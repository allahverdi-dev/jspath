import { useState } from 'react';
import { Card, Button, Icon, Toggle, Select, SectionLabel, Dialog, cx } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useTheme, THEMES } from '../state/ThemeProvider.jsx';
import { useToast } from '../state/ToastProvider.jsx';
import { isPersistent, usageBytes } from '../services/storage.js';
import { useAuth } from '../state/AuthProvider.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { GUMROAD_MANAGE_URL } from '../features/billing/plans.js';

export default function Settings() {
  const { state, actions } = useUserState();
  const { preference, setTheme } = useTheme();
  const toast = useToast();
  const { isAuthenticated, isConfigured } = useAuth();
  const { plan, isPro, subscription, billingConfigured } = useEntitlements();
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
    toast.show({ tone: 'success', title: 'Progress exported' });
  };

  const importProgress = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        actions.importState(JSON.parse(String(reader.result)));
        toast.show({ tone: 'success', title: 'Progress imported' });
      } catch {
        toast.show({ tone: 'error', title: 'Could not import', message: 'That file is not valid JSPath progress data.' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">Settings</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">Every control here does something.</p>

      <div className="mt-8 space-y-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Appearance</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-3">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cx(
                  'flex items-center justify-center gap-2 rounded border px-3 py-2.5 font-body-sm capitalize transition-colors',
                  preference === t ? 'border-primary bg-primary/10 text-primary-ink' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
                )}
                aria-pressed={preference === t}
              >
                <Icon name={t === 'dark' ? 'dark_mode' : t === 'light' ? 'light_mode' : 'contrast'} size={17} />
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 divide-y divide-[rgb(var(--c-outline-variant))]">
            <Toggle
              label="Reduce motion"
              description="Removes animations and transitions across the app."
              checked={Boolean(s.reduceMotion)}
              onChange={(v) => set({ reduceMotion: v })}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select label="Text size" value={s.fontScale} onChange={(e) => set({ fontScale: Number(e.target.value) })}>
              <option value={0.9}>Small</option>
              <option value={1}>Default</option>
              <option value={1.1}>Large</option>
              <option value={1.25}>Extra large</option>
            </Select>
            <Select label="Editor font size" value={s.editorFontSize} onChange={(e) => set({ editorFontSize: Number(e.target.value) })}>
              {[12, 13, 14, 15, 16, 18].map((n) => <option key={n} value={n}>{n}px</option>)}
            </Select>
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-4">Learning</SectionLabel>
          <Select
            label="Daily goal"
            hint="Used to size your daily practice sessions."
            value={s.dailyGoalMinutes}
            onChange={(e) => set({ dailyGoalMinutes: Number(e.target.value) })}
          >
            {[10, 20, 30, 45, 60].map((n) => <option key={n} value={n}>{n} minutes a day</option>)}
          </Select>
          <div className="mt-2 divide-y divide-[rgb(var(--c-outline-variant))]">
            <Toggle
              label="Run examples automatically"
              description="Execute runnable lesson examples as soon as they appear."
              checked={Boolean(s.autoRunExamples)}
              onChange={(v) => set({ autoRunExamples: v })}
            />
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-3">Plan & billing</SectionLabel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-heading text-title-md capitalize text-on-surface">{plan} plan</p>
              <p className="mt-1 font-body-sm text-on-surface-variant">
                {!isAuthenticated
                  ? 'Sign in before purchasing Pro so Gumroad can be linked securely to your account.'
                  : subscription
                    ? `${subscription.status.replace('_', ' ')}${subscription.billing_interval ? ` · ${subscription.billing_interval}` : ''}`
                    : billingConfigured
                      ? 'Your account currently has Free access.'
                      : 'Billing is unavailable in this deployment; learning continues normally.'}
              </p>
              {subscription?.current_period_end && (
                <p className="mt-1 font-body-sm text-on-surface-variant">
                  {subscription.status === 'canceling' ? 'Access until' : 'Renewal/access review'}:{' '}
                  {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(subscription.current_period_end))}
                </p>
              )}
            </div>
            {isPro ? (
              <Button href={GUMROAD_MANAGE_URL} target="_blank" rel="noreferrer" variant="secondary" size="sm">Manage subscription</Button>
            ) : (
              <Button to="/pricing" size="sm" icon="upgrade">View Pro</Button>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-3">Your data</SectionLabel>
          <p className="mb-4 font-body-sm text-on-surface-variant">
            {isPersistent()
              ? `Progress is saved in this browser (about ${Math.round(usageBytes() / 1024)} KB).`
              : 'Browser storage is unavailable, so progress is kept in memory only for this session.'}
            {isAuthenticated
              ? ' It also syncs to your account.'
              : isConfigured
                ? ' Create an account to sync across devices.'
                : ' Accounts are not configured for this deployment.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={exportProgress} icon="download">Export progress</Button>
            <label className="inline-flex">
              <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-outline-variant px-3 font-body-sm text-on-surface transition hover:bg-surface-container-high">
                <Icon name="upload" size={17} /> Import progress
                <input type="file" accept="application/json" onChange={importProgress} className="sr-only" />
              </span>
            </label>
            <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)} icon="delete_forever">Reset everything</Button>
          </div>
        </Card>
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all progress?"
        description="This permanently deletes every lesson, exercise, quiz, challenge and project record stored in this browser."
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.resetProgress();
                setConfirmReset(false);
                toast.show({ tone: 'info', title: 'Progress reset' });
              }}
            >
              Yes, delete everything
            </Button>
          </div>
        }
      >
        <p className="font-body-md text-on-surface-variant">
          This cannot be undone. If you might want it back, export your progress first and close this
          dialog.
        </p>
      </Dialog>
    </div>
  );
}
