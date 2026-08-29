import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, FocusLayout } from '../layouts/AppShell.jsx';
import { RouteError } from '../components/feedback/RouteError.jsx';
import { PageSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary.jsx';

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
        <Route path="/learn/:moduleSlug/:lessonSlug" element={<Page element={<Lesson />} />} />
        <Route path="/interview/session" element={<Page element={<InterviewSession />} />} />
        <Route path="/practice/session" element={<Page element={<PracticeSession />} />} />
      </Route>

      {/* Main application */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Page element={<Dashboard />} />} />
        <Route path="/curriculum" element={<Page element={<Curriculum />} />} />
        <Route path="/curriculum/:moduleSlug" element={<Page element={<ModuleDetail />} />} />
        <Route path="/practice" element={<Page element={<PracticeHub />} />} />
        <Route path="/practice/exercise/:exerciseId" element={<Page element={<ExercisePage />} />} />
        <Route path="/challenges" element={<Page element={<Challenges />} />} />
        <Route path="/challenges/:slug" element={<Page element={<ChallengeDetail />} />} />
        <Route path="/projects" element={<Page element={<Projects />} />} />
        <Route path="/projects/:slug" element={<Page element={<ProjectDetail />} />} />
        <Route path="/playground" element={<Page element={<Playground />} />} />
        <Route path="/interview" element={<Page element={<InterviewPrep />} />} />
        <Route path="/interview/question/:questionId" element={<Page element={<InterviewQuestionPage />} />} />
        <Route path="/reference" element={<Page element={<Reference />} />} />
        <Route path="/reference/:slug" element={<Page element={<ReferenceDetail />} />} />
        <Route path="/cheat-sheets" element={<Page element={<CheatSheets />} />} />
        <Route path="/cheat-sheets/:slug" element={<Page element={<CheatSheetDetail />} />} />
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
