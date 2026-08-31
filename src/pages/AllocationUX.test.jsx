import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Challenges from './Challenges.jsx';
import Projects from './Projects.jsx';
import InterviewPrep from './InterviewPrep.jsx';
import PracticeHub from './PracticeHub.jsx';
import Dashboard from './Dashboard.jsx';
import MyLearning from './MyLearning.jsx';
import Pricing from './Pricing.jsx';
import { ExerciseRunner } from '../features/exercises/ExerciseRunner.jsx';
import { createInitialState, completeLesson, recordQuizAttempt } from '../features/progress/progressEngine.js';
import { exercises, challenges, projects, interviewQuestions, getExercise, lessons, quizIndex } from '../content/registry.js';
import { canAccessContent, planHasFeature, requiredPlanForContent } from '../features/billing/access.js';

const context = vi.hoisted(() => ({ plan: 'free', state: null }));
vi.mock('../state/EntitlementProvider.jsx', () => ({ useEntitlements: () => ({
  plan: context.plan,
  isPro: context.plan === 'pro',
  loading: false,
  billingConfigured: false,
  hasFeature: (feature) => planHasFeature(context.plan, feature),
  canAccessContent: (kind, id) => canAccessContent({ kind, id, plan: context.plan }),
}) }));
vi.mock('../state/UserStateProvider.jsx', () => ({ useUserState: () => ({ state: context.state, actions: {}, xp: context.state.xp.total, streak: 1, isGuest: context.plan === 'guest' }) }));
vi.mock('../state/AuthProvider.jsx', () => ({ useAuth: () => ({ displayName: 'Learner', isAuthenticated: context.plan !== 'guest' }) }));
vi.mock('../components/code/CodeEditor.jsx', () => ({ CodeEditor: () => <textarea aria-label="Exercise editor" /> }));

const mount = (component) => render(<MemoryRouter>{component}</MemoryRouter>);

beforeEach(() => { context.plan = 'free'; context.state = createInitialState(); });

describe('browseable catalogs mark item allocation, not whole features', () => {
  it.each([
    ['challenge', Challenges, challenges, (item) => `/challenges/${item.slug}`],
    ['project', Projects, projects, (item) => `/projects/${item.slug}`],
    ['interview', InterviewPrep, interviewQuestions, (item) => `/interview/question/${item.id}`],
    ['exercise', PracticeHub, exercises, (item) => `/practice/exercise/${item.id}`],
  ])('%s preserves every item and only marks Pro items', (kind, Page, items, url) => {
    const { container } = mount(<Page />);
    for (const item of items) {
      const links = container.querySelectorAll(`a[href="${url(item)}"]`);
      expect(links.length, item.id).toBeGreaterThan(0);
      const row = links[links.length - 1];
      expect(Boolean(within(row).queryByText('Pro')), item.id).toBe(requiredPlanForContent(kind, item.id) === 'pro');
    }
  });

  it('labels Pro items even for members without labeling Free samples Pro', () => {
    context.plan = 'pro';
    const { container } = mount(<Projects />);
    for (const project of projects) {
      const row = container.querySelector(`a[href="/projects/${project.slug}"]`);
      expect(Boolean(within(row).queryByText('Pro'))).toBe(requiredPlanForContent('project', project.id) === 'pro');
    }
  });
});

describe('basic progress and meaningful advanced analysis', () => {
  beforeEach(() => {
    context.state = completeLesson(context.state, lessons[0]);
    const quiz = quizIndex[0];
    context.state = recordQuizAttempt(context.state, quiz, { score: quiz.questions.length - 1, total: quiz.questions.length, wrongQuestionIds: [quiz.questions[0].id] });
  });

  it.each(['guest', 'free'])('%s keeps dashboard progress but not detailed mastery', (plan) => {
    context.plan = plan;
    mount(<Dashboard />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('XP')).toBeInTheDocument();
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('Lessons completed')).toBeInTheDocument();
    expect(screen.getByText('1 of 214 lessons complete')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.queryByText('Skill breakdown')).not.toBeInTheDocument();
    expect(screen.queryByText('JavaScript Mastery')).not.toBeInTheDocument();
    expect(screen.queryByText(/weakest started topic/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Advanced Analytics · Pro' })).toBeInTheDocument();
  });

  it('shows the real skill breakdown and mastery to Pro', () => {
    context.plan = 'pro';
    mount(<Dashboard />);
    expect(screen.getByText('Skill breakdown')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Mastery')).toBeInTheDocument();
    expect(screen.queryByText('Advanced Analytics · Pro')).not.toBeInTheDocument();
  });

  it('leaves My Learning counts and activity free while gating the evidence tree', () => {
    mount(<MyLearning />);
    expect(screen.getByText('1/214')).toBeInTheDocument();
    expect(screen.getByText('Recent activity')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Advanced Analytics: skill tree' })).not.toBeInTheDocument();
    expect(screen.queryByText(/no quiz data/)).not.toBeInTheDocument();
  });

  it('renders actual assessment evidence in the Pro skill tree', () => {
    context.plan = 'pro';
    mount(<MyLearning />);
    expect(screen.getByRole('heading', { name: 'Advanced Analytics: skill tree' })).toBeInTheDocument();
    expect(screen.getAllByText(/lessons · .*exercises · .*challenges · /).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/% quiz accuracy/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/idle null/)).not.toBeInTheDocument();
  });

  it('does not expose weak-area scores through the practice sidebar', () => {
    mount(<PracticeHub />);
    expect(screen.queryByText('Weakest topics')).not.toBeInTheDocument();
    expect(screen.queryByText('Mastery overview')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Weak topics/ })).toHaveAttribute('href', '/practice/session?mode=weak');
  });

  it('does not expose weak-area scores through the interview sidebar', () => {
    mount(<InterviewPrep />);
    expect(screen.queryByText('Shore these up first')).not.toBeInTheDocument();
  });
});

describe('embedded exercise enforcement', () => {
  it('does not mount a paid exercise editor, choices, hints or solution for Free', async () => {
    const exercise = await getExercise(exercises.find((e) => requiredPlanForContent('exercise', e.id) === 'pro').id);
    mount(<ExerciseRunner exercise={exercise} />);
    expect(screen.getByRole('heading', { name: exercise.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore Pro' })).toHaveAttribute('href', '/pricing');
    expect(screen.queryByText(exercise.instructions)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Check answer|Run tests|hint|solution/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it.each(['free', 'pro'])('%s can use a Free exercise within a lesson', async (plan) => {
    context.plan = plan;
    const exercise = await getExercise(exercises.find((e) => e.kind === 'conceptual' && requiredPlanForContent('exercise', e.id) === 'free').id);
    mount(<ExerciseRunner exercise={exercise} compact />);
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(exercise.options.length);
  });

  it('Pro can use an explicitly paid embedded exercise', async () => {
    context.plan = 'pro';
    const exercise = await getExercise(exercises.find((e) => e.kind === 'conceptual' && requiredPlanForContent('exercise', e.id) === 'pro').id);
    mount(<ExerciseRunner exercise={exercise} />);
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeInTheDocument();
  });
});

it('pricing communicates exact allocation without fixing external Pro prices', () => {
  mount(<Pricing />);
  for (const text of ['650 exercises', '15 coding challenges', '5 guided projects', '25 interview questions', 'All 810 exercises', 'All 171 coding challenges', 'All 31 guided projects', 'All 312 interview questions']) expect(screen.getByText(text)).toBeInTheDocument();
  expect(screen.getByText('Complete 47-module JavaScript curriculum · all 214 lessons')).toBeInTheDocument();
  expect(screen.getByText('All 213 reference entries and all 9 cheat sheets')).toBeInTheDocument();
  expect(screen.getByText('Flexible billing')).toBeInTheDocument();
  expect(screen.queryByText(/as content is tagged/)).not.toBeInTheDocument();
});
