import { describe, it, expect } from 'vitest';
import { VALIDATORS, scanForPlaceholders } from '../content/schema/validate.js';
import { TOPIC_IDS } from '../content/topics.js';
import { MODULES } from '../content/curriculum/modules.js';
import m00 from '../content/curriculum/00-orientation/lessons.js';
import m01 from '../content/curriculum/01-variables/lessons.js';
import m02 from '../content/curriculum/02-data-types/lessons.js';
import m03 from '../content/curriculum/03-coercion/lessons.js';
import m04 from '../content/curriculum/04-operators/lessons.js';
import m05 from '../content/curriculum/05-strings/lessons.js';
import m06 from '../content/curriculum/06-numbers/lessons.js';
import m07 from '../content/curriculum/07-control-flow/lessons.js';
import m08 from '../content/curriculum/08-functions/lessons.js';
import m09 from '../content/curriculum/09-arrow-functions/lessons.js';
import m10 from '../content/curriculum/10-scope-hoisting/lessons.js';
import m11 from '../content/curriculum/11-loops/lessons.js';
import m12 from '../content/curriculum/12-arrays/lessons.js';
import m13 from '../content/curriculum/13-array-methods/lessons.js';
import m14 from '../content/curriculum/14-objects/lessons.js';
import m15 from '../content/curriculum/15-object-utilities/lessons.js';
import m16 from '../content/curriculum/16-dates-regex/lessons.js';
import m17 from '../content/curriculum/17-dom/lessons.js';
import m18 from '../content/curriculum/18-dom-manipulation/lessons.js';
import m19 from '../content/curriculum/19-events/lessons.js';
import m20 from '../content/curriculum/20-forms/lessons.js';
import m21 from '../content/curriculum/21-modern-javascript/lessons.js';
import m22 from '../content/curriculum/22-errors-debugging/lessons.js';
import m23 from '../content/curriculum/23-async-foundations/lessons.js';
import m24 from '../content/curriculum/24-promises/lessons.js';
import m25 from '../content/curriculum/25-async-await/lessons.js';
import m26 from '../content/curriculum/26-http-fetch/lessons.js';
import m27 from '../content/curriculum/27-storage-web-apis/lessons.js';
import m28 from '../content/curriculum/28-modules/lessons.js';
import m29 from '../content/curriculum/29-this/lessons.js';
import m30 from '../content/curriculum/30-prototypes/lessons.js';
import m31 from '../content/curriculum/31-classes/lessons.js';
import m32 from '../content/curriculum/32-closures/lessons.js';
import m33 from '../content/curriculum/33-event-loop/lessons.js';
import m34 from '../content/curriculum/34-data-structures/lessons.js';
import m35 from '../content/curriculum/35-iterators-generators/lessons.js';
import m36 from '../content/curriculum/36-metaprogramming/lessons.js';
import m37 from '../content/curriculum/37-functional/lessons.js';
import m38 from '../content/curriculum/38-recursion/lessons.js';
import m39 from '../content/curriculum/39-algorithms/lessons.js';
import m40 from '../content/curriculum/40-clean-code/lessons.js';
import m41 from '../content/curriculum/41-design-patterns/lessons.js';
import m42 from '../content/curriculum/42-testing/lessons.js';
import m43 from '../content/curriculum/43-performance/lessons.js';
import m44 from '../content/curriculum/44-security/lessons.js';
import m45 from '../content/curriculum/45-workflow/lessons.js';
import m46 from '../content/curriculum/46-interview-mastery/lessons.js';
import { mergeStates } from '../state/UserStateProvider.jsx';
import { createInitialState, completeLesson, recordExerciseAttempt } from '../features/progress/progressEngine.js';
import { search } from '../features/search/searchIndex.js';

/** Every authored lesson, so these invariants cover the whole curriculum. */
const authored = [
  ...m00, ...m01, ...m02, ...m03, ...m04, ...m05, ...m06, ...m07,
  ...m08, ...m09, ...m10, ...m11, ...m12, ...m13, ...m14, ...m15,
  ...m16, ...m17, ...m18, ...m19, ...m20,
  ...m21, ...m22, ...m23, ...m24, ...m25, ...m26, ...m27, ...m28, ...m29, ...m30, ...m31, ...m32, ...m33, ...m34, ...m35, ...m36, ...m37, ...m38, ...m39, ...m40, ...m41, ...m42, ...m43, ...m44, ...m45, ...m46,
];

/**
 * Cross-cutting content guarantees. `npm run content:audit` is the exhaustive
 * check; these keep the same invariants enforced in the normal test run.
 */
describe('curriculum structure', () => {
  it('defines the full 47-module curriculum in order', () => {
    expect(MODULES).toHaveLength(47);
    MODULES.forEach((m, i) => expect(m.order).toBe(i));
  });

  it('uses unique module ids and slugs', () => {
    expect(new Set(MODULES.map((m) => m.id)).size).toBe(MODULES.length);
    expect(new Set(MODULES.map((m) => m.slug)).size).toBe(MODULES.length);
  });

  it('only references topics that exist', () => {
    for (const m of MODULES) {
      for (const t of m.topicIds) expect(TOPIC_IDS).toContain(t);
    }
  });

  it('only references prerequisite modules that exist', () => {
    const ids = new Set(MODULES.map((m) => m.id));
    for (const m of MODULES) {
      for (const p of m.prerequisites ?? []) expect(ids.has(p)).toBe(true);
    }
  });
});

describe('authored lessons', () => {
  it('covers every module that declares lessons', () => {
    const moduleIds = new Set(authored.map((l) => l.moduleId));
    expect(moduleIds.size).toBe(47);
  });

  it('uses globally unique lesson ids and slugs', () => {
    expect(new Set(authored.map((l) => l.id)).size).toBe(authored.length);
    expect(new Set(authored.map((l) => l.slug)).size).toBe(authored.length);
  });

  it('only references topics that exist', () => {
    for (const lesson of authored) {
      for (const t of lesson.topicIds) expect(TOPIC_IDS).toContain(t);
    }
  });

  it('only links to lessons that exist', () => {
    const ids = new Set(authored.map((l) => l.id));
    for (const lesson of authored) {
      for (const ref of lesson.relatedLessons ?? []) expect(ids.has(ref)).toBe(true);
      for (const ref of lesson.prerequisites ?? []) expect(ids.has(ref)).toBe(true);
    }
  });

  it('pass schema validation', () => {
    for (const lesson of authored) {
      expect(VALIDATORS.lesson(lesson)).toEqual([]);
    }
  });

  it('contain no placeholder text', () => {
    for (const lesson of authored) {
      expect(scanForPlaceholders(lesson)).toEqual([]);
    }
  });

  it('have quizzes whose correct answers are in range and explained', () => {
    for (const lesson of authored) {
      if (!lesson.quiz) continue;
      expect(VALIDATORS.quiz(lesson.quiz)).toEqual([]);
    }
  });

  it('have exercises that are solvable — tests or a correct option', () => {
    for (const lesson of authored) {
      for (const exercise of lesson.exercises ?? []) {
        expect(VALIDATORS.exercise(exercise)).toEqual([]);
        const hasTests = (exercise.tests ?? []).length > 0;
        const hasChoice = Number.isInteger(exercise.correct);
        expect(hasTests || hasChoice).toBe(true);
      }
    }
  });
});

describe('search', () => {
  it('finds an authored lesson by title', () => {
    const results = search('javascript');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns nothing for a one-character query', () => {
    expect(search('a')).toEqual([]);
  });

  it('requires every term to match', () => {
    expect(search('zzzz notarealterm')).toEqual([]);
  });
});

describe('guest to account migration', () => {
  it('keeps progress made in either place', () => {
    let guest = createInitialState();
    guest = completeLesson(guest, { id: 'l-a', xp: 20 });
    guest = recordExerciseAttempt(guest, { id: 'e-a', xp: 10, topicIds: [] }, { passed: true });

    let account = createInitialState();
    account = completeLesson(account, { id: 'l-b', xp: 20 });

    const merged = mergeStates(account, guest);

    expect(merged.lessons['l-a'].completedAt).toBeTruthy();
    expect(merged.lessons['l-b'].completedAt).toBeTruthy();
    expect(merged.exercises['e-a'].solved).toBe(true);
  });

  it('never loses a solved exercise when the remote record is unsolved', () => {
    let guest = createInitialState();
    guest = recordExerciseAttempt(guest, { id: 'e1', xp: 10, topicIds: [] }, { passed: true });

    let account = createInitialState();
    account = recordExerciseAttempt(account, { id: 'e1', xp: 10, topicIds: [] }, { passed: false });

    expect(mergeStates(account, guest).exercises.e1.solved).toBe(true);
  });

  it('does not double-count XP for the same award', () => {
    let guest = createInitialState();
    guest = completeLesson(guest, { id: 'l1', xp: 20 });

    const account = JSON.parse(JSON.stringify(guest));
    const merged = mergeStates(account, guest);

    expect(merged.xp.total).toBe(guest.xp.total);
  });

  it('returns the local state when there is nothing remote', () => {
    const guest = completeLesson(createInitialState(), { id: 'l1', xp: 20 });
    expect(mergeStates(null, guest)).toBe(guest);
  });
});
