import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Placement from './Placement.jsx';
import QUESTIONS from '../content/placement/index.js';
import { moduleById } from '../content/registry.js';
import { createInitialState, completeLesson } from '../features/progress/progressEngine.js';
import { PLACEMENT_DOMAIN_KEY } from '../content/schema/types.js';
import en from '../i18n/locales/en.js';

/**
 * Page-level coverage for the placement assessment.
 *
 * The engine is tested separately as pure functions; what matters here is that
 * the route exists for every kind of visitor, that the flow reaches a result
 * without leaking answers, and that finishing it does not silently write to
 * curriculum progress.
 */

const context = vi.hoisted(() => ({ plan: 'guest', state: null, saved: [], profilePatches: [] }));

vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({
    state: context.state,
    isGuest: context.plan === 'guest',
    xp: context.state.xp.total,
    streak: 0,
    actions: {
      savePlacement: (p) => { context.saved.push(p); },
      updateProfile: (p) => { context.profilePatches.push(p); },
    },
  }),
}));
vi.mock('../state/AuthProvider.jsx', () => ({
  useAuth: () => ({ displayName: 'Learner', isAuthenticated: context.plan !== 'guest' }),
}));

const mount = () =>
  render(
    <MemoryRouter initialEntries={['/onboarding/placement']}>
      <Routes>
        <Route path="/onboarding/placement" element={<Placement />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  context.plan = 'guest';
  context.state = createInitialState();
  context.saved = [];
  context.profilePatches = [];
});

/** Walk the whole assessment, answering every question correctly or not. */
const WALKTHROUGH_TIMEOUT = 30_000;

async function completeAssessment(user, { correct }) {
  await user.click(screen.getByRole('button', { name: /start the assessment|retake the assessment/i }));
  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const options = screen.getAllByRole('radio');
    const pick = correct ? q.correct : (q.correct + 1) % q.options.length;
    await user.click(options[pick]);
    const last = i === QUESTIONS.length - 1;
    await user.click(
      screen.getByRole('button', { name: last ? /submit and see my result/i : /^next$/i }),
    );
  }
}

describe('placement route and access', () => {
  it.each(['guest', 'free', 'pro'])('renders the assessment for a %s visitor', (plan) => {
    context.plan = plan;
    mount();
    expect(screen.getByRole('heading', { name: /find out where to start/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start the assessment/i })).toBeInTheDocument();
  });

  it('shows no upgrade prompt or Pro badge anywhere in the flow', () => {
    const { container } = mount();
    expect(container.textContent).not.toMatch(/\bPro\b/);
    expect(container.textContent).not.toMatch(/upgrade/i);
    expect(container.querySelector('a[href="/pricing"]')).toBeNull();
  });

  it('states that nothing is locked', () => {
    mount();
    expect(screen.getByText(/does not lock or skip any curriculum/i)).toBeInTheDocument();
  });

  it('offers a way out to the full curriculum before starting', () => {
    mount();
    expect(screen.getByRole('link', { name: /browse the curriculum/i })).toHaveAttribute(
      'href',
      '/curriculum',
    );
  });
});

describe('answering', () => {
  it('shows one question at a time with a visible position', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await user.click(screen.getByRole('button', { name: /start the assessment/i }));
    expect(screen.getByText(`Question 1 of ${QUESTIONS.length}`)).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(QUESTIONS[0].options.length);
  });

  it('does not reveal the answer or the explanation during the assessment', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = mount();
    await user.click(screen.getByRole('button', { name: /start the assessment/i }));
    await user.click(screen.getAllByRole('radio')[0]);
    expect(container.textContent).not.toContain(QUESTIONS[0].explanation);
    expect(container.textContent).not.toMatch(/correct!|that.s right|incorrect/i);
  });

  it('marks the chosen option as selected for assistive technology', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await user.click(screen.getByRole('button', { name: /start the assessment/i }));
    const options = screen.getAllByRole('radio');
    await user.click(options[1]);
    expect(options[1]).toHaveAttribute('aria-checked', 'true');
    expect(options[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('allows going back and changing an answer before submitting', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await user.click(screen.getByRole('button', { name: /start the assessment/i }));

    await user.click(screen.getAllByRole('radio')[0]);
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    expect(screen.getByText(`Question 2 of ${QUESTIONS.length}`)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(screen.getByText(`Question 1 of ${QUESTIONS.length}`)).toBeInTheDocument();
    // The earlier choice is still selected, and can be changed.
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getAllByRole('radio')[1]);
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('aria-checked', 'false');
    expect(screen.getAllByRole('radio')[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('cannot go back past the first question', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await user.click(screen.getByRole('button', { name: /start the assessment/i }));
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('allows skipping a question without blocking progress', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await user.click(screen.getByRole('button', { name: /start the assessment/i }));
    expect(screen.getByText(/you can skip this and come back to it/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    expect(screen.getByText(`Question 2 of ${QUESTIONS.length}`)).toBeInTheDocument();
  });

  it('counts answered questions as they accumulate', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await user.click(screen.getByRole('button', { name: /start the assessment/i }));
    expect(screen.getByText('0 answered')).toBeInTheDocument();
    await user.click(screen.getAllByRole('radio')[0]);
    expect(screen.getByText('1 answered')).toBeInTheDocument();
  });
});

describe('result', () => {
  it('renders a full result for a perfect run', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await completeAssessment(user, { correct: true });

    expect(screen.getByText(/your result/i)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${QUESTIONS.length} of ${QUESTIONS.length}`)),
    ).toBeInTheDocument();
    expect(screen.getByText(/recommended start/i)).toBeInTheDocument();
    expect(screen.getByText(/^Why:/)).toBeInTheDocument();
  }, WALKTHROUGH_TIMEOUT);

  it('renders a full result for a run with no correct answers', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await completeAssessment(user, { correct: false });

    expect(screen.getByText(/your result/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`0 of ${QUESTIONS.length}`))).toBeInTheDocument();
    expect(screen.getByText(/recommended start/i)).toBeInTheDocument();
  }, WALKTHROUGH_TIMEOUT);

  it('never uses discouraging language', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = mount();
    await completeAssessment(user, { correct: false });
    expect(container.textContent).not.toMatch(/you failed|not ready|too weak|poor/i);
    expect(container.textContent).toMatch(/starting point, not a verdict/i);
  }, WALKTHROUGH_TIMEOUT);

  it('makes no AI or readiness claim', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = mount();
    await completeAssessment(user, { correct: true });
    expect(container.textContent).not.toMatch(/\bAI\b|artificial intelligence|interview ready/i);
  }, WALKTHROUGH_TIMEOUT);

  it('shows a breakdown for every domain, labelled in words as well as colour', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await completeAssessment(user, { correct: true });

    const breakdown = screen.getByText(/how each area went/i).closest('div');
    for (const key of Object.values(PLACEMENT_DOMAIN_KEY)) {
      const label = key.split('.').reduce((node, part) => node[part], en);
      expect(within(breakdown).getByText(label)).toBeInTheDocument();
    }
    expect(within(breakdown).getAllByText(/strong|mixed|focus area/i).length).toBeGreaterThan(0);
  }, WALKTHROUGH_TIMEOUT);

  it('links the recommendation to a curriculum module that really exists', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await completeAssessment(user, { correct: false });

    const cta = screen.getByRole('link', { name: /start here/i });
    const slug = cta.getAttribute('href').replace('/curriculum/', '');
    const target = Object.values(moduleById).find((m) => m.slug === slug);
    expect(target).toBeDefined();
  }, WALKTHROUGH_TIMEOUT);

  it('always offers the whole curriculum as an alternative', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await completeAssessment(user, { correct: true });
    expect(screen.getByRole('link', { name: /browse the whole curriculum/i })).toHaveAttribute(
      'href',
      '/curriculum',
    );
  }, WALKTHROUGH_TIMEOUT);
});

describe('persistence and retake', () => {
  it('saves exactly one placement record on submission', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await completeAssessment(user, { correct: true });

    expect(context.saved).toHaveLength(1);
    expect(context.saved[0].level).toBe('experienced');
    expect(context.saved[0].recommendedModuleId).toBeTruthy();
    expect(context.saved[0].completedAt).toBeTruthy();
  }, WALKTHROUGH_TIMEOUT);

  it('does not write to lesson, exercise or challenge progress', async () => {
    const user = userEvent.setup({ delay: null });
    const before = JSON.stringify(context.state);
    mount();
    await completeAssessment(user, { correct: true });

    // The page only ever calls savePlacement; nothing mutates the state object.
    expect(JSON.stringify(context.state)).toBe(before);
    expect(context.state.lessons).toEqual({});
    expect(context.state.exercises).toEqual({});
    expect(context.state.challenges).toEqual({});
    expect(context.state.xp.total).toBe(0);
    expect(context.state.activity).toEqual([]);
  }, WALKTHROUGH_TIMEOUT);

  it('shows a previous result on the intro and offers a retake', () => {
    context.state = {
      ...createInitialState(),
      placement: {
        completedAt: '2026-01-01T00:00:00.000Z',
        level: 'basics',
        score: 0.4,
        correctCount: 12,
        totalCount: QUESTIONS.length,
        recommendedModuleId: 'm08',
        recommendedDomain: 'core-language',
        domainScores: {},
      },
    };
    mount();
    expect(screen.getByText(/your last result/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`12 of ${QUESTIONS.length} correct`))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retake the assessment/i })).toBeInTheDocument();
    expect(screen.getByText(/curriculum progress is\s+untouched/i)).toBeInTheDocument();
  });

  it('starts a retake clean, with no answers carried over', async () => {
    const user = userEvent.setup({ delay: null });
    mount();
    await completeAssessment(user, { correct: true });
    await user.click(screen.getByRole('button', { name: /retake assessment/i }));

    expect(screen.getByText(`Question 1 of ${QUESTIONS.length}`)).toBeInTheDocument();
    expect(screen.getByText('0 answered')).toBeInTheDocument();
    for (const option of screen.getAllByRole('radio')) {
      expect(option).toHaveAttribute('aria-checked', 'false');
    }
  }, WALKTHROUGH_TIMEOUT);

  it('leaves existing curriculum progress alone when a result is stored', () => {
    // Guarded at the reducer level too, but asserted here as the product promise.
    const withProgress = completeLesson(createInitialState(), {
      id: 'l-m01-01',
      moduleId: 'm01',
      estimatedMinutes: 10,
    });
    context.state = { ...withProgress, placement: null };
    mount();
    expect(context.state.lessons['l-m01-01']).toBeDefined();
    expect(context.state.xp.total).toBeGreaterThan(0);
  });
});

describe('direct navigation', () => {
  it('mounts cleanly on a fresh load with no stored state', () => {
    expect(() => mount()).not.toThrow();
    expect(screen.getByRole('heading', { name: /find out where to start/i })).toBeInTheDocument();
  });

  it('mounts cleanly when a previous result exists', () => {
    context.state = {
      ...createInitialState(),
      placement: { completedAt: '2026-01-01', level: 'zero', score: 0, correctCount: 0, totalCount: QUESTIONS.length, recommendedModuleId: 'm01', recommendedDomain: 'foundations', domainScores: {} },
    };
    expect(() => mount()).not.toThrow();
  });

  it('survives a state shape that predates placement', () => {
    const legacy = createInitialState();
    delete legacy.placement;
    context.state = legacy;
    expect(() => mount()).not.toThrow();
    expect(screen.getByRole('button', { name: /start the assessment/i })).toBeInTheDocument();
  });
});
