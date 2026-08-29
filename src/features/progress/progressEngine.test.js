import { describe, it, expect } from 'vitest';
import {
  createInitialState, awardXp, recordActivityDay, currentStreak, completeLesson,
  recordExerciseAttempt, recordQuizAttempt, moduleProgress, dayKey, daysBetween,
  toggleBookmark, XP, quizAccuracy,
} from './progressEngine.js';

const LESSON = { id: 'l1', xp: 20, topicIds: ['variables'] };
const EXERCISE = { id: 'e1', xp: 15, topicIds: ['variables'], title: 'Exercise' };

describe('date helpers', () => {
  it('formats a local day key', () => {
    expect(dayKey(new Date(2026, 7, 22))).toBe('2026-08-22');
  });

  it('counts whole days between keys, ignoring DST shifts', () => {
    expect(daysBetween('2026-08-22', '2026-08-23')).toBe(1);
    expect(daysBetween('2026-08-22', '2026-09-01')).toBe(10);
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });
});

describe('XP', () => {
  it('awards XP once per reference', () => {
    let state = createInitialState();
    state = awardXp(state, 'lesson', 'l1', 20);
    state = awardXp(state, 'lesson', 'l1', 20);
    expect(state.xp.total).toBe(20);
  });

  it('does not re-award XP for an already completed lesson', () => {
    let state = createInitialState();
    state = completeLesson(state, LESSON);
    const afterFirst = state.xp.total;
    state = completeLesson(state, LESSON);
    expect(state.xp.total).toBe(afterFirst);
  });

  it('gives a first-try bonus only when solved on attempt one', () => {
    let clean = createInitialState();
    clean = recordExerciseAttempt(clean, EXERCISE, { passed: true });
    expect(clean.xp.total).toBe(EXERCISE.xp + XP.EXERCISE_FIRST_TRY_BONUS);

    let struggled = createInitialState();
    struggled = recordExerciseAttempt(struggled, EXERCISE, { passed: false });
    struggled = recordExerciseAttempt(struggled, EXERCISE, { passed: true });
    expect(struggled.xp.total).toBe(EXERCISE.xp);
  });
});

describe('streaks', () => {
  it('starts at one on the first active day', () => {
    const state = recordActivityDay(createInitialState(), new Date(2026, 7, 22));
    expect(state.streak.current).toBe(1);
    expect(state.streak.longest).toBe(1);
  });

  it('counts a day once no matter how much is done', () => {
    let state = createInitialState();
    const day = new Date(2026, 7, 22);
    state = recordActivityDay(state, day);
    state = recordActivityDay(state, day);
    state = recordActivityDay(state, day);
    expect(state.streak.current).toBe(1);
    expect(state.streak.days['2026-08-22']).toBe(3);
  });

  it('extends across consecutive days and resets after a gap', () => {
    let state = createInitialState();
    state = recordActivityDay(state, new Date(2026, 7, 20));
    state = recordActivityDay(state, new Date(2026, 7, 21));
    state = recordActivityDay(state, new Date(2026, 7, 22));
    expect(state.streak.current).toBe(3);

    state = recordActivityDay(state, new Date(2026, 7, 25));
    expect(state.streak.current).toBe(1);
    expect(state.streak.longest).toBe(3);
  });

  it('reports zero once the streak has lapsed', () => {
    let state = createInitialState();
    state = recordActivityDay(state, new Date(2026, 7, 20));
    expect(currentStreak(state, new Date(2026, 7, 21))).toBe(1);
    expect(currentStreak(state, new Date(2026, 7, 23))).toBe(0);
  });
});

describe('quizzes', () => {
  const quiz = { id: 'q1', topicIds: ['variables'] };

  it('records an attempt and keeps the best ratio', () => {
    let state = createInitialState();
    state = recordQuizAttempt(state, quiz, { score: 1, total: 4, wrongQuestionIds: ['a', 'b', 'c'] });
    state = recordQuizAttempt(state, quiz, { score: 3, total: 4, wrongQuestionIds: ['a'] });
    expect(state.quizzes.q1.bestRatio).toBe(0.75);
    expect(state.quizzes.q1.passed).toBe(true);
  });

  it('measures accuracy from the best attempt, not the latest', () => {
    let state = createInitialState();
    state = recordQuizAttempt(state, quiz, { score: 4, total: 4, wrongQuestionIds: [] });
    state = recordQuizAttempt(state, quiz, { score: 1, total: 4, wrongQuestionIds: ['a', 'b', 'c'] });
    expect(quizAccuracy(state)).toBe(1);
  });

  it('stores wrong answers for review and clears them on a clean run', () => {
    let state = createInitialState();
    state = recordQuizAttempt(state, quiz, { score: 1, total: 2, wrongQuestionIds: ['a'] });
    expect(state.mistakes.some((m) => m.refId === 'q1')).toBe(true);
    state = recordQuizAttempt(state, quiz, { score: 2, total: 2, wrongQuestionIds: [] });
    expect(state.mistakes.some((m) => m.refId === 'q1')).toBe(false);
  });
});

describe('module progress', () => {
  it('reports completion from real lesson records', () => {
    const module = { id: 'm1', lessonIds: ['a', 'b', 'c', 'd'] };
    let state = createInitialState();
    expect(moduleProgress(state, module)).toMatchObject({ completed: 0, started: false, complete: false });

    state = completeLesson(state, { id: 'a', xp: 10 });
    state = completeLesson(state, { id: 'b', xp: 10 });
    expect(moduleProgress(state, module)).toMatchObject({ completed: 2, ratio: 0.5, started: true, complete: false });

    state = completeLesson(state, { id: 'c', xp: 10 });
    state = completeLesson(state, { id: 'd', xp: 10 });
    expect(moduleProgress(state, module).complete).toBe(true);
  });
});

describe('bookmarks', () => {
  it('toggles on and off', () => {
    let state = createInitialState();
    state = toggleBookmark(state, 'lesson', 'l1', { title: 'A lesson' });
    expect(state.bookmarks['lesson:l1']).toBeTruthy();
    state = toggleBookmark(state, 'lesson', 'l1');
    expect(state.bookmarks['lesson:l1']).toBeUndefined();
  });
});
