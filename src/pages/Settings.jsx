import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Toggle, Select, SectionLabel, Dialog, cx } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useTheme, THEMES } from '../state/ThemeProvider.jsx';
import { useToast } from '../state/ToastProvider.jsx';
import { isPersistent, usageBytes } from '../services/storage.js';
import { useAuth } from '../state/AuthProvider.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { ManageSubscriptionButton } from '../components/billing/ManageSubscriptionButton.jsx';
import { useI18n } from '../i18n/index.jsx';
import { DeleteAccountSection } from '../components/settings/DeleteAccountSection.jsx';
import { RestorePurchase } from '../components/billing/RestorePurchase.jsx';

/* Stable subscription tokens mapped to their wording. The tokens themselves are
   what entitlement compares, and are never translated. */
const STATUS_KEY = {
  active: 'billing.statusActive',
  canceling: 'billing.statusCanceling',
  canceled: 'billing.statusCanceled',
  expired: 'billing.statusExpired',
  paused: 'billing.statusPaused',
  refunded: 'billing.statusRefunded',
  revoked: 'billing.statusRevoked',
  past_due: 'billing.statusPastDue',
};

export default function Settings() {
  const { state, actions } = useUserState();
  const { preference, setTheme } = useTheme();
  const toast = useToast();
  const { isAuthenticated, isConfigured } = useAuth();
  const { isPro, subscription, billingConfigured } = useEntitlements();
  const { t, locale, setLocale, locales, localeNames, formatDate } = useI18n();
  const [confirmReset, setConfirmReset] = useState(false);

  const s = state.settings;
  const set = (patch) => actions.updateSettings(patch);

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jspath-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show({ tone: 'success', titleKey: 'settings.exported' });
  };

  const importProgress = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        actions.importState(JSON.parse(String(reader.result)));
        toast.show({ tone: 'success', titleKey: 'settings.imported' });
      } catch {
        toast.show({ tone: 'error', titleKey: 'settings.importFailed', messageKey: 'settings.importFailedBody' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">{t('settings.title')}</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">{t('settings.subtitle')}</p>

      <div className="mt-8 space-y-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">{t('settings.appearance')}</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-3">
            {THEMES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={cx(
                  'flex items-center justify-center gap-2 rounded border px-3 py-2.5 font-body-sm capitalize transition-colors',
                  preference === mode ? 'border-primary bg-primary/10 text-primary-ink' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
                )}
                aria-pressed={preference === mode}
              >
                <Icon name={mode === 'dark' ? 'dark_mode' : mode === 'light' ? 'light_mode' : 'contrast'} size={17} />
                {t(`settings.${mode}`)}
              </button>
            ))}
          </div>

          <div className="mt-4 divide-y divide-[rgb(var(--c-outline-variant))]">
            <Toggle
              label={t('settings.reduceMotion')}
              description={t('settings.reduceMotionHint')}
              checked={Boolean(s.reduceMotion)}
              onChange={(v) => set({ reduceMotion: v })}
            />
          </div>

          {/* Language sits with the other display preferences: it changes how the
              product reads, not what the learner is entitled to. */}
          <div className="mt-4">
            <Select
              label={t('settings.languageLabel')}
              hint={t('settings.languageHint')}
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
            >
              {locales.map((code) => (
                <option key={code} value={code}>{localeNames[code]}</option>
              ))}
            </Select>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select label={t('settings.textSize')} value={s.fontScale} onChange={(e) => set({ fontScale: Number(e.target.value) })}>
              <option value={0.9}>{t('settings.sizeSmall')}</option>
              <option value={1}>{t('settings.sizeDefault')}</option>
              <option value={1.1}>{t('settings.sizeLarge')}</option>
              <option value={1.25}>{t('settings.sizeExtraLarge')}</option>
            </Select>
            <Select label={t('settings.editorFontSize')} value={s.editorFontSize} onChange={(e) => set({ editorFontSize: Number(e.target.value) })}>
              {[12, 13, 14, 15, 16, 18].map((n) => <option key={n} value={n}>{n}px</option>)}
            </Select>
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-4">{t('settings.learning')}</SectionLabel>
          <Select
            label={t('settings.dailyGoal')}
            hint={t('settings.dailyGoalHint')}
            value={s.dailyGoalMinutes}
            onChange={(e) => set({ dailyGoalMinutes: Number(e.target.value) })}
          >
            {[10, 20, 30, 45, 60].map((n) => (
              <option key={n} value={n}>{t('settings.minutesADay', { count: n })}</option>
            ))}
          </Select>
          <div className="mt-2 divide-y divide-[rgb(var(--c-outline-variant))]">
            <Toggle
              label={t('settings.autoRun')}
              description={t('settings.autoRunHint')}
              checked={Boolean(s.autoRunExamples)}
              onChange={(v) => set({ autoRunExamples: v })}
            />
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-3">{t('billing.planAndBilling')}</SectionLabel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-heading text-title-md text-on-surface">
                {t('billing.planName', { plan: isPro ? t('common.pro') : t('common.free') })}
              </p>
              <p className="mt-1 font-body-sm text-on-surface-variant">
                {!isAuthenticated
                  ? t('billing.signInBeforePurchase')
                  : subscription
                    ? [
                      t(STATUS_KEY[subscription.status] ?? 'billing.statusActive'),
                      subscription.billing_interval
                        ? t('billing.interval.' + subscription.billing_interval)
                        : null,
                    ].filter(Boolean).join(' · ')
                    : billingConfigured
                      ? t('billing.freeAccessNotice')
                      : t('billing.billingUnavailable')}
              </p>
              {subscription?.current_period_end && (
                <p className="mt-1 font-body-sm text-on-surface-variant">
                  {subscription.status === 'canceling' ? t('billing.statusCanceling') : t('billing.statusActive')}:{' '}
                  {formatDate(subscription.current_period_end, { dateStyle: 'medium' })}
                </p>
              )}
            </div>
            {isPro ? (
              <ManageSubscriptionButton size="sm" />
            ) : (
              <Button to="/pricing" size="sm" icon="upgrade">{t('billing.viewPro')}</Button>
            )}
          </div>
          {/* A purchase made before this account existed can be claimed here. */}
          <RestorePurchase className="mt-4" />
          {/* Cancelling is done here; what it does and does not mean is there. */}
          <p className="mt-3 font-body-sm text-on-surface-variant">
            <Link to="/refund-policy" className="text-primary-ink underline underline-offset-2">
              {t('legal.refund')}
            </Link>
          </p>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-3">{t('settings.data')}</SectionLabel>
          <p className="mb-4 font-body-sm text-on-surface-variant">
            {isPersistent()
              ? t('settings.storageLocal', { kb: Math.round(usageBytes() / 1024) })
              : t('settings.storageMemory')}{' '}
            {isAuthenticated
              ? t('settings.syncsToAccount')
              : isConfigured
                ? t('settings.createAccountToSync')
                : t('auth.accountsUnavailable')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={exportProgress} icon="download">{t('settings.exportProgress')}</Button>
            <label className="inline-flex">
              <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-outline-variant px-3 font-body-sm text-on-surface transition hover:bg-surface-container-high">
                <Icon name="upload" size={17} /> {t('settings.importProgress')}
                <input type="file" accept="application/json" onChange={importProgress} className="sr-only" />
              </span>
            </label>
            <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)} icon="delete_forever">{t('settings.resetEverything')}</Button>
          </div>
        </Card>

        {/* Signed-in only: a guest has no account to delete. */}
        <DeleteAccountSection />
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t('settings.resetTitle')}
        description={t('settings.resetWarning')}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>{t('common.cancel')}</Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.resetProgress();
                setConfirmReset(false);
                toast.show({ tone: 'info', titleKey: 'settings.progressReset' });
              }}
            >
              {t('settings.resetConfirm')}
            </Button>
          </div>
        }
      >
        <p className="font-body-md text-on-surface-variant">
          {t('settings.resetBody')}
        </p>
      </Dialog>
    </div>
  );
}
