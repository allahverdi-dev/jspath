import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { isAllowedProduct, parseAllowedProducts } from '../_shared/gumroad.js';
import { processSubscription, salesForEmail } from '../_shared/billing-server.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

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
  const user = data.user;
  if (error || !user?.email || !user.email_confirmed_at) return jsonResponse({ ok: false, message: 'Unauthorized.' }, { status: 401 });

  try {
    const allowed = parseAllowedProducts(Deno.env.get('GUMROAD_ALLOWED_PRODUCTS_JSON'));
    const sales = (await salesForEmail(user.email))
      .filter((sale) => isAllowedProduct(allowed, sale))
      .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
    if (sales.length === 0) return jsonResponse({ ok: true, matched: false });

    const sale = sales[0];
    const result = await processSubscription({
      eventType: sale.refunded ? 'refund' : sale.disputed || sale.chargebacked ? 'dispute' : 'subscription_updated',
      payload: { ...sale, sale_id: sale.sale_id ?? sale.id },
      authenticatedUser: { id: user.id, email: user.email },
    });
    return jsonResponse({ ok: true, matched: result.outcome === 'processed' });
  } catch {
    return jsonResponse({ ok: false, message: 'Membership reconciliation failed.' }, { status: 502 });
  }
});
