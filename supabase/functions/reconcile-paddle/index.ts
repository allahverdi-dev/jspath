import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/billing-server.ts';
import {
  getPaddleSubscription, getPaddleTransaction, isFresherThanStored, isSandboxTester,
  jspathUserIdFrom, normalizePaddleSubscription, paddleCatalog, paddleEnvironment,
} from '../_shared/paddle.js';

/**
 * Repair Paddle subscription state for the signed-in learner.
 *
 * Two jobs, in this order:
 *
 *   1. refresh a Paddle subscription this account already has, when the stored
 *      copy has gone stale
 *   2. recover a checkout that completed but whose webhook never arrived
 *
 * The second is the interesting one, and the reason `billing_checkout_sessions`
 * exists. The unsafe way to do it is to ask the provider "what has this email
 * bought" — which makes a browser-supplied address the key to an entitlement.
 * Here the server reads a mapping *it wrote itself* when it created the
 * transaction, so the only thing this function will look up is a transaction it
 * already knows belongs to the caller.
 *
 * The browser sends no body. There is no transaction id, subscription id,
 * customer id or user id to supply, so there is nothing to forge.
 */

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ ok: false, message: 'Method not allowed.' }, { status: 405 });

  const authorization = request.headers.get('authorization');
  if (!authorization) return jsonResponse({ ok: false, message: 'Unauthorized.' }, { status: 401 });

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } },
  );
  const { data, error } = await userClient.auth.getUser();
  const user = data?.user;
  if (error || !user?.id || !user.email_confirmed_at) {
    return jsonResponse({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  // Paddle is sandbox-only until live cutover. In sandbox, only allow-listed
  // testers may reach it - the id comes from the verified token, never the body.
  if (!isSandboxTester(user.id)) {
    return jsonResponse({ ok: false, reason: 'not_authorized' }, { status: 403 });
  }

  let catalog;
  try {
    catalog = paddleCatalog();
  } catch {
    return jsonResponse({ ok: false, message: 'Paddle is not configured.' }, { status: 503 });
  }

  const admin = adminClient();
  const now = new Date();

  /** Write a verified Paddle subscription to this user, if it is really theirs. */
  const applySubscription = async (subscription: Record<string, unknown>) => {
    const record = normalizePaddleSubscription({ subscription, catalog, now });
    if (!record?.provider_subscription_id || !record.provider_customer_id) return false;

    // The subscription must name this user. custom_data was written by
    // paddle-checkout from a verified session, so agreeing with it is a real
    // check and not a formality.
    const boundUserId = jspathUserIdFrom(subscription?.custom_data);
    if (boundUserId && boundUserId !== user.id) return false;

    if (!boundUserId) {
      // No binding on the subscription: fall back to the server's own mapping
      // for the transaction that created it.
      const transactionId = typeof subscription?.transaction_id === 'string' ? subscription.transaction_id : null;
      if (!transactionId) return false;
      const { data: mapping } = await admin
        .from('billing_checkout_sessions')
        .select('user_id')
        .eq('provider', 'paddle')
        .eq('provider_transaction_id', transactionId)
        .maybeSingle();
      if (mapping?.user_id !== user.id) return false;
    }

    const { data: stored } = await admin
      .from('subscriptions')
      .select('provider_updated_at')
      .eq('provider', 'paddle')
      .eq('provider_subscription_id', record.provider_subscription_id)
      .maybeSingle();
    if (!isFresherThanStored(record.provider_updated_at, stored?.provider_updated_at)) return true;

    const { error: upsertError } = await admin
      .from('subscriptions')
      .upsert({ ...record, user_id: user.id }, { onConflict: 'provider,provider_subscription_id' });
    return !upsertError;
  };

  try {
    // 1. Refresh what this account already has. Rows are selected by user_id, so
    //    another learner's subscription is not reachable from here.
    const { data: existing } = await admin
      .from('subscriptions')
      .select('provider_subscription_id')
      .eq('user_id', user.id)
      .eq('provider', 'paddle')
      .eq('provider_environment', paddleEnvironment())
      .order('updated_at', { ascending: false })
      .limit(5);

    let matched = false;
    for (const row of existing ?? []) {
      if (!row?.provider_subscription_id) continue;
      const subscription = await getPaddleSubscription(row.provider_subscription_id);
      if (await applySubscription(subscription)) matched = true;
    }
    if (matched) return jsonResponse({ ok: true, matched: true });

    // 2. Recover a completed checkout whose webhook has not landed. Only this
    //    user's own pending transactions are considered.
    const { data: pending } = await admin
      .from('billing_checkout_sessions')
      .select('provider_transaction_id')
      .eq('user_id', user.id)
      .eq('provider', 'paddle')
      // A sandbox mapping is invisible to a production deployment and vice versa.
      .eq('provider_environment', paddleEnvironment())
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    for (const session of pending ?? []) {
      const transaction = await getPaddleTransaction(session.provider_transaction_id);
      const subscriptionId = typeof transaction?.subscription_id === 'string' ? transaction.subscription_id : null;
      if (!subscriptionId) continue;

      const subscription = await getPaddleSubscription(subscriptionId);
      if (await applySubscription(subscription)) {
        await admin.from('billing_checkout_sessions')
          .update({ status: 'completed', updated_at: now.toISOString() })
          .eq('provider', 'paddle')
          .eq('provider_transaction_id', session.provider_transaction_id);
        return jsonResponse({ ok: true, matched: true });
      }
    }

    return jsonResponse({ ok: true, matched: false });
  } catch {
    return jsonResponse({ ok: false, message: 'Membership reconciliation failed.' }, { status: 502 });
  }
});
