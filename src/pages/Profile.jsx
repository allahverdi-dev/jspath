import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, ProgressBar, Stat, EmptyState } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { contentIndex } from '../content/registry.js';
import { overallMastery, rankKeyFor } from '../features/mastery/masteryEngine.js';
import { curriculumProgress, exerciseStats, challengeStats, projectStats } from '../features/progress/progressEngine.js';
import { evaluateAchievements } from '../features/achievements/achievements.js';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { useI18n, useT } from '../i18n/index.jsx';

export default function Profile() {
  const { state, xp, streak, isGuest, syncStatus } = useUserState();
  const { displayName, user, signOut, isConfigured } = useAuth();
  const { isPro } = useEntitlements();
  const t = useT();
  const { formatNumber } = useI18n();

  const mastery = useMemo(() => overallMastery(state, contentIndex.topics, contentIndex), [state]);
  const progress = useMemo(() => curriculumProgress(state, contentIndex.modules), [state]);
  const exStats = useMemo(() => exerciseStats(state), [state]);
  const chStats = useMemo(() => challengeStats(state), [state]);
  const prStats = useMemo(() => projectStats(state), [state]);
  const achievements = useMemo(() => evaluateAchievements(state, contentIndex), [state]);
  const unlocked = achievements.filter((a) => a.unlocked);

  const name = displayName ?? state.profile.displayName ?? t('auth.guest');

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
              {t(rankKeyFor(mastery.score))}
              {user?.email && ` · ${user.email}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="primary" icon="star">{t('common.xp', { count: formatNumber(xp) })}</Badge>
              <Badge tone="neutral" icon="local_fire_department">{t('common.dayStreak', { count: streak })}</Badge>
              <Badge tone="neutral" icon="military_tech">{t('profile.achievementCount', { count: unlocked.length })}</Badge>
              {isGuest
                ? <Badge tone="warning">{t('auth.guest')}</Badge>
                : <Badge tone="success">{t('auth.signedIn')}</Badge>}
              {!isGuest && <Badge tone={isPro ? 'primary' : 'neutral'} icon={isPro ? 'workspace_premium' : undefined}>{isPro ? t('common.pro') : t('common.free')}</Badge>}
              {syncStatus === 'syncing' && <Badge tone="info">{t('auth.syncing')}</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button to="/settings" variant="secondary" icon="settings">{t('settings.title')}</Button>
            <Button to="/pricing" variant={isPro ? 'secondary' : 'primary'} icon={isPro ? 'workspace_premium' : 'upgrade'}>{isPro ? t('billing.managePlan') : t('billing.upgrade')}</Button>
            {isGuest ? (
              <Button to="/signup" icon="person_add">{t('auth.createAccount')}</Button>
            ) : (
              <Button variant="ghost" onClick={signOut} icon="logout">{t('auth.signOut')}</Button>
            )}
          </div>
        </div>
      </Card>

      {isGuest && (
        <Card className="mt-4 border-info/30 bg-info/5 p-4">
          <p className="font-body-sm text-on-surface-variant">
            <Icon name="info" size={15} className="mr-1.5 inline text-info" />
            {isConfigured ? t('profile.guestNotice') : t('profile.guestNoticeUnconfigured')}
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('mastery.label')} value={`${Math.round(mastery.score * 100)}%`} icon="psychology" tone="primary" />
        <Stat label={t('learning.lessons')} value={`${progress.completed}/${progress.lessons}`} icon="school" />
        <Stat label={t('profile.exercises')} value={exStats.solved} icon="fitness_center" />
        <Stat label={t('challenges.title')} value={chStats.solved} icon="trophy" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-headline-sm text-on-surface">{t('achievements.title')}</h2>
            <Link to="/achievements" className="font-body-sm text-primary-ink hover:opacity-80">{t('common.viewAll')}</Link>
          </div>
          {unlocked.length === 0 ? (
            <EmptyState
              icon="military_tech"
              title={t('profile.noAchievements')}
              message={t('profile.noAchievementsBody')}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {unlocked.slice(0, 6).map((a) => (
                <Card key={a.id} className="flex items-center gap-3 border-primary/30 bg-primary/5 p-4">
                  <Icon name={a.icon} size={22} className="shrink-0 text-primary-ink" filled />
                  <div className="min-w-0">
                    <p className="truncate font-body-sm font-semibold text-on-surface">{t('achievements.items.' + a.id + '.title')}</p>
                    <p className="truncate font-body-sm text-on-surface-variant">{t('achievements.items.' + a.id + '.description')}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-heading text-headline-sm text-on-surface">{t('profile.overallProgress')}</h2>
          <Card className="space-y-4 p-5">
            {[
              {
                key: 'learning.curriculum',
                value: progress.ratio,
                hint: t('profile.lessonsHint', { done: progress.completed, total: progress.lessons }),
              },
              {
                key: 'mastery.label',
                value: mastery.score,
                hint: t('profile.topicsMasteredHint', { done: mastery.mastered, total: mastery.total }),
              },
              {
                key: 'projects.title',
                value: prStats.started ? prStats.completed / Math.max(prStats.started, 1) : 0,
                hint: t('profile.completedHint', { count: prStats.completed }),
              },
            ].map((row) => (
              <div key={row.key}>
                <div className="mb-1.5 flex items-center justify-between font-body-sm">
                  <span className="text-on-surface">{t(row.key)}</span>
                  <span className="font-mono text-on-surface-variant">{row.hint}</span>
                </div>
                <ProgressBar value={row.value} label={t(row.key)} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
