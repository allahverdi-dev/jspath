import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from './cors.ts';
import { adminClient } from './billing-server.ts';
import {
  canUsePaddleEnvironment, paddleCatalogFor, paddleFetch, resolveBillingOption,
} from './paddle.js';

/**
 * Start a Paddle checkout for the signed-in learner.
 *
 * The browser asks for an *internal* option id — "pro-monthly" or "pro-annual" —
 * and nothing else. It does not send a price, a product, a user id, a customer
 * or any custom data. The server maps the option to a configured price, binds
 * the transaction to the identity in the verified token, and returns only the
 * transaction id.
 *
 * That is the whole point of doing this server-side: `custom_data.jspath_user_id`
 * is what the webhook later trusts to decide whose account gets Pro, so it must
 * be written by something that knows who the caller actually is.
 *
 * The transaction is created without a customer, so Paddle returns it as
 * `draft`. That is fine and intended — a draft transaction can be passed to
 * Paddle.js `Checkout.open({ transactionId })`, which collects the customer and
 * address itself.
 */

export function createPaddleCheckoutHandler(environment: 'sandbox' | 'production') {
  return async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ ok: false, reason: 'method' }, { status: 405 });

  const authorization = request.headers.get('authorization');
  if (!authorization) return jsonResponse({ ok: false, reason: 'unauthenticated' }, { status: 401 });

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } },
  );
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user?.id || !user.email_confirmed_at) {
    return jsonResponse({ ok: false, reason: 'unauthenticated' }, { status: 401 });
  }

  // Paddle is sandbox-only until live cutover. In sandbox, only allow-listed
  // testers may reach it - the id comes from the verified token, never the body.
  if (!canUsePaddleEnvironment(user.id, environment)) {
    return jsonResponse({ ok: false, reason: 'not_authorized' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  // The only thing the caller gets to choose, and it is chosen from a closed set.
  const option = resolveBillingOption(body?.option);
  if (!option) return jsonResponse({ ok: false, reason: 'unknown_option' }, { status: 400 });

  let catalog;
  try {
    catalog = paddleCatalogFor(environment);
  } catch {
    return jsonResponse({ ok: false, reason: 'not_configured' }, { status: 503 });
  }
  const priceId = catalog.priceByInterval[option.billingInterval];
  if (!priceId) return jsonResponse({ ok: false, reason: 'not_configured' }, { status: 503 });

  let transaction;
  try {
    transaction = await paddleFetch('/transactions', {
      method: 'POST',
      environment,
      body: {
        items: [{ price_id: priceId, quantity: 1 }],
        collection_mode: 'automatic',
        // Flat, and written here rather than by the browser. Paddle copies this
        // onto the subscription it creates, which is how the webhook knows whose
        // account to credit.
        custom_data: {
          jspath_user_id: user.id,
          jspath_plan: option.plan,
          jspath_billing_interval: option.billingInterval,
        },
      },
    });
  } catch {
    return jsonResponse({ ok: false, reason: 'provider_unavailable' }, { status: 502 });
  }

  const transactionId = typeof transaction?.id === 'string' ? transaction.id : null;
  if (!transactionId) return jsonResponse({ ok: false, reason: 'provider_unavailable' }, { status: 502 });

  // Record who this transaction belongs to *before* telling the browser about
  // it. If the webhook is later delayed or lost, this mapping is what lets
  // reconciliation ask Paddle about this one transaction — instead of searching
  // the provider by an email the browser handed us.
  const admin = adminClient();
  const { error: mappingError } = await admin
    .from('billing_checkout_sessions')
    .upsert({
      user_id: user.id,
      provider: 'paddle',
      // Which Paddle account created it, so a sandbox transaction can never be
      // recovered by a production deployment.
      provider_environment: environment,
      provider_transaction_id: transactionId,
      billing_interval: option.billingInterval,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'provider,provider_environment,provider_transaction_id' });

  if (mappingError) {
    // Without the mapping there is no recovery path, so this is a failure and
    // not a warning. The transaction is harmless: it is a draft nobody paid.
    return jsonResponse({ ok: false, reason: 'mapping_failed' }, { status: 500 });
  }

  return jsonResponse({ ok: true, transactionId });
  };
}
