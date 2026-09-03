import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '../i18n/index.jsx';
import { createInitialState } from '../features/progress/progressEngine.js';
import { canAccessContent, planHasFeature } from '../features/billing/access.js';
import {
  moduleBySlug, lessonBySlug, challengeBySlug, projectBySlug,
  referenceBySlug, cheatSheetBySlug, interviewQuestions,
} from '../content/registry.js';
import en from '../i18n/locales/en.js';
import az from '../i18n/locales/az.js';
import ru from '../i18n/locales/ru.js';

import Dashboard from '../pages/Dashboard.jsx';
import Curriculum from '../pages/Curriculum.jsx';
import ModuleDetail from '../pages/ModuleDetail.jsx';
import Lesson from '../pages/Lesson.jsx';
import PracticeHub from '../pages/PracticeHub.jsx';
import Challenges from '../pages/Challenges.jsx';
import ChallengeDetail from '../pages/ChallengeDetail.jsx';
import Projects from '../pages/Projects.jsx';
import ProjectDetail from '../pages/ProjectDetail.jsx';
import InterviewPrep from '../pages/InterviewPrep.jsx';
import InterviewQuestionPage from '../pages/InterviewQuestionPage.jsx';
import Reference from '../pages/Reference.jsx';
import ReferenceDetail from '../pages/ReferenceDetail.jsx';
import CheatSheets from '../pages/CheatSheets.jsx';
import CheatSheetDetail from '../pages/CheatSheetDetail.jsx';
import Playground from '../pages/Playground.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import Profile from '../pages/Profile.jsx';
import Achievements from '../pages/Achievements.jsx';
import MyLearning from '../pages/MyLearning.jsx';
import Bookmarks from '../pages/Bookmarks.jsx';

/**
 * Every migrated surface, in both non-default languages.
 *
 * `i18n.test.js` proves the three dictionaries agree; `i18n-ui.test.jsx` proves
 * the plumbing works. This file proves each *screen* was actually migrated.
 *
 * Two different checks, because these pages mix product chrome with authored
 * English content and a blunt scan cannot tell them apart:
 *
 *  - `assertNoRawKeys` runs everywhere. It flags dotted text only when it
 *    resolves to a real entry in the dictionary, which is exactly what a leaked
 *    key looks like and what authored prose never accidentally is. (The bug this
 *    catches shipped once already: Bookmarks rendered the literal
 *    `{t('bookmarks.emptyBody')}` to users.)
 *  - `assertNoRenderArtifacts` adds `{placeholder}`, `undefined`, `NaN` and
 *    `[object Object]` — but only on pages with no authored content, because a
 *    Reference entry legitimately says "returns undefined", a challenge prompt
 *    contains `${userInput}`, and one interview question is *about*
 *    `[object Object]`.
 *
 * Authored learning content stays English by design, so the positive assertions
 * target product chrome rather than lesson prose.
 */

const context = vi.hoisted(() => ({ state: null, plan: 'pro' }));

vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({
    state: context.state,
    isGuest: context.plan === 'guest',
    xp: context.state.xp.total,
    streak: 3,
    syncStatus: 'idle',
    actions: new Proxy({}, { get: () => () => {} }),
  }),
}));
vi.mock('../state/AuthProvider.jsx', () => ({
  useAuth: () => ({
    displayName: 'Learner', isAuthenticated: true, isConfigured: true,
    user: { email: 'learner@example.com' }, signOut: () => {},
  }),
}));
vi.mock('../state/EntitlementProvider.jsx', () => ({
  useEntitlements: () => ({
    plan: context.plan, isPro: context.plan === 'pro', loading: false, error: null,
    billingConfigured: true, subscription: null, subscriptions: [],
    refresh: () => {}, reconcile: () => {},
    hasFeature: (f) => planHasFeature(context.plan, f),
    canAccessContent: (kind, id) => canAccessContent({ kind, id, plan: context.plan }),
  }),
}));
vi.mock('../state/ToastProvider.jsx', () => ({ useToast: () => ({ show: () => {} }) }));
vi.mock('../state/ThemeProvider.jsx', () => ({
  useTheme: () => ({ preference: 'dark', setTheme: () => {}, isDark: true }),
  THEMES: ['system', 'light', 'dark'],
}));

const DICTS = { en, az, ru };
const LOCALES = ['az', 'ru'];
const SETTLE = { timeout: 15_000 };

function mount(ui, locale, { path, route } = {}) {
  const base = createInitialState();
  context.state = { ...base, settings: { ...base.settings, locale } };
  return render(
    <MemoryRouter initialEntries={[path ?? '/']}>
      <I18nProvider>
        {route ? <Routes><Route path={route} element={ui} /></Routes> : ui}
      </I18nProvider>
    </MemoryRouter>,
  );
}

const resolve = (dict, key) => key.split('.').reduce((n, p) => (n == null ? undefined : n[p]), dict);

const NAMESPACES = Object.keys(en).join('|');
const DOTTED = new RegExp(`\\b(?:${NAMESPACES})(?:\\.[A-Za-z][A-Za-z0-9]*)+`, 'g');

/** Dotted text that actually resolves to a dictionary entry is a leaked key. */
function assertNoRawKeys(container, locale) {
  const text = container.textContent ?? '';
  const leaked = [...new Set(text.match(DOTTED) ?? [])].filter((candidate) => {
    const value = resolve(DICTS[locale], candidate);
    return typeof value === 'string' || (value && typeof value.other === 'string');
  });
  expect(leaked).toEqual([]);
}

function assertNoRenderArtifacts(container) {
  const text = container.textContent ?? '';
  expect(text).not.toMatch(/\{[a-z][a-zA-Z]*\}/);
  expect(text).not.toContain('[object Object]');
  expect(text).not.toMatch(/\bundefined\b/);
  expect(text).not.toMatch(/\bNaN\b/);
}

/** The page is not merely key-free — it shows this locale's wording. */
function assertTranslated(container, locale, ...keys) {
  for (const key of keys) {
    expect(container.textContent).toContain(resolve(DICTS[locale], key));
  }
}

/** Accessible names come from the dictionaries too, not just visible text. */
function assertAccessibleName(container, locale, key) {
  const label = resolve(DICTS[locale], key);
  expect(container.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
}

beforeEach(() => {
  context.state = createInitialState();
  context.plan = 'pro';
});

/* ------------------------------------------------------------------ *
 * Chrome-only surfaces — the strict scan applies
 * ------------------------------------------------------------------ */

const CHROME_ONLY = [
  ['Profile', () => <Profile />, ['profile.overallProgress', 'achievements.title', 'profile.exercises']],
  ['Achievements', () => <Achievements />, ['achievements.title', 'achievements.progress']],
  ['My Learning', () => <MyLearning />, ['myLearning.title', 'myLearning.recentActivity', 'myLearning.howMasteryCalculated']],
  ['Bookmarks', () => <Bookmarks />, ['bookmarks.title', 'bookmarks.subtitle', 'bookmarks.empty']],
  ['Search', () => <SearchPage />, ['search.title', 'search.typeAtLeast']],
  ['Playground', () => <Playground />, ['playground.title', 'playground.savedSnippets', 'playground.notes']],
];

describe.each(LOCALES)('chrome-only surfaces in %s', (locale) => {
  it.each(CHROME_ONLY)('%s', (_name, element, expected) => {
    const { container } = mount(element(), locale);
    assertNoRawKeys(container, locale);
    assertNoRenderArtifacts(container);
    assertTranslated(container, locale, ...expected);
  });
});

/* ------------------------------------------------------------------ *
 * Surfaces that also render authored English content
 * ------------------------------------------------------------------ */

const CONTENT_SURFACES = [
  ['Dashboard', () => <Dashboard />, ['dashboard.title', 'dashboard.activity', 'dashboard.recommended']],
  ['Curriculum', () => <Curriculum />, ['learning.curriculum', 'learning.yourProgress', 'learning.rank']],
  ['Practice Hub', () => <PracticeHub />, ['practice.title', 'practice.allTopics', 'practice.masteryOverview']],
  ['Challenges', () => <Challenges />, ['challenges.title', 'challenges.todaysChallenge']],
  ['Projects', () => <Projects />, ['projects.title']],
  ['Interview Prep', () => <InterviewPrep />, ['interview.title', 'interview.howToUse', 'interview.questionType']],
  ['Reference', () => <Reference />, ['reference.title']],
  ['Cheat Sheets', () => <CheatSheets />, ['cheatSheets.title']],
];

describe.each(LOCALES)('content surfaces in %s', (locale) => {
  it.each(CONTENT_SURFACES)('%s', (_name, element, expected) => {
    const { container } = mount(element(), locale);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, ...expected);
  });
});

/* ------------------------------------------------------------------ *
 * Detail pages, which load their content first
 * ------------------------------------------------------------------ */

const someModule = Object.values(moduleBySlug)[0];
const someLesson = Object.values(lessonBySlug)[0];
const someChallenge = Object.values(challengeBySlug)[0];
const someProject = Object.values(projectBySlug)[0];
const someReference = Object.values(referenceBySlug)[0];
const someSheet = Object.values(cheatSheetBySlug)[0];
const someQuestion = interviewQuestions[0];

describe.each(LOCALES)('detail chrome in %s', (locale) => {
  it('module detail', async () => {
    const { container } = mount(<ModuleDetail />, locale, {
      path: `/curriculum/${someModule.slug}`, route: '/curriculum/:moduleSlug',
    });
    await screen.findByText(someModule.title, {}, SETTLE);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, 'learning.lessons', 'learning.learningObjectives');
  });

  it('lesson chrome', async () => {
    const moduleForLesson = Object.values(moduleBySlug).find((m) => m.id === someLesson.moduleId);
    const { container } = mount(<Lesson />, locale, {
      path: `/learn/${moduleForLesson.slug}/${someLesson.slug}`,
      route: '/learn/:moduleSlug/:lessonSlug',
    });
    await screen.findByText(resolve(DICTS[locale], 'learning.objectives'), {}, SETTLE);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, 'learning.keyTakeaways', 'learning.summary', 'learning.markComplete');
    assertAccessibleName(container, locale, 'nav.backToCurriculum');
  });

  it('challenge chrome', async () => {
    const { container } = mount(<ChallengeDetail />, locale, {
      path: `/challenges/${someChallenge.slug}`, route: '/challenges/:slug',
    });
    await screen.findByText(resolve(DICTS[locale], 'learning.runTests'), {}, SETTLE);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, 'challenges.title', 'common.reset');
  });

  it('project chrome', async () => {
    const { container } = mount(<ProjectDetail />, locale, {
      path: `/projects/${someProject.slug}`, route: '/projects/:slug',
    });
    await screen.findByText(resolve(DICTS[locale], 'projects.milestones'), {}, SETTLE);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, 'projects.requiredFeatures', 'projects.stuck', 'projects.completionCriteria');
  });

  it('interview question chrome', async () => {
    const { container } = mount(<InterviewQuestionPage />, locale, {
      path: `/interview/question/${someQuestion.id}`, route: '/interview/question/:questionId',
    });
    await screen.findByText(resolve(DICTS[locale], 'interview.reveal'), {}, SETTLE);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, 'interview.interviewPrep');
  });

  it('reference chrome', async () => {
    const { container } = mount(<ReferenceDetail />, locale, {
      path: `/reference/${someReference.slug}`, route: '/reference/:slug',
    });
    await screen.findByText(resolve(DICTS[locale], 'reference.syntax'), {}, SETTLE);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, 'reference.parameters', 'reference.examples');
  });

  it('cheat sheet chrome', async () => {
    const { container } = mount(<CheatSheetDetail />, locale, {
      path: `/cheat-sheets/${someSheet.slug}`, route: '/cheat-sheets/:slug',
    });
    await screen.findByText(someSheet.title, {}, SETTLE);
    assertNoRawKeys(container, locale);
    assertTranslated(container, locale, 'cheatSheets.short');
  });
});

/* ------------------------------------------------------------------ *
 * Guarantees that must survive the migration
 * ------------------------------------------------------------------ */

describe('what localization must not change', () => {
  it('does not open locked content in any locale', () => {
    const proChallenge = Object.values(challengeBySlug)
      .find((c) => !canAccessContent({ kind: 'challenge', id: c.id, plan: 'free' }));
    expect(proChallenge).toBeTruthy();
    for (const locale of ['en', ...LOCALES]) {
      context.state = { ...createInitialState(), settings: { locale } };
      expect(canAccessContent({ kind: 'challenge', id: proChallenge.id, plan: 'free' })).toBe(false);
      expect(canAccessContent({ kind: 'challenge', id: proChallenge.id, plan: 'pro' })).toBe(true);
    }
  });

  it('keeps every dictionary free of malformed interpolation', () => {
    const leaves = (node, out = []) => {
      for (const value of Object.values(node)) {
        if (typeof value === 'string') out.push(value);
        else if (value && typeof value === 'object') leaves(value, out);
      }
      return out;
    };
    for (const dict of [en, az, ru]) {
      for (const value of leaves(dict)) {
        for (const brace of value.match(/\{[^}]*\}/g) ?? []) {
          expect(brace).toMatch(/^\{[a-z][a-zA-Z]*\}$/);
        }
      }
    }
  });

  it('never translates the stable tokens that logic compares', () => {
    expect(Object.keys(en.difficulty)).toEqual(Object.keys(ru.difficulty));
    expect(Object.keys(en.mastery)).toEqual(Object.keys(az.mastery));
    expect(Object.keys(en.interviewKind)).toEqual(Object.keys(ru.interviewKind));
    expect(Object.keys(en.exerciseKind)).toEqual(Object.keys(az.exerciseKind));
    for (const dict of [en, az, ru]) {
      expect(dict.common.pro).toBe('Pro');
      expect(dict.common.free).toBe('Free');
    }
  });
});
