import { describe, expect, it } from 'vitest';
import { modules, lessons, exercises, challenges, projects, interviewQuestions, references, cheatSheets, quizIndex, contentIndex } from '../../content/registry.js';
import { FREE_SAMPLE_CONTENT_IDS, PRO_CONTENT_IDS } from './accessCatalog.js';
import { canAccessContent, planHasFeature, requiredPlanForContent } from './access.js';
import { CONTENT_ALLOCATION } from './contentAllocation.js';
import { FEATURE } from './plans.js';
import { createInitialState, recordQuizAttempt } from '../progress/progressEngine.js';
import { topicMastery } from '../mastery/masteryEngine.js';

const collections = { module: modules, lesson: lessons, exercise: exercises, challenge: challenges, project: projects, interview: interviewQuestions, reference: references, cheatsheet: cheatSheets };
const expected = { module: [47, 0], lesson: [214, 0], exercise: [650, 160], challenge: [15, 156], project: [5, 26], interview: [25, 287], reference: [213, 0], cheatsheet: [9, 0] };

describe('approved allocation against the actual registry', () => {
  it.each(Object.entries(expected))('%s has its exact Free / Pro allocation', (kind, [free, pro]) => {
    const items = collections[kind];
    expect(items).toHaveLength(free + pro);
    expect(items.filter(({ id }) => requiredPlanForContent(kind, id) === 'free')).toHaveLength(free);
    expect(items.filter(({ id }) => requiredPlanForContent(kind, id) === 'pro')).toHaveLength(pro);
    expect(CONTENT_ALLOCATION[kind]).toEqual({ free, pro, total: free + pro });
  });

  for (const [name, catalog] of Object.entries({ Free: FREE_SAMPLE_CONTENT_IDS, Pro: PRO_CONTENT_IDS })) {
    it.each(Object.entries(catalog))(`${name} %s IDs exist, are unique and immutable`, (kind, ids) => {
      expect(new Set(ids).size).toBe(ids.length);
      expect(Object.isFrozen(ids)).toBe(true);
      const existing = new Set(collections[kind].map((item) => item.id));
      for (const id of ids) expect(existing.has(id), id).toBe(true);
    });
  }

  it('keeps at least two Free exercises in every lesson with exercises', () => {
    for (const lesson of lessons.filter((item) => item.exerciseIds.length)) {
      const free = lesson.exerciseIds.filter((id) => requiredPlanForContent('exercise', id) === 'free');
      expect(free.length, lesson.id).toBeGreaterThanOrEqual(Math.min(2, lesson.exerciseIds.length));
    }
  });

  it('reserves later mastery practice, never beginner/easy or foundational exercises', () => {
    const paid = exercises.filter(({ id }) => PRO_CONTENT_IDS.exercise.includes(id));
    expect(paid.filter(({ difficulty }) => difficulty === 'hard')).toHaveLength(92);
    expect(paid.filter(({ difficulty }) => difficulty === 'medium')).toHaveLength(68);
    expect(new Set(paid.map(({ lessonId }) => lessonId)).size).toBe(80);
    for (const exercise of exercises.filter(({ moduleId }) => Number(moduleId?.slice(1)) < 23)) {
      expect(requiredPlanForContent('exercise', exercise.id)).toBe('free');
    }
  });

  it('samples challenges across all real difficulty levels and fourteen categories', () => {
    const sample = challenges.filter(({ id }) => FREE_SAMPLE_CONTENT_IDS.challenge.includes(id));
    const counts = Object.fromEntries(['beginner', 'easy', 'medium', 'hard', 'expert'].map((d) => [d, sample.filter((c) => c.difficulty === d).length]));
    expect(counts).toEqual({ beginner: 4, easy: 4, medium: 4, hard: 2, expert: 1 });
    expect(new Set(sample.map((c) => c.category)).size).toBe(14);
  });

  it('samples projects from beginner through a substantial hard build', () => {
    const sample = projects.filter(({ id }) => FREE_SAMPLE_CONTENT_IDS.project.includes(id));
    expect(sample.map((p) => p.difficulty).sort()).toEqual(['beginner', 'easy', 'hard', 'medium', 'medium']);
    expect(sample.find((p) => p.difficulty === 'hard').milestoneCount).toBeGreaterThanOrEqual(5);
  });

  it('samples interview levels, topics and formats without exposing answers in metadata', () => {
    const sample = interviewQuestions.filter(({ id }) => FREE_SAMPLE_CONTENT_IDS.interview.includes(id));
    expect(new Set(sample.map((q) => q.topic)).size).toBe(17);
    expect(new Set(sample.map((q) => q.level))).toEqual(new Set(['junior', 'junior+', 'intermediate', 'advanced']));
    expect(new Set(sample.map((q) => q.kind)).size).toBeGreaterThanOrEqual(12);
    for (const q of interviewQuestions) expect(q).not.toHaveProperty('shortAnswer');
  });
});

describe('centralized access policy', () => {
  it.each(['guest', 'free', 'pro'])('%s receives exactly its content allocation, even with checkout enforcement disabled', (plan) => {
    for (const [kind, items] of Object.entries(collections)) {
      for (const { id } of items) {
        expect(canAccessContent({ kind, id, plan, enforcePaidAccess: false }), `${plan}:${id}`)
          .toBe(plan === 'pro' || requiredPlanForContent(kind, id) === 'free');
      }
    }
  });

  it.each(['challenge', 'project', 'interview'])('unknown or omitted %s IDs default to Pro', (kind) => {
    for (const id of ['future-content', undefined, '', 'constructor', '__proto__']) {
      expect(requiredPlanForContent(kind, id)).toBe('pro');
      expect(canAccessContent({ kind, id, plan: 'free' })).toBe(false);
    }
  });

  it.each(['module', 'lesson', 'exercise', 'reference', 'cheatsheet'])('new %s content defaults to Free', (kind) => {
    expect(requiredPlanForContent(kind, 'future-content')).toBe('free');
  });

  it.each([FEATURE.INTERVIEW_PRO, FEATURE.PREMIUM_PRACTICE, FEATURE.ADVANCED_ANALYTICS])('%s remains Pro-only', (feature) => {
    expect(planHasFeature('guest', feature)).toBe(false);
    expect(planHasFeature('free', feature)).toBe(false);
    expect(planHasFeature('pro', feature)).toBe(true);
  });

  it('preserves playground for everyone and account benefits for Free accounts', () => {
    for (const plan of ['guest', 'free', 'pro']) {
      for (const feature of [FEATURE.PLAYGROUND, FEATURE.FULL_CURRICULUM, FEATURE.PREMIUM_REFERENCE]) expect(planHasFeature(plan, feature)).toBe(true);
    }
    for (const feature of [FEATURE.CLOUD_SYNC, FEATURE.BOOKMARKS, FEATURE.ACHIEVEMENTS]) {
      expect(planHasFeature('guest', feature)).toBe(false);
      expect(planHasFeature('free', feature)).toBe(true);
      expect(planHasFeature('pro', feature)).toBe(true);
    }
  });
});

describe('real quiz evidence for advanced mastery', () => {
  it('publishes question IDs/topics, not answers, and accounts for incorrect answers', () => {
    for (const quiz of quizIndex) {
      expect(quiz.questions).toHaveLength(lessons.find((l) => l.id === quiz.lessonId).quizQuestionCount);
      for (const q of quiz.questions) expect(Object.keys(q).sort()).toEqual(['id', 'topicIds']);
    }
    const quiz = quizIndex.find((q) => q.questions.length > 1);
    const question = quiz.questions[0];
    const state = recordQuizAttempt(createInitialState(), quiz, { score: quiz.questions.length - 1, total: quiz.questions.length, wrongQuestionIds: [question.id] });
    const topic = question.topicIds[0];
    const evidence = topicMastery(state, topic, contentIndex).evidence;
    const relevant = quiz.questions.filter((q) => q.topicIds.includes(topic));
    expect(evidence.quizQuestionsAnswered).toBe(relevant.length);
    expect(evidence.quizAccuracy).toBe((relevant.length - 1) / relevant.length);
    expect(topicMastery(createInitialState(), topic, contentIndex).evidence.quizAccuracy).toBeNull();
  });
});
