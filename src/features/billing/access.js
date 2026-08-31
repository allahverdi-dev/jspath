import { FEATURE, PLAN_FEATURES } from './plans.js';
import { FREE_SAMPLE_CONTENT_IDS, PRO_CONTENT_IDS } from './accessCatalog.js';

export { FREE_SAMPLE_CONTENT_IDS, PRO_CONTENT_IDS } from './accessCatalog.js';

export const CONTENT_ACCESS = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
});

const proExercises = new Set(PRO_CONTENT_IDS.exercise);
const freeSamples = Object.fromEntries(
  Object.entries(FREE_SAMPLE_CONTENT_IDS).map(([kind, ids]) => [kind, new Set(ids)]),
);

const FEATURE_BY_CONTENT_KIND = Object.freeze({
  challenge: FEATURE.CHALLENGES,
  project: FEATURE.PROJECTS,
  interview: FEATURE.INTERVIEW_PRO,
});

export function requiredPlanForContent(kind, id) {
  if (Object.hasOwn(FEATURE_BY_CONTENT_KIND, kind)) {
    return freeSamples[kind].has(id) ? CONTENT_ACCESS.FREE : CONTENT_ACCESS.PRO;
  }
  if (kind === 'exercise' && proExercises.has(id)) return CONTENT_ACCESS.PRO;
  return CONTENT_ACCESS.FREE;
}

export function planHasFeature(plan, feature) {
  return Boolean(PLAN_FEATURES[plan]?.has(feature));
}

export function canAccessContent({ kind, id, plan }) {
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
