import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Dialog, Icon, Input, SectionLabel } from '../ui/index.jsx';
import { useAuth } from '../../state/AuthProvider.jsx';
import { useEntitlements } from '../../state/EntitlementProvider.jsx';
import { useUserState } from '../../state/UserStateProvider.jsx';
import { useToast } from '../../state/ToastProvider.jsx';
import { useT } from '../../i18n/index.jsx';
import { GUMROAD_MANAGE_URL } from '../../features/billing/plans.js';
import { DELETE_ACCOUNT_RESULT } from '../../services/supabase.js';
import { accountDeletionReadiness, DELETION_STATE } from '../../features/billing/accountDeletion.js';

/**
 * Danger zone — delete this account.
 *
 * Only rendered for a signed-in learner: a guest has no account to delete, and
 * their data is already entirely under their own control through the reset above.
 *
 * The readiness check here is for explanation only. It decides which of three
 * things the learner is told — go cancel at Gumroad first, you are giving up
 * paid time you have left, or nothing is in the way — while the Edge Function
 * re-runs the same rules against rows the browser cannot influence and is the
 * only thing that actually authorises anything.
 */
export function DeleteAccountSection() {
  const t = useT();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, deleteAccount } = useAuth();
  const { subscriptions } = useEntitlements();
  const { actions } = useUserState();

  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) return null;

  const readiness = accountDeletionReadiness({ subscriptions: subscriptions ?? [] });
  const confirmWord = t('settings.deleteConfirmWord');
  const confirmed = typed.trim().toLocaleUpperCase() === confirmWord.toLocaleUpperCase();

  const close = () => {
    if (busy) return;
    setOpen(false);
    setTyped('');
    setError(null);
  };

  const submit = async () => {
    if (!confirmed || busy || readiness.blocked) return;
    setBusy(true);
    setError(null);

    // The learner has just read what they are giving up, so the request may say
    // so. The server still refuses if it disagrees about the subscription state.
    const outcome = await deleteAccount(
      { acknowledgeForfeit: readiness.requiresAcknowledgement },
      () => actions.resetProgress(),
    );

    if (outcome.result === DELETE_ACCOUNT_RESULT.OK) {
      setOpen(false);
      toast.show({ tone: 'info', titleKey: 'settings.deleteDone' });
      navigate('/', { replace: true });
      return;
    }

    // Nothing local has been touched: the error stays in the open dialog and the
    // learner keeps a working, signed-in app.
    setBusy(false);
    setError(ERROR_KEY[outcome.result] ?? 'settings.deleteErrorUnknown');
  };

  return (
    <>
      <Card className="border-error/40 p-5">
        <SectionLabel className="mb-3">{t('settings.dangerZone')}</SectionLabel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 basis-64">
            <p className="font-heading text-title-md text-on-surface">{t('settings.deleteAccount')}</p>
            <p className="mt-1 font-body-sm text-on-surface-variant">{t('settings.deleteAccountHint')}</p>
          </div>
          <Button variant="danger" size="sm" icon="person_remove" onClick={() => setOpen(true)}>
            {t('settings.deleteAccount')}
          </Button>
        </div>
      </Card>

      <Dialog
        open={open}
        onClose={close}
        title={t('settings.deleteAccount')}
        description={t('settings.deleteDialogLead')}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={close} disabled={busy}>{t('common.cancel')}</Button>
            {readiness.blocked ? (
              <Button href={GUMROAD_MANAGE_URL} target="_blank" rel="noreferrer" variant="secondary" icon="open_in_new">
                {t('billing.managePlan')}
              </Button>
            ) : (
              <Button variant="danger" onClick={submit} disabled={!confirmed || busy} icon="delete_forever">
                {busy ? t('settings.deleting') : t('settings.deletePermanently')}
              </Button>
            )}
          </div>
        )}
      >
        {/* A subscription that can still charge them stops everything else. */}
        {readiness.state === DELETION_STATE.ACTIVE_SUBSCRIPTION && (
          <Notice icon="credit_card" title={t('settings.deleteBlockedTitle')}>
            {t('settings.deleteBlockedBody')}
          </Notice>
        )}
        {readiness.state === DELETION_STATE.UNKNOWN_STATE && (
          <Notice icon="help" title={t('settings.deleteBlockedTitle')}>
            {t('settings.deleteUnknownStateBody')}
          </Notice>
        )}
        {readiness.state === DELETION_STATE.FORFEITS_ACCESS && (
          <Notice icon="schedule" title={t('settings.deleteForfeitTitle')}>
            {t('settings.deleteForfeitBody')}
          </Notice>
        )}

        {!readiness.blocked && (
          <>
            <p className="font-body-md text-on-surface">{t('settings.deleteWhatHappens')}</p>
            <ul className="mt-3 space-y-2 pl-1">
              {[
                'settings.deleteEffectPermanent',
                'settings.deleteEffectProgress',
                'settings.deleteEffectLocal',
                'settings.deleteEffectProviders',
                'settings.deleteEffectGumroad',
              ].map((key) => (
                <li key={key} className="flex min-w-0 gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="chevron_right" size={16} className="mt-0.5 shrink-0 text-on-surface-variant/60" />
                  <span className="min-w-0 flex-1">{t(key)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <Input
                // `useModalFocus` honours this, so a destructive dialog opens
                // with the caret in the field the learner has to fill in rather
                // than on the panel behind it.
                data-autofocus=""
                label={t('settings.deleteTypeToConfirm', { word: confirmWord })}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={busy}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded border border-error/30 bg-error/5 px-3 py-2 font-body-sm text-on-surface">
            {t(error)}
          </p>
        )}
      </Dialog>
    </>
  );
}

/** Distinct server refusals the learner can act on differently. */
const ERROR_KEY = {
  [DELETE_ACCOUNT_RESULT.UNAUTHENTICATED]: 'settings.deleteErrorSignedOut',
  [DELETE_ACCOUNT_RESULT.ACTIVE_SUBSCRIPTION]: 'settings.deleteBlockedBody',
  [DELETE_ACCOUNT_RESULT.UNKNOWN_SUBSCRIPTION_STATE]: 'settings.deleteUnknownStateBody',
  [DELETE_ACCOUNT_RESULT.FORFEIT_NOT_ACKNOWLEDGED]: 'settings.deleteForfeitBody',
  [DELETE_ACCOUNT_RESULT.FAILED]: 'settings.deleteErrorFailed',
  [DELETE_ACCOUNT_RESULT.UNAVAILABLE]: 'settings.deleteErrorUnavailable',
};

/** Tailwind scans for literal class names, so these are not built at runtime. */
function Notice({ icon, title, children }) {
  return (
    <div className="mb-5 flex flex-wrap gap-3 rounded border border-warning/30 bg-warning/5 px-3 py-2.5">
      <Icon name={icon} size={17} className="mt-0.5 shrink-0 text-warning" />
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-heading text-title-md text-on-surface">{title}</p>
        <p className="mt-1 font-body-sm text-on-surface-variant">{children}</p>
      </div>
    </div>
  );
}
