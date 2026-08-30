import { Link, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Icon } from '../components/ui/index.jsx';
import { OAuthButtons } from '../components/auth/OAuthButtons.jsx';
import { useAuth } from '../state/AuthProvider.jsx';

export default function Login() {
  const { loading, isAuthenticated, isConfigured } = useAuth();

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <AuthLayout
      title="Log in"
      subtitle="Pick up where you left off."
      footer={<>New here? <Link to="/signup" className="text-primary-ink underline underline-offset-2">Create an account</Link></>}
    >
      {loading ? (
        <p className="py-4 text-center font-body-sm text-on-surface-variant" role="status">
          Checking your account…
        </p>
      ) : (
        <>
          {!isConfigured && (
            <div className="mb-5 rounded border border-info/30 bg-info/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
              <Icon name="info" size={15} className="mr-1.5 inline text-info" />
              Accounts are not configured for this deployment. You can{' '}
              <Link to="/dashboard" className="text-primary-ink underline underline-offset-2">continue as a guest</Link>{' '}
              — every lesson, exercise and challenge works, saved in this browser.
            </div>
          )}
          <OAuthButtons redirectPath="/dashboard" guestPath="/dashboard" />
        </>
      )}
    </AuthLayout>
  );
}
