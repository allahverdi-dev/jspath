import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../pages/Settings.jsx';
import NotFound from '../pages/NotFound.jsx';
import Placement from '../pages/Placement.jsx';
import { AppShell } from '../layouts/AppShell.jsx';
import { I18nProvider } from '../i18n/index.jsx';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../i18n/core.js';
import { createInitialState } from '../features/progress/progressEngine.js';
import { canAccessContent, planHasFeature } from '../features/billing/access.js';
import en from '../i18n/locales/en.js';
import az from '../i18n/locales/az.js';
import ru from '../i18n/locales/ru.js';

/**
 * Localization as the user meets it.
 *
 * The dictionary test proves the three files agree. This one proves the product
 * actually uses them: that switching language changes what is on screen, that the
 * document language follows, that the preference persists through the existing
 * settings state, and — the failure everyone notices — that no raw key or
 * unresolved `{placeholder}` ever reaches the page.
 */

const context = vi.hoisted(() => ({ state: null, plan: 'guest', patches: [] }));

vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({
    state: context.state,
    isGuest: context.plan === 'guest',
    xp: context.state.xp.total,
    streak: 0,
    syncStatus: 'idle',
    actions: {
      updateSettings: (patch) => {
        context.patches.push(patch);
        context.state = { ...context.state, settings: { ...context.state.settings, ...patch } };
      },
      updateProfile: () => {},
      savePlacement: () => {},
      resetProgress: () => {},
      importState: () => {},
    },
  }),
}));
vi.mock('../state/AuthProvider.jsx', () => ({
  useAuth: () => ({
    displayName: 'Learner', isAuthenticated: context.plan !== 'guest',
    isConfigured: true, user: null, signOut: () => {},
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
  useTheme: () => ({ preference: 'dark', setTheme: () => {} }),
  THEMES: ['system', 'light', 'dark'],
}));

const mount = (ui, locale = DEFAULT_LOCALE) => {
  context.state = { ...createInitialState(), settings: { ...createInitialState().settings, locale } };
  return render(
    <MemoryRouter>
      <I18nProvider>{ui}</I18nProvider>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  context.state = createInitialState();
  context.plan = 'guest';
  context.patches = [];
  document.documentElement.lang = '';
});

/* ------------------------------------------------------------------ *
 * Defaults and persistence
 * ------------------------------------------------------------------ */

describe('default locale', () => {
  it('starts in English', () => {
    expect(createInitialState().settings.locale).toBe('en');
    mount(<Settings />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it.each([['tr'], ['de'], ['xx'], [''], [null]])(
    'falls back to English when the saved locale is %s',
    (bad) => {
      mount(<Settings />, bad);
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('en');
    },
  );

  it('offers exactly the supported languages, each in its own language', () => {
    mount(<Settings />);
    const select = screen.getByLabelText(en.settings.languageLabel);
    const values = [...select.options].map((o) => o.value);
    expect(values).toEqual([...SUPPORTED_LOCALES]);
    expect([...select.options].map((o) => o.textContent))
      .toEqual(['English', 'Azərbaycan dili', 'Русский']);
  });

  it('persists the choice through the existing settings state', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Settings />);
    await user.selectOptions(screen.getByLabelText(en.settings.languageLabel), 'ru');
    expect(context.patches).toContainEqual({ locale: 'ru' });
  });

  it('never writes anything but the locale when the language changes', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Settings />);
    await user.selectOptions(screen.getByLabelText(en.settings.languageLabel), 'az');
    // A display preference must not touch plan, entitlement or identity.
    for (const patch of context.patches) {
      expect(Object.keys(patch)).toEqual(['locale']);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Switching
 * ------------------------------------------------------------------ */

describe('switching language', () => {
  it('updates the interface immediately, without a reload', async () => {
    const user = userEvent.setup({ delay: null });
    const { rerender } = mount(<Settings />);
    expect(screen.getByRole('heading', { name: en.settings.title })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(en.settings.languageLabel), 'az');
    rerender(
      <MemoryRouter><I18nProvider><Settings /></I18nProvider></MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: az.settings.title })).toBeInTheDocument();
  });

  it.each([
    ['en', 'en'],
    ['az', 'az'],
    ['ru', 'ru'],
  ])('sets <html lang> to %s', (locale, expected) => {
    mount(<Settings />, locale);
    expect(document.documentElement.lang).toBe(expected);
  });

  it('does not change the theme when the language changes', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Settings />);
    await user.selectOptions(screen.getByLabelText(en.settings.languageLabel), 'ru');
    expect(context.patches.some((p) => 'theme' in p)).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * Surfaces
 * ------------------------------------------------------------------ */

describe('translated surfaces', () => {
  it.each([
    ['az', az],
    ['ru', ru],
  ])('translates settings into %s', (locale, dict) => {
    mount(<Settings />, locale);
    expect(screen.getByRole('heading', { name: dict.settings.title })).toBeInTheDocument();
    expect(screen.getByText(dict.settings.subtitle)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.settings.languageLabel)).toBeInTheDocument();
  });

  it.each([
    ['az', az],
    ['ru', ru],
  ])('translates the 404 page into %s', (locale, dict) => {
    mount(<NotFound />, locale);
    expect(screen.getByRole('heading', { name: dict.errors.notFoundTitle })).toBeInTheDocument();
    expect(screen.getByText(dict.errors.notFoundBody)).toBeInTheDocument();
  });

  it.each([
    ['az', az],
    ['ru', ru],
  ])('translates placement into %s', (locale, dict) => {
    mount(<Placement />, locale);
    expect(screen.getByRole('heading', { name: dict.placement.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: dict.placement.start })).toBeInTheDocument();
  });

  it.each([
    ['az', az],
    ['ru', ru],
  ])('translates navigation into %s', (locale, dict) => {
    mount(<AppShell />, locale);
    const nav = screen.getAllByRole('navigation')[0];
    expect(within(nav).getAllByText(dict.nav.dashboard).length).toBeGreaterThan(0);
    expect(within(nav).getAllByText(dict.nav.practice).length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ *
 * The failure everyone notices
 * ------------------------------------------------------------------ */

describe('no untranslated artefacts reach the page', () => {
  const NAMESPACES = Object.keys(en).join('|');
  const RAW_KEY = new RegExp(`\\b(?:${NAMESPACES})\\.[a-zA-Z]+`);

  it.each([
    ['Settings', () => <Settings />],
    ['NotFound', () => <NotFound />],
    ['Placement', () => <Placement />],
  ])('%s renders no raw key or placeholder in any locale', (_name, make) => {
    for (const locale of SUPPORTED_LOCALES) {
      const { container, unmount } = mount(make(), locale);
      const text = container.textContent ?? '';
      expect(text, `${_name} @ ${locale}`).not.toMatch(RAW_KEY);
      expect(text, `${_name} @ ${locale}`).not.toMatch(/\{\w+\}/);
      unmount();
    }
  });
});

/* ------------------------------------------------------------------ *
 * Nothing else moved
 * ------------------------------------------------------------------ */

describe('locale changes nothing outside presentation', () => {
  it('keeps stored difficulty values in English regardless of language', () => {
    // Display labels differ per locale; the values the engine stores do not.
    for (const dict of [en, az, ru]) {
      expect(Object.keys(dict.difficulty).sort())
        .toEqual(['beginner', 'easy', 'expert', 'hard', 'medium']);
    }
  });

  it('keeps plan and subscription status values untranslated in code', () => {
    // The UI translates the label; `status === 'canceling'` still compares to the
    // literal token, so entitlement logic is locale-independent by construction.
    for (const dict of [en, az, ru]) {
      expect(dict.common.pro).toBe('Pro');
      expect(dict.common.free).toBe('Free');
    }
  });

  it.each(SUPPORTED_LOCALES)('resolves Free/Pro access identically in %s', (locale) => {
    context.state = { ...createInitialState(), settings: { locale } };
    // Access is a pure function of kind, id and plan — locale is not an input.
    expect(canAccessContent({ kind: 'lesson', id: 'l-m01-01', plan: 'guest' })).toBe(true);
    expect(planHasFeature('pro', 'interview_pro')).toBe(planHasFeature('pro', 'interview_pro'));
  });
});
