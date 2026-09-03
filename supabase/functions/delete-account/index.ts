import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/billing-server.ts';
import { accountDeletionReadiness, DELETION_STATE } from '../_shared/account-deletion.js';

/**
 * Delete the calling learner's account.
 *
 * The only account this can ever delete is the one that owns the token in the
 * Authorization header. The user id is read from the verified session and the
 * request body is never consulted for identity — there is no `user_id`
 * parameter to send, so there is nothing to forge.
 *
 * The function fails closed at every step. No Authorization header, a token that
 * does not verify, a subscription query that errors, a subscription that can
 * still be charged, a status this build does not recognise — each returns
 * without deleting anything.
 *
 * Deletion itself is one call: removing the row from `auth.users` cascades to
 * `public.user_progress` and `public.subscriptions`, both of which declare
 * `on delete cascade`. `public.billing_events` is deliberately untouched — it
 * holds no user reference at all (provider event key, event type, provider
 * object id and a SHA-256 of the message) and exists so a replayed webhook is
 * not processed twice. Losing it would weaken billing idempotency without
 * removing anything identifying.
 */

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ ok: false, reason: 'method' }, { status: 405 });

  // 1. A caller must present a token we can verify ourselves.
  const authorization = request.headers.get('authorization');
  if (!authorization) return jsonResponse({ ok: false, reason: 'unauthenticated' }, { status: 401 });

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } },
  );

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  // 2. The identity comes from the token, never from the body.
  if (userError || !user?.id) {
    return jsonResponse({ ok: false, reason: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const acknowledgedForfeit = body?.acknowledgeForfeit === true;

  const admin = adminClient();

  // 3. Read billing state with the service role, so row-level security cannot be
  //    the thing that decides, and a client cannot hide a subscription from us.
  const { data: subscriptions, error: subscriptionError } = await admin
    .from('subscriptions')
    .select('plan, status, current_period_end, ended_at, last_verified_at')
    .eq('user_id', user.id);

  if (subscriptionError) {
    return jsonResponse({ ok: false, reason: 'subscription_lookup_failed' }, { status: 503 });
  }

  const readiness = accountDeletionReadiness({ subscriptions: subscriptions ?? [] });

  // 4. A subscription that can still charge them is a hard stop: JSPath cannot
  //    cancel a Gumroad subscription, so deleting here would orphan it.
  if (readiness.state === DELETION_STATE.ACTIVE_SUBSCRIPTION) {
    return jsonResponse({ ok: false, reason: 'active_subscription' }, { status: 409 });
  }
  if (readiness.state === DELETION_STATE.UNKNOWN_STATE) {
    return jsonResponse({ ok: false, reason: 'unknown_subscription_state' }, { status: 409 });
  }

  // 5. Giving up paid time that is still valid has to be said out loud.
  if (readiness.requiresAcknowledgement && !acknowledgedForfeit) {
    return jsonResponse({ ok: false, reason: 'forfeit_not_acknowledged' }, { status: 409 });
  }

  // 6. One call, one account: the verified id and nothing else.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return jsonResponse({ ok: false, reason: 'delete_failed' }, { status: 500 });
  }

  // 7. Prove the cascade actually ran rather than trusting the schema. A
  //    surviving row is reported so it can be investigated; the account itself
  //    is already gone by this point, so this never blocks the caller.
  const [{ count: progressRows }, { count: subscriptionRows }] = await Promise.all([
    admin.from('user_progress').select('user_id', { count: 'exact', head: true }).eq('user_id', user.id),
    admin.from('subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  return jsonResponse({
    ok: true,
    deleted: true,
    residual: { user_progress: progressRows ?? 0, subscriptions: subscriptionRows ?? 0 },
  });
});
