import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/billing-server.ts';
import { isSandboxTester, paddleEnvironment, paddleFetch } from '../_shared/paddle.js';

/**
 * Open the Paddle customer portal for the signed-in learner.
 *
 * Managing a subscription — cancelling, changing card, downloading invoices — is
 * Paddle's own UI, and building a bespoke one would mean JSPath handling
 * payment details it deliberately never touches.
 *
 * The customer and subscription ids come from this user's own trusted row. The
 * browser sends no body: it cannot name a customer, a subscription, or a user,
 * so there is no way to ask for a portal session belonging to somebody else.
 *
 * The returned URL is authenticated and temporary. It is handed straight to the
 * caller and stored nowhere — caching it would mean caching a credential.
 */

Deno.serve(async (request) => {
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
  if (userError || !user?.id) return jsonResponse({ ok: false, reason: 'unauthenticated' }, { status: 401 });

  // Paddle is sandbox-only until live cutover. In sandbox, only allow-listed
  // testers may reach it - the id comes from the verified token, never the body.
  if (!isSandboxTester(user.id)) {
    return jsonResponse({ ok: false, reason: 'not_authorized' }, { status: 403 });
  }

  const admin = adminClient();
  // Paddle rows only. A learner whose Pro came from Gumroad is managed at
  // Gumroad, and this endpoint must not pretend otherwise.
  const { data: row, error: lookupError } = await admin
    .from('subscriptions')
    .select('provider_customer_id, provider_subscription_id')
    .eq('user_id', user.id)
    .eq('provider', 'paddle')
    .eq('provider_environment', paddleEnvironment())
    .not('provider_customer_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) return jsonResponse({ ok: false, reason: 'lookup_failed' }, { status: 503 });
  if (!row?.provider_customer_id) return jsonResponse({ ok: false, reason: 'no_paddle_subscription' }, { status: 404 });

  try {
    const session = await paddleFetch(
      `/customers/${encodeURIComponent(row.provider_customer_id)}/portal-sessions`,
      {
        method: 'POST',
        // Deep links are scoped to this learner's own subscription.
        body: row.provider_subscription_id ? { subscription_ids: [row.provider_subscription_id] } : {},
      },
    );

    const overview = session?.urls?.general?.overview;
    if (typeof overview !== 'string' || !overview.startsWith('https://')) {
      return jsonResponse({ ok: false, reason: 'provider_unavailable' }, { status: 502 });
    }

    const deepLink = Array.isArray(session?.urls?.subscriptions)
      ? session.urls.subscriptions.find((entry: Record<string, unknown>) => entry?.id === row.provider_subscription_id)
      : null;

    return jsonResponse({
      ok: true,
      url: overview,
      cancelUrl: typeof deepLink?.cancel_subscription === 'string' ? deepLink.cancel_subscription : null,
    });
  } catch {
    return jsonResponse({ ok: false, reason: 'provider_unavailable' }, { status: 502 });
  }
});
