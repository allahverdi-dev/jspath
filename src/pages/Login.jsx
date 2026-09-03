import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Icon } from '../components/ui/index.jsx';
import { OAuthButtons } from '../components/auth/OAuthButtons.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useT } from '../i18n/index.jsx';
import { safeApplicationPath } from '../features/billing/plans.js';

export default function Login() {
  const t = useT();
  const { loading, isAuthenticated, isConfigured } = useAuth();
  const [params] = useSearchParams();

  /*
   * Signing in from a gated page should return there, not dump the learner on the
   * dashboard to find their way back. `safeApplicationPath` is the same guard the
   * upgrade flow uses: it keeps same-origin application paths and rejects
   * everything else — absolute URLs, protocol-relative "//evil.test" — so a
   * crafted `?next=` cannot turn sign-in into an open redirect. Opening /login
   * directly carries no destination and falls back to the dashboard.
   */
  const nextPath = safeApplicationPath(params.get('next'), '/dashboard');

  if (!loading && isAuthenticated) return <Navigate to={nextPath} replace />;

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
          <OAuthButtons redirectPath={nextPath} guestPath={nextPath} />
        </>
      )}
    </AuthLayout>
  );
}
