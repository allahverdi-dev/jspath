import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppShell, FocusLayout } from '../layouts/AppShell.jsx';
import { RouteError } from '../components/feedback/RouteError.jsx';
import { PageSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary.jsx';
import { ContentGate, FeatureGate } from '../components/billing/FeatureGate.jsx';
import { FEATURE } from '../features/billing/plans.js';
import { cheatSheetBySlug, exerciseById, lessonBySlug, moduleBySlug, referenceBySlug } from '../content/registry.js';

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
  return <ContentGate kind={kind} id={item?.id} {...lockedProps}>{children}</ContentGate>;
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

      {/* Distraction-free reading and sessions */}
      <Route element={<FocusLayout />}>
        <Route path="/learn/:moduleSlug/:lessonSlug" element={<ContentRouteGate kind="lesson" param="lessonSlug" index={lessonBySlug} title="This lesson is included with Pro" backTo="/curriculum"><Page element={<Lesson />} /></ContentRouteGate>} />
        <Route path="/interview/session" element={<FeatureGate feature={FEATURE.INTERVIEW_PRO} title="Interview practice sessions are included with Pro" backTo="/interview"><Page element={<InterviewSession />} /></FeatureGate>} />
        <Route path="/practice/session" element={<FeatureGate feature={FEATURE.PREMIUM_PRACTICE} title="Guided practice sessions are included with Pro" backTo="/practice"><Page element={<PracticeSession />} /></FeatureGate>} />
      </Route>

      {/* Main application */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Page element={<Dashboard />} />} />
        <Route path="/pricing" element={<Page element={<Pricing />} />} />
        <Route path="/curriculum" element={<Page element={<Curriculum />} />} />
        <Route path="/curriculum/:moduleSlug" element={<ContentRouteGate kind="module" param="moduleSlug" index={moduleBySlug} title="This curriculum module is included with Pro" backTo="/curriculum"><Page element={<ModuleDetail />} /></ContentRouteGate>} />
        <Route path="/practice" element={<Page element={<PracticeHub />} />} />
        <Route path="/practice/exercise/:exerciseId" element={<ContentRouteGate kind="exercise" param="exerciseId" index={exerciseById} title="This exercise is included with Pro" backTo="/practice"><Page element={<ExercisePage />} /></ContentRouteGate>} />
        <Route path="/challenges" element={<Page element={<Challenges />} />} />
        <Route path="/challenges/:slug" element={<FeatureGate feature={FEATURE.CHALLENGES} title="Coding challenges are included with Pro" backTo="/challenges"><Page element={<ChallengeDetail />} /></FeatureGate>} />
        <Route path="/projects" element={<Page element={<Projects />} />} />
        <Route path="/projects/:slug" element={<FeatureGate feature={FEATURE.PROJECTS} title="Guided projects are included with Pro" backTo="/projects"><Page element={<ProjectDetail />} /></FeatureGate>} />
        <Route path="/playground" element={<Page element={<Playground />} />} />
        <Route path="/interview" element={<Page element={<InterviewPrep />} />} />
        <Route path="/interview/question/:questionId" element={<FeatureGate feature={FEATURE.INTERVIEW_PRO} title="Complete Interview Prep is included with Pro" backTo="/interview"><Page element={<InterviewQuestionPage />} /></FeatureGate>} />
        <Route path="/reference" element={<Page element={<Reference />} />} />
        <Route path="/reference/:slug" element={<ContentRouteGate kind="reference" param="slug" index={referenceBySlug} title="This reference section is included with Pro" backTo="/reference"><Page element={<ReferenceDetail />} /></ContentRouteGate>} />
        <Route path="/cheat-sheets" element={<Page element={<CheatSheets />} />} />
        <Route path="/cheat-sheets/:slug" element={<ContentRouteGate kind="cheatsheet" param="slug" index={cheatSheetBySlug} title="This cheat sheet is included with Pro" backTo="/cheat-sheets"><Page element={<CheatSheetDetail />} /></ContentRouteGate>} />
        <Route path="/profile" element={<Page element={<Profile />} />} />
        <Route path="/achievements" element={<Page element={<Achievements />} />} />
        <Route path="/my-learning" element={<Page element={<MyLearning />} />} />
        <Route path="/bookmarks" element={<Page element={<Bookmarks />} />} />
        <Route path="/search" element={<Page element={<SearchPage />} />} />
        <Route path="/settings" element={<Page element={<Settings />} />} />
      </Route>

      <Route path="*" element={<Page element={<NotFound />} />} />
    </Routes>
  );
}
