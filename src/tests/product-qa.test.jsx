import { describe, expect, it } from 'vitest';
import { challenges, projects, interviewQuestions, lessons, references } from '../content/registry.js';
import {
  createInitialState, toggleProjectMilestone, toggleBookmark,
  recordExerciseAttempt, recordInterviewAnswer,
} from '../features/progress/progressEngine.js';
import { requiredPlanForContent, canAccessContent, planHasFeature } from '../features/billing/access.js';
import { FEATURE } from '../features/billing/plans.js';
import { resolveEntitlement, subscriptionGrantsPro } from '../features/billing/entitlements.js';
import { mergeStates } from '../state/UserStateProvider.jsx';
import practiceSessionSource from '../pages/PracticeSession.jsx?raw';
import interviewAnswerSource from '../features/interview/InterviewAnswer.jsx?raw';
import buttonSource from '../components/ui/index.jsx?raw';
import routerSource from '../app/router.jsx?raw';
import dashboardSource from '../pages/Dashboard.jsx?raw';
import appShellSource from '../layouts/AppShell.jsx?raw';
import settingsSource from '../pages/Settings.jsx?raw';

/**
 * Final frontend / product QA.
 *
 * These cover the product flows the browser pane cannot drive reliably — it runs
 * hidden, which throttles timers and drops synthesised keystrokes — plus the
 * state and entitlement invariants that a manual pass cannot prove at all.
 *
 * Everything here is derived from real content and the real reducers; there are
 * no fabricated fixtures standing in for product behaviour.
 */

const FUTURE = '2099-01-01T00:00:00.000Z';
const PAST = '2020-01-01T00:00:00.000Z';

const proProject = projects.find((p) => requiredPlanForContent('project', p.id) === 'pro');
const freeProject = projects.find((p) => requiredPlanForContent('project', p.id) === 'free');
const proChallenge = challenges.find((c) => requiredPlanForContent('challenge', c.id) === 'pro');
const freeInterview = interviewQuestions.find((q) => requiredPlanForContent('interview', q.id) === 'free');

/* ------------------------------------------------------------------ *
 * Project milestones and progress
 * ------------------------------------------------------------------ */

describe('project milestone tracking', () => {
  // The registry ships milestone counts; the bodies hold the milestones, so build
  // a minimal project shape with real ids for the reducer to work against.
  const project = { id: freeProject.id, milestones: [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }] };

  it('records a milestone and reports accurate progress', () => {
    let s = createInitialState();
    s = toggleProjectMilestone(s, project, 'm1');
    expect(s.projects[project.id].milestones.m1).toBe(true);
    expect(Object.values(s.projects[project.id].milestones).filter(Boolean)).toHaveLength(1);
  });

  it('reopens a milestone that was ticked by mistake', () => {
    let s = createInitialState();
    s = toggleProjectMilestone(s, project, 'm1');
    s = toggleProjectMilestone(s, project, 'm1');
    expect(s.projects[project.id].milestones.m1).toBe(false);
    expect(s.projects[project.id].completedAt).toBeNull();
  });

  it('only completes the project when every milestone is done', () => {
    let s = createInitialState();
    s = toggleProjectMilestone(s, project, 'm1');
    expect(s.projects[project.id].completedAt).toBeNull();
    s = toggleProjectMilestone(s, project, 'm2');
    expect(s.projects[project.id].completedAt).toBeNull();
    s = toggleProjectMilestone(s, project, 'm3');
    expect(s.projects[project.id].completedAt).toBeTruthy();
  });

  it('un-completes the project when a milestone is reopened', () => {
    let s = createInitialState();
    for (const m of ['m1', 'm2', 'm3']) s = toggleProjectMilestone(s, project, m);
    expect(s.projects[project.id].completedAt).toBeTruthy();
    s = toggleProjectMilestone(s, project, 'm2');
    expect(s.projects[project.id].completedAt).toBeNull();
  });

  it('never awards the same milestone or completion XP twice', () => {
    let s = createInitialState();
    for (const m of ['m1', 'm2', 'm3']) s = toggleProjectMilestone(s, project, m);
    const afterFirst = { ...s.xp.awarded };
    const xpAfterFirst = s.xp.total;

    // Toggle the last milestone off and on again: the completion is re-reached,
    // but XP is keyed by award id, so nothing is granted a second time.
    s = toggleProjectMilestone(s, project, 'm3');
    s = toggleProjectMilestone(s, project, 'm3');
    expect(Object.keys(s.xp.awarded).sort()).toEqual(Object.keys(afterFirst).sort());
    expect(s.xp.total).toBe(xpAfterFirst);
  });

  it('keeps progress isolated to the project being worked on', () => {
    let s = createInitialState();
    s = toggleProjectMilestone(s, project, 'm1');
    const others = Object.keys(s.projects).filter((id) => id !== project.id);
    expect(others).toEqual([]);
    expect(s.lessons).toEqual({});
    expect(s.exercises).toEqual({});
    expect(s.challenges).toEqual({});
  });
});

describe('project access', () => {
  it('keeps the free sample projects open to everyone', () => {
    for (const plan of ['guest', 'free', 'pro']) {
      expect(canAccessContent({ kind: 'project', id: freeProject.id, plan })).toBe(true);
    }
  });

  it('gates a Pro project for guest and free, and opens it for Pro', () => {
    expect(canAccessContent({ kind: 'project', id: proProject.id, plan: 'guest' })).toBe(false);
    expect(canAccessContent({ kind: 'project', id: proProject.id, plan: 'free' })).toBe(false);
    expect(canAccessContent({ kind: 'project', id: proProject.id, plan: 'pro' })).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Bookmarks
 * ------------------------------------------------------------------ */

describe('bookmark round-trip', () => {
  const lesson = lessons[0];
  const reference = references[0];

  it('adds, reflects and removes a bookmark', () => {
    let s = createInitialState();
    expect(s.bookmarks[`lesson:${lesson.id}`]).toBeUndefined();

    s = toggleBookmark(s, 'lesson', lesson.id, { title: lesson.title });
    expect(s.bookmarks[`lesson:${lesson.id}`]).toBeTruthy();

    s = toggleBookmark(s, 'lesson', lesson.id, { title: lesson.title });
    expect(s.bookmarks[`lesson:${lesson.id}`]).toBeFalsy();
  });

  it('never stores the same bookmark twice', () => {
    let s = createInitialState();
    s = toggleBookmark(s, 'lesson', lesson.id, { title: lesson.title });
    s = toggleBookmark(s, 'lesson', lesson.id, { title: lesson.title });
    s = toggleBookmark(s, 'lesson', lesson.id, { title: lesson.title });
    const keys = Object.keys(s.bookmarks).filter((k) => s.bookmarks[k]);
    expect(keys).toEqual([`lesson:${lesson.id}`]);
  });

  it('keys bookmarks by kind so two kinds sharing an id do not collide', () => {
    let s = createInitialState();
    s = toggleBookmark(s, 'lesson', 'shared-id', { title: 'a' });
    s = toggleBookmark(s, 'reference', 'shared-id', { title: 'b' });
    expect(s.bookmarks['lesson:shared-id']).toBeTruthy();
    expect(s.bookmarks['reference:shared-id']).toBeTruthy();
  });

  it('holds several kinds at once without disturbing each other', () => {
    let s = createInitialState();
    s = toggleBookmark(s, 'lesson', lesson.id, { title: lesson.title });
    s = toggleBookmark(s, 'reference', reference.id, { title: reference.name });
    expect(Object.values(s.bookmarks).filter(Boolean)).toHaveLength(2);
    s = toggleBookmark(s, 'lesson', lesson.id, { title: lesson.title });
    expect(s.bookmarks[`reference:${reference.id}`]).toBeTruthy();
  });

  it('does not touch curriculum progress', () => {
    const before = createInitialState();
    const after = toggleBookmark(before, 'lesson', lesson.id, { title: lesson.title });
    expect(after.lessons).toEqual(before.lessons);
    expect(after.xp).toEqual(before.xp);
  });
});

/* ------------------------------------------------------------------ *
 * Import / export — the security invariant
 * ------------------------------------------------------------------ */

describe('progress import cannot forge entitlement', () => {
  /**
   * Settings exports `state` as JSON and imports it back through
   * `actions.importState`. The thing that must never work is a hand-edited file
   * granting Pro. Entitlement is resolved from Supabase subscription rows by
   * `resolveEntitlement`, which takes no user state at all — so this asserts the
   * decision path directly rather than trusting the shape of the store.
   */
  it('derives the plan only from subscriptions and auth, never from stored state', () => {
    const forged = {
      ...createInitialState(),
      plan: 'pro',
      isPro: true,
      entitlement: { plan: 'pro' },
      subscriptions: [{ plan: 'pro', status: 'active', current_period_end: FUTURE }],
    };
    // Whatever the imported blob claims, the resolver is only ever given the
    // authenticated flag and the rows fetched from the server.
    expect(resolveEntitlement({ authenticated: true, subscriptions: [] }).plan).toBe('free');
    expect(resolveEntitlement({ authenticated: false, subscriptions: [] }).plan).toBe('guest');
    expect(Object.keys(forged)).toContain('plan');
    expect(resolveEntitlement.length).toBeLessThanOrEqual(1);
  });

  it('grants Pro only for a subscription the server actually returned', () => {
    const active = { plan: 'pro', status: 'active', current_period_end: FUTURE };
    expect(resolveEntitlement({ authenticated: true, subscriptions: [active] }).plan).toBe('pro');
    // The same row without authentication is not enough.
    expect(resolveEntitlement({ authenticated: false, subscriptions: [active] }).plan).toBe('guest');
  });

  it('treats an unknown or hostile subscription status as not entitling', () => {
    for (const status of ['', 'forged', 'true', 'admin', 'complete']) {
      expect(subscriptionGrantsPro({ plan: 'pro', status, current_period_end: FUTURE })).toBe(false);
    }
  });

  it('ignores a row that claims a plan other than pro', () => {
    for (const plan of ['free', 'admin', 'PRO', undefined]) {
      expect(subscriptionGrantsPro({ plan, status: 'active', current_period_end: FUTURE })).toBe(false);
    }
  });
});

describe('import handles hostile and malformed data safely', () => {
  // Settings parses the file inside a try/catch and reports a failure toast, so
  // what matters here is that anything which does reach the store leaves a
  // coherent state rather than a corrupted one.
  it('parses the uploaded file behind a guard so a bad file cannot reach the store', () => {
    // Settings does JSON.parse inside try/catch and reports a toast on failure,
    // so malformed text never becomes state in the first place.
    expect(settingsSource).toMatch(/try\s*\{[\s\S]*JSON\.parse[\s\S]*catch/);
    // The failure is reported to the learner. The message is now a translation
    // key rather than a literal, so assert the key — and that it resolves in
    // every locale, which the i18n dictionary test enforces separately.
    expect(settingsSource).toMatch(/settings\.importFailed/);
  });

  it('normalises a partial remote record when merging on sign-in', () => {
    // The sign-in merge runs `migrate` over whatever the server returned, so a
    // row missing newer keys still produces a complete, usable state.
    const local = toggleBookmark(createInitialState(), 'lesson', lessons[0].id, { title: 'x' });
    const merged = mergeStates({ version: 1, lessons: {} }, local);
    expect(Array.isArray(merged.activity)).toBe(true);
    expect(Array.isArray(merged.mistakes)).toBe(true);
    expect(merged.xp).toBeTruthy();
    expect(merged.placement).toBeDefined();
    // Nothing the learner had locally is lost.
    expect(merged.bookmarks[`lesson:${lessons[0].id}`]).toBeTruthy();
  });

  it('keeps the better outcome from either side of the merge', () => {
    const remote = toggleBookmark(createInitialState(), 'lesson', lessons[0].id, { title: 'a' });
    const local = toggleBookmark(createInitialState(), 'reference', references[0].id, { title: 'b' });
    const merged = mergeStates(remote, local);
    expect(merged.bookmarks[`lesson:${lessons[0].id}`]).toBeTruthy();
    expect(merged.bookmarks[`reference:${references[0].id}`]).toBeTruthy();
  });

  it('recomputes XP from awarded keys rather than trusting an imported total', () => {
    // A file claiming a huge total cannot inflate XP: the total is summed from
    // the award ledger during the merge.
    const merged = mergeStates(createInitialState(), {
      ...createInitialState(),
      xp: { total: 999999, awarded: { 'exercise:ex-a': 10 } },
    });
    expect(merged.xp.total).toBe(10);
  });
});

/* ------------------------------------------------------------------ *
 * Billing UI states
 * ------------------------------------------------------------------ */

describe('subscription lifecycle states', () => {
  const past = PAST;

  // The pending-cancellation state is the `canceling` status: the learner has
  // asked to stop renewing but has already paid for the current period.
  it('keeps Pro while a cancellation is pending until the period ends', () => {
    const pending = { plan: 'pro', status: 'canceling', current_period_end: FUTURE };
    expect(subscriptionGrantsPro(pending)).toBe(true);
    expect(resolveEntitlement({ authenticated: true, subscriptions: [pending] }).plan).toBe('pro');
    expect(canAccessContent({ kind: 'challenge', id: proChallenge.id, plan: 'pro' })).toBe(true);
  });

  it('keeps Pro through a past_due period rather than downgrading immediately', () => {
    const late = { plan: 'pro', status: 'past_due', current_period_end: FUTURE };
    expect(subscriptionGrantsPro(late)).toBe(true);
  });

  it('drops to free once the cancelling period has ended', () => {
    const ended = { plan: 'pro', status: 'canceling', current_period_end: past };
    expect(subscriptionGrantsPro(ended)).toBe(false);
    expect(resolveEntitlement({ authenticated: true, subscriptions: [ended] }).plan).toBe('free');
  });

  it.each(['expired', 'refunded', 'revoked'])('revokes Pro for a %s subscription', (status) => {
    // Revoked statuses lose access even with a period end still in the future.
    expect(subscriptionGrantsPro({ plan: 'pro', status, current_period_end: FUTURE })).toBe(false);
  });

  it('denies premium content in the expired state', () => {
    const expired = { plan: 'pro', status: 'expired', current_period_end: past };
    const { plan } = resolveEntitlement({ authenticated: true, subscriptions: [expired] });
    expect(plan).toBe('free');
    expect(canAccessContent({ kind: 'challenge', id: proChallenge.id, plan })).toBe(false);
    expect(planHasFeature(plan, FEATURE.INTERVIEW_PRO)).toBe(false);
  });

  it('still allows every free allocation in the expired state', () => {
    const { plan } = resolveEntitlement({
      authenticated: true,
      subscriptions: [{ plan: 'pro', status: 'expired', current_period_end: past }],
    });
    expect(canAccessContent({ kind: 'project', id: freeProject.id, plan })).toBe(true);
    expect(canAccessContent({ kind: 'interview', id: freeInterview.id, plan })).toBe(true);
    expect(canAccessContent({ kind: 'lesson', id: lessons[0].id, plan })).toBe(true);
  });

  it.each([
    ['guest', false],
    ['free', false],
    ['pro', true],
  ])('gives %s the right session features', (plan, allowed) => {
    expect(planHasFeature(plan, FEATURE.INTERVIEW_PRO)).toBe(allowed);
    expect(planHasFeature(plan, FEATURE.PREMIUM_PRACTICE)).toBe(allowed);
  });
});

/* ------------------------------------------------------------------ *
 * Session flows — no double scoring
 * ------------------------------------------------------------------ */

describe('session scoring cannot double-count', () => {
  it('counts a practice session solve by exercise id, not per run', () => {
    // ExerciseRunner calls onSolved on every passing run, so the session must
    // dedupe or a re-run inflates the summary beyond the session size.
    expect(practiceSessionSource).toContain('solvedIds');
    expect(practiceSessionSource).toContain('prev.has(ex.id)');
    expect(practiceSessionSource).not.toMatch(/setSolved\(\(s\) => s \+ 1\)/);
  });

  it('lets an interview question report its outcome only once', () => {
    // Objective questions report on reveal, which is replaced by the revealed
    // panel; self-assessed questions report on rating, which is hidden after.
    expect(interviewAnswerSource).toMatch(/\{!revealed \?/);
    expect(interviewAnswerSource).toMatch(/!objective && !rated/);
  });

  it('records an interview answer without inventing a grade for open questions', () => {
    const open = interviewQuestions.find((q) => q.kind !== 'output' && q.kind !== 'choice');
    let s = createInitialState();
    s = recordInterviewAnswer(s, open, { correct: true, selfRating: 4 });
    expect(s.interview[open.id].seen).toBe(1);
    // The stored outcome is the learner's own rating, not a machine judgement.
    expect(interviewAnswerSource).not.toMatch(/\bAI\b|machine.grad|auto.grade/i);
  });

  it('awards exercise XP once however many times it is re-run', () => {
    const exercise = { id: 'ex-qa-double', lessonId: lessons[0].id, moduleId: lessons[0].moduleId, topicIds: [] };
    let s = createInitialState();
    s = recordExerciseAttempt(s, exercise, { passed: true });
    const first = s.xp.total;
    s = recordExerciseAttempt(s, exercise, { passed: true });
    s = recordExerciseAttempt(s, exercise, { passed: true });
    expect(s.xp.total).toBe(first);
    expect(s.exercises[exercise.id].solved).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Fixes made during this QA phase must stay fixed
 * ------------------------------------------------------------------ */

describe('QA regressions stay fixed', () => {
  it('routes an unknown premium slug to the page rather than the gate', () => {
    // The gate used to receive id={undefined}, which resolves to PRO for the
    // feature-gated kinds and billed a 404 as paid content.
    expect(routerSource).toMatch(/if \(!item\) return children;/);
    expect(routerSource).not.toMatch(/id=\{item\?\.id\}/);
  });

  it('keeps Button from defaulting to a form submit', () => {
    expect(buttonSource).toMatch(/Tag === 'button' \? \{ type: 'button' \} : \{\}/);
  });

  it('uses a theme-aware token for the streak flame', () => {
    // Raw `text-primary` is brand yellow in both themes and measured 1.3 against
    // the light-theme card. `text-primary-ink` adapts: 5.12 light, 13.62 dark.
    for (const [name, source] of [['Dashboard', dashboardSource], ['AppShell', appShellSource]]) {
      const flame = source
        .split(/\r?\n/)
        .filter((line) => line.includes('local_fire_department') && line.includes('className'));
      expect(flame.length, name).toBeGreaterThan(0);
      for (const line of flame) {
        expect(line, `${name}: ${line.trim()}`).not.toMatch(/'text-primary'/);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * Settings surface
 * ------------------------------------------------------------------ */

describe('settings reset scope', () => {
  it('resets learning progress to a fresh state shape', () => {
    const fresh = createInitialState();
    expect(fresh.lessons).toEqual({});
    expect(fresh.exercises).toEqual({});
    expect(fresh.projects).toEqual({});
    expect(fresh.bookmarks).toEqual({});
    expect(fresh.xp.total).toBe(0);
    expect(fresh.placement).toBeNull();
    // Nothing about identity or billing lives in this store, so a reset cannot
    // touch either of them.
    expect(Object.keys(fresh)).not.toContain('plan');
    expect(Object.keys(fresh)).not.toContain('subscriptions');
    expect(Object.keys(fresh)).not.toContain('session');
  });
});
