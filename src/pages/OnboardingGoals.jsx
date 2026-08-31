import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Icon, ProgressBar, cx } from '../components/ui/index.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';

const GOALS = [
  { id: 'job', label: 'Get a developer job', icon: 'work' },
  { id: 'interview', label: 'Prepare for interviews', icon: 'record_voice_over' },
  { id: 'framework', label: 'Learn React or another framework next', icon: 'widgets' },
  { id: 'fundamentals', label: 'Fix gaps in my fundamentals', icon: 'foundation' },
  { id: 'projects', label: 'Build my own projects', icon: 'folder_special' },
  { id: 'curiosity', label: 'Understand how JavaScript really works', icon: 'psychology' },
];

const TIMES = [10, 20, 30, 60];

export default function OnboardingGoals() {
  const { state, actions } = useUserState();
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
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="flex items-center px-4 py-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <Link to="/dashboard" className="ml-auto font-body-sm text-on-surface-variant transition hover:text-on-surface">Skip</Link>
      </header>
      <ProgressBar value={0.66} height={2} label="Onboarding progress" />

      <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">Step 2 of 3</p>
        <h1 className="mt-2 font-display text-headline-md text-on-surface">What are you here for?</h1>
        <p className="mt-2 font-body-md text-on-surface-variant">Choose as many as apply. This shapes what gets recommended to you.</p>

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
              <span className="min-w-0 flex-1 font-body-sm text-on-surface">{goal.label}</span>
              {goals.includes(goal.id) && <Icon name="check" size={17} className="text-primary-ink" />}
            </button>
          ))}
        </div>

        <h2 className="mt-10 font-heading text-title-md text-on-surface">How much time can you give it?</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMinutes(t)}
              aria-pressed={minutes === t}
              className={cx(
                'rounded-lg border py-3 text-center transition-colors',
                minutes === t ? 'border-primary bg-primary/5 text-primary-ink' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
              )}
            >
              <span className="block font-heading text-title-md">{t}</span>
              <span className="font-body-sm">min/day</span>
            </button>
          ))}
        </div>

        <Button onClick={finish} size="lg" className="mt-10" iconRight="arrow_forward">Start learning</Button>
      </main>
    </div>
  );
}
