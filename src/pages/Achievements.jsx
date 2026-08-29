import { useMemo } from 'react';
import { Card, Icon, Badge, ProgressBar, cx } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { evaluateAchievements } from '../features/achievements/achievements.js';
import { contentIndex } from '../content/registry.js';

const TIER_STYLE = {
  bronze: 'text-[#CD7F32]',
  silver: 'text-on-surface-variant',
  gold: 'text-primary-ink',
  platinum: 'text-info',
};

export default function Achievements() {
  const { state } = useUserState();
  const achievements = useMemo(() => evaluateAchievements(state, contentIndex), [state]);
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">Achievements</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">
        {unlocked.length} of {achievements.length} unlocked. Every one is derived from what you have
        actually done — locked cards show real progress, not a mystery.
      </p>

      <ProgressBar value={achievements.length ? unlocked.length / achievements.length : 0} className="mt-6 max-w-md" height={6} label="Achievements unlocked" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <Card key={a.id} className={cx('p-5', a.unlocked ? 'border-primary/30 bg-primary/5' : '')}>
            <div className="flex items-start justify-between gap-3">
              <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-full border', a.unlocked ? 'border-primary/40 bg-primary/10' : 'border-outline-variant bg-surface-container')}>
                <Icon name={a.unlocked ? a.icon : 'lock'} size={20} filled={a.unlocked} className={a.unlocked ? TIER_STYLE[a.tier] : 'text-on-surface-variant'} />
              </div>
              <Badge tone={a.unlocked ? 'primary' : 'neutral'}>{a.tier}</Badge>
            </div>

            <h2 className="mt-4 font-heading text-title-md text-on-surface">{a.title}</h2>
            <p className="mt-1 font-body-sm text-on-surface-variant">{a.description}</p>

            {a.unlocked ? (
              <p className="mt-4 flex items-center gap-1.5 font-body-sm text-success">
                <Icon name="check_circle" size={14} filled />
                Unlocked{a.unlockedAt ? ` · ${new Date(a.unlockedAt).toLocaleDateString()}` : ''}
              </p>
            ) : (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between font-mono text-code-sm text-on-surface-variant">
                  <span>Progress</span>
                  <span>{a.current} / {a.target}</span>
                </div>
                <ProgressBar value={a.ratio} label={`${a.title} progress`} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
