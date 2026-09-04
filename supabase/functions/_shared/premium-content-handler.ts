import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from './cors.ts';
import { adminClient } from './billing-server.ts';
import { resolveEntitlement } from './entitlement.js';
import { canUsePaddleEnvironment } from './paddle.js';
import payload from '../premium-content/payload.json' with { type: 'json' };

/**
 * Serve the paid half of Pro content to entitled learners.
 *
 * A static bundle cannot keep a secret, so the answer half of every Pro item is
 * removed from the client build and lives here instead, behind a verified
 * session and a server-side entitlement check.
 *
 * The function fails closed at every step. No Authorization header, an
 * unverifiable token, an unconfirmed email, a subscription query that errors, an
 * expired or refunded subscription, an unknown id — each returns without the
 * payload. Nothing the browser sends influences the entitlement decision: the
 * user id comes from the verified token and the subscription rows are read with
 * the service role, never from the request body.
 */

const MAX_KEYS = 50;

export function createPremiumContentHandler(environment: 'sandbox' | 'production') {
  return async (request: Request) => {
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
  if (userError || !user?.id || !user.email_confirmed_at) {
    return jsonResponse({ ok: false, reason: 'unauthenticated' }, { status: 401 });
  }

  if (!canUsePaddleEnvironment(user.id, environment)) {
    return jsonResponse({ ok: false, reason: 'not_authorized' }, { status: 403 });
  }

  // 2. Entitlement is read server-side for that verified id, with the same rules
  //    the client uses to decide what to show.
  const admin = adminClient();
  const { data: subscriptions, error: subscriptionError } = await admin
    .from('subscriptions')
    .select('plan, status, current_period_end, ended_at, last_verified_at, provider, provider_environment')
    .eq('user_id', user.id);

  // An ambiguous failure must not open the gate.
  if (subscriptionError) return jsonResponse({ ok: false, reason: 'unavailable' }, { status: 503 });

  const { isPro } = resolveEntitlement({ authenticated: true, subscriptions: subscriptions ?? [], environment });
  if (!isPro) return jsonResponse({ ok: false, reason: 'not_entitled' }, { status: 403 });

  // 3. Only now is the request body read, and only to choose which known keys
  //    to return. An unknown key is a 404, never an upsell.
  let body: { keys?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  const keys = Array.isArray(body?.keys) ? body.keys.filter((k) => typeof k === 'string') : [];
  if (keys.length === 0 || keys.length > MAX_KEYS) {
    return jsonResponse({ ok: false, reason: 'bad_request' }, { status: 400 });
  }

  const found: Record<string, unknown> = {};
  const missing: string[] = [];
  for (const key of keys) {
    if (Object.hasOwn(payload, key)) found[key] = (payload as Record<string, unknown>)[key];
    else missing.push(key);
  }

  if (Object.keys(found).length === 0) {
    return jsonResponse({ ok: false, reason: 'not_found', missing }, { status: 404 });
  }

  return jsonResponse(
    { ok: true, content: found, missing },
    // A per-user authorised payload must never be shared by a cache.
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
  };
}
