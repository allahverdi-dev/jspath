import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from './router.jsx';
import { modules, lessons, exercises, challenges, projects, interviewQuestions, references, cheatSheets } from '../content/registry.js';
import { canAccessContent, planHasFeature, requiredPlanForContent } from '../features/billing/access.js';

const entitlement = vi.hoisted(() => ({ plan: 'free', loading: false }));
vi.mock('../state/EntitlementProvider.jsx', () => ({
  useEntitlements: () => ({
    loading: entitlement.loading,
    hasFeature: (feature) => planHasFeature(entitlement.plan, feature),
    canAccessContent: (kind, id) => canAccessContent({ kind, id, plan: entitlement.plan }),
  }),
}));
vi.mock('../layouts/AppShell.jsx', async () => {
  const { Outlet } = await import('react-router-dom');
  return { AppShell: Outlet, FocusLayout: Outlet };
});
// Keep the real router, indexes and gates; sentinels prove protected children
// never mount (not merely hidden buttons). Lazy imports remain in the router.
vi.mock('../pages/ChallengeDetail.jsx', () => ({ default: () => <h2>Challenge workspace</h2> }));
vi.mock('../pages/ProjectDetail.jsx', () => ({ default: () => <h2>Project workspace</h2> }));
vi.mock('../pages/InterviewQuestionPage.jsx', () => ({ default: () => <h2>Question workspace</h2> }));
vi.mock('../pages/ExercisePage.jsx', () => ({ default: () => <h2>Exercise workspace</h2> }));
vi.mock('../pages/InterviewSession.jsx', () => ({ default: () => <h2>Interview session workspace</h2> }));
vi.mock('../pages/PracticeSession.jsx', () => ({ default: () => <h2>Practice session workspace</h2> }));
vi.mock('../pages/ModuleDetail.jsx', () => ({ default: () => <h2>Module workspace</h2> }));
vi.mock('../pages/Lesson.jsx', () => ({ default: () => <h2>Lesson workspace</h2> }));
vi.mock('../pages/ReferenceDetail.jsx', () => ({ default: () => <h2>Reference workspace</h2> }));
vi.mock('../pages/CheatSheetDetail.jsx', () => ({ default: () => <h2>Cheatsheet workspace</h2> }));

const details = [
  { kind: 'challenge', items: challenges, path: (item) => `/challenges/${item.slug}`, heading: 'Challenge workspace' },
  { kind: 'project', items: projects, path: (item) => `/projects/${item.slug}`, heading: 'Project workspace' },
  { kind: 'interview', items: interviewQuestions, path: (item) => `/interview/question/${item.id}`, heading: 'Question workspace' },
  { kind: 'exercise', items: exercises, path: (item) => `/practice/exercise/${item.id}`, heading: 'Exercise workspace' },
];
const open = (path) => render(<MemoryRouter initialEntries={[path]}><AppRouter /></MemoryRouter>);

describe('direct navigation uses exact content IDs, not broad feature access', () => {
  beforeEach(() => { entitlement.plan = 'free'; entitlement.loading = false; });

  for (const { kind, items, path, heading } of details) {
    for (const allocation of ['free', 'pro']) {
      const item = items.find(({ id }) => requiredPlanForContent(kind, id) === allocation);
      it.each(['guest', 'free', 'pro'])(`%s navigates directly to ${allocation} ${kind}`, async (plan) => {
        entitlement.plan = plan;
        open(path(item));
        if (allocation === 'free' || plan === 'pro') {
          expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
          expect(screen.queryByRole('link', { name: 'View Pro options' })).not.toBeInTheDocument();
        } else {
          expect(screen.queryByRole('heading', { name: heading })).not.toBeInTheDocument();
          expect(screen.getByRole('link', { name: 'View Pro options' })).toHaveAttribute('href', '/pricing');
        }
      });
    }
  }

  /**
   * "Not yet allocated" and "does not exist" are two different things, and an
   * earlier version of this test conflated them by using a slug that was not real.
   *
   * Content that exists but is missing from the free-sample catalog must fail
   * closed to Pro — that is the guarantee that stops new content leaking out for
   * free. It lives in the access layer, so it is asserted there, against ids the
   * catalog has never seen.
   */
  it.each(['challenge', 'project', 'interview'])(
    'fails closed to Pro for an unallocated %s id',
    (kind) => {
      expect(requiredPlanForContent(kind, 'id-the-catalog-has-never-seen')).toBe('pro');
    },
  );

  /**
   * A slug that resolves to nothing is a 404, not paid content. Gating it would
   * ask a learner to pay for something that does not exist, so the route must
   * reach the page and let it render its own "not found".
   */
  it.each([
    ['/challenges/no-such-challenge', 'Challenge workspace'],
    ['/projects/no-such-project', 'Project workspace'],
    ['/interview/question/no-such-question', 'Question workspace'],
    ['/practice/exercise/no-such-exercise', 'Exercise workspace'],
  ])('routes unknown content %s to the page, not to an upgrade wall', async (path, heading) => {
    entitlement.plan = 'guest';
    open(path);
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View Pro options' })).not.toBeInTheDocument();
  });

  it.each([
    [`/curriculum/${modules[0].slug}`, 'Module workspace'],
    [`/learn/${modules.find((m) => m.id === lessons.at(-1).moduleId).slug}/${lessons.at(-1).slug}`, 'Lesson workspace'],
    [`/reference/${references.at(-1).slug}`, 'Reference workspace'],
    [`/cheat-sheets/${cheatSheets.at(-1).slug}`, 'Cheatsheet workspace'],
  ])('keeps core route %s accessible', async (path, heading) => {
    entitlement.plan = 'guest';
    open(path);
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  for (const [path, heading] of [['/interview/session', 'Interview session workspace'], ['/practice/session?mode=weak', 'Practice session workspace']]) {
    it.each(['guest', 'free', 'pro'])(`%s access to session ${path}`, async (plan) => {
      entitlement.plan = plan;
      open(path);
      if (plan === 'pro') expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
      else {
        expect(screen.queryByRole('heading', { name: heading })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View Pro options' })).toBeInTheDocument();
      }
    });
  }

  it('does not mount a premium workspace while entitlement is loading', () => {
    entitlement.plan = 'pro'; entitlement.loading = true;
    const detail = details[0];
    open(detail.path(detail.items.find(({ id }) => requiredPlanForContent('challenge', id) === 'pro')));
    expect(screen.getByRole('status')).toHaveTextContent('Checking access');
    expect(screen.queryByRole('heading', { name: detail.heading })).not.toBeInTheDocument();
  });
});
