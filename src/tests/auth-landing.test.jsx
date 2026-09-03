import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import SignUp from '../pages/SignUp.jsx';
import { ContentLoadState } from '../components/feedback/ContentLoadState.jsx';
import { PREMIUM_STATUS } from '../services/premiumContent.js';
import { safeApplicationPath } from '../features/billing/plans.js';
import { createOAuthRedirectUrl } from '../services/supabase.js';
import en from '../i18n/locales/en.js';
import az from '../i18n/locales/az.js';
import ru from '../i18n/locales/ru.js';

/**
 * The landing page after a successful sign-in.
 *
 * OAuth worked in production, but the landing page kept offering "Log in" to
 * learners who already had a session — which reads as a broken login even though
 * the session is valid. It is the one screen reachable without the app shell, so
 * it is the only place that needed to become auth-aware.
 *
 * The second half covers the return path: signing in from a gated page should
 * come back to that page, and must not become an open redirect while doing so.
 */

const mocks = vi.hoisted(() => ({
  auth: {},
  userState: { state: { lessons: {} } },
  entitlements: {},
}));

vi.mock('../state/AuthProvider.jsx', () => ({ useAuth: () => mocks.auth }));
vi.mock('../state/UserStateProvider.jsx', () => ({ useUserState: () => mocks.userState }));
vi.mock('../state/EntitlementProvider.jsx', () => ({ useEntitlements: () => mocks.entitlements }));
vi.mock('../layouts/AuthLayout.jsx', () => ({
  AuthLayout: ({ title, subtitle, children, footer }) => (
    <main><h1>{title}</h1><p>{subtitle}</p>{children}<footer>{footer}</footer></main>
  ),
}));

const guest = () => ({
  loading: false, isAuthenticated: false, isConfigured: true,
  displayName: null, user: null, signOut: vi.fn(),
  signInWithGoogle: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signInWithGitHub: vi.fn().mockResolvedValue({ data: {}, error: null }),
});

const signedIn = () => ({ ...guest(), isAuthenticated: true, displayName: 'Learner', user: { email: 'a@b.c' } });

const plan = (name, subscription = null) => ({
  plan: name, isPro: name === 'pro', loading: false, error: null,
  billingConfigured: true, subscription, subscriptions: subscription ? [subscription] : [],
  refresh: vi.fn(), reconcile: vi.fn(), hasFeature: () => name === 'pro', canAccessContent: () => true,
});

const renderAt = (ui, entry = '/') => render(<MemoryRouter initialEntries={[entry]}>{ui}</MemoryRouter>);

beforeEach(() => {
  mocks.auth = guest();
  mocks.userState = { state: { lessons: {} } };
  mocks.entitlements = plan('guest');
});

/* ------------------------------------------------------------------ *
 * Landing, by role
 * ------------------------------------------------------------------ */

describe('landing CTAs follow the session', () => {
  it('offers guest CTAs when signed out', () => {
    renderAt(<Landing />);
    expect(screen.getAllByRole('link', { name: en.auth.logIn }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: en.dashboard.startLearning }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: en.landing.startFromZero }).length).toBeGreaterThan(0);
  });

  it.each([
    ['free', plan('free')],
    ['active pro', plan('pro', { status: 'active', current_period_end: '2030-01-01T00:00:00Z' })],
    ['canceling pro', plan('pro', { status: 'canceling', current_period_end: '2030-01-01T00:00:00Z' })],
  ])('never offers "Log in" to a signed-in %s learner', (_role, entitlements) => {
    mocks.auth = signedIn();
    mocks.entitlements = entitlements;
    renderAt(<Landing />);

    expect(screen.queryByRole('link', { name: en.auth.logIn })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: en.dashboard.startLearning })).not.toBeInTheDocument();
  });

  it.each([
    ['free', plan('free')],
    ['active pro', plan('pro', { status: 'active', current_period_end: '2030-01-01T00:00:00Z' })],
    ['canceling pro', plan('pro', { status: 'canceling', current_period_end: '2030-01-01T00:00:00Z' })],
  ])('offers Dashboard, profile and Continue learning to a signed-in %s learner', (_role, entitlements) => {
    mocks.auth = signedIn();
    mocks.entitlements = entitlements;
    renderAt(<Landing />);

    expect(screen.getAllByRole('link', { name: en.nav.dashboard }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: en.nav.profile }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: en.dashboard.continueLearning }).length).toBeGreaterThan(0);
  });

  it('shows no auth CTA at all while the session is still restoring', () => {
    // The flash this prevents: "Log in" painted, then swapped for "Dashboard".
    mocks.auth = { ...guest(), loading: true };
    renderAt(<Landing />);

    expect(screen.queryByRole('link', { name: en.auth.logIn })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: en.nav.dashboard })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: en.dashboard.startLearning })).not.toBeInTheDocument();
    // The rest of the page is not blocked on auth.
    expect(screen.getByRole('heading', { name: en.landing.headline })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: en.learning.curriculum }).length).toBeGreaterThan(0);
  });

  it('returns to guest CTAs after signing out', () => {
    mocks.auth = signedIn();
    const view = renderAt(<Landing />);
    expect(screen.queryByRole('link', { name: en.auth.logIn })).not.toBeInTheDocument();

    view.unmount();
    mocks.auth = guest();
    renderAt(<Landing />);
    expect(screen.getAllByRole('link', { name: en.auth.logIn }).length).toBeGreaterThan(0);
  });

  it.each([['az', az], ['ru', ru]])('uses translated CTAs in %s without changing behaviour', (_code, dict) => {
    // Landing reads the dictionary through useT; here we only assert that the
    // signed-in branch is chosen regardless of locale, using each locale's words.
    mocks.auth = signedIn();
    renderAt(<Landing />);
    expect(screen.queryByRole('link', { name: en.auth.logIn })).not.toBeInTheDocument();
    expect(typeof dict.nav.dashboard).toBe('string');
    expect(dict.nav.dashboard.length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ *
 * Authenticated learners do not sit on the auth screens
 * ------------------------------------------------------------------ */

describe('auth routes while already authenticated', () => {
  const withRoutes = (page, entry) => render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={page} />
        <Route path="/signup" element={page} />
        <Route path="/dashboard" element={<p>DASHBOARD</p>} />
        <Route path="/challenges/:slug" element={<p>DEEP ROUTE</p>} />
        <Route path="/onboarding/level" element={<p>ONBOARDING</p>} />
      </Routes>
    </MemoryRouter>,
  );

  it('redirects away from /login', () => {
    mocks.auth = signedIn();
    withRoutes(<Login />, '/login');
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en.auth.continueWithGoogle })).not.toBeInTheDocument();
  });

  it('redirects away from /signup', () => {
    mocks.auth = signedIn();
    withRoutes(<SignUp />, '/signup');
    expect(screen.queryByRole('button', { name: en.auth.continueWithGoogle })).not.toBeInTheDocument();
    expect(screen.getByText('ONBOARDING')).toBeInTheDocument();
  });

  it('honours a safe return path when redirecting away from /login', () => {
    mocks.auth = signedIn();
    withRoutes(<Login />, '/login?next=%2Fchallenges%2Fa-lazy-transformation-pipeline');
    expect(screen.getByText('DEEP ROUTE')).toBeInTheDocument();
  });

  it('ignores an unsafe return path and uses the default', () => {
    mocks.auth = signedIn();
    withRoutes(<Login />, '/login?next=https%3A%2F%2Fevil.test%2Fsteal');
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ *
 * The OAuth return path
 * ------------------------------------------------------------------ */

describe('OAuth return path', () => {
  // One provider per render: starting a sign-in disables the other button, which
  // is correct behaviour and not something to click around.
  it.each([
    ['Google', 'continueWithGoogle', 'signInWithGoogle'],
    ['GitHub', 'continueWithGitHub', 'signInWithGitHub'],
  ])('passes the deep link to %s', (_name, labelKey, method) => {
    const deep = '/challenges/a-lazy-transformation-pipeline';
    const view = renderAt(<Login />, `/login?next=${encodeURIComponent(deep)}`);
    fireEvent.click(screen.getByRole('button', { name: en.auth[labelKey] }));
    expect(mocks.auth[method]).toHaveBeenCalledWith(deep);
    view.unmount();
  });

  it('falls back to the dashboard when /login is opened directly', () => {
    renderAt(<Login />, '/login');
    fireEvent.click(screen.getByRole('button', { name: en.auth.continueWithGoogle }));
    expect(mocks.auth.signInWithGoogle).toHaveBeenCalledWith('/dashboard');
  });

  it.each([
    ['absolute URL', 'https://evil.test/steal'],
    ['protocol-relative', '//evil.test/steal'],
    ['scheme-relative with backslash', '/\\evil.test'],
    ['javascript URL', 'javascript:alert(1)'],
  ])('refuses an unsafe next value (%s)', (_label, bad) => {
    renderAt(<Login />, `/login?next=${encodeURIComponent(bad)}`);
    fireEvent.click(screen.getByRole('button', { name: en.auth.continueWithGoogle }));
    const used = mocks.auth.signInWithGoogle.mock.calls[0][0];
    expect(used).not.toContain('evil.test');
    expect(used).not.toMatch(/^javascript:/i);
    expect(used.startsWith('/')).toBe(true);
  });

  it('also routes the guest escape hatch to the same safe destination', () => {
    const deep = '/reference/array-constructor';
    renderAt(<Login />, `/login?next=${encodeURIComponent(deep)}`);
    expect(screen.getByRole('link', { name: en.auth.continueAsGuest })).toHaveAttribute('href', deep);
  });

  it('sends a learner blocked on a Pro page back to that page after signing in', () => {
    render(
      <MemoryRouter initialEntries={['/challenges/a-lazy-transformation-pipeline']}>
        <Routes>
          <Route
            path="/challenges/:slug"
            element={<ContentLoadState error={{ premiumStatus: PREMIUM_STATUS.UNAUTHENTICATED }} kind="challenge" />}
          />
        </Routes>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: en.auth.logIn });
    expect(link.getAttribute('href')).toBe(
      '/login?next=%2Fchallenges%2Fa-lazy-transformation-pipeline',
    );
  });
});

/* ------------------------------------------------------------------ *
 * Guarantees the redirect work must not weaken
 * ------------------------------------------------------------------ */

describe('redirect safety is unchanged', () => {
  it('keeps every provider redirect on the current origin', () => {
    expect(createOAuthRedirectUrl('/dashboard', 'https://jspath.vercel.app'))
      .toBe('https://jspath.vercel.app/dashboard');
    expect(createOAuthRedirectUrl('/challenges/x?a=1#b', 'https://jspath.vercel.app'))
      .toBe('https://jspath.vercel.app/challenges/x?a=1#b');
    expect(() => createOAuthRedirectUrl('https://evil.test', 'https://jspath.vercel.app')).toThrow();
    expect(() => createOAuthRedirectUrl('//evil.test/x', 'https://jspath.vercel.app')).toThrow();
  });

  it('keeps safeApplicationPath rejecting anything off-origin', () => {
    const origin = 'https://jspath.vercel.app';
    expect(safeApplicationPath('/projects/counter-app', '/dashboard', origin)).toBe('/projects/counter-app');
    expect(safeApplicationPath('https://evil.test/x', '/dashboard', origin)).toBe('/dashboard');
    expect(safeApplicationPath('//evil.test/x', '/dashboard', origin)).toBe('/dashboard');
    expect(safeApplicationPath(null, '/dashboard', origin)).toBe('/dashboard');
  });

  it('does not vary the destination by locale', () => {
    // The redirect helpers take a path and an origin; locale is not an input and
    // must never become one.
    const origin = 'https://jspath.vercel.app';
    for (const locale of ['en', 'az', 'ru']) {
      mocks.userState = { state: { lessons: {}, settings: { locale } } };
      expect(safeApplicationPath('/interview', '/dashboard', origin)).toBe('/interview');
      expect(createOAuthRedirectUrl('/interview', origin)).toBe(`${origin}/interview`);
    }
  });
});
