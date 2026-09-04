import { corsHeaders, jsonResponse } from './cors.ts';
import { adminClient } from './billing-server.ts';
import {
  isFresherThanStored, jspathUserIdFrom, normalizePaddleSubscription,
  paddleCatalogFor, paddleWebhookSecret, sha256Hex, verifyPaddleSignature,
} from './paddle.js';

/**
 * Paddle's webhook endpoint.
 *
 * Deployed with `--no-verify-jwt`: Paddle is not a Supabase user and cannot
 * present a Supabase token. The signature is what authenticates this endpoint,
 * so it is verified before anything else happens — before the body is parsed,
 * before a row is read, before a single decision is made.
 *
 * Order matters and is deliberate:
 *
 *   1. read the body as raw text, untouched
 *   2. verify ts + HMAC-SHA256 against the destination secret
 *   3. only then parse JSON
 *   4. claim the event id, so a duplicate delivery is a no-op
 *   5. validate the product and price against configuration
 *   6. resolve the user from the server-written custom_data
 *   7. refuse to write if a newer state is already stored
 *
 * Events consumed: subscription.created and subscription.updated. Anything else
 * is acknowledged and ignored — Paddle only needs to know we received it.
 */

const HANDLED = new Set(['subscription.created', 'subscription.updated']);

export function createPaddleWebhookHandler(environment: 'sandbox' | 'production') {
  return async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ ok: false, reason: 'method' }, { status: 405 });

  // 1. Raw, exactly as sent. Parsing first would change the bytes the signature
  //    was computed over.
  const rawBody = await request.text();

  // 2. Authenticate the request itself.
  const verification = await verifyPaddleSignature({
    rawBody,
    signatureHeader: request.headers.get('paddle-signature'),
    secret: paddleWebhookSecret(environment),
  });
  if (!verification.ok) {
    const status = verification.reason === 'not_configured' ? 503 : 401;
    return jsonResponse({ ok: false, reason: verification.reason }, { status });
  }

  // 3. Now it is safe to look at the contents.
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, reason: 'malformed_body' }, { status: 400 });
  }

  const eventId = typeof event?.event_id === 'string' ? event.event_id : null;
  const eventType = typeof event?.event_type === 'string' ? event.event_type : null;
  if (!eventId || !eventType) return jsonResponse({ ok: false, reason: 'malformed_body' }, { status: 400 });

  const eventKey = `${environment}:${eventId}`;

  const subscription = (event?.data ?? {}) as Record<string, unknown>;
  const subscriptionId = typeof subscription?.id === 'string' ? subscription.id : null;
  const admin = adminClient();

  // 4. Claim the event. The unique (provider, event_key) constraint means a
  //    duplicate delivery loses the race and stops here, so the same Paddle
  //    event can never be applied twice. A row left in a non-terminal state by
  //    an earlier crash stays retryable.
  const payloadSha256 = await sha256Hex(rawBody);
  const { error: claimError } = await admin.from('billing_events').insert({
    provider: 'paddle',
    event_key: eventKey,
    event_type: eventType,
    provider_object_id: subscriptionId,
    payload_sha256: payloadSha256,
    processing_status: 'received',
  });

  if (claimError) {
    const { data: existing } = await admin
      .from('billing_events')
      .select('processing_status')
      .eq('provider', 'paddle')
      .eq('event_key', eventKey)
      .maybeSingle();
    // Already dealt with. Acknowledge so Paddle stops retrying.
    if (!existing || ['processed', 'duplicate', 'rejected'].includes(existing.processing_status)) {
      return jsonResponse({ ok: true, duplicate: true });
    }
  }

  const finish = async (status: string, error?: string) => {
    await admin.from('billing_events')
      .update({ processing_status: status, error_message: error ?? null, processed_at: new Date().toISOString() })
      .eq('provider', 'paddle').eq('event_key', eventKey);
  };

  if (!HANDLED.has(eventType)) {
    await finish('duplicate');
    return jsonResponse({ ok: true, ignored: eventType });
  }

  try {
    let catalog;
    try {
      catalog = paddleCatalogFor(environment);
    } catch {
      await finish('failed', 'catalogue_not_configured');
      return jsonResponse({ ok: false, reason: 'not_configured' }, { status: 503 });
    }

    // 5. What was actually bought, checked against configuration. A subscription
    //    for another product or an unrecognised price normalises to null and is
    //    rejected here — `custom_data` claiming plan "pro" counts for nothing.
    const record = normalizePaddleSubscription({ subscription, catalog, environment });
    if (!record || !record.provider_subscription_id || !record.provider_customer_id) {
      await finish('rejected', 'product_or_price_not_recognised');
      return jsonResponse({ ok: true, rejected: 'catalogue' });
    }

    // 6. Whose account. Written by paddle-checkout from a verified session; a
    //    value that is not a UUID, or names no confirmed user, resolves nobody.
    const userId = jspathUserIdFrom(subscription?.custom_data);
    let resolvedUserId: string | null = null;
    if (userId) {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (!error && data?.user?.id) resolvedUserId = data.user.id;
    }

    // Fallback for a subscription whose custom_data did not survive: the
    // server's own record of which user this transaction was created for. Still
    // never anything the browser supplied.
    if (!resolvedUserId && typeof subscription?.transaction_id === 'string') {
      const { data } = await admin
        .from('billing_checkout_sessions')
        .select('user_id')
        .eq('provider', 'paddle')
        .eq('provider_environment', environment)
        .eq('provider_transaction_id', subscription.transaction_id)
        .maybeSingle();
      resolvedUserId = data?.user_id ?? null;
    }

    if (!resolvedUserId) {
      await finish('unresolved', 'no_jspath_account');
      return jsonResponse({ ok: true, unresolved: true });
    }

    // 7. Do not roll state backwards. A delayed older delivery arriving after a
    //    newer one must not undo it.
    const { data: stored } = await admin
      .from('subscriptions')
      .select('provider_updated_at')
      .eq('provider', 'paddle')
      .eq('provider_environment', environment)
      .eq('provider_subscription_id', record.provider_subscription_id)
      .maybeSingle();

    if (!isFresherThanStored(record.provider_updated_at, stored?.provider_updated_at)) {
      await finish('duplicate', 'stale_event');
      return jsonResponse({ ok: true, stale: true });
    }

    const { error: upsertError } = await admin
      .from('subscriptions')
      .upsert({ ...record, user_id: resolvedUserId }, { onConflict: 'provider,provider_environment,provider_subscription_id' });
    if (upsertError) throw upsertError;

    // The checkout that produced this is no longer pending.
    if (typeof subscription?.transaction_id === 'string') {
      await admin.from('billing_checkout_sessions')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('provider', 'paddle')
        .eq('provider_environment', environment)
        .eq('provider_transaction_id', subscription.transaction_id);
    }

    await finish('processed');
    return jsonResponse({ ok: true, processed: true });
  } catch (caught) {
    // Left retryable on purpose: Paddle will deliver again, and the event row is
    // not in a terminal state, so the retry is allowed to do the work.
    await finish('failed', String((caught as Error)?.message ?? 'error').slice(0, 200));
    return jsonResponse({ ok: false, reason: 'processing_failed' }, { status: 500 });
  }
  };
}
