const PAID_STATUSES = new Set(['active', 'canceling', 'past_due']);
const REVOKED_STATUSES = new Set(['expired', 'refunded', 'revoked']);
export const ENTITLEMENT_VERIFICATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SUBSCRIPTION_RECONCILIATION_FRESHNESS_MS = 24 * 60 * 60 * 1000;

const timestamp = (value) => {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(time) ? time : null;
};

/**
 * Which Paddle environment this deployment trusts.
 *
 * Defaults to production when unset or unrecognised: the safe direction is to
 * distrust a sandbox row, never to trust one by accident.
 */
export function currentBillingEnvironment() {
  const raw = String(import.meta.env?.VITE_PADDLE_ENVIRONMENT ?? '').trim().toLowerCase();
  return raw === 'sandbox' ? 'sandbox' : 'production';
}

export function subscriptionGrantsPro(subscription, now = new Date(), environment = currentBillingEnvironment()) {
  if (!subscription || subscription.plan !== 'pro') return false;
  if (REVOKED_STATUSES.has(subscription.status) || !PAID_STATUSES.has(subscription.status)) return false;

  /*
   * A Paddle row carries the environment that produced it. Sandbox and live are
   * different Paddle accounts, but both write provider='paddle', so without this
   * a subscription bought with a test card during sandbox testing would quietly
   * become a real entitlement the day the deployment goes live. Gumroad has one
   * environment and is unaffected.
   */
  if (subscription.provider === 'paddle' && subscription.provider_environment !== environment) return false;

  const nowTime = now.getTime();

  /*
   * Paddle's status is the answer for a past_due subscription, and no date is.
   *
   * The period end has elapsed by definition - that is *why* payment is due - so
   * judging by it would revoke Pro the moment a renewal failed. But bounding it
   * by how recently the row was verified is no better: that is a second timeout
   * JSPath would be inventing, and Paddle's provisioning model has no such
   * concept.
   *
   * Paddle owns the recovery window. It retries the payment during dunning; if
   * one succeeds the subscription returns to `active`, and if recovery is
   * exhausted Paddle moves it to `canceled` - which arrives here as `expired`
   * and grants nothing. Following the provider's status is therefore both
   * simpler and more correct than any grace period of our own.
   *
   * What stops a stale row lingering is the machinery that already exists:
   * webhook ordering and idempotency keep state moving forwards, and
   * reconciliation refreshes it on demand.
   *
   * Scoped to Paddle. Gumroad derives past_due from a failure date and keeps its
   * existing period-end semantics untouched.
   */
  if (subscription.status === 'past_due' && subscription.provider === 'paddle') return true;

  const validUntil = timestamp(subscription.current_period_end ?? subscription.ended_at);
  if (validUntil !== null) return validUntil > nowTime;

  // No period to judge by: fall back to how recently the provider was verified.
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

export function resolveEntitlement({ authenticated, subscriptions = [], now = new Date(), environment = currentBillingEnvironment() }) {
  if (!authenticated) return { plan: 'guest', isPro: false, subscription: null };

  const subscription = [...subscriptions]
    .filter((item) => subscriptionGrantsPro(item, now, environment))
    .sort((a, b) => (timestamp(b.current_period_end) ?? Infinity) - (timestamp(a.current_period_end) ?? Infinity))[0] ?? null;

  return {
    plan: subscription ? 'pro' : 'free',
    isPro: Boolean(subscription),
    subscription,
  };
}
