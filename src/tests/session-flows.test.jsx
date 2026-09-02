import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import InterviewSession from '../pages/InterviewSession.jsx';
import Pricing from '../pages/Pricing.jsx';
import { createInitialState } from '../features/progress/progressEngine.js';
import { canAccessContent, planHasFeature } from '../features/billing/access.js';
import { CONTENT_ALLOCATION } from '../features/billing/contentAllocation.js';

/**
 * Session and billing-surface flows.
 *
 * The router already proves who may *enter* a session (`router.access.test.jsx`).
 * What is proved here is what happens once inside: that a session progresses,
 * scores only what the learner actually answered, completes, and can be restarted
 * — and that the Pricing surface tells each kind of visitor the truth.
 */

const context = vi.hoisted(() => ({
  plan: 'pro',
  state: null,
  recorded: [],
  subscription: null,
  loading: false,
}));

vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({
    state: context.state,
    isGuest: context.plan === 'guest',
    xp: context.state.xp.total,
    streak: 0,
    syncStatus: 'idle',
    actions: {
      recordInterview: (q, r) => { context.recorded.push({ id: q.id, ...r }); },
      toggleBookmark: () => {},
      updateProfile: () => {},
    },
  }),
}));
vi.mock('../state/AuthProvider.jsx', () => ({
  useAuth: () => ({ displayName: 'Learner', isAuthenticated: context.plan !== 'guest', user: null }),
}));
vi.mock('../state/EntitlementProvider.jsx', () => ({
  useEntitlements: () => ({
    plan: context.plan,
    isPro: context.plan === 'pro',
    loading: context.loading,
    error: null,
    billingConfigured: true,
    subscription: context.subscription,
    subscriptions: context.subscription ? [context.subscription] : [],
    refresh: () => {},
    reconcile: () => {},
    hasFeature: (f) => planHasFeature(context.plan, f),
    canAccessContent: (kind, id) => canAccessContent({ kind, id, plan: context.plan }),
  }),
}));
vi.mock('../state/ToastProvider.jsx', () => ({ useToast: () => ({ show: () => {} }) }));

const mount = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

/**
 * Starting a session dynamically imports the interview bodies. Under a loaded
 * full-suite run that can take longer than the 1s `findBy*` default, which made
 * this file fail intermittently in CI while passing on its own. The wait is
 * generous rather than the assertions being weakened.
 */
const SETTLE = { timeout: 15_000 };

beforeEach(() => {
  context.plan = 'pro';
  context.state = createInitialState();
  context.recorded = [];
  context.subscription = null;
  context.loading = false;
});

/* ------------------------------------------------------------------ *
 * Interview session
 * ------------------------------------------------------------------ */

describe('interview session flow', () => {
  const start = async (user) => {
    mount(<InterviewSession />);
    await user.click(screen.getByRole('button', { name: /start session/i }));
  };

  it('offers a configurable setup before any question is shown', () => {
    mount(<InterviewSession />);
    expect(screen.getByRole('heading', { name: /interview practice session/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/questions/i)).toBeInTheDocument();
    expect(screen.getByText(/questions match your filters/i)).toBeInTheDocument();
  });

  it('states plainly how each kind of question is scored', () => {
    mount(<InterviewSession />);
    const blurb = screen.getByText(/objective questions are scored automatically/i);
    expect(blurb).toBeInTheDocument();
    expect(blurb.textContent).toMatch(/you assess yourself/i);
  });

  it('never claims an AI grades the answers', () => {
    const { container } = mount(<InterviewSession />);
    expect(container.textContent).not.toMatch(/\bAI\b|artificial intelligence|auto-?grade/i);
  });

  it('shows a position counter and progress once started', async () => {
    const user = userEvent.setup({ delay: null });
    await start(user);
    expect(await screen.findByText(/^1 \/ \d+$/, undefined, SETTLE)).toBeInTheDocument();
    expect(screen.getByLabelText(/session progress/i)).toBeInTheDocument();
  });

  it('advances through questions and reaches a completion summary', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<InterviewSession />);
    // Smallest session the product offers, so the walkthrough stays quick.
    await user.selectOptions(screen.getByLabelText(/questions/i), '5');
    await user.click(screen.getByRole('button', { name: /start session/i }));

    for (let i = 0; i < 5; i++) {
      const next = await screen.findByRole('button', { name: /next question|finish session/i }, SETTLE);
      await user.click(next);
    }

    expect(await screen.findByRole('heading', { name: /session complete/i }, SETTLE)).toBeInTheDocument();
    expect(screen.getByLabelText(/session score/i)).toBeInTheDocument();
  }, 30_000);

  it('scores only the questions the learner actually answered', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<InterviewSession />);
    await user.selectOptions(screen.getByLabelText(/questions/i), '5');
    await user.click(screen.getByRole('button', { name: /start session/i }));

    // Walk the whole session without answering anything at all.
    for (let i = 0; i < 5; i++) {
      await user.click(await screen.findByRole('button', { name: /next question|finish session/i }, SETTLE));
    }

    // Skipping never invents a score, and nothing was written to progress.
    expect(await screen.findByRole('heading', { name: /session complete/i }, SETTLE)).toBeInTheDocument();
    expect(screen.getByText(/felt confident on 0/i)).toBeInTheDocument();
    expect(context.recorded).toEqual([]);
  }, 30_000);

  it('offers a way out of a session at any time', () => {
    mount(<InterviewSession />);
    expect(screen.getByRole('button', { name: /exit/i })).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ *
 * Pricing: what each kind of visitor is told
 * ------------------------------------------------------------------ */

describe('pricing surface per plan', () => {
  it('quotes the real allocation rather than stale numbers', () => {
    context.plan = 'guest';
    const { container } = mount(<Pricing />);
    const text = container.textContent;
    expect(text).toContain(String(CONTENT_ALLOCATION.exercise.free));
    expect(text).toContain(String(CONTENT_ALLOCATION.exercise.total));
    expect(text).toContain(String(CONTENT_ALLOCATION.challenge.free));
    expect(text).toContain(String(CONTENT_ALLOCATION.challenge.total));
    expect(text).toContain(String(CONTENT_ALLOCATION.interview.total));
  });

  it('tells a guest that placement is free', () => {
    context.plan = 'guest';
    const { container } = mount(<Pricing />);
    expect(container.textContent).toMatch(/placement assessment/i);
  });

  it('offers a guest a way to create an account', () => {
    context.plan = 'guest';
    mount(<Pricing />);
    expect(screen.getByRole('link', { name: /create a free account/i })).toHaveAttribute('href', '/signup');
  });

  it('does not offer account creation to someone already signed in', () => {
    context.plan = 'free';
    mount(<Pricing />);
    expect(screen.queryByRole('link', { name: /create a free account/i })).not.toBeInTheDocument();
  });

  it('marks Pro as the current plan for a Pro subscriber', () => {
    context.plan = 'pro';
    context.subscription = { plan: 'pro', status: 'active', current_period_end: '2099-01-01T00:00:00.000Z' };
    mount(<Pricing />);
    expect(screen.getByText(/current plan/i)).toBeInTheDocument();
  });

  it('shows a pending cancellation without downgrading the plan', () => {
    context.plan = 'pro';
    context.subscription = {
      plan: 'pro',
      status: 'canceling',
      current_period_end: '2099-01-01T00:00:00.000Z',
    };
    const { container } = mount(<Pricing />);
    // Still Pro, and the copy must not contradict that.
    expect(screen.getByText(/current plan/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/your plan has ended|no longer have access/i);
  });
});
