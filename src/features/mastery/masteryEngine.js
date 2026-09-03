/**
 * The mastery engine.
 *
 * Mastery answers "do you actually know this topic?", which is a different
 * question from "have you clicked through the lessons?". The calculation is
 * deliberately transparent: `topicMastery` returns the component scores alongside
 * the final number so the UI can show a learner exactly why they sit where they do.
 *
 * Core rule: **completing lessons alone can never reach Mastered.** Reaching the
 * top state requires assessment evidence — solved exercises, quiz accuracy, or
 * solved challenges. This is the whole point of having a mastery model rather than
 * a completion checkbox.
 */
import { MASTERY } from '../../content/schema/types.js';

/** Relative contribution of each evidence source. Must sum to 1. */
export const MASTERY_WEIGHTS = {
  lessons: 0.3,
  exercises: 0.3,
  quizzes: 0.25,
  challenges: 0.15,
};

/** Assessment evidence required before a topic may be called Mastered. */
export const MASTERED_REQUIREMENTS = {
  minScore: 0.85,
  minAssessments: 4,
  minQuizAccuracy: 0.8,
};

export const PRACTICING_REQUIREMENTS = {
  minScore: 0.55,
  minAssessments: 2,
};

/** Confidence decays after this many days without touching a topic. */
const DECAY_GRACE_DAYS = 21;
const DECAY_FLOOR = 0.75;

function daysSince(iso, now) {
  if (!iso) return Infinity;
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000;
}

/**
 * Repeated failures before success indicate shakier knowledge than a clean solve,
 * so the credit for a solved item tapers with attempt count — but never below 0.6,
 * because struggling and then succeeding is still genuine learning.
 */
function attemptQuality(attempts) {
  if (!attempts || attempts <= 1) return 1;
  if (attempts === 2) return 0.9;
  if (attempts === 3) return 0.8;
  if (attempts <= 5) return 0.7;
  return 0.6;
}

/**
 * Compute mastery for a single topic.
 *
 * @param {object} state    user progress state
 * @param {string} topicId
 * @param {object} content  { lessons, exercises, quizzes, challenges } — manifest arrays
 * @returns {{score:number, level:string, components:object, evidence:object}}
 */
export function topicMastery(state, topicId, content, now = new Date()) {
  const inTopic = (item) => (item.topicIds ?? []).includes(topicId);

  const lessons = (content.lessons ?? []).filter(inTopic);
  const exercises = (content.exercises ?? []).filter(inTopic);
  const challenges = (content.challenges ?? []).filter(inTopic);

  /* --- Lessons: coverage of the available teaching material --- */
  const lessonsDone = lessons.filter((l) => state.lessons[l.id]?.completedAt).length;
  const lessonScore = lessons.length === 0 ? null : lessonsDone / lessons.length;

  /* --- Exercises: solved, weighted down by how many attempts it took --- */
  let exerciseScore = null;
  let exercisesSolved = 0;
  if (exercises.length > 0) {
    let credit = 0;
    for (const ex of exercises) {
      const rec = state.exercises[ex.id];
      if (rec?.solved) {
        exercisesSolved += 1;
        credit += attemptQuality(rec.attempts);
      }
    }
    exerciseScore = credit / exercises.length;
  }

  /* --- Quizzes: accuracy on questions tagged with this topic --- */
  let quizScore = null;
  let quizAnswered = 0;
  {
    let correct = 0;
    let total = 0;
    for (const quiz of content.quizzes ?? []) {
      const record = state.quizzes[quiz.id];
      if (!record?.attempts?.length) continue;
      const topicQuestions = (quiz.questions ?? []).filter(inTopic);
      if (topicQuestions.length === 0) continue;
      const best = record.attempts.reduce((a, b) => (b.ratio > a.ratio ? b : a), record.attempts[0]);
      const wrong = new Set(best.wrongQuestionIds ?? []);
      for (const q of topicQuestions) {
        total += 1;
        if (!wrong.has(q.id)) correct += 1;
      }
    }
    quizAnswered = total;
    if (total > 0) quizScore = correct / total;
  }

  /* --- Challenges: applied skill --- */
  let challengeScore = null;
  let challengesSolved = 0;
  if (challenges.length > 0) {
    let credit = 0;
    for (const ch of challenges) {
      const rec = state.challenges[ch.id];
      if (rec?.solved) {
        challengesSolved += 1;
        credit += attemptQuality(rec.attempts);
      }
    }
    challengeScore = credit / challenges.length;
  }

  /* --- Combine, redistributing the weight of unavailable sources --- */
  const parts = [
    ['lessons', lessonScore, MASTERY_WEIGHTS.lessons],
    ['exercises', exerciseScore, MASTERY_WEIGHTS.exercises],
    ['quizzes', quizScore, MASTERY_WEIGHTS.quizzes],
    ['challenges', challengeScore, MASTERY_WEIGHTS.challenges],
  ];
  const available = parts.filter(([, value]) => value !== null);
  const weightSum = available.reduce((n, [, , w]) => n + w, 0);
  const raw = weightSum === 0 ? 0 : available.reduce((n, [, value, w]) => n + value * w, 0) / weightSum;

  /* --- Recency: confidence fades if a topic is left untouched --- */
  const lastTouched = lastTouchedAt(state, topicId, content);
  const idle = daysSince(lastTouched, now);
  const decay = idle <= DECAY_GRACE_DAYS ? 1 : Math.max(DECAY_FLOOR, 1 - (idle - DECAY_GRACE_DAYS) / 120);
  const score = Math.min(1, raw * decay);

  const assessmentCount = exercisesSolved + challengesSolved + Math.floor(quizAnswered / 3);

  const evidence = {
    lessonsDone,
    lessonsAvailable: lessons.length,
    exercisesSolved,
    exercisesAvailable: exercises.length,
    challengesSolved,
    challengesAvailable: challenges.length,
    quizQuestionsAnswered: quizAnswered,
    quizAccuracy: quizScore,
    assessmentCount,
    lastTouched,
    idleDays: Number.isFinite(idle) ? Math.round(idle) : null,
    decayApplied: decay < 1,
  };

  return {
    topicId,
    score,
    level: masteryLevel(score, evidence),
    components: {
      lessons: lessonScore,
      exercises: exerciseScore,
      quizzes: quizScore,
      challenges: challengeScore,
    },
    evidence,
  };
}

/**
 * Map a score plus its evidence onto a mastery state.
 *
 * The evidence gate is what makes this honest: a learner who has read every lesson
 * but solved nothing sits at Learning, not Mastered, no matter how high the raw
 * lesson coverage pushes the score.
 */
export function masteryLevel(score, evidence) {
  if (score <= 0 && evidence.lessonsDone === 0) return MASTERY.NOT_STARTED;

  const canMaster =
    score >= MASTERED_REQUIREMENTS.minScore &&
    evidence.assessmentCount >= MASTERED_REQUIREMENTS.minAssessments &&
    (evidence.quizAccuracy === null || evidence.quizAccuracy >= MASTERED_REQUIREMENTS.minQuizAccuracy);
  if (canMaster) return MASTERY.MASTERED;

  const canPractice =
    score >= PRACTICING_REQUIREMENTS.minScore &&
    evidence.assessmentCount >= PRACTICING_REQUIREMENTS.minAssessments;
  if (canPractice) return MASTERY.PRACTICING;

  return MASTERY.LEARNING;
}

/** Most recent moment the learner interacted with anything tagged with this topic. */
function lastTouchedAt(state, topicId, content) {
  const inTopic = (item) => (item.topicIds ?? []).includes(topicId);
  let latest = null;
  const consider = (iso) => {
    if (iso && (!latest || iso > latest)) latest = iso;
  };

  for (const l of (content.lessons ?? []).filter(inTopic)) {
    const rec = state.lessons[l.id];
    consider(rec?.completedAt ?? rec?.lastVisitedAt);
  }
  for (const e of (content.exercises ?? []).filter(inTopic)) consider(state.exercises[e.id]?.solvedAt);
  for (const c of (content.challenges ?? []).filter(inTopic)) consider(state.challenges[c.id]?.solvedAt);
  for (const quiz of content.quizzes ?? []) {
    if (!(quiz.questions ?? []).some(inTopic)) continue;
    consider(state.quizzes[quiz.id]?.attempts?.[0]?.at);
  }
  return latest;
}

/** Mastery across every topic, sorted strongest first. */
export function allTopicMastery(state, topics, content, now = new Date()) {
  return topics
    .map((t) => ({ ...topicMastery(state, t.id, content, now), label: t.label, group: t.group }))
    .sort((a, b) => b.score - a.score);
}

/** Overall mastery — the single headline percentage. */
export function overallMastery(state, topics, content, now = new Date()) {
  const all = allTopicMastery(state, topics, content, now);
  const started = all.filter((t) => t.level !== MASTERY.NOT_STARTED);
  if (all.length === 0) return { score: 0, started: 0, mastered: 0, total: 0 };
  return {
    score: all.reduce((n, t) => n + t.score, 0) / all.length,
    started: started.length,
    mastered: all.filter((t) => t.level === MASTERY.MASTERED).length,
    total: all.length,
  };
}

/**
 * Topics the learner has engaged with but is scoring poorly on.
 * Untouched topics are excluded — you cannot be "weak" at something you have not
 * started; that is simply the next thing to learn, which is a different list.
 */
export function weakTopics(state, topics, content, { limit = 5, threshold = 0.6 } = {}, now = new Date()) {
  return allTopicMastery(state, topics, content, now)
    .filter((t) => t.level !== MASTERY.NOT_STARTED && t.score < threshold)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

/** A friendly rank label derived from overall mastery — cosmetic only. */
/**
 * The learner's overall rank, as a stable token rather than a sentence.
 *
 * Returning a key keeps this module locale-free; `mastery.rank*` in the
 * dictionaries holds the wording for each language.
 */
export function rankKeyFor(score) {
  if (score >= 0.9) return 'mastery.rankMaster';
  if (score >= 0.75) return 'mastery.rankAdvanced';
  if (score >= 0.55) return 'mastery.rankIntermediate';
  if (score >= 0.3) return 'mastery.rankJunior';
  if (score > 0) return 'mastery.rankNovice';
  return 'mastery.rankGettingStarted';
}
