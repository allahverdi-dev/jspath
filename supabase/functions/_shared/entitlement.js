/**
 * Server-side entitlement rules.
 *
 * These must stay identical to `src/features/billing/entitlements.js`. The two
 * cannot share a module — one runs in Deno with no bundler, the other in the
 * browser — so `src/features/billing/entitlementParity.test.js` drives both
 * implementations over the same matrix of subscription states and fails if they
 * ever disagree. Change one, change the other.
 *
 * The Edge Function that serves paid content is the only thing standing between
 * an unentitled request and the payload, so this file fails closed everywhere:
 * an unknown status, a missing plan, an unparseable date or a stale verification
 * all resolve to "not entitled".
 */

const PAID_STATUSES = new Set(['active', 'canceling', 'past_due']);
const REVOKED_STATUSES = new Set(['expired', 'refunded', 'revoked']);
export const ENTITLEMENT_VERIFICATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
