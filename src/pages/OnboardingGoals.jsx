import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Icon, ProgressBar, cx } from '../components/ui/index.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useT } from '../i18n/index.jsx';

/* The ids are stored on the profile and drive recommendations; only labels differ. */
const GOALS = [
  { id: 'job', icon: 'work' },
  { id: 'interview', icon: 'record_voice_over' },
  { id: 'framework', icon: 'widgets' },
  { id: 'fundamentals', icon: 'foundation' },
  { id: 'projects', icon: 'folder_special' },
  { id: 'curiosity', icon: 'psychology' },
];

const TIMES = [10, 20, 30, 60];

export default function OnboardingGoals() {
  const { state, actions } = useUserState();
  const t = useT();
  const navigate = useNavigate();
  const [goals, setGoals] = useState(state.profile.goals ?? []);
  const [minutes, setMinutes] = useState(state.profile.dailyMinutes ?? 20);

  const toggle = (id) => setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const finish = () => {
    actions.updateProfile({ goals, dailyMinutes: minutes, onboarded: true });
    actions.updateSettings({ dailyGoalMinutes: minutes });
    navigate('/dashboard');
  };

  return (
    <div className="safe-page safe-top safe-bottom min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t('nav.skipToContent')}</a>
      <header className="flex items-center px-4 py-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <Link to="/dashboard" className="ml-auto font-body-sm text-on-surface-variant transition hover:text-on-surface">{t('common.skip')}</Link>
      </header>
      <ProgressBar value={0.66} height={2} label={t('onboarding.progress')} />

      <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">{t('onboarding.step', { current: 2, total: 3 })}</p>
        <h1 className="mt-2 font-display text-headline-md text-on-surface">{t('onboarding.goalsTitle')}</h1>
        <p className="mt-2 font-body-md text-on-surface-variant">{t('onboarding.goalsSubtitle')}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggle(goal.id)}
              aria-pressed={goals.includes(goal.id)}
              className={cx(
                'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                goals.includes(goal.id) ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low hover:bg-surface-container',
              )}
            >
              <Icon name={goal.icon} size={20} className={goals.includes(goal.id) ? 'text-primary-ink' : 'text-on-surface-variant'} />
              <span className="min-w-0 flex-1 font-body-sm text-on-surface">{t('onboarding.goal.' + goal.id)}</span>
              {goals.includes(goal.id) && <Icon name="check" size={17} className="text-primary-ink" />}
            </button>
          ))}
        </div>

        <h2 className="mt-10 font-heading text-title-md text-on-surface">{t('onboarding.timeTitle')}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIMES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMinutes(value)}
              aria-pressed={minutes === value}
              className={cx(
                'rounded-lg border py-3 text-center transition-colors',
                minutes === value ? 'border-primary bg-primary/5 text-primary-ink' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
              )}
            >
              <span className="block font-heading text-title-md">{value}</span>
              <span className="font-body-sm">{t('onboarding.minPerDay')}</span>
            </button>
          ))}
        </div>

        <Button onClick={finish} size="lg" className="mt-10" iconRight="arrow_forward">{t('onboarding.startLearning')}</Button>
      </main>
    </div>
  );
}
