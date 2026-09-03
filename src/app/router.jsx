import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppShell, FocusLayout } from '../layouts/AppShell.jsx';
import { RouteError } from '../components/feedback/RouteError.jsx';
import { PageSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary.jsx';
import { ContentGate, FeatureGate } from '../components/billing/FeatureGate.jsx';
import { FEATURE } from '../features/billing/plans.js';
import { challengeBySlug, projectBySlug, interviewById, cheatSheetBySlug, exerciseById, lessonBySlug, moduleBySlug, referenceBySlug } from '../content/registry.js';
import { DOCUMENTS } from '../legal/documents.js';

/* Every page is code-split. The shell paints immediately; the route streams in. */
const Landing = lazy(() => import('../pages/Landing.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const Curriculum = lazy(() => import('../pages/Curriculum.jsx'));
const ModuleDetail = lazy(() => import('../pages/ModuleDetail.jsx'));
const Lesson = lazy(() => import('../pages/Lesson.jsx'));
const PracticeHub = lazy(() => import('../pages/PracticeHub.jsx'));
const ExercisePage = lazy(() => import('../pages/ExercisePage.jsx'));
const PracticeSession = lazy(() => import('../pages/PracticeSession.jsx'));
const Challenges = lazy(() => import('../pages/Challenges.jsx'));
const ChallengeDetail = lazy(() => import('../pages/ChallengeDetail.jsx'));
const Projects = lazy(() => import('../pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail.jsx'));
const Playground = lazy(() => import('../pages/Playground.jsx'));
const InterviewPrep = lazy(() => import('../pages/InterviewPrep.jsx'));
const InterviewSession = lazy(() => import('../pages/InterviewSession.jsx'));
const InterviewQuestionPage = lazy(() => import('../pages/InterviewQuestionPage.jsx'));
const Reference = lazy(() => import('../pages/Reference.jsx'));
const ReferenceDetail = lazy(() => import('../pages/ReferenceDetail.jsx'));
const CheatSheets = lazy(() => import('../pages/CheatSheets.jsx'));
const CheatSheetDetail = lazy(() => import('../pages/CheatSheetDetail.jsx'));
const Profile = lazy(() => import('../pages/Profile.jsx'));
const Achievements = lazy(() => import('../pages/Achievements.jsx'));
const MyLearning = lazy(() => import('../pages/MyLearning.jsx'));
const Bookmarks = lazy(() => import('../pages/Bookmarks.jsx'));
const SearchPage = lazy(() => import('../pages/SearchPage.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const SignUp = lazy(() => import('../pages/SignUp.jsx'));
const Pricing = lazy(() => import('../pages/Pricing.jsx'));
const OnboardingLevel = lazy(() => import('../pages/OnboardingLevel.jsx'));
const OnboardingGoals = lazy(() => import('../pages/OnboardingGoals.jsx'));
const Placement = lazy(() => import('../pages/Placement.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));
const LegalDocument = lazy(() => import('../pages/LegalDocument.jsx'));

/**
 * Each route is wrapped in its own error boundary, so a single lesson that fails
 * to load shows a recoverable error inside the shell rather than blanking the app.
 */
function Page({ element }) {
  return (
    <ErrorBoundary fallback={(props) => <RouteError {...props} />}>
      <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
    </ErrorBoundary>
  );
}

function ContentRouteGate({ kind, param, index, children, ...lockedProps }) {
  const params = useParams();
  const item = index[params[param]];
  // An unknown slug is a 404, not paid content. Passing `undefined` into the gate
  // made `requiredPlanForContent` fall through to PRO for the feature-gated kinds,
  // so a stale bookmark or a mistyped link asked the learner to pay for something
  // that does not exist. Every detail page already renders its own "not found",
  // so let the route through and allow the page to say so.
  if (!item) return children;
  return <ContentGate kind={kind} id={item.id} {...lockedProps}>{children}</ContentGate>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Page element={<Landing />} />} />
      <Route path="/login" element={<Page element={<Login />} />} />
      <Route path="/signup" element={<Page element={<SignUp />} />} />
      <Route path="/onboarding" element={<Navigate to="/onboarding/level" replace />} />
      <Route path="/onboarding/level" element={<Page element={<OnboardingLevel />} />} />
      <Route path="/onboarding/goals" element={<Page element={<OnboardingGoals />} />} />
      <Route path="/onboarding/placement" element={<Page element={<Placement />} />} />
      {/* The same assessment outside the onboarding flow, for retakes. Free for everyone. */}
      <Route path="/placement" element={<Page element={<Placement />} />} />

      {/* Distraction-free reading and sessions */}
      <Route element={<FocusLayout />}>
        <Route path="/learn/:moduleSlug/:lessonSlug" element={<ContentRouteGate kind="lesson" param="lessonSlug" index={lessonBySlug} backTo="/curriculum"><Page element={<Lesson />} /></ContentRouteGate>} />
        <Route path="/interview/session" element={<FeatureGate feature={FEATURE.INTERVIEW_PRO} titleKey="billing.lockedInterviewSession" backTo="/interview"><Page element={<InterviewSession />} /></FeatureGate>} />
        <Route path="/practice/session" element={<FeatureGate feature={FEATURE.PREMIUM_PRACTICE} titleKey="billing.lockedPracticeSession" backTo="/practice"><Page element={<PracticeSession />} /></FeatureGate>} />
      </Route>

      {/* Main application */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Page element={<Dashboard />} />} />
        <Route path="/pricing" element={<Page element={<Pricing />} />} />
        <Route path="/curriculum" element={<Page element={<Curriculum />} />} />
        <Route path="/curriculum/:moduleSlug" element={<ContentRouteGate kind="module" param="moduleSlug" index={moduleBySlug} backTo="/curriculum"><Page element={<ModuleDetail />} /></ContentRouteGate>} />
        <Route path="/practice" element={<Page element={<PracticeHub />} />} />
        <Route path="/practice/exercise/:exerciseId" element={<ContentRouteGate kind="exercise" param="exerciseId" index={exerciseById} backTo="/practice"><Page element={<ExercisePage />} /></ContentRouteGate>} />
        <Route path="/challenges" element={<Page element={<Challenges />} />} />
        <Route path="/challenges/:slug" element={<ContentRouteGate kind="challenge" param="slug" index={challengeBySlug} backTo="/challenges"><Page element={<ChallengeDetail />} /></ContentRouteGate>} />
        <Route path="/projects" element={<Page element={<Projects />} />} />
        <Route path="/projects/:slug" element={<ContentRouteGate kind="project" param="slug" index={projectBySlug} backTo="/projects"><Page element={<ProjectDetail />} /></ContentRouteGate>} />
        <Route path="/playground" element={<Page element={<Playground />} />} />
        <Route path="/interview" element={<Page element={<InterviewPrep />} />} />
        <Route path="/interview/question/:questionId" element={<ContentRouteGate kind="interview" param="questionId" index={interviewById} backTo="/interview"><Page element={<InterviewQuestionPage />} /></ContentRouteGate>} />
        <Route path="/reference" element={<Page element={<Reference />} />} />
        <Route path="/reference/:slug" element={<ContentRouteGate kind="reference" param="slug" index={referenceBySlug} backTo="/reference"><Page element={<ReferenceDetail />} /></ContentRouteGate>} />
        <Route path="/cheat-sheets" element={<Page element={<CheatSheets />} />} />
        <Route path="/cheat-sheets/:slug" element={<ContentRouteGate kind="cheatsheet" param="slug" index={cheatSheetBySlug} backTo="/cheat-sheets"><Page element={<CheatSheetDetail />} /></ContentRouteGate>} />
        <Route path="/profile" element={<Page element={<Profile />} />} />
        <Route path="/achievements" element={<Page element={<Achievements />} />} />
        <Route path="/my-learning" element={<Page element={<MyLearning />} />} />
        <Route path="/bookmarks" element={<Page element={<Bookmarks />} />} />
        <Route path="/search" element={<Page element={<SearchPage />} />} />
        <Route path="/settings" element={<Page element={<Settings />} />} />

        {/*
         * Public policy pages. The paths are locale-independent, like every
         * other route: the document language follows the interface locale.
         * An unrecognised path under them still falls through to the 404 below.
         */}
        {DOCUMENTS.map((doc) => (
          <Route key={doc.id} path={doc.path} element={<Page element={<LegalDocument documentId={doc.id} />} />} />
        ))}
      </Route>

      <Route path="*" element={<Page element={<NotFound />} />} />
    </Routes>
  );
}
