export const FEATURE = Object.freeze({
  CURRICULUM_BROWSE: 'curriculum_browse',
  CORE_LEARNING: 'core_learning',
  BASIC_EXERCISES: 'basic_exercises',
  PLAYGROUND: 'playground',
  LOCAL_PROGRESS: 'local_progress',
  CLOUD_SYNC: 'cloud_sync',
  BOOKMARKS: 'bookmarks',
  ACHIEVEMENTS: 'achievements',
  FULL_CURRICULUM: 'full_curriculum',
  FULL_EXERCISES: 'full_exercises',
  CHALLENGES: 'challenges',
  PROJECTS: 'projects',
  INTERVIEW_PRO: 'interview_pro',
  PREMIUM_PRACTICE: 'premium_practice',
  PREMIUM_REFERENCE: 'premium_reference',
  ADVANCED_ANALYTICS: 'advanced_analytics',
});

const GUEST_FEATURES = [
  FEATURE.CURRICULUM_BROWSE,
  FEATURE.CORE_LEARNING,
  FEATURE.FULL_CURRICULUM,
  FEATURE.PREMIUM_REFERENCE,
  FEATURE.BASIC_EXERCISES,
  FEATURE.PLAYGROUND,
  FEATURE.LOCAL_PROGRESS,
];

const FREE_FEATURES = [
  ...GUEST_FEATURES,
  FEATURE.CLOUD_SYNC,
  FEATURE.BOOKMARKS,
  FEATURE.ACHIEVEMENTS,
];

export const PLAN_FEATURES = Object.freeze({
  guest: new Set(GUEST_FEATURES),
  free: new Set(FREE_FEATURES),
  pro: new Set([...FREE_FEATURES, ...Object.values(FEATURE)]),
});

export const PLAN_DEFINITIONS = Object.freeze({
  guest: { id: 'guest', name: 'Guest', description: 'Learn locally without an account.' },
  free: { id: 'free', name: 'Free', description: 'The complete JavaScript curriculum, with cloud progress sync.' },
  pro: { id: 'pro', name: 'Pro', description: 'Deeper practice, projects, interview preparation and mastery insights.' },
});

/**
 * The internal billing options.
 *
 * These ids are the *only* thing the browser names when starting a checkout.
 * The server maps an id to a configured Paddle price; the price and product ids
 * never reach the client, which is what stops a crafted request from buying
 * something JSPath does not sell.
 *
 * `amount` is display copy. It is not what anyone is charged — Paddle's own
 * catalogue decides that, and the checkout shows the real figure in the
 * customer's currency.
 */
export const CHECKOUT_OPTIONS = Object.freeze({
  'pro-monthly': {
    id: 'pro-monthly',
    plan: 'pro',
    name: 'Pro monthly',
    billingInterval: 'monthly',
    amount: '$4.99',
  },
  'pro-annual': {
    id: 'pro-annual',
    plan: 'pro',
    name: 'Pro annual',
    billingInterval: 'annual',
    amount: '$49.99',
  },
});

/** Twelve months at the monthly rate, minus the annual rate. */
export const ANNUAL_SAVING = '$9.89';

/* ------------------------------------------------------------------ *
 * Providers
 * ------------------------------------------------------------------ */

export const BILLING_PROVIDER = Object.freeze({ PADDLE: 'paddle', GUMROAD: 'gumroad' });

/**
 * Where a subscription is managed.
 *
 * New subscriptions are Paddle and are managed in Paddle's customer portal,
 * reached through an authenticated server-generated link. Subscriptions sold
 * through Gumroad before the migration keep working and keep being managed at
 * Gumroad — they are not converted, and nothing pretends they are Paddle.
 */
export const GUMROAD_MANAGE_URL = 'https://gumroad.com/library';

export function subscriptionProvider(subscription) {
  const provider = subscription?.provider;
  return provider === BILLING_PROVIDER.PADDLE || provider === BILLING_PROVIDER.GUMROAD ? provider : null;
}

/** Legacy Gumroad rows are managed at Gumroad; everything else uses the portal. */
export function isLegacyGumroadSubscription(subscription) {
  return subscriptionProvider(subscription) === BILLING_PROVIDER.GUMROAD;
}

/* ------------------------------------------------------------------ *
 * Which checkout this deployment offers
 * ------------------------------------------------------------------ */

/**
 * Paddle is sandbox-only until live cutover is approved, and sandbox checkout
 * must never be reachable by ordinary production learners — a sandbox payment
 * costs nothing and would hand out real Pro.
 *
 * So the provider for *new* purchases is an explicit deployment decision rather
 * than something inferred from "is a token present":
 *
 *   gumroad-production   what production runs today. Real money, real Gumroad.
 *   paddle-sandbox       staging or owner testing. Paddle sandbox checkout.
 *   paddle-production    after live cutover. Not enabled yet.
 *
 * This flag only decides which UI is shown. It is not a security boundary: the
 * Paddle Edge Functions independently refuse sandbox work for accounts that are
 * not on the server-side tester allowlist, so a learner who edits their own
 * bundle gets nothing.
 */
export const BILLING_MODE = Object.freeze({
  GUMROAD_PRODUCTION: 'gumroad-production',
  PADDLE_SANDBOX: 'paddle-sandbox',
  PADDLE_PRODUCTION: 'paddle-production',
});

const MODES = new Set(Object.values(BILLING_MODE));

/**
 * An unset or unrecognised value means production Gumroad.
 *
 * Failing closed here means failing *to the thing production already does*: a
 * typo must never silently promote sandbox checkout, and must never leave a
 * paying learner with no way to buy.
 */
export function billingMode() {
  const raw = String(import.meta.env?.VITE_BILLING_MODE ?? '').trim().toLowerCase();
  return MODES.has(raw) ? raw : BILLING_MODE.GUMROAD_PRODUCTION;
}

export const isPaddleCheckoutMode = () => billingMode() !== BILLING_MODE.GUMROAD_PRODUCTION;
export const isSandboxCheckoutMode = () => billingMode() === BILLING_MODE.PADDLE_SANDBOX;

/** Legacy Gumroad checkout links, still the production purchase path. */
const gumroadCheckoutUrls = Object.freeze({
  monthly: String(import.meta.env?.VITE_GUMROAD_PRO_MONTHLY_URL ?? '').trim(),
  annual: String(import.meta.env?.VITE_GUMROAD_PRO_ANNUAL_URL ?? '').trim(),
});

export function gumroadCheckoutUrl(option) {
  return gumroadCheckoutUrls[option?.billingInterval] || '';
}

/**
 * Gumroad's checkout is a link with the buyer's identity prefilled. It is a
 * convenience only: the entitlement still comes from a verified webhook, and a
 * crafted URL grants nothing.
 */
export const GUMROAD_ACCOUNT_ID_FIELD = 'JSPath account ID';

export function createGumroadCheckoutUrl(option, user) {
  const base = gumroadCheckoutUrl(option);
  if (!base || !user?.id || !user?.email) return null;
  try {
    const url = new URL(base);
    if (url.protocol !== 'https:') return null;
    url.searchParams.set('wanted', 'true');
    url.searchParams.set('email', user.email);
    url.searchParams.set(GUMROAD_ACCOUNT_ID_FIELD, user.id);
    url.searchParams.set(option.billingInterval === 'annual' ? 'yearly' : 'monthly', 'true');
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Can a *new* purchase be started from this deployment?
 *
 * Whichever provider this deployment is configured for has to be usable. Never
 * an entitlement check — only "should the buttons be live".
 */
export function isBillingConfigured() {
  if (isPaddleCheckoutMode()) {
    return Boolean(String(import.meta.env?.VITE_PADDLE_CLIENT_TOKEN ?? '').trim());
  }
  return Object.values(gumroadCheckoutUrls).some(Boolean);
}

export function getCheckoutOption(optionId) {
  return CHECKOUT_OPTIONS[optionId] ?? null;
}

export function createUpgradeAuthPath(optionId) {
  const option = getCheckoutOption(optionId);
  const next = option ? `/pricing?checkout=${encodeURIComponent(option.id)}` : '/pricing';
  return `/signup?next=${encodeURIComponent(next)}`;
}

export function safeApplicationPath(value, fallback = '/', origin = globalThis.window?.location?.origin) {
  if (!origin || typeof value !== 'string' || !value.startsWith('/')) return fallback;
  try {
    const applicationOrigin = new URL(origin).origin;
    const target = new URL(value, `${applicationOrigin}/`);
    return target.origin === applicationOrigin ? `${target.pathname}${target.search}${target.hash}` : fallback;
  } catch {
    return fallback;
  }
}
