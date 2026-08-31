/**
 * Deterministic recommendations.
 *
 * There is no AI tutor here and the product never pretends otherwise. These are
 * explicit, explainable rules over the learner's own progress data, and every
 * recommendation carries a `reason` string that is shown in the UI — so a learner
 * always knows *why* something was suggested.
 */
import { weakTopics } from '../mastery/masteryEngine.js';
import { dayKey } from './progressEngine.js';

/** The next uncompleted lesson in curriculum order. */
export function nextLesson(state, { modules, lessons }) {
  const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));
  for (const module of modules) {
    for (const id of module.lessonIds) {
      if (!state.lessons[id]?.completedAt) {
        return { lesson: byId[id], module };
      }
    }
  }
  return null;
}

/** The lesson most recently opened but not finished. */
export function continueLesson(state, { lessons, modules }) {
  const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));
  const candidates = Object.entries(state.lessons)
    .filter(([id, rec]) => !rec.completedAt && rec.lastVisitedAt && byId[id])
    .sort((a, b) => (a[1].lastVisitedAt < b[1].lastVisitedAt ? 1 : -1));
  if (candidates.length === 0) return null;
  const lesson = byId[candidates[0][0]];
  return { lesson, module: modules.find((m) => m.id === lesson.moduleId) };
}

/**
 * A mixed list of next actions for the dashboard.
 * Weak-topic practice is ranked above simply moving forward, because closing a
 * gap is worth more than adding another partly-understood topic on top of it.
 */
export function recommendations(state, content, { limit = 4, includeMastery = true } = {}) {
  const out = [];
  const weak = includeMastery ? weakTopics(state, content.topics, content, { limit: 2, threshold: 0.6 }) : [];

  for (const topic of weak) {
    const exercise = content.exercises.find(
      (e) => e.topicIds.includes(topic.topicId) && !state.exercises[e.id]?.solved,
    );
    if (exercise) {
      out.push({
        kind: 'exercise',
        id: exercise.id,
        title: exercise.title,
        description: exercise.instructions,
        to: `/practice/exercise/${exercise.id}`,
        icon: 'fitness_center',
        meta: `+${exercise.xp} XP`,
        reason: `${topic.label} is your weakest started topic (${Math.round(topic.score * 100)}%)`,
      });
      continue;
    }
    const lesson = content.lessons.find(
      (l) => l.topicIds.includes(topic.topicId) && !state.lessons[l.id]?.completedAt,
    );
    if (lesson) {
      const module = content.modules.find((m) => m.id === lesson.moduleId);
      out.push({
        kind: 'lesson',
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        to: `/learn/${module.slug}/${lesson.slug}`,
        icon: 'school',
        meta: `${lesson.estimatedMinutes} min`,
        reason: `Strengthens ${topic.label}, currently at ${Math.round(topic.score * 100)}%`,
      });
    }
  }

  // Revisit anything recently failed.
  const failed = state.mistakes.find((m) => m.kind === 'exercise' && !state.exercises[m.refId]?.solved);
  if (failed) {
    const exercise = content.exercises.find((e) => e.id === failed.refId);
    if (exercise && !out.some((r) => r.id === exercise.id)) {
      out.push({
        kind: 'exercise',
        id: exercise.id,
        title: exercise.title,
        description: exercise.instructions,
        to: `/practice/exercise/${exercise.id}`,
        icon: 'refresh',
        meta: `+${exercise.xp} XP`,
        reason: 'You did not solve this last time',
      });
    }
  }

  // Then simply keep going.
  const next = continueLesson(state, content) ?? nextLesson(state, content);
  if (next?.lesson && !out.some((r) => r.id === next.lesson.id)) {
    out.push({
      kind: 'lesson',
      id: next.lesson.id,
      title: next.lesson.title,
      description: next.lesson.description,
      to: `/learn/${next.module.slug}/${next.lesson.slug}`,
      icon: 'play_arrow',
      meta: `${next.lesson.estimatedMinutes} min`,
      reason: 'The next lesson on your path',
    });
  }

  // Something applied, to break up reading.
  const challenge = content.challenges.find((c) => !state.challenges[c.id]?.solved);
  if (challenge && out.length < limit) {
    out.push({
      kind: 'challenge',
      id: challenge.id,
      title: challenge.title,
      description: challenge.prompt,
      to: `/challenges/${challenge.slug}`,
      icon: 'trophy',
      meta: `+${challenge.xp} XP`,
      reason: 'Apply what you have learned',
    });
  }

  return out.slice(0, limit);
}

/**
 * Daily challenge selection.
 *
 * Seeded by the calendar date so it is stable across refreshes and identical for
 * everyone on a given day, without needing a server.
 */
export function dailyChallenge(challenges, date = new Date()) {
  if (challenges.length === 0) return null;
  const key = dayKey(date);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return challenges[hash % challenges.length];
}

/** Items the learner previously got wrong and has not since fixed. */
export function reviewQueue(state, content) {
  const seen = new Set();
  const out = [];

  for (const mistake of state.mistakes) {
    if (seen.has(mistake.refId)) continue;
    seen.add(mistake.refId);

    if (mistake.kind === 'exercise') {
      if (state.exercises[mistake.refId]?.solved) continue;
      const exercise = content.exercises.find((e) => e.id === mistake.refId);
      if (exercise) {
        out.push({ ...mistake, to: `/practice/exercise/${exercise.id}`, title: exercise.title, icon: 'fitness_center' });
      }
    } else if (mistake.kind === 'challenge') {
      if (state.challenges[mistake.refId]?.solved) continue;
      const challenge = content.challenges.find((c) => c.id === mistake.refId);
      if (challenge) {
        out.push({ ...mistake, to: `/challenges/${challenge.slug}`, title: challenge.title, icon: 'trophy' });
      }
    } else if (mistake.kind === 'quiz') {
      const lesson = content.lessons.find((l) => l.quizId === mistake.refId);
      if (lesson) {
        const module = content.modules.find((m) => m.id === lesson.moduleId);
        out.push({
          ...mistake,
          to: `/learn/${module.slug}/${lesson.slug}`,
          title: `Quiz: ${lesson.title}`,
          icon: 'quiz',
        });
      }
    } else if (mistake.kind === 'interview') {
      out.push({ ...mistake, to: `/interview/question/${mistake.refId}`, icon: 'record_voice_over' });
    }
  }

  return out;
}
