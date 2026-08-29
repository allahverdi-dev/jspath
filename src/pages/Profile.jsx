import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, ProgressBar, Stat, EmptyState } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { contentIndex } from '../content/registry.js';
import { overallMastery, rankFor } from '../features/mastery/masteryEngine.js';
import { curriculumProgress, exerciseStats, challengeStats, projectStats } from '../features/progress/progressEngine.js';
import { evaluateAchievements } from '../features/achievements/achievements.js';

export default function Profile() {
  const { state, xp, streak, isGuest, syncStatus } = useUserState();
  const { displayName, user, signOut, isConfigured } = useAuth();

  const mastery = useMemo(() => overallMastery(state, contentIndex.topics, contentIndex), [state]);
  const progress = useMemo(() => curriculumProgress(state, contentIndex.modules), [state]);
  const exStats = useMemo(() => exerciseStats(state), [state]);
  const chStats = useMemo(() => challengeStats(state), [state]);
  const prStats = useMemo(() => projectStats(state), [state]);
  const achievements = useMemo(() => evaluateAchievements(state, contentIndex), [state]);
  const unlocked = achievements.filter((a) => a.unlocked);

  const name = displayName ?? state.profile.displayName ?? 'Guest';

  return (
    <div className="animate-fade-in">
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-outline-variant bg-surface-container">
            <Icon name="person" size={36} className="text-on-surface-variant" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-headline-md text-on-surface">{name}</h1>
            <p className="mt-1 font-body-md text-on-surface-variant">
              {rankFor(mastery.score)}
              {user?.email && ` · ${user.email}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="primary" icon="star">{xp.toLocaleString()} XP</Badge>
              <Badge tone="neutral" icon="local_fire_department">{streak} day streak</Badge>
              <Badge tone="neutral" icon="military_tech">{unlocked.length} achievements</Badge>
              {isGuest ? <Badge tone="warning">Guest</Badge> : <Badge tone="success">Signed in</Badge>}
              {syncStatus === 'syncing' && <Badge tone="info">Syncing…</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button to="/settings" variant="secondary" icon="settings">Settings</Button>
            {isGuest ? (
              <Button to="/signup" icon="person_add">Create account</Button>
            ) : (
              <Button variant="ghost" onClick={signOut} icon="logout">Sign out</Button>
            )}
          </div>
        </div>
      </Card>

      {isGuest && (
        <Card className="mt-4 border-info/30 bg-info/5 p-4">
          <p className="font-body-sm text-on-surface-variant">
            <Icon name="info" size={15} className="mr-1.5 inline text-info" />
            {isConfigured
              ? 'Your progress lives in this browser. Creating an account merges it into your profile — nothing is lost.'
              : 'Accounts are not configured for this deployment, so progress is saved in this browser only. Everything else works normally.'}
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Mastery" value={`${Math.round(mastery.score * 100)}%`} icon="psychology" tone="primary" />
        <Stat label="Lessons" value={`${progress.completed}/${progress.lessons}`} icon="school" />
        <Stat label="Exercises" value={exStats.solved} icon="fitness_center" />
        <Stat label="Challenges" value={chStats.solved} icon="trophy" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-headline-sm text-on-surface">Achievements</h2>
            <Link to="/achievements" className="font-body-sm text-primary-ink hover:opacity-80">View all</Link>
          </div>
          {unlocked.length === 0 ? (
            <EmptyState icon="military_tech" title="No achievements yet" message="Complete your first lesson to unlock one." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {unlocked.slice(0, 6).map((a) => (
                <Card key={a.id} className="flex items-center gap-3 border-primary/30 bg-primary/5 p-4">
                  <Icon name={a.icon} size={22} className="shrink-0 text-primary-ink" filled />
                  <div className="min-w-0">
                    <p className="truncate font-body-sm font-semibold text-on-surface">{a.title}</p>
                    <p className="truncate font-body-sm text-on-surface-variant">{a.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-heading text-headline-sm text-on-surface">Overall progress</h2>
          <Card className="space-y-4 p-5">
            {[
              ['Curriculum', progress.ratio, `${progress.completed}/${progress.lessons} lessons`],
              ['Mastery', mastery.score, `${mastery.mastered}/${mastery.total} topics mastered`],
              ['Projects', prStats.started ? prStats.completed / Math.max(prStats.started, 1) : 0, `${prStats.completed} completed`],
            ].map(([label, value, hint]) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between font-body-sm">
                  <span className="text-on-surface">{label}</span>
                  <span className="font-mono text-on-surface-variant">{hint}</span>
                </div>
                <ProgressBar value={value} label={label} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
