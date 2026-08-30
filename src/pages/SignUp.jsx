import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Icon } from '../components/ui/index.jsx';
import { OAuthButtons } from '../components/auth/OAuthButtons.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { safeApplicationPath } from '../features/billing/plans.js';

export default function SignUp() {
  const { loading, isAuthenticated, isConfigured } = useAuth();
  const { state } = useUserState();
  const [params] = useSearchParams();
  const completed = Object.values(state.lessons).filter((lesson) => lesson.completedAt).length;
  const requestedNext = params.get('next');
  const nextPath = safeApplicationPath(requestedNext, '/onboarding/level');

  if (!loading && isAuthenticated) return <Navigate to={nextPath} replace />;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free, and it syncs your progress across devices."
      footer={<>Already have an account? <Link to="/login" className="text-primary-ink underline underline-offset-2">Log in</Link></>}
    >
      {loading ? (
        <p className="py-4 text-center font-body-sm text-on-surface-variant" role="status">
          Checking your account…
        </p>
      ) : (
        <>
          {completed > 0 && (
            <div className="mb-5 rounded border border-success/30 bg-success/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
              <Icon name="check_circle" size={15} className="mr-1.5 inline text-success" />
              The {completed} lesson{completed === 1 ? '' : 's'} you have already completed will be merged
              into your account.
            </div>
          )}

          {!isConfigured && (
            <div className="mb-5 rounded border border-info/30 bg-info/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
              <Icon name="info" size={15} className="mr-1.5 inline text-info" />
              Accounts are not configured for this deployment.{' '}
              <Link to="/onboarding/level" className="text-primary-ink underline underline-offset-2">Start learning as a guest</Link>{' '}
              — nothing is gated behind an account.
            </div>
          )}

          <OAuthButtons redirectPath={nextPath} guestPath="/onboarding/level" />
        </>
      )}
    </AuthLayout>
  );
}
