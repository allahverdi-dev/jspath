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

const monthlyUrl = import.meta.env?.VITE_GUMROAD_PRO_MONTHLY_URL ?? '';
const annualUrl = import.meta.env?.VITE_GUMROAD_PRO_ANNUAL_URL ?? '';

export const CHECKOUT_OPTIONS = Object.freeze({
  'pro-monthly': {
    id: 'pro-monthly',
    plan: 'pro',
    name: 'Pro monthly',
    billingInterval: 'monthly',
    price: null,
    checkoutUrl: monthlyUrl,
  },
  'pro-annual': {
    id: 'pro-annual',
    plan: 'pro',
    name: 'Pro annual',
    billingInterval: 'annual',
    price: null,
    checkoutUrl: annualUrl,
  },
});

export const GUMROAD_ACCOUNT_ID_FIELD = 'JSPath account ID';
export const GUMROAD_MANAGE_URL = 'https://gumroad.com/library';

export function isBillingConfigured() {
  return Object.values(CHECKOUT_OPTIONS).some((option) => Boolean(option.checkoutUrl));
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

/** Public checkout data is convenience only; it never grants an entitlement. */
export function createCheckoutUrl(option, user) {
  if (!option?.checkoutUrl || !user?.id || !user?.email) return null;
  try {
    const url = new URL(option.checkoutUrl);
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
