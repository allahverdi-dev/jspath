/**
 * The progress engine.
 *
 * Every rule about what counts as progress, how much XP something is worth, and
 * how streaks advance lives here as a pure function. React state is a thin wrapper
 * (`src/state/UserStateProvider.jsx`); components never recompute these formulas
 * themselves, which is what stops the same calculation drifting across screens.
 *
 * All functions take a state object and return a *new* state object.
 */

export const STATE_VERSION = 3;

/** XP awards, in one table so the economy is visible and tunable. */
export const XP = {
  LESSON_COMPLETE: 20,
  EXERCISE_FIRST_SOLVE: 15,
  EXERCISE_FIRST_TRY_BONUS: 5,
  QUIZ_PASS: 20,
  QUIZ_PERFECT_BONUS: 10,
  CHALLENGE_SOLVE: 40,
  PROJECT_MILESTONE: 25,
  PROJECT_COMPLETE: 100,
  INTERVIEW_QUESTION: 5,
  DAILY_CHALLENGE_BONUS: 20,
  ACHIEVEMENT: 25,
};

/** A quiz must be answered at this accuracy to count as passed. */
export const QUIZ_PASS_THRESHOLD = 0.7;

const ACTIVITY_LIMIT = 400;
const MISTAKE_LIMIT = 250;

export function createInitialState(overrides = {}) {
  return {
    version: STATE_VERSION,
    createdAt: new Date().toISOString(),
    profile: {
      displayName: 'Developer',
      level: null,
      goals: [],
      dailyMinutes: 20,
      startedAt: new Date().toISOString(),
      onboarded: false,
    },
    lessons: {},
    exercises: {},
    quizzes: {},
    challenges: {},
    projects: {},
    interview: {},
    bookmarks: {},
    achievements: {},
    xp: { total: 0, awarded: {} },
    streak: { current: 0, longest: 0, lastActiveDay: null, days: {} },
    activity: [],
    mistakes: [],
    dailyChallenge: {},
    /** The latest placement result, or null. A recommendation, never progress. */
    placement: null,
    settings: {
      theme: 'dark',
      reduceMotion: false,
      fontScale: 1,
      editorFontSize: 14,
      dailyGoalMinutes: 20,
      autoRunExamples: false,
      soundEffects: false,
    },
    ...overrides,
  };
}

/* ------------------------------------------------------------------ *
 * Dates — day keys are local, so a learner's "today" matches their clock
 * ------------------------------------------------------------------ */

export function dayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(aKey, bKey) {
  const [ay, am, ad] = aKey.split('-').map(Number);
  const [by, bm, bd] = bKey.split('-').map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86_400_000);
}

/* ------------------------------------------------------------------ *
 * XP — awarded at most once per (kind, ref) pair
 * ------------------------------------------------------------------ */

/**
 * Award XP idempotently. Re-opening a finished lesson, or re-solving an exercise
 * you already solved, adds nothing — which is what stops XP farming by clicking.
 */
export function awardXp(state, kind, refId, amount) {
  const key = `${kind}:${refId}`;
  if (state.xp.awarded[key]) return state;
  return {
    ...state,
    xp: {
      total: state.xp.total + amount,
      awarded: { ...state.xp.awarded, [key]: amount },
    },
  };
}

export function hasAwarded(state, kind, refId) {
  return Boolean(state.xp.awarded[`${kind}:${refId}`]);
}

/* ------------------------------------------------------------------ *
 * Streak & activity
 * ------------------------------------------------------------------ */

/**
 * Record that the learner did something today.
 *
 * A day counts once regardless of how much was done, so the streak measures
 * consistency rather than volume. A gap of exactly one day continues the streak;
 * any larger gap resets it to 1.
 */
export function recordActivityDay(state, date = new Date()) {
  const key = dayKey(date);
  const { lastActiveDay, current, longest, days } = state.streak;
  const nextDays = { ...days, [key]: (days[key] ?? 0) + 1 };

  if (lastActiveDay === key) {
    return { ...state, streak: { ...state.streak, days: nextDays } };
  }

  let nextCurrent;
  if (!lastActiveDay) {
    nextCurrent = 1;
  } else {
    const gap = daysBetween(lastActiveDay, key);
    if (gap === 1) nextCurrent = current + 1;
    else if (gap <= 0) nextCurrent = Math.max(current, 1); // clock moved backwards
    else nextCurrent = 1;
  }

  return {
    ...state,
    streak: {
      current: nextCurrent,
      longest: Math.max(longest, nextCurrent),
      lastActiveDay: key,
      days: nextDays,
    },
  };
}

/**
 * A streak is only "current" if the learner was active today or yesterday.
 * Stored state is not rewritten on read; this is the display value.
 */
export function currentStreak(state, today = new Date()) {
  const { lastActiveDay, current } = state.streak;
  if (!lastActiveDay) return 0;
  const gap = daysBetween(lastActiveDay, dayKey(today));
  return gap <= 1 ? current : 0;
}

export function logActivity(state, entry) {
  const activity = [{ at: new Date().toISOString(), ...entry }, ...state.activity].slice(0, ACTIVITY_LIMIT);
  return { ...state, activity };
}

function recordMistake(state, mistake) {
  const mistakes = [{ at: new Date().toISOString(), ...mistake }, ...state.mistakes].slice(0, MISTAKE_LIMIT);
  return { ...state, mistakes };
}

/** Drop stored mistakes for an item once the learner gets it right. */
function clearMistakes(state, refId) {
  return { ...state, mistakes: state.mistakes.filter((m) => m.refId !== refId) };
}

/* ------------------------------------------------------------------ *
 * Lessons
 * ------------------------------------------------------------------ */

export function visitLesson(state, lessonId) {
  const prev = state.lessons[lessonId] ?? { visits: 0, completedAt: null };
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: { ...prev, visits: prev.visits + 1, lastVisitedAt: new Date().toISOString() },
    },
  };
}

export function completeLesson(state, lesson) {
  const id = typeof lesson === 'string' ? lesson : lesson.id;
  const xpValue = typeof lesson === 'object' && lesson.xp ? lesson.xp : XP.LESSON_COMPLETE;
  const prev = state.lessons[id] ?? { visits: 1 };
  if (prev.completedAt) return state;

  let next = {
    ...state,
    lessons: { ...state.lessons, [id]: { ...prev, completedAt: new Date().toISOString() } },
  };
  next = awardXp(next, 'lesson', id, xpValue);
  next = recordActivityDay(next);
  next = logActivity(next, { type: 'lesson.complete', refId: id, xp: xpValue });
  return next;
}

export function isLessonComplete(state, lessonId) {
  return Boolean(state.lessons[lessonId]?.completedAt);
}

/* ------------------------------------------------------------------ *
 * Exercises
 * ------------------------------------------------------------------ */

export function recordExerciseAttempt(state, exercise, { passed, code }) {
  const id = exercise.id;
  const prev = state.exercises[id] ?? { attempts: 0, solved: false, solvedAt: null };
  const attempts = prev.attempts + 1;

  let next = {
    ...state,
    exercises: {
      ...state.exercises,
      [id]: {
        ...prev,
        attempts,
        lastCode: code ?? prev.lastCode,
        solved: prev.solved || passed,
        solvedAt: prev.solvedAt ?? (passed ? new Date().toISOString() : null),
        firstTrySolved: prev.solved ? prev.firstTrySolved : passed && attempts === 1,
      },
    },
  };

  if (passed && !prev.solved) {
    const base = exercise.xp ?? XP.EXERCISE_FIRST_SOLVE;
    next = awardXp(next, 'exercise', id, base);
    if (attempts === 1) next = awardXp(next, 'exercise-firsttry', id, XP.EXERCISE_FIRST_TRY_BONUS);
    next = recordActivityDay(next);
    next = logActivity(next, { type: 'exercise.solve', refId: id, xp: base });
    next = clearMistakes(next, id);
  } else if (!passed) {
    next = recordMistake(next, {
      kind: 'exercise',
      refId: id,
      topicIds: exercise.topicIds ?? [],
      title: exercise.title,
    });
  }
  return next;
}

/* ------------------------------------------------------------------ *
 * Quizzes
 * ------------------------------------------------------------------ */

export function recordQuizAttempt(state, quiz, { score, total, wrongQuestionIds = [] }) {
  const id = quiz.id;
  const prev = state.quizzes[id] ?? { attempts: [], bestRatio: 0 };
  const ratio = total > 0 ? score / total : 0;
  const attempt = { at: new Date().toISOString(), score, total, ratio, wrongQuestionIds };

  let next = {
    ...state,
    quizzes: {
      ...state.quizzes,
      [id]: {
        ...prev,
        attempts: [attempt, ...prev.attempts].slice(0, 20),
        bestRatio: Math.max(prev.bestRatio, ratio),
        passed: prev.passed || ratio >= QUIZ_PASS_THRESHOLD,
      },
    },
  };

  if (ratio >= QUIZ_PASS_THRESHOLD) {
    next = awardXp(next, 'quiz', id, XP.QUIZ_PASS);
    if (ratio === 1) next = awardXp(next, 'quiz-perfect', id, XP.QUIZ_PERFECT_BONUS);
  }
  next = recordActivityDay(next);
  next = logActivity(next, { type: 'quiz.attempt', refId: id, score, total });

  if (wrongQuestionIds.length === 0) {
    next = clearMistakes(next, id);
  } else {
    next = recordMistake(next, {
      kind: 'quiz',
      refId: id,
      questionIds: wrongQuestionIds,
      topicIds: quiz.topicIds ?? [],
      title: quiz.title ?? 'Quiz',
    });
  }
  return next;
}

/* ------------------------------------------------------------------ *
 * Challenges
 * ------------------------------------------------------------------ */

export function recordChallengeAttempt(state, challenge, { passed, code }) {
  const id = challenge.id;
  const prev = state.challenges[id] ?? { attempts: 0, solved: false };
  const attempts = prev.attempts + 1;

  let next = {
    ...state,
    challenges: {
      ...state.challenges,
      [id]: {
        ...prev,
        attempts,
        lastCode: code ?? prev.lastCode,
        solved: prev.solved || passed,
        solvedAt: prev.solvedAt ?? (passed ? new Date().toISOString() : null),
      },
    },
  };

  if (passed && !prev.solved) {
    const amount = challenge.xp ?? XP.CHALLENGE_SOLVE;
    next = awardXp(next, 'challenge', id, amount);
    next = recordActivityDay(next);
    next = logActivity(next, { type: 'challenge.solve', refId: id, xp: amount });
    next = clearMistakes(next, id);
  } else if (!passed) {
    next = recordMistake(next, {
      kind: 'challenge',
      refId: id,
      topicIds: challenge.topicIds ?? [],
      title: challenge.title,
    });
  }
  return next;
}

/* ------------------------------------------------------------------ *
 * Projects
 * ------------------------------------------------------------------ */

export function toggleProjectMilestone(state, project, milestoneId) {
  const id = project.id;
  const prev = state.projects[id] ?? { startedAt: new Date().toISOString(), milestones: {} };
  const done = Boolean(prev.milestones[milestoneId]);
  const milestones = { ...prev.milestones, [milestoneId]: !done };

  const totalMilestones = project.milestones?.length ?? 0;
  const completedCount = Object.values(milestones).filter(Boolean).length;
  const allDone = totalMilestones > 0 && completedCount === totalMilestones;

  let next = {
    ...state,
    projects: {
      ...state.projects,
      [id]: {
        ...prev,
        milestones,
        completedAt: allDone ? (prev.completedAt ?? new Date().toISOString()) : null,
      },
    },
  };

  if (!done) {
    next = awardXp(next, 'milestone', `${id}:${milestoneId}`, XP.PROJECT_MILESTONE);
    next = recordActivityDay(next);
    next = logActivity(next, { type: 'project.milestone', refId: id, milestoneId });
  }
  if (allDone) {
    next = awardXp(next, 'project', id, XP.PROJECT_COMPLETE);
    next = logActivity(next, { type: 'project.complete', refId: id, xp: XP.PROJECT_COMPLETE });
  }
  return next;
}

/* ------------------------------------------------------------------ *
 * Interview practice
 * ------------------------------------------------------------------ */

export function recordInterviewAnswer(state, question, { correct, selfRating = null }) {
  const id = question.id;
  const prev = state.interview[id] ?? { seen: 0, correctCount: 0, wrongCount: 0 };

  let next = {
    ...state,
    interview: {
      ...state.interview,
      [id]: {
        ...prev,
        seen: prev.seen + 1,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        wrongCount: prev.wrongCount + (correct === false ? 1 : 0),
        selfRating: selfRating ?? prev.selfRating,
        lastSeenAt: new Date().toISOString(),
      },
    },
  };

  next = awardXp(next, 'interview', id, XP.INTERVIEW_QUESTION);
  next = recordActivityDay(next);
  if (correct === false) {
    next = recordMistake(next, {
      kind: 'interview',
      refId: id,
      topicIds: question.topicIds ?? [],
      title: question.question,
    });
  } else if (correct === true) {
    next = clearMistakes(next, id);
  }
  return next;
}

/* ------------------------------------------------------------------ *
 * Bookmarks
 * ------------------------------------------------------------------ */

export function toggleBookmark(state, kind, refId, meta = {}) {
  const key = `${kind}:${refId}`;
  const bookmarks = { ...state.bookmarks };
  if (bookmarks[key]) delete bookmarks[key];
  else bookmarks[key] = { kind, refId, at: new Date().toISOString(), ...meta };
  return { ...state, bookmarks };
}

export function isBookmarked(state, kind, refId) {
  return Boolean(state.bookmarks[`${kind}:${refId}`]);
}

/* ------------------------------------------------------------------ *
 * Settings & profile
 * ------------------------------------------------------------------ */

export function updateSettings(state, patch) {
  return { ...state, settings: { ...state.settings, ...patch } };
}

export function updateProfile(state, patch) {
  return { ...state, profile: { ...state.profile, ...patch } };
}

/* ------------------------------------------------------------------ *
 * Placement
 * ------------------------------------------------------------------ */

/**
 * Store a placement result.
 *
 * Placement is evidence for a recommendation, not a record of work: this writes
 * exactly one key and deliberately touches nothing else. It must never mark a
 * lesson complete, solve an exercise, award XP, or log activity — scoring well on
 * a 42-question assessment is not the same as having done the curriculum, and
 * faking that history would corrupt every mastery and streak calculation that
 * reads from it.
 *
 * Saving a new result replaces the previous one outright, which is what makes a
 * retake a clean attempt rather than a merge of two.
 */
export function savePlacement(state, placement) {
  return { ...state, placement };
}

/** Discard the stored placement result, leaving all curriculum progress intact. */
export function clearPlacement(state) {
  return { ...state, placement: null };
}

/* ------------------------------------------------------------------ *
 * Derived read models
 * ------------------------------------------------------------------ */

export function moduleProgress(state, module) {
  const total = module.lessonIds?.length ?? 0;
  const completed = (module.lessonIds ?? []).filter((id) => isLessonComplete(state, id)).length;
  return {
    total,
    completed,
    ratio: total === 0 ? 0 : completed / total,
    started: completed > 0,
    complete: total > 0 && completed === total,
  };
}

export function curriculumProgress(state, modules) {
  const totals = modules.reduce(
    (acc, m) => {
      const p = moduleProgress(state, m);
      acc.lessons += p.total;
      acc.completed += p.completed;
      if (p.complete) acc.modulesComplete += 1;
      return acc;
    },
    { lessons: 0, completed: 0, modulesComplete: 0 },
  );
  return {
    ...totals,
    modules: modules.length,
    ratio: totals.lessons === 0 ? 0 : totals.completed / totals.lessons,
  };
}

export function quizAccuracy(state) {
  const entries = Object.values(state.quizzes);
  const totals = entries.reduce(
    (acc, q) => {
      const best = q.attempts?.[0];
      if (!best) return acc;
      // Use the learner's best attempt, not their most recent.
      const bestAttempt = q.attempts.reduce((a, b) => (b.ratio > a.ratio ? b : a), q.attempts[0]);
      acc.score += bestAttempt.score;
      acc.total += bestAttempt.total;
      return acc;
    },
    { score: 0, total: 0 },
  );
  return totals.total === 0 ? null : totals.score / totals.total;
}

export function exerciseStats(state) {
  const values = Object.values(state.exercises);
  const solved = values.filter((e) => e.solved).length;
  const attempted = values.length;
  return {
    solved,
    attempted,
    accuracy: attempted === 0 ? null : solved / attempted,
  };
}

export function challengeStats(state) {
  const values = Object.values(state.challenges);
  return { solved: values.filter((c) => c.solved).length, attempted: values.length };
}

export function projectStats(state) {
  const values = Object.values(state.projects);
  return { completed: values.filter((p) => p.completedAt).length, started: values.length };
}

/** Last `days` days of activity counts, oldest first — powers the heatmap. */
export function activityHeatmap(state, days = 84, today = new Date()) {
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({ date: key, count: state.streak.days[key] ?? 0 });
  }
  return out;
}

/** Total minutes of lessons the learner has completed. */
export function minutesLearned(state, lessonsById) {
  return Object.entries(state.lessons)
    .filter(([, v]) => v.completedAt)
    .reduce((n, [id]) => n + (lessonsById[id]?.estimatedMinutes ?? 0), 0);
}
