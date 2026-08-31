import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Icon, ProgressBar, cx } from '../components/ui/index.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';

const LEVELS = [
  { id: 'zero', title: 'Complete beginner', description: 'I have never written a line of code.', icon: 'egg', start: 'Module 00 — Orientation' },
  { id: 'basics', title: 'I know the basics', description: 'Variables, conditions and loops make sense to me.', icon: 'school', start: 'Module 08 — Functions' },
  { id: 'intermediate', title: 'Comfortable with JavaScript', description: 'I build things, but the deeper mechanics are hazy.', icon: 'code', start: 'Module 29 — this, prototypes, closures' },
  { id: 'experienced', title: 'Experienced developer', description: 'I want depth, edge cases and interview readiness.', icon: 'workspace_premium', start: 'Take the placement check' },
];

export default function OnboardingLevel() {
  const { state, actions } = useUserState();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(state.profile.level);

  const next = () => {
    actions.updateProfile({ level: selected });
    navigate('/onboarding/goals');
  };

  return (
    <div className="safe-page safe-top safe-bottom min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="flex items-center px-4 py-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <Link to="/dashboard" className="ml-auto font-body-sm text-on-surface-variant transition hover:text-on-surface">Skip</Link>
      </header>
      <ProgressBar value={0.33} height={2} label="Onboarding progress" />

      <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">Step 1 of 3</p>
        <h1 className="mt-2 font-display text-headline-md text-on-surface">Where are you starting from?</h1>
        <p className="mt-2 font-body-md text-on-surface-variant">
          This only sets a suggested starting point. Nothing is ever locked — you can open any module
          at any time.
        </p>

        <div className="mt-8 space-y-3">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setSelected(level.id)}
              aria-pressed={selected === level.id}
              className={cx(
                'flex w-full items-start gap-4 rounded-lg border p-5 text-left transition-colors',
                selected === level.id ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low hover:bg-surface-container',
              )}
            >
              <Icon name={level.icon} size={24} className={selected === level.id ? 'text-primary-ink' : 'text-on-surface-variant'} />
              <span className="min-w-0 flex-1">
                <span className="font-body-md font-semibold text-on-surface">{level.title}</span>
                <span className="mt-1 block font-body-sm text-on-surface-variant">{level.description}</span>
                <span className="mt-2 block font-mono text-code-sm text-on-surface-variant">Suggested start · {level.start}</span>
              </span>
              {selected === level.id && <Icon name="check_circle" size={20} className="text-primary-ink" filled />}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Button onClick={next} disabled={!selected} size="lg" iconRight="arrow_forward">Continue</Button>
          {selected === 'experienced' && (
            <Button to="/onboarding/placement" variant="secondary" size="lg">Take the placement check</Button>
          )}
        </div>
      </main>
    </div>
  );
}
