import { Link, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Icon } from '../components/ui/index.jsx';
import { OAuthButtons } from '../components/auth/OAuthButtons.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useT } from '../i18n/index.jsx';

export default function Login() {
  const t = useT();
  const { loading, isAuthenticated, isConfigured } = useAuth();

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <AuthLayout
      title={t('auth.logInTitle')}
      subtitle={t('auth.logInSubtitle')}
      footer={(
        <>
          {t('auth.newHere')}{' '}
          <Link to="/signup" className="text-primary-ink underline underline-offset-2">
            {t('auth.createAnAccount')}
          </Link>
        </>
      )}
    >
      {loading ? (
        <p className="py-4 text-center font-body-sm text-on-surface-variant" role="status">
          {t('auth.checkingAccount')}
        </p>
      ) : (
        <>
          {!isConfigured && (
            <div className="mb-5 rounded border border-info/30 bg-info/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
              <Icon name="info" size={15} className="mr-1.5 inline text-info" />
              {t('auth.guestNoticeUnconfigured')}
            </div>
          )}
          <OAuthButtons redirectPath="/dashboard" guestPath="/dashboard" />
        </>
      )}
    </AuthLayout>
  );
}
