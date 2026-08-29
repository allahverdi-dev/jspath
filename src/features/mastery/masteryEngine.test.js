import { describe, it, expect } from 'vitest';
import { topicMastery, masteryLevel, weakTopics } from './masteryEngine.js';
import { createInitialState, completeLesson, recordExerciseAttempt, recordQuizAttempt } from '../progress/progressEngine.js';
import { MASTERY } from '../../content/schema/types.js';

const content = {
  topics: [{ id: 'arrays', label: 'Arrays', group: 'Core' }, { id: 'closures', label: 'Closures', group: 'Advanced' }],
  lessons: [
    { id: 'l1', topicIds: ['arrays'], estimatedMinutes: 10 },
    { id: 'l2', topicIds: ['arrays'], estimatedMinutes: 10 },
  ],
  exercises: [
    { id: 'e1', topicIds: ['arrays'], xp: 10 },
    { id: 'e2', topicIds: ['arrays'], xp: 10 },
    { id: 'e3', topicIds: ['arrays'], xp: 10 },
    { id: 'e4', topicIds: ['arrays'], xp: 10 },
  ],
  challenges: [{ id: 'c1', topicIds: ['arrays'], xp: 40 }],
  quizzes: [{ id: 'q1', topicIds: ['arrays'], questions: [{ id: 'q1a', topicIds: ['arrays'] }, { id: 'q1b', topicIds: ['arrays'] }] }],
  modules: [],
};

describe('topic mastery', () => {
  it('is Not Started with no activity', () => {
    const result = topicMastery(createInitialState(), 'arrays', content);
    expect(result.level).toBe(MASTERY.NOT_STARTED);
    expect(result.score).toBe(0);
  });

  it('cannot reach Mastered from lesson completion alone', () => {
    let state = createInitialState();
    state = completeLesson(state, { id: 'l1', xp: 10 });
    state = completeLesson(state, { id: 'l2', xp: 10 });

    const result = topicMastery(state, 'arrays', content);
    expect(result.components.lessons).toBe(1);
    expect(result.level).not.toBe(MASTERY.MASTERED);
    expect(result.level).toBe(MASTERY.LEARNING);
  });

  it('reaches Mastered with full lesson, exercise, quiz and challenge evidence', () => {
    let state = createInitialState();
    state = completeLesson(state, { id: 'l1', xp: 10 });
    state = completeLesson(state, { id: 'l2', xp: 10 });
    for (const id of ['e1', 'e2', 'e3', 'e4']) {
      state = recordExerciseAttempt(state, { id, xp: 10, topicIds: ['arrays'] }, { passed: true });
    }
    state = recordExerciseAttempt(state, { id: 'c1', xp: 40, topicIds: ['arrays'] }, { passed: true });
    state.challenges.c1 = { attempts: 1, solved: true, solvedAt: new Date().toISOString() };
    state = recordQuizAttempt(state, content.quizzes[0], { score: 2, total: 2, wrongQuestionIds: [] });

    const result = topicMastery(state, 'arrays', content);
    expect(result.score).toBeGreaterThan(0.85);
    expect(result.level).toBe(MASTERY.MASTERED);
  });

  it('gives less credit for a solve that took many attempts', () => {
    const build = (attempts) => {
      let state = createInitialState();
      for (let i = 0; i < attempts - 1; i += 1) {
        state = recordExerciseAttempt(state, { id: 'e1', xp: 10, topicIds: ['arrays'] }, { passed: false });
      }
      return recordExerciseAttempt(state, { id: 'e1', xp: 10, topicIds: ['arrays'] }, { passed: true });
    };
    const clean = topicMastery(build(1), 'arrays', content);
    const struggled = topicMastery(build(6), 'arrays', content);
    expect(clean.components.exercises).toBeGreaterThan(struggled.components.exercises);
  });

  it('decays a topic left untouched for a long time', () => {
    let state = createInitialState();
    state = completeLesson(state, { id: 'l1', xp: 10 });
    state = completeLesson(state, { id: 'l2', xp: 10 });

    const now = new Date();
    const muchLater = new Date(now.getTime() + 200 * 86_400_000);
    const fresh = topicMastery(state, 'arrays', content, now);
    const stale = topicMastery(state, 'arrays', content, muchLater);

    expect(stale.score).toBeLessThan(fresh.score);
    expect(stale.evidence.decayApplied).toBe(true);
  });
});

describe('masteryLevel gate', () => {
  it('refuses Mastered without enough assessments even at a high score', () => {
    const level = masteryLevel(0.95, { lessonsDone: 5, assessmentCount: 1, quizAccuracy: 1 });
    expect(level).not.toBe(MASTERY.MASTERED);
  });

  it('refuses Mastered when quiz accuracy is poor', () => {
    const level = masteryLevel(0.9, { lessonsDone: 5, assessmentCount: 8, quizAccuracy: 0.4 });
    expect(level).not.toBe(MASTERY.MASTERED);
  });
});

describe('weak topics', () => {
  it('excludes topics that have never been started', () => {
    let state = createInitialState();
    state = completeLesson(state, { id: 'l1', xp: 10 });
    const weak = weakTopics(state, content.topics, content, { limit: 5, threshold: 0.9 });
    expect(weak.some((t) => t.topicId === 'closures')).toBe(false);
    expect(weak.some((t) => t.topicId === 'arrays')).toBe(true);
  });
});
