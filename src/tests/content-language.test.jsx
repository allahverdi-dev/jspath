import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '../i18n/index.jsx';
import { createInitialState } from '../features/progress/progressEngine.js';
import { canAccessContent, planHasFeature, requiredPlanForContent } from '../features/billing/access.js';
import {
  moduleBySlug, lessonBySlug, challengeBySlug, projectBySlug,
  referenceBySlug, cheatSheetBySlug, interviewQuestions,
} from '../content/registry.js';
import az from '../i18n/locales/az.js';
import ru from '../i18n/locales/ru.js';

import Lesson from '../pages/Lesson.jsx';
import ChallengeDetail from '../pages/ChallengeDetail.jsx';
import ProjectDetail from '../pages/ProjectDetail.jsx';
import InterviewQuestionPage from '../pages/InterviewQuestionPage.jsx';
import ReferenceDetail from '../pages/ReferenceDetail.jsx';
import CheatSheetDetail from '../pages/CheatSheetDetail.jsx';
import Dashboard from '../pages/Dashboard.jsx';

/**
 * The boundary between translated chrome and authored English content.
 *
 * `<html lang>` follows the interface locale, which is correct — and which makes
 * every unmarked authored string claim to be Azerbaijani or Russian. Two visible
 * consequences, both tested here:
 *
 *  - a screen reader announces English lesson prose with the wrong phonetics;
 *  - `text-transform: uppercase` is language-sensitive, so under `lang="az"` the
 *    authored word "Orientation" renders as "ORİENTATİON" — presentation
 *    corrupting the source text.
 *
 * The fix is per-string, not per-region: marking a whole panel English would
 * relabel the translated buttons inside it, which is the same bug reversed.
 */

const context = vi.hoisted(() => ({ state: null, plan: 'pro' }));

vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({
    state: context.state,
    isGuest: false,
    xp: context.state.xp.total,
    streak: 2,
    syncStatus: 'idle',
    actions: new Proxy({}, { get: () => () => {} }),
  }),
}));
vi.mock('../state/AuthProvider.jsx', () => ({
  useAuth: () => ({
    displayName: 'Learner', isAuthenticated: true, isConfigured: true, user: null, signOut: () => {},
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

const DICTS = { az, ru };
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

/** The nearest declared language for a node, as a browser would resolve it. */
function effectiveLang(node) {
  let el = node instanceof HTMLElement ? node : node?.parentElement;
  while (el) {
    const lang = el.getAttribute?.('lang');
    if (lang) return lang;
    el = el.parentElement;
  }
  return document.documentElement.lang || '';
}

/** Find the element that directly renders this exact text. */
function elementFor(container, text) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent?.trim() === text) return node.parentElement;
  }
  return null;
}

const someModule = Object.values(moduleBySlug)[0];
const someLesson = Object.values(lessonBySlug)[0];
const someChallenge = Object.values(challengeBySlug)[0];
const someProject = Object.values(projectBySlug)[0];
const someReference = Object.values(referenceBySlug)[0];
const someSheet = Object.values(cheatSheetBySlug)[0];
const someQuestion = interviewQuestions[0];

beforeEach(() => {
  context.state = createInitialState();
  context.plan = 'pro';
  document.documentElement.lang = '';
});

/* ------------------------------------------------------------------ *
 * Authored content declares English
 * ------------------------------------------------------------------ */

describe.each(LOCALES)('authored content is marked English in %s', (locale) => {
  it('lesson title and prose', async () => {
    const moduleForLesson = Object.values(moduleBySlug).find((m) => m.id === someLesson.moduleId);
    const { container } = mount(<Lesson />, locale, {
      path: `/learn/${moduleForLesson.slug}/${someLesson.slug}`,
      route: '/learn/:moduleSlug/:lessonSlug',
    });
    await screen.findByText(resolve(DICTS[locale], 'learning.objectives'), {}, SETTLE);

    expect(document.documentElement.lang).toBe(locale);
    expect(effectiveLang(elementFor(container, someLesson.title))).toBe('en');
    expect(effectiveLang(elementFor(container, someLesson.description))).toBe('en');
  });

  it('challenge title', async () => {
    const { container } = mount(<ChallengeDetail />, locale, {
      path: `/challenges/${someChallenge.slug}`, route: '/challenges/:slug',
    });
    await screen.findByText(resolve(DICTS[locale], 'learning.runTests'), {}, SETTLE);
    expect(effectiveLang(elementFor(container, someChallenge.title))).toBe('en');
  });

  it('project title', async () => {
    const { container } = mount(<ProjectDetail />, locale, {
      path: `/projects/${someProject.slug}`, route: '/projects/:slug',
    });
    await screen.findByText(resolve(DICTS[locale], 'projects.milestones'), {}, SETTLE);
    expect(effectiveLang(elementFor(container, someProject.title))).toBe('en');
  });

  it('interview question', async () => {
    const { container } = mount(<InterviewQuestionPage />, locale, {
      path: `/interview/question/${someQuestion.id}`, route: '/interview/question/:questionId',
    });
    await screen.findByText(resolve(DICTS[locale], 'interview.reveal'), {}, SETTLE);
    // The question renders through InlineMarkup, which carries the marking.
    const heading = container.querySelector('h2');
    expect(effectiveLang(heading.querySelector('[lang]') ?? heading)).toBe('en');
  });

  it('reference name and syntax', async () => {
    const { container } = mount(<ReferenceDetail />, locale, {
      path: `/reference/${someReference.slug}`, route: '/reference/:slug',
    });
    await screen.findByText(resolve(DICTS[locale], 'reference.syntax'), {}, SETTLE);
    expect(effectiveLang(elementFor(container, someReference.name))).toBe('en');
    expect(effectiveLang(container.querySelector('pre'))).toBe('en');
  });

  it('cheat sheet title', async () => {
    const { container } = mount(<CheatSheetDetail />, locale, {
      path: `/cheat-sheets/${someSheet.slug}`, route: '/cheat-sheets/:slug',
    });
    await screen.findByText(someSheet.title, {}, SETTLE);
    expect(effectiveLang(elementFor(container, someSheet.title))).toBe('en');
  });
});

/* ------------------------------------------------------------------ *
 * The marking is a boundary, not a blanket
 * ------------------------------------------------------------------ */

describe.each(LOCALES)('translated chrome keeps the document language in %s', (locale) => {
  it('does not inherit English from neighbouring authored content', async () => {
    const moduleForLesson = Object.values(moduleBySlug).find((m) => m.id === someLesson.moduleId);
    const { container } = mount(<Lesson />, locale, {
      path: `/learn/${moduleForLesson.slug}/${someLesson.slug}`,
      route: '/learn/:moduleSlug/:lessonSlug',
    });
    await screen.findByText(resolve(DICTS[locale], 'learning.objectives'), {}, SETTLE);

    // Chrome sitting right beside authored prose must still be the UI language.
    for (const key of ['learning.objectives', 'learning.keyTakeaways', 'learning.summary', 'learning.markComplete']) {
      const label = resolve(DICTS[locale], key);
      const el = elementFor(container, label);
      expect(el, key).not.toBeNull();
      expect(effectiveLang(el), key).toBe(locale);
    }
  });

  it('leaves no lang attribute on buttons, navigation or billing chrome', async () => {
    const { container } = mount(<ChallengeDetail />, locale, {
      path: `/challenges/${someChallenge.slug}`, route: '/challenges/:slug',
    });
    await screen.findByText(resolve(DICTS[locale], 'learning.runTests'), {}, SETTLE);

    // A button whose own label is translated must never declare English.
    for (const button of container.querySelectorAll('button, a')) {
      if (button.getAttribute('lang') === 'en') {
        // Only acceptable if the visible text is authored content, not a label.
        const text = button.textContent.trim();
        const isChrome = [...Object.values(DICTS[locale].common), ...Object.values(DICTS[locale].nav)]
          .some((v) => typeof v === 'string' && v.length > 2 && text === v);
        expect(isChrome, `chrome control marked English: "${text}"`).toBe(false);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * The casing defect this pass exists to fix
 * ------------------------------------------------------------------ */

describe('authored English survives locale-sensitive casing', () => {
  it('keeps the module short title spellable as English under az', async () => {
    // jsdom does not implement `text-transform`, so the guarantee is asserted at
    // its cause: the uppercased chip declares English, which is what makes the
    // browser use English casing rules and render ORIENTATION, not ORİENTATİON.
    const { container } = mount(<Dashboard />, 'az');
    const badge = elementFor(container, someModule.shortTitle)
      ?? [...container.querySelectorAll('[lang="en"]')]
        .find((el) => el.textContent.trim() === someModule.shortTitle);

    expect(badge, 'the module short title should be rendered').not.toBeNull();
    expect(effectiveLang(badge)).toBe('en');
    // The label beside it is still translated and still Azerbaijani.
    expect(document.documentElement.lang).toBe('az');
  });

  it('marks the uppercased chip without swallowing its translated half', () => {
    const { container } = mount(<Dashboard />, 'az');
    const marked = [...container.querySelectorAll('[lang="en"]')]
      .map((el) => el.textContent.trim());
    // "Modul 00" is chrome and must not be inside the English region.
    expect(marked.some((text) => /^Modul\b/.test(text))).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * Nothing else moved
 * ------------------------------------------------------------------ */

describe('the boundary changes presentation only', () => {
  it('does not mutate authored content', () => {
    // The strings rendered are the strings authored — marking adds an attribute,
    // never a transformation.
    expect(someLesson.title).toBe(lessonBySlug[someLesson.slug].title);
    expect(someChallenge.title).toBe(challengeBySlug[someChallenge.slug].title);
    expect(someReference.name).toBe(referenceBySlug[someReference.slug].name);
    expect(someSheet.title).toBe(cheatSheetBySlug[someSheet.slug].title);
  });

  it('leaves ids and slugs untouched', () => {
    expect(someModule.slug).toBe(Object.values(moduleBySlug)[0].slug);
    expect(someChallenge.id).toBe(Object.values(challengeBySlug)[0].id);
    expect(someQuestion.id).toBe(interviewQuestions[0].id);
  });

  it('leaves entitlement and access unchanged in every locale', () => {
    const proChallenge = Object.values(challengeBySlug)
      .find((c) => requiredPlanForContent('challenge', c.id) === 'pro');
    expect(proChallenge).toBeTruthy();
    for (const locale of ['en', ...LOCALES]) {
      context.state = { ...createInitialState(), settings: { locale } };
      expect(canAccessContent({ kind: 'challenge', id: proChallenge.id, plan: 'free' })).toBe(false);
      expect(canAccessContent({ kind: 'challenge', id: proChallenge.id, plan: 'pro' })).toBe(true);
      expect(requiredPlanForContent('challenge', proChallenge.id)).toBe('pro');
    }
  });
});
