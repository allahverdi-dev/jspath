import { useState } from 'react';
import { Button, Icon } from '../ui/index.jsx';
import { useAuth } from '../../state/AuthProvider.jsx';
import { useEntitlements } from '../../state/EntitlementProvider.jsx';
import { useT } from '../../i18n/index.jsx';

/**
 * Restore a Pro purchase that the account does not know about.
 *
 * The gap this closes: `EntitlementProvider` reconciles when an *existing* row
 * looks stale, so `subscriptions.some(needsReconciliation)` is false for an
 * account with no rows at all. A learner who deleted their JSPath account and
 * signed up again therefore had a valid Gumroad subscription and no way to ask
 * about it — the only trigger left was the internal `?purchase=success` return
 * from checkout, which is not a thing anyone can be told to visit.
 *
 * This is deliberately an **explicit** action rather than an automatic call.
 * Reconciling on every Pricing visit would hit Gumroad once per session for
 * every free learner who never bought anything — almost always to learn nothing
 * — and would make entitlement depend on which page you happened to open. An
 * action the learner takes is predictable, testable, and costs one API call
 * exactly when there is reason to think a purchase exists.
 *
 * Nothing here decides entitlement. `reconcile-gumroad` verifies the session,
 * requires a confirmed email, searches Gumroad by *that* address, checks the
 * product allow-list and writes the result itself. The browser sends no email,
 * no user id and no subscription data — there is nothing in the request to forge.
 */

const STATE = Object.freeze({
  IDLE: 'idle',
  CHECKING: 'checking',
  RESTORED: 'restored',
  NOT_FOUND: 'not_found',
  FAILED: 'failed',
});

export function RestorePurchase({ className = '', variant = 'secondary' }) {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const { isPro, billingConfigured, reconcile } = useEntitlements();
  const [state, setState] = useState(STATE.IDLE);

  // Nothing to restore for a guest, for an account that already has Pro, or on
  // a deployment with no billing configured at all.
  if (!isAuthenticated || isPro || !billingConfigured) return null;

  const run = async () => {
    if (state === STATE.CHECKING) return;
    setState(STATE.CHECKING);

    // `reconcile()` de-duplicates concurrent calls per user and refreshes the
    // subscription rows before resolving, so `isPro` is current on the next render.
    const { data, error } = await reconcile();

    if (error) { setState(STATE.FAILED); return; }
    // The function answers `{ ok, matched }`. "No purchase" is an answer, not a
    // fault, and must not be dressed up as an error.
    if (data?.ok !== true) { setState(STATE.FAILED); return; }
    setState(data.matched ? STATE.RESTORED : STATE.NOT_FOUND);
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          variant={variant}
          size="sm"
          icon="restore"
          onClick={run}
          disabled={state === STATE.CHECKING}
        >
          {state === STATE.CHECKING ? t('billing.restoreChecking') : t('billing.restorePurchase')}
        </Button>
        <p className="min-w-0 flex-1 basis-56 font-body-sm text-on-surface-variant">
          {t('billing.restoreHint')}
        </p>
      </div>

      {state !== STATE.IDLE && state !== STATE.CHECKING && (
        <p
          role="status"
          className={`mt-3 flex flex-wrap items-start gap-2 rounded border px-3 py-2 font-body-sm ${
            state === STATE.RESTORED
              ? 'border-success/30 bg-success/5'
              : state === STATE.FAILED
                ? 'border-error/30 bg-error/5'
                : 'border-outline-variant'
          }`}
        >
          <Icon
            name={state === STATE.RESTORED ? 'check_circle' : state === STATE.FAILED ? 'error' : 'info'}
            size={16}
            className="mt-0.5 shrink-0"
          />
          <span className="min-w-0 flex-1 text-on-surface-variant">{t(MESSAGE_KEY[state])}</span>
        </p>
      )}
    </div>
  );
}

const MESSAGE_KEY = {
  [STATE.RESTORED]: 'billing.restoreRestored',
  [STATE.NOT_FOUND]: 'billing.restoreNotFound',
  [STATE.FAILED]: 'billing.restoreFailed',
};

export { STATE as RESTORE_STATE };
