import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Icon, ProgressBar, cx } from '../components/ui/index.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useT } from '../i18n/index.jsx';

/* The ids are the stored profile level and never change; the copy is per-language. */
const LEVELS = [
  { id: 'zero', icon: 'egg' },
  { id: 'basics', icon: 'school' },
  { id: 'intermediate', icon: 'code' },
  { id: 'experienced', icon: 'workspace_premium' },
];

export default function OnboardingLevel() {
  const { state, actions } = useUserState();
  const t = useT();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(state.profile.level);

  const next = () => {
    actions.updateProfile({ level: selected });
    navigate('/onboarding/goals');
  };

  return (
    <div className="safe-page safe-top safe-bottom min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t('nav.skipToContent')}</a>
      <header className="flex items-center px-4 py-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <Link to="/dashboard" className="ml-auto font-body-sm text-on-surface-variant transition hover:text-on-surface">{t('common.skip')}</Link>
      </header>
      <ProgressBar value={0.33} height={2} label={t('onboarding.progress')} />

      <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">{t('onboarding.step', { current: 1, total: 3 })}</p>
        <h1 className="mt-2 font-display text-headline-md text-on-surface">{t('onboarding.levelTitle')}</h1>
        <p className="mt-2 font-body-md text-on-surface-variant">
          {t('onboarding.levelSubtitle')}
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
                <span className="font-body-md font-semibold text-on-surface">{t('onboarding.level.' + level.id + '.title')}</span>
                <span className="mt-1 block font-body-sm text-on-surface-variant">{t('onboarding.level.' + level.id + '.description')}</span>
                <span className="mt-2 block font-mono text-code-sm text-on-surface-variant">
                  {t('onboarding.suggestedStart')} · {t('onboarding.level.' + level.id + '.start')}
                </span>
              </span>
              {selected === level.id && <Icon name="check_circle" size={20} className="text-primary-ink" filled />}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Button onClick={next} disabled={!selected} size="lg" iconRight="arrow_forward">{t('common.continue')}</Button>
          {selected === 'experienced' && (
            <Button to="/onboarding/placement" variant="secondary" size="lg">{t('onboarding.takePlacementCheck')}</Button>
          )}
        </div>
      </main>
    </div>
  );
}
