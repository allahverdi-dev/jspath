import { EmptyState, Button } from '../ui/index.jsx';
import { PREMIUM_STATUS } from '../../services/premiumContent.js';
import { useLocation } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';

/**
 * Why a piece of content did not open.
 *
 * A detail page used to report every failure as "not found", which is only true
 * for one of the reasons it can fail. Once the paid half of Pro content is
 * fetched from the server, a network problem or an expired session would have
 * read as missing content — and the reverse mistake, showing an upgrade wall for
 * something that merely failed to load, is the regression fixed during the QA
 * phase and must not come back.
 *
 * So each cause gets its own honest message and its own useful way forward.
 */
export function ContentLoadState({ error, kind = 'content', backTo = '/dashboard', backLabel, onRetry }) {
  const t = useT();
  const location = useLocation();
  // Carry where they were, so signing in returns them here rather than to the
  // dashboard. Encoded, and re-validated by /login before it is ever used.
  const signInTo = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
  const status = error?.premiumStatus;
  // `kind` stays a stable internal token; only its display form is translated.
  const kindLabel = t(`billing.kind${kind[0].toUpperCase()}${kind.slice(1)}`);
  const back = backLabel ?? t('errors.goBack');

  if (status === PREMIUM_STATUS.NOT_ENTITLED) {
    return (
      <EmptyState
        icon="lock"
        title={t('billing.notEntitledTitle', { kind: kindLabel })}
        message={t('billing.notEntitledBody')}
        action={<Button to="/pricing" icon="workspace_premium">{t('billing.viewProOptions')}</Button>}
      />
    );
  }

  if (status === PREMIUM_STATUS.UNAUTHENTICATED) {
    return (
      <EmptyState
        icon="login"
        title={t('auth.signInToOpen')}
        message={t('auth.signInToOpenBody')}
        action={<Button to={signInTo} icon="login">{t('auth.logIn')}</Button>}
      />
    );
  }

  if (status === PREMIUM_STATUS.UNAVAILABLE) {
    return (
      <EmptyState
        icon="cloud_off"
        title={t('errors.unavailableTitle')}
        message={t('errors.unavailableBody')}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {onRetry && <Button onClick={onRetry} icon="refresh">{t('common.retry')}</Button>}
            <Button to={backTo} variant="secondary">{back}</Button>
          </div>
        }
      />
    );
  }

  // Genuinely absent, or an unexpected failure: say so plainly, never upsell.
  //
  // Callers pass a translation key rather than a sentence. A raw `error.message`
  // is an untranslated technical string ("Failed to fetch dynamically imported
  // module") that told the learner nothing and would be the only English left on
  // an otherwise translated page, so it is not rendered.
  return (
    <EmptyState
      icon="search_off"
      title={t('errors.contentNotFound', { kind: kindLabel })}
      message={error?.messageKey ? t(error.messageKey) : t('errors.contentDoesNotExist', { kind: kindLabel })}
      action={<Button to={backTo} variant="secondary">{back}</Button>}
    />
  );
}
