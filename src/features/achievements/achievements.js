/**
 * Achievements.
 *
 * Every achievement is a pure predicate over user state plus content metadata, so
 * unlocking is always derivable — there is no separate "unlocked" flag that can
 * drift from reality. `evaluateAchievements` returns the full list with progress,
 * which lets the UI render locked states with a real "3 / 10" rather than a
 * mystery box.
 *
 * Achievement names and descriptions are not stored here: they are product copy,
 * and this module is locale-free logic. The UI looks them up by id under
 * `achievements.items.<id>` in the dictionaries, so adding an achievement fails
 * the i18n test until every language has wording for it.
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
    icon: 'terminal',
    tier: 'bronze',
    progress: (s) => [Math.min(1, s.activity.length > 0 || Object.keys(s.lessons).length > 0 ? 1 : 0), 1],
  },
  {
    id: 'first-lesson',
    icon: 'school',
    tier: 'bronze',
    progress: (s) => [Math.min(completedLessons(s), 1), 1],
  },
  {
    id: 'first-module',
    icon: 'inventory',
    tier: 'silver',
    progress: (s, c) => [Math.min(completedModules(s, c), 1), 1],
  },
  {
    id: 'five-modules',
    icon: 'library_books',
    tier: 'gold',
    progress: (s, c) => [Math.min(completedModules(s, c), 5), 5],
  },
  {
    id: 'ten-lessons',
    icon: 'menu_book',
    tier: 'bronze',
    progress: (s) => [Math.min(completedLessons(s), 10), 10],
  },
  {
    id: 'fifty-lessons',
    icon: 'auto_stories',
    tier: 'gold',
    progress: (s) => [Math.min(completedLessons(s), 50), 50],
  },
  {
    id: 'ten-exercises',
    icon: 'fitness_center',
    tier: 'bronze',
    progress: (s) => [Math.min(solvedExercises(s), 10), 10],
  },
  {
    id: 'fifty-exercises',
    icon: 'exercise',
    tier: 'silver',
    progress: (s) => [Math.min(solvedExercises(s), 50), 50],
  },
  {
    id: 'hundred-exercises',
    icon: 'military_tech',
    tier: 'gold',
    progress: (s) => [Math.min(solvedExercises(s), 100), 100],
  },
  {
    id: 'array-master',
    icon: 'view_list',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'array-methods') ? 1 : 0, 1],
  },
  {
    id: 'function-master',
    icon: 'code',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'functions') ? 1 : 0, 1],
  },
  {
    id: 'closure-master',
    icon: 'lock',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'closures') ? 1 : 0, 1],
  },
  {
    id: 'async-master',
    icon: 'sync',
    tier: 'gold',
    progress: (s, c) => [masteredTopic(s, c, 'promises') ? 1 : 0, 1],
  },
  {
    id: 'dom-builder',
    icon: 'account_tree',
    tier: 'silver',
    progress: (s, c) => [masteredTopic(s, c, 'dom') ? 1 : 0, 1],
  },
  {
    id: 'first-project',
    icon: 'folder_special',
    tier: 'silver',
    progress: (s) => [Math.min(completedProjects(s), 1), 1],
  },
  {
    id: 'five-projects',
    icon: 'workspaces',
    tier: 'gold',
    progress: (s) => [Math.min(completedProjects(s), 5), 5],
  },
  {
    id: 'challenge-solver',
    icon: 'trophy',
    tier: 'silver',
    progress: (s) => [Math.min(solvedChallenges(s), 25), 25],
  },
  {
    id: 'challenge-expert',
    icon: 'workspace_premium',
    tier: 'gold',
    progress: (s, c) => {
      const expert = (c.challenges ?? []).filter((ch) => ch.difficulty === 'expert');
      return [expert.some((ch) => s.challenges[ch.id]?.solved) ? 1 : 0, 1];
    },
  },
  {
    id: 'debugger',
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
    icon: 'local_fire_department',
    tier: 'silver',
    progress: (s) => [Math.min(s.streak.longest, 7), 7],
  },
  {
    id: 'streak-30',
    icon: 'whatshot',
    tier: 'gold',
    progress: (s) => [Math.min(s.streak.longest, 30), 30],
  },
  {
    id: 'interview-ready',
    icon: 'record_voice_over',
    tier: 'gold',
    progress: (s) => [Math.min(answeredInterview(s), 100), 100],
  },
  {
    id: 'perfectionist',
    icon: 'target',
    tier: 'silver',
    progress: (s) => {
      const perfect = Object.values(s.quizzes).filter((q) => q.bestRatio === 1).length;
      return [Math.min(perfect, 10), 10];
    },
  },
  {
    id: 'polyglot-topics',
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
