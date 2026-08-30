import { FEATURE, PLAN_FEATURES } from './plans.js';

export const CONTENT_ACCESS = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
});

/**
 * Stable IDs can be added here when a commercial content allocation is approved.
 * Empty sets deliberately keep the existing curriculum free instead of inventing
 * a module-number cutoff or silently locking hundreds of authored items.
 */
export const PRO_CONTENT_IDS = Object.freeze({
  module: new Set(),
  lesson: new Set(),
  exercise: new Set(),
  reference: new Set(),
  cheatsheet: new Set(),
});

const FEATURE_BY_CONTENT_KIND = Object.freeze({
  challenge: FEATURE.CHALLENGES,
  project: FEATURE.PROJECTS,
  interview: FEATURE.INTERVIEW_PRO,
});

export function requiredPlanForContent(kind, id) {
  if (FEATURE_BY_CONTENT_KIND[kind]) return CONTENT_ACCESS.PRO;
  return PRO_CONTENT_IDS[kind]?.has(id) ? CONTENT_ACCESS.PRO : CONTENT_ACCESS.FREE;
}

export function planHasFeature(plan, feature) {
  return Boolean(PLAN_FEATURES[plan]?.has(feature));
}

export function canAccessContent({ kind, id, plan, enforcePaidAccess = true }) {
  if (!enforcePaidAccess) return true;
  if (requiredPlanForContent(kind, id) === CONTENT_ACCESS.FREE) return true;
  const feature = FEATURE_BY_CONTENT_KIND[kind] ?? {
    module: FEATURE.FULL_CURRICULUM,
    lesson: FEATURE.FULL_CURRICULUM,
    exercise: FEATURE.FULL_EXERCISES,
    reference: FEATURE.PREMIUM_REFERENCE,
    cheatsheet: FEATURE.PREMIUM_REFERENCE,
  }[kind];
  return feature ? planHasFeature(plan, feature) : plan === 'pro';
}
