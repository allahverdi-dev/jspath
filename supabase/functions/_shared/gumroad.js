export const GUMROAD_RESOURCE_TYPES = Object.freeze([
  'sale',
  'refund',
  'cancellation',
  'subscription_ended',
  'subscription_restarted',
  'subscription_updated',
  'dispute',
  'dispute_won',
]);

const stringValue = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);
const dateValue = (...values) => values.map(stringValue).find((value) => value && !Number.isNaN(new Date(value).getTime())) ?? null;

export function canonicalPayload(payload) {
  return Object.entries(payload ?? {})
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');
}

export async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createEventIdentity(eventType, payload) {
  const payloadSha256 = await sha256(canonicalPayload(payload));
  const objectId = stringValue(payload?.subscription_id) ?? stringValue(payload?.sale_id) ?? stringValue(payload?.id) ?? 'unknown';
  return {
    objectId,
    payloadSha256,
    eventKey: `${eventType}:${objectId}:${payloadSha256}`,
  };
}

export function parseAllowedProducts(raw) {
  try {
    const parsed = JSON.parse(raw ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function isAllowedProduct(allowedProducts, sale) {
  const productId = stringValue(sale?.product_id);
  const rule = productId ? allowedProducts?.[productId] : null;
  if (!rule || rule.plan !== 'pro') return false;
  const allowedVariants = Array.isArray(rule.variants) ? rule.variants.filter(Boolean) : [];
  if (allowedVariants.length === 0) return true;
  const variant = stringValue(sale?.variants) ?? stringValue(sale?.variant) ?? stringValue(sale?.tier);
  return Boolean(variant && allowedVariants.includes(variant));
}

export function customField(payload, fieldName) {
  const fields = payload?.custom_fields;
  if (Array.isArray(fields)) {
    const match = fields.find((field) => field?.name === fieldName || field?.label === fieldName);
    return stringValue(match?.value);
  }
  if (fields && typeof fields === 'object') return stringValue(fields[fieldName]);
  return stringValue(payload?.[fieldName]);
}

const interval = (value) => ({ yearly: 'annual', annual: 'annual', biannually: 'semiannual' }[value] ?? value);

export function normalizeSubscription({ eventType, sale, subscriber = {}, now = new Date() }) {
  const merged = { ...sale, ...subscriber };
  const cancellationEnd = dateValue(merged.subscription_cancelled_at, merged.cancelled_at);
  const failureEnd = dateValue(merged.subscription_failed_at, merged.failed_at);
  const endedAt = dateValue(merged.subscription_ended_at, merged.ended_at);
  const periodEnd = dateValue(merged.next_charge_at, merged.current_period_end, cancellationEnd, failureEnd, endedAt);
  const nowTime = now.getTime();
  const hasEnded = (value) => value && new Date(value).getTime() <= nowTime;

  let status = 'active';
  const disputeWon = eventType === 'dispute_won' || merged.dispute_won === true || merged.dispute_won === 'true';
  if (eventType === 'refund' || merged.refunded === true || merged.refunded === 'true') status = 'refunded';
  else if (!disputeWon && (eventType === 'dispute' || merged.chargebacked === true || merged.chargebacked === 'true' || merged.disputed === true || merged.disputed === 'true')) status = 'revoked';
  else if (eventType === 'subscription_ended' || hasEnded(endedAt) || hasEnded(cancellationEnd) || hasEnded(failureEnd)) status = 'expired';
  else if (eventType === 'cancellation' || cancellationEnd) status = 'canceling';
  else if (failureEnd) status = 'past_due';

  return {
    provider: 'gumroad',
    provider_subscription_id: stringValue(merged.subscription_id) ?? stringValue(merged.id),
    provider_sale_id: stringValue(sale?.sale_id) ?? stringValue(sale?.id),
    provider_product_id: stringValue(sale?.product_id),
    provider_variant: stringValue(sale?.variants) ?? stringValue(sale?.variant) ?? stringValue(sale?.tier),
    plan: 'pro',
    status,
    billing_interval: interval(stringValue(merged.recurrence) ?? stringValue(merged.billing_interval)),
    customer_email: stringValue(merged.email)?.toLowerCase() ?? null,
    started_at: dateValue(sale?.sale_timestamp, sale?.created_at),
    current_period_end: periodEnd,
    cancel_at_period_end: status === 'canceling',
    ended_at: ['expired', 'refunded', 'revoked'].includes(status) ? (endedAt ?? cancellationEnd ?? failureEnd ?? now.toISOString()) : null,
    last_verified_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}
