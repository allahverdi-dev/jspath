/**
 * The placement engine.
 *
 * Everything the placement assessment claims about a learner is computed here,
 * as pure functions over their actual answers. There is no AI, no inference from
 * goals, age or self-reported level, and no confidence value that is not simply
 * the ratio of weighted marks the learner earned.
 *
 * The curriculum ordering is *not* restated in this file. Domains declare the
 * topics they own (`PLACEMENT_DOMAIN_TOPICS`); which modules that maps to, and
 * which domain comes first, are both derived from `module.order` in the real
 * content registry. There is one curriculum order in this codebase and it lives
 * in the content.
 */
import {
  PLACEMENT_DOMAINS,
  PLACEMENT_DOMAIN_TOPICS,
  PLACEMENT_DIFFICULTY_WEIGHT,
  PLACEMENT_LEVEL,
  QUIZ_KIND,
} from '../../content/schema/types.js';

/** At or above this, a domain counts as demonstrated. */
export const MASTERY_THRESHOLD = 0.7;
/** Below this, a domain is a meaningful gap rather than a wobble. */
export const WEAK_THRESHOLD = 0.5;

const weightOf = (q) => PLACEMENT_DIFFICULTY_WEIGHT[q.difficulty] ?? 1;

/* ------------------------------------------------------------------ *
 * Answer checking
 * ------------------------------------------------------------------ */

/**
 * Is this answer correct?
 *
 * `undefined` (skipped) is never correct, but it is also never an error — a
 * learner may leave a question blank rather than guess.
 */
export function isAnswerCorrect(question, answer) {
  if (answer === undefined || answer === null) return false;
  if (question.kind === QUIZ_KIND.MULTIPLE) {
    if (!Array.isArray(answer)) return false;
    const want = [...question.correct].sort((a, b) => a - b);
    // De-duplicate first: selecting the same option twice must not count twice.
    const got = [...new Set(answer)].sort((a, b) => a - b);
    return want.length === got.length && want.every((v, i) => v === got[i]);
  }
  return answer === question.correct;
}

/* ------------------------------------------------------------------ *
 * Curriculum mapping — derived from the registry, never hardcoded
 * ------------------------------------------------------------------ */

/**
 * Resolve each placement domain to the real modules that teach it, ordered by
 * the curriculum's own `order` field. Domains are then sorted by the position of
 * their earliest module, so "earlier domain" always means "earlier curriculum".
 */
export function buildDomainMap(modules) {
  const byDomain = {};
  for (const domain of PLACEMENT_DOMAINS) {
    const topics = new Set(PLACEMENT_DOMAIN_TOPICS[domain]);
    const mods = modules
      .filter((m) => (m.topicIds ?? []).some((t) => topics.has(t)))
      .sort((a, b) => a.order - b.order);
    byDomain[domain] = { domain, topics, modules: mods, order: mods[0]?.order ?? Infinity };
  }
  const ordered = PLACEMENT_DOMAINS.slice().sort((a, b) => byDomain[a].order - byDomain[b].order);
  return { byDomain, ordered };
}

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */

/**
 * Score a completed attempt.
 *
 * Weighting is a small explicit progression (beginner 1 to expert 3) declared in
 * `PLACEMENT_DIFFICULTY_WEIGHT`. It is deliberately narrow, and because domains
 * are scored independently before anything overall is computed, one hard
 * question cannot outweigh a whole foundational domain.
 *
 * Answers are keyed by question id, so re-answering replaces the previous
 * choice and a question can never be counted twice.
 */
export function scorePlacement(questions, answers = {}) {
  const domains = {};
  const missedTopicIds = new Set();
  const strongTopicIds = new Set();
  let earned = 0;
  let possible = 0;
  let correctCount = 0;
  let answeredCount = 0;

  for (const q of questions) {
    const w = weightOf(q);
    const answered = answers[q.id] !== undefined && answers[q.id] !== null;
    const correct = isAnswerCorrect(q, answers[q.id]);

    possible += w;
    if (answered) answeredCount += 1;
    if (correct) {
      earned += w;
      correctCount += 1;
      for (const t of q.topicIds) strongTopicIds.add(t);
    } else {
      for (const t of q.topicIds) missedTopicIds.add(t);
    }

    const d = (domains[q.domain] ??= {
      domain: q.domain,
      correct: 0,
      total: 0,
      earned: 0,
      possible: 0,
      questionIds: [],
    });
    d.total += 1;
    d.possible += w;
    d.questionIds.push(q.id);
    if (correct) {
      d.correct += 1;
      d.earned += w;
    }
  }

  for (const d of Object.values(domains)) {
    d.score = d.possible === 0 ? 0 : d.earned / d.possible;
    d.rawScore = d.total === 0 ? 0 : d.correct / d.total;
  }

  // A topic answered correctly somewhere is not a gap, even if missed elsewhere.
  for (const t of strongTopicIds) missedTopicIds.delete(t);

  return {
    totalCount: questions.length,
    answeredCount,
    correctCount,
    score: possible === 0 ? 0 : earned / possible,
    rawScore: questions.length === 0 ? 0 : correctCount / questions.length,
    earned,
    possible,
    domains,
    missedTopicIds: [...missedTopicIds],
    strongTopicIds: [...strongTopicIds],
  };
}

/* ------------------------------------------------------------------ *
 * Level band
 * ------------------------------------------------------------------ */

/**
 * Map a score to one of the four bands the onboarding step already uses.
 *
 * Overall score alone is not enough: prerequisites are checked too, so a learner
 * is never called "experienced" while the foundations domain is unproven.
 */
export function levelFor(result) {
  const s = (d) => result.domains[d]?.score ?? 0;
  const foundations = s('foundations');
  const core = s('core-language');

  if (result.score >= 0.85 && foundations >= 0.8 && core >= 0.8) return PLACEMENT_LEVEL.EXPERIENCED;
  if (result.score >= 0.6 && foundations >= 0.7 && core >= 0.5) return PLACEMENT_LEVEL.INTERMEDIATE;
  if (result.score >= 0.35 && foundations >= 0.5) return PLACEMENT_LEVEL.BASICS;
  return PLACEMENT_LEVEL.ZERO;
}

/* ------------------------------------------------------------------ *
 * Recommendation
 * ------------------------------------------------------------------ */

/**
 * Choose where the learner should start.
 *
 * The rule is "earliest meaningful gap after confirmed mastery", not "a module
 * proportional to the total score" — a learner can score 90% overall and still
 * be missing a foundational prerequisite, and sending them to an advanced module
 * would waste their time. Domains are walked in curriculum order and the first
 * one below mastery wins, however well the learner did afterwards.
 *
 * Within that domain we pick the earliest module that actually teaches something
 * they missed, so the recommendation points at the gap rather than at the top of
 * a band they have mostly cleared.
 */
export function recommendStart(result, modules) {
  const { byDomain, ordered } = buildDomainMap(modules);
  const missed = new Set(result.missedTopicIds);

  const gapDomain = ordered.find((d) => (result.domains[d]?.score ?? 0) < MASTERY_THRESHOLD);

  if (!gapDomain) {
    // Nothing below mastery. There is no placement gap to send the learner back
    // to, so the honest recommendation is the capstone rather than an arbitrary
    // earlier module.
    const capstone =
      modules.filter((m) => m.track === 'interview').sort((a, b) => a.order - b.order)[0] ??
      modules.slice().sort((a, b) => b.order - a.order)[0];
    return {
      moduleId: capstone.id,
      domain: null,
      reason: 'every area scored at or above the mastery threshold, so nothing earlier is worth repeating',
    };
  }

  const candidates = byDomain[gapDomain].modules;
  const target =
    candidates.find((m) => (m.topicIds ?? []).some((t) => missed.has(t))) ?? candidates[0];

  return { moduleId: target.id, domain: gapDomain, reason: null };
}

/* ------------------------------------------------------------------ *
 * The public entry point
 * ------------------------------------------------------------------ */

/**
 * Turn an attempt into a complete, self-contained placement result.
 *
 * This never touches progress state. A placement result is evidence for a
 * recommendation, not a record of work the learner has done — nothing here marks
 * a lesson complete, solves an exercise, or logs activity.
 */
export function placeLearner({ questions, answers = {}, modules }) {
  const result = scorePlacement(questions, answers);
  const level = levelFor(result);
  const { moduleId, domain: gapDomain, reason } = recommendStart(result, modules);
  const { ordered } = buildDomainMap(modules);

  const breakdown = ordered.filter((d) => result.domains[d]).map((d) => ({ ...result.domains[d] }));

  const strengths = breakdown.filter((d) => d.score >= MASTERY_THRESHOLD).map((d) => d.domain);
  const gaps = breakdown.filter((d) => d.score < WEAK_THRESHOLD).map((d) => d.domain);
  const shaky = breakdown
    .filter((d) => d.score >= WEAK_THRESHOLD && d.score < MASTERY_THRESHOLD)
    .map((d) => d.domain);

  return {
    level,
    score: result.score,
    rawScore: result.rawScore,
    correctCount: result.correctCount,
    answeredCount: result.answeredCount,
    totalCount: result.totalCount,
    breakdown,
    strengths,
    shaky,
    gaps,
    missedTopicIds: result.missedTopicIds,
    recommendedModuleId: moduleId,
    recommendedDomain: gapDomain,
    recommendationReason: reason,
  };
}

/** The compact shape persisted in user state. Deliberately small. */
export function toStoredPlacement(result, { completedAt = new Date().toISOString() } = {}) {
  return {
    completedAt,
    level: result.level,
    score: result.score,
    correctCount: result.correctCount,
    totalCount: result.totalCount,
    recommendedModuleId: result.recommendedModuleId,
    recommendedDomain: result.recommendedDomain,
    domainScores: Object.fromEntries(result.breakdown.map((d) => [d.domain, d.score])),
  };
}
