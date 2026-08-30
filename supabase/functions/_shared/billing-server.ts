import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { customField, isAllowedProduct, normalizeSubscription, parseAllowedProducts } from './gumroad.js';

const gumroadToken = Deno.env.get('GUMROAD_ACCESS_TOKEN') ?? '';
const allowedProducts = parseAllowedProducts(Deno.env.get('GUMROAD_ALLOWED_PRODUCTS_JSON'));
const accountIdField = Deno.env.get('GUMROAD_USER_ID_FIELD') ?? 'JSPath account ID';

export function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function gumroad(path: string) {
  if (!gumroadToken) throw new Error('Gumroad API verification is not configured.');
  const response = await fetch(`https://api.gumroad.com/v2${path}`, {
    headers: { Authorization: `Bearer ${gumroadToken}`, Accept: 'application/json' },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) throw new Error(`Gumroad verification failed (${response.status}).`);
  return body;
}

export async function verifiedSale(saleId: string) {
  const body = await gumroad(`/sales/${encodeURIComponent(saleId)}`);
  return body.sale ?? body;
}

export async function verifiedSubscriber(subscriptionId: string) {
  if (!subscriptionId) return {};
  const body = await gumroad(`/subscribers/${encodeURIComponent(subscriptionId)}`);
  return body.subscriber ?? body;
}

export async function salesForEmail(email: string) {
  const body = await gumroad(`/sales?email=${encodeURIComponent(email)}`);
  return Array.isArray(body.sales) ? body.sales : [];
}

export async function resolveUser(admin: ReturnType<typeof adminClient>, sale: Record<string, unknown>, payload: Record<string, unknown>, authenticatedUser?: { id: string; email?: string }) {
  const verifiedEmail = String(sale.email ?? '').trim().toLowerCase();
  if (!verifiedEmail) return null;

  if (authenticatedUser) {
    return authenticatedUser.email?.trim().toLowerCase() === verifiedEmail ? authenticatedUser : null;
  }

  const hintedUserId = customField(sale, accountIdField) ?? customField(payload, accountIdField);
  if (!hintedUserId) return null;
  const { data, error } = await admin.auth.admin.getUserById(hintedUserId);
  if (error || !data.user?.email_confirmed_at) return null;
  return data.user.email?.trim().toLowerCase() === verifiedEmail ? data.user : null;
}

export async function processSubscription({ eventType, payload, authenticatedUser }: { eventType: string; payload: Record<string, unknown>; authenticatedUser?: { id: string; email?: string } }) {
  const saleId = String(payload.sale_id ?? payload.id ?? '');
  if (!saleId) return { outcome: 'unresolved', reason: 'No Gumroad sale ID was supplied.' };

  const sale = await verifiedSale(saleId);
  if (!isAllowedProduct(allowedProducts, sale)) return { outcome: 'rejected', reason: 'Product or tier is not allow-listed.' };

  const subscriptionId = String(sale.subscription_id ?? payload.subscription_id ?? '');
  if (!subscriptionId) return { outcome: 'rejected', reason: 'The verified sale is not a recurring membership.' };
  const subscriber = await verifiedSubscriber(subscriptionId);
  const admin = adminClient();
  const user = await resolveUser(admin, sale, payload, authenticatedUser);
  if (!user) return { outcome: 'unresolved', reason: 'Purchaser identity did not match a verified JSPath account.' };

  const record = normalizeSubscription({ eventType, sale, subscriber });
  if (!record.provider_subscription_id || !record.provider_sale_id || !record.provider_product_id || !record.customer_email) {
    return { outcome: 'unresolved', reason: 'Verified provider data was incomplete.' };
  }

  const { error } = await admin.from('subscriptions').upsert(
    { ...record, user_id: user.id },
    { onConflict: 'provider,provider_subscription_id' },
  );
  if (error) throw error;
  return { outcome: 'processed', subscription: record };
}
