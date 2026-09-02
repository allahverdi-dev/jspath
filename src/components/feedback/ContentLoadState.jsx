import { EmptyState, Button } from '../ui/index.jsx';
import { PREMIUM_STATUS } from '../../services/premiumContent.js';

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
export function ContentLoadState({ error, kind = 'content', backTo = '/dashboard', backLabel = 'Go back', onRetry }) {
  const status = error?.premiumStatus;

  if (status === PREMIUM_STATUS.NOT_ENTITLED) {
    return (
      <EmptyState
        icon="lock"
        title={`This ${kind} is included with Pro`}
        message="Your account does not currently have Pro access. Everything you have already done stays exactly as it is."
        action={<Button to="/pricing" icon="workspace_premium">View Pro options</Button>}
      />
    );
  }

  if (status === PREMIUM_STATUS.UNAUTHENTICATED) {
    return (
      <EmptyState
        icon="login"
        title="Sign in to open this"
        message="Pro content is verified with your account. Signing in restores access — your progress is kept either way."
        action={<Button to="/login" icon="login">Sign in</Button>}
      />
    );
  }

  if (status === PREMIUM_STATUS.UNAVAILABLE) {
    return (
      <EmptyState
        icon="cloud_off"
        title="Could not load that right now"
        message="The content service did not respond. This is usually temporary — nothing about your progress or your plan has changed."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {onRetry && <Button onClick={onRetry} icon="refresh">Try again</Button>}
            <Button to={backTo} variant="secondary">{backLabel}</Button>
          </div>
        }
      />
    );
  }

  // Genuinely absent, or an unexpected failure: say so plainly, never upsell.
  return (
    <EmptyState
      icon="search_off"
      title={`${kind[0].toUpperCase()}${kind.slice(1)} not found`}
      message={error?.message ?? `That ${kind} does not exist.`}
      action={<Button to={backTo} variant="secondary">{backLabel}</Button>}
    />
  );
}
