/**
 * Achievements.
 *
 * Every achievement is a pure predicate over user state plus content metadata, so
 * unlocking is always derivable — there is no separate "unlocked" flag that can
 * drift from reality. `evaluateAchievements` returns the full list with progress,
 * which lets the UI render locked states with a real "3 / 10" rather than a
 * mystery box.
 */
import { MASTERY } from '../../content/schema/types.js';
import { allTopicMastery } from '../mastery/masteryEngine.js';
import { currentStreak } from '../progress/progressEngine.js';

const solvedExercises = (s) => Object.values(s.exercises).filter((e) => e.solved).length;
const solvedChallenges = (s) => Object.values(s.challenges).filter((c) => c.solved).length;
const completedLessons = (s) => Object.values(s.lessons).filter((l) => l.completedAt).length;
const completedProjects = (s) => Object.values(s.projects).filter((p) => p.completedAt).length;
const answeredInterview = (s) => Object.keys(s.interview).length;

/** Count of completed modules, using manifest module metadata. */
function completedModules(state, content) {
  return (content.modules ?? []).filter(
    (m) => m.lessonIds.length > 0 && m.lessonIds.every((id) => state.lessons[id]?.completedAt),
  ).length;
}

function masteredTopic(state, content, topicId) {
  const topics = (content.topics ?? []).filter((t) => t.id === topicId);
  if (topics.length === 0) return false;
  const [result] = allTopicMastery(state, topics, content);
  return result?.level === MASTERY.MASTERED;
}

/**
 * `progress` returns [current, target] so locked achievements can show real
 * progress. `unlocked` is derived from that pair unless stated otherwise.
 */
export const ACHIEVEMENTS = [
  {
    id: 'first-line',
    title: 'First Line of Code',
    description: 'Run your first piece of JavaScript.',
    icon: 'terminal',
    tier: 'bronze',
    progress: (s) => [Math.min(1, s.activity.length > 0 || Object.keys(s.lessons).length > 0 ? 1 : 0), 1],
  },
  {
    id: 'first-lesson',
    title: 'First Lesson',
    description: 'Complete your first lesson.',
    icon: 'school',
    tier: 'bronze',
    progress: (s) => [Math.min(completedLessons(s), 1), 1],
  },
  {
    id: 'first-module',
    title: 'Module Cleared',
    description: 'Complete every lesson in a module.',
    icon: 'inventory',
    tier: 'silver',
    progress: (s, c) => [Math.min(completedModules(s, c), 1), 1],
  },
  {
    id: 'five-modules',
    title: 'Five Modules Down',
    description: 'Complete five modules.',
    icon: 'library_books',
    tier: 'gold',
    progress: (s, c) => [Math.min(completedModules(s, c), 5), 5],
  },
  {
    id: 'ten-lessons',
    title: 'Getting Serious',
    description: 'Complete 10 lessons.',
    icon: 'menu_book',
    tier: 'bronze',
    progress: (s) => [Math.min(completedLessons(s), 10), 10],
  },
  {
    id: 'fifty-lessons',
    title: 'Committed Learner',
    description: 'Complete 50 lessons.',
    icon: 'auto_stories',
    tier: 'gold',
    progress: (s) => [Math.min(completedLessons(s), 50), 50],
  },
  {
    id: 'ten-exercises',
    title: '10 Exercises',
    description: 'Solve 10 exercises.',
    icon: 'fitness_center',
    tier: 'bronze',
    progress: (s) => [Math.min(solvedExercises(s), 10), 10],
  },
  {
    id: 'fifty-exercises',
    title: '50 Exercises',
    description: 'Solve 50 exercises.',
    icon: 'exercise',
    tier: 'silver',
    progress: (s) => [Math.min(solvedExercises(s), 50), 50],
  },
  {
    id: 'hundred-exercises',
    title: '100 Exercises',
    description: 'Solve 100 exercises.',
    icon: 'military_tech',
    tier: 'gold',
    progress: (s) => [Math.min(solvedExercises(s), 100), 100],
  },
  {
    id: 'array-master',
    title: 'Array Master',
    description: 'Reach Mastered on array iteration methods.',
    icon: 'view_list',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'array-methods') ? 1 : 0, 1],
  },
  {
    id: 'function-master',
    title: 'Function Master',
    description: 'Reach Mastered on functions.',
    icon: 'code',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'functions') ? 1 : 0, 1],
  },
  {
    id: 'closure-master',
    title: 'Closure Master',
    description: 'Reach Mastered on closures.',
    icon: 'lock',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'closures') ? 1 : 0, 1],
  },
  {
    id: 'async-master',
    title: 'Async Master',
    description: 'Reach Mastered on promises.',
    icon: 'sync',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'promises') ? 1 : 0, 1],
  },
  {
    id: 'dom-builder',
    title: 'DOM Builder',
    description: 'Reach Mastered on DOM fundamentals.',
    icon: 'account_tree',
    tier: 'silver',
    progress: (s, c) => [masteredTopic(s, c, 'dom') ? 1 : 0, 1],
  },
  {
    id: 'first-project',
    title: 'First Project',
    description: 'Complete a guided project.',
    icon: 'folder_special',
    tier: 'silver',
    progress: (s) => [Math.min(completedProjects(s), 1), 1],
  },
  {
    id: 'five-projects',
    title: 'Five Projects',
    description: 'Complete five guided projects.',
    icon: 'workspaces',
    tier: 'gold',
    progress: (s) => [Math.min(completedProjects(s), 5), 5],
  },
  {
    id: 'challenge-solver',
    title: 'Challenge Solver',
    description: 'Solve 25 coding challenges.',
    icon: 'trophy',
    tier: 'silver',
    progress: (s) => [Math.min(solvedChallenges(s), 25), 25],
  },
  {
    id: 'challenge-expert',
    title: 'Challenge Expert',
    description: 'Solve an Expert-difficulty challenge.',
    icon: 'workspace_premium',
    tier: 'gold',
    progress: (s, c) => {
      const expert = (c.challenges ?? []).filter((ch) => ch.difficulty === 'expert');
      return [expert.some((ch) => s.challenges[ch.id]?.solved) ? 1 : 0, 1];
    },
  },
  {
    id: 'debugger',
    title: 'Debugger',
    description: 'Solve 10 fix-the-bug exercises.',
    icon: 'bug_report',
    tier: 'silver',
    progress: (s, c) => {
      const bugs = (c.exercises ?? []).filter((e) => e.kind === 'fixBug');
      const solved = bugs.filter((e) => s.exercises[e.id]?.solved).length;
      return [Math.min(solved, 10), 10];
    },
  },
  {
    id: 'streak-7',
    title: 'Seven Day Streak',
    description: 'Learn on seven consecutive days.',
    icon: 'local_fire_department',
    tier: 'silver',
    progress: (s) => [Math.min(s.streak.longest, 7), 7],
  },
  {
    id: 'streak-30',
    title: 'Thirty Day Streak',
    description: 'Learn on thirty consecutive days.',
    icon: 'whatshot',
    tier: 'gold',
    progress: (s) => [Math.min(s.streak.longest, 30), 30],
  },
  {
    id: 'interview-ready',
    title: 'Interview Ready',
    description: 'Work through 100 interview questions.',
    icon: 'record_voice_over',
    tier: 'gold',
    progress: (s) => [Math.min(answeredInterview(s), 100), 100],
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Score 100% on ten quizzes.',
    icon: 'target',
    tier: 'silver',
    progress: (s) => {
      const perfect = Object.values(s.quizzes).filter((q) => q.bestRatio === 1).length;
      return [Math.min(perfect, 10), 10];
    },
  },
  {
    id: 'polyglot-topics',
    title: 'Broad Foundation',
    description: 'Reach at least Practicing on 20 topics.',
    icon: 'hub',
    tier: 'gold',
    progress: (s, c) => {
      const levels = allTopicMastery(s, c.topics ?? [], c);
      const count = levels.filter(
        (t) => t.level === MASTERY.PRACTICING || t.level === MASTERY.MASTERED,
      ).length;
      return [Math.min(count, 20), 20];
    },
  },
  {
    id: 'javascript-master',
    title: 'JavaScript Master',
    description: 'Reach Mastered on 40 topics.',
    icon: 'diamond',
    tier: 'platinum',
    progress: (s, c) => {
      const levels = allTopicMastery(s, c.topics ?? [], c);
      return [Math.min(levels.filter((t) => t.level === MASTERY.MASTERED).length, 40), 40];
    },
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

/**
 * Evaluate every achievement against current state.
 * Returns the list enriched with `{ current, target, unlocked, ratio, unlockedAt }`.
 */
export function evaluateAchievements(state, content) {
  return ACHIEVEMENTS.map((a) => {
    let current = 0;
    let target = 1;
    try {
      [current, target] = a.progress(state, content);
    } catch {
      // A malformed content set must never break the achievements screen.
      current = 0;
      target = 1;
    }
    const unlocked = target > 0 && current >= target;
    return {
      ...a,
      current,
      target,
      unlocked,
      ratio: target === 0 ? 0 : Math.min(1, current / target),
      unlockedAt: state.achievements[a.id] ?? null,
    };
  });
}

/**
 * Find achievements that have just become true and stamp them with an unlock time.
 * Returns `{ state, newlyUnlocked }` so the caller can show a notification.
 */
export function syncAchievements(state, content) {
  const evaluated = evaluateAchievements(state, content);
  const newlyUnlocked = evaluated.filter((a) => a.unlocked && !state.achievements[a.id]);
  if (newlyUnlocked.length === 0) return { state, newlyUnlocked: [] };

  const at = new Date().toISOString();
  const achievements = { ...state.achievements };
  let xpTotal = state.xp.total;
  const awarded = { ...state.xp.awarded };

  for (const a of newlyUnlocked) {
    achievements[a.id] = at;
    const key = `achievement:${a.id}`;
    if (!awarded[key]) {
      awarded[key] = 25;
      xpTotal += 25;
    }
  }

  return {
    state: { ...state, achievements, xp: { total: xpTotal, awarded } },
    newlyUnlocked,
  };
}

export { currentStreak };
