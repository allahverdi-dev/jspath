const PAID_STATUSES = new Set(['active', 'canceling', 'past_due']);
const REVOKED_STATUSES = new Set(['expired', 'refunded', 'revoked']);
export const ENTITLEMENT_VERIFICATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SUBSCRIPTION_RECONCILIATION_FRESHNESS_MS = 24 * 60 * 60 * 1000;

const timestamp = (value) => {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(time) ? time : null;
};

export function subscriptionGrantsPro(subscription, now = new Date()) {
  if (!subscription || subscription.plan !== 'pro') return false;
  if (REVOKED_STATUSES.has(subscription.status) || !PAID_STATUSES.has(subscription.status)) return false;

  const nowTime = now.getTime();
  const validUntil = timestamp(subscription.current_period_end ?? subscription.ended_at);
  if (validUntil !== null) return validUntil > nowTime;

  const verifiedAt = timestamp(subscription.last_verified_at);
  return verifiedAt !== null && verifiedAt + ENTITLEMENT_VERIFICATION_TTL_MS > nowTime;
}

/**
 * Decide whether an existing server-verified Gumroad paid row needs a recovery
 * check. A passed provider end boundary always needs recovery; otherwise paid
 * rows are refreshed well before the seven-day entitlement buffer expires.
 */
export function subscriptionNeedsReconciliation(subscription, now = new Date()) {
  if (!subscription || subscription.provider !== 'gumroad' || subscription.plan !== 'pro') return false;
  if (!PAID_STATUSES.has(subscription.status)) return false;

  const nowTime = now.getTime();
  const validUntil = timestamp(subscription.current_period_end ?? subscription.ended_at);
  if (validUntil !== null && validUntil <= nowTime) return true;

  const verifiedAt = timestamp(subscription.last_verified_at);
  return verifiedAt === null || verifiedAt + SUBSCRIPTION_RECONCILIATION_FRESHNESS_MS <= nowTime;
}

export function resolveEntitlement({ authenticated, subscriptions = [], now = new Date() }) {
  if (!authenticated) return { plan: 'guest', isPro: false, subscription: null };

  const subscription = [...subscriptions]
    .filter((item) => subscriptionGrantsPro(item, now))
    .sort((a, b) => (timestamp(b.current_period_end) ?? Infinity) - (timestamp(a.current_period_end) ?? Infinity))[0] ?? null;

  return {
    plan: subscription ? 'pro' : 'free',
    isPro: Boolean(subscription),
    subscription,
  };
}
