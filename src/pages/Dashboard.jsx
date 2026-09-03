import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardHeader, Button, Icon, Badge, ProgressBar, ProgressRing, SectionLabel,
  EmptyState, DifficultyBadge, cx,
} from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useI18n, useT } from '../i18n/index.jsx';
import { contentIndex, contentStats, moduleById } from '../content/registry.js';
import {
  curriculumProgress, activityHeatmap, exerciseStats, quizAccuracy, challengeStats, projectStats,
  dayKey,
} from '../features/progress/progressEngine.js';
import { overallMastery, allTopicMastery, rankKeyFor } from '../features/mastery/masteryEngine.js';
import { recommendations, continueLesson, nextLesson, dailyChallenge } from '../features/progress/recommendations.js';
import { AdvancedAnalyticsGate } from '../components/billing/AdvancedAnalyticsGate.jsx';
import { ContentAccessBadge } from '../components/billing/ContentAccessBadge.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { FEATURE } from '../features/billing/plans.js';
import { PLACEMENT_LEVEL_KEY } from '../content/schema/types.js';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';

/**
 * The greeting key for the current hour.
 *
 * A key rather than a sentence, because where the name sits in the greeting is
 * a property of the language, not of the clock.
 */
function greetingKey(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'dashboard.greetingMorning';
  if (h < 18) return 'dashboard.greetingAfternoon';
  return 'dashboard.greetingEvening';
}

/** GitHub-style activity grid — real data only, never simulated. */
function ActivityHeatmap({ days }) {
  const t = useT();
  const { formatDate } = useI18n();
  const weeks = useMemo(() => {
    const out = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  const level = (count) => (count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3);
  const shades = ['bg-surface-container-high', 'bg-primary/30', 'bg-primary/60', 'bg-primary'];
  const active = days.filter((d) => d.count > 0).length;

  return (
    <div>
      <div className="thin-scrollbar overflow-x-auto pb-2">
        <div className="flex gap-1">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={cx('h-3 w-3 rounded-sm', shades[level(day.count)])}
                  title={t('dashboard.heatmapDay', {
                    date: formatDate(day.date, { dateStyle: 'medium' }),
                    count: day.count,
                  })}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 font-mono text-code-sm text-on-surface-variant">
        <span>{t('dashboard.activeDays', { count: active })}</span>
        <span className="ml-auto">{t('common.less')}</span>
        {shades.map((s, i) => <div key={i} className={cx('h-3 w-3 rounded-sm', s)} />)}
        <span>{t('common.more')}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, streak, xp, isGuest } = useUserState();
  const { displayName } = useAuth();
  const { hasFeature } = useEntitlements();
  const t = useT();
  const { formatNumber } = useI18n();
  const analyticsUnlocked = hasFeature(FEATURE.ADVANCED_ANALYTICS);

  const name = displayName ?? state.profile.displayName ?? t('dashboard.defaultName');
  const progress = useMemo(() => curriculumProgress(state, contentIndex.modules), [state]);
  const mastery = useMemo(() => overallMastery(state, contentIndex.topics, contentIndex), [state]);
  const topics = useMemo(() => allTopicMastery(state, contentIndex.topics, contentIndex), [state]);
  const placement = state.placement ?? null;
  const placementModule = placement ? moduleById[placement.recommendedModuleId] : null;

  const recs = useMemo(() => recommendations(state, contentIndex, { includeMastery: analyticsUnlocked }), [state, analyticsUnlocked]);
  const heatmap = useMemo(() => activityHeatmap(state, 84), [state]);
  const exStats = useMemo(() => exerciseStats(state), [state]);
  const chStats = useMemo(() => challengeStats(state), [state]);
  const prStats = useMemo(() => projectStats(state), [state]);
  const accuracy = useMemo(() => quizAccuracy(state), [state]);

  const current = useMemo(
    () => continueLesson(state, contentIndex) ?? nextLesson(state, contentIndex),
    [state],
  );
  const daily = useMemo(() => dailyChallenge(contentIndex.challenges), []);
  const dailyDone = daily && state.dailyChallenge[dayKey()] === daily.id;

  const startedTopics = topics.filter((topic) => topic.level !== 'notStarted');

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">{t('dashboard.title')}</h1>
          <p className="mt-2 font-body-lg text-on-surface-variant">
            {t(greetingKey(), { name })}{' '}
            {progress.completed === 0 ? t('dashboard.readyFirst') : t('dashboard.readyContinue')}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-low px-5 py-3">
          <div className="text-center">
            <SectionLabel>{t('dashboard.streak')}</SectionLabel>
            <p className="mt-0.5 flex items-center justify-center gap-1 font-heading text-headline-sm text-on-surface">
              <Icon name="local_fire_department" size={20} filled className={streak > 0 ? 'text-primary-ink' : 'text-on-surface-variant'} />
              {formatNumber(streak)}
            </p>
          </div>
          <div className="h-10 w-px bg-outline-variant" aria-hidden="true" />
          <div className="text-center">
            <SectionLabel>{t('dashboard.xp')}</SectionLabel>
            <p className="mt-0.5 font-heading text-headline-sm text-on-surface">{formatNumber(xp)}</p>
          </div>
        </div>
      </div>

      {isGuest && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-info/30 bg-info/5 px-4 py-3">
          <Icon name="info" size={18} className="text-info" />
          <p className="min-w-0 flex-1 basis-64 font-body-sm text-on-surface-variant">
            {t('dashboard.guestNoticeBody')}
          </p>
          <Button to="/signup" size="sm" variant="secondary">{t('auth.createAccount')}</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Continue learning */}
          {current?.lesson ? (
            <Card className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Badge tone="primary">
                      {t('learning.moduleNumber', { order: String(current.module.order).padStart(2, '0') })}
                      {' · '}
                      <Authored>{current.module.shortTitle}</Authored>
                    </Badge>
                    <h2 className="mt-3 font-heading text-headline-md text-on-surface"><Authored>{current.lesson.title}</Authored></h2>
                    <p className="mt-2 max-w-xl font-body-md text-on-surface-variant"><Authored>{current.lesson.description}</Authored></p>
                  </div>
                  <ProgressRing value={progress.ratio} size={64}>
                    <span className="font-mono text-code-sm font-bold text-on-surface">
                      {Math.round(progress.ratio * 100)}%
                    </span>
                  </ProgressRing>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                    <span>{t('dashboard.lessonsComplete', { done: progress.completed, total: progress.lessons })}</span>
                    <span>{t('common.minutes', { count: current.lesson.estimatedMinutes })}</span>
                  </div>
                  <ProgressBar value={progress.ratio} height={6} label={t('dashboard.curriculumProgress')} />
                </div>

                <Button
                  to={`/learn/${current.module.slug}/${current.lesson.slug}`}
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  iconRight="arrow_forward"
                >
                  {state.lessons[current.lesson.id]?.lastVisitedAt
                    ? t('dashboard.continueLearning')
                    : t('dashboard.startLearning')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8">
              <EmptyState
                icon="celebration"
                title={t('dashboard.everyLessonComplete')}
                message={t('dashboard.everyLessonCompleteBody')}
                action={<Button to="/challenges" icon="trophy">{t('dashboard.takeOnChallenges')}</Button>}
              />
            </Card>
          )}

          {/* Activity */}
          <Card className="p-6">
            <CardHeader
              title={t('dashboard.activity')}
              description={t('dashboard.activitySubtitle')}
              action={<span className="font-mono text-code-sm text-on-surface-variant">{t('dashboard.lastTwelveWeeks')}</span>}
            />
            <div className="mt-5">
              <ActivityHeatmap days={heatmap} />
            </div>
          </Card>

          {/* Recommended */}
          <div>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="font-heading text-headline-sm text-on-surface">{t('dashboard.recommended')}</h2>
                <p className="mt-1 font-body-sm text-on-surface-variant">
                  {analyticsUnlocked ? t('dashboard.recommendedBasisPro') : t('dashboard.recommendedBasis')}
                </p>
              </div>
            </div>

            {recs.length === 0 ? (
              <EmptyState
                icon="explore"
                title={t('dashboard.nothingToRecommend')}
                message={t('dashboard.nothingToRecommendBody')}
                action={<Button to="/curriculum" icon="school">{t('dashboard.browseCurriculum')}</Button>}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recs.map((rec) => (
                  <Card key={`${rec.kind}-${rec.id}`} as={Link} to={rec.to} interactive className="block p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Icon name={rec.icon} size={18} className="mt-0.5 text-on-surface-variant" />
                      <Badge tone="neutral">{t(rec.metaKey, rec.metaVars)}</Badge>
                    </div>
                    <p className="mt-3 font-body-md font-semibold text-on-surface"><Authored>{rec.title}</Authored></p>
                    <ContentAccessBadge kind={rec.kind} id={rec.id} />
                    <p className="mt-1 line-clamp-2 font-body-sm text-on-surface-variant"><InlineMarkup text={rec.description} /></p>
                    <p className="mt-3 flex items-center gap-1.5 font-body-sm text-primary-ink">
                      <Icon name="auto_awesome" size={13} />
                      {t(rec.reasonKey, rec.reasonVars)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Mastery */}
          <AdvancedAnalyticsGate>
            <Card className="p-6 text-center">
              <ProgressRing value={mastery.score} size={128} stroke={6} className="mx-auto">
                <div>
                  <p className="font-heading text-headline-md text-on-surface">{Math.round(mastery.score * 100)}%</p>
                  <SectionLabel>{t('dashboard.mastery')}</SectionLabel>
                </div>
              </ProgressRing>
              <h3 className="mt-4 font-heading text-title-md text-on-surface">{t('dashboard.jsMastery')}</h3>
              <p className="mt-1 font-body-sm text-on-surface-variant">{t(rankKeyFor(mastery.score))}</p>
              <p className="mt-3 font-body-sm text-on-surface-variant">
                {t('dashboard.topicsMastered', { done: mastery.mastered, total: mastery.total })}
              </p>
            </Card>
          </AdvancedAnalyticsGate>

          {/* Placement — a recommendation, never a record of progress */}
          <Card className="p-5">
            <p className="flex items-center gap-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
              <Icon name="explore" size={14} />
              {t('dashboard.placement')}
            </p>
            {placement ? (
              <>
                <h3 className="mt-2 font-heading text-title-md text-on-surface">
                  {PLACEMENT_LEVEL_KEY[placement.level]
                    ? t(PLACEMENT_LEVEL_KEY[placement.level])
                    : t('dashboard.placementAssessed')}
                </h3>
                <p className="mt-1 font-body-sm text-on-surface-variant">
                  {t('dashboard.placementSummary', { correct: placement.correctCount, total: placement.totalCount })}
                  {placementModule ? t('dashboard.placementRecommends', { module: placementModule.title }) : ''}
                </p>
                {placementModule && (
                  <Button
                    to={`/curriculum/${placementModule.slug}`}
                    className="mt-4 w-full"
                    icon="play_arrow"
                  >
                    {t('dashboard.continueFromPlacement')}
                  </Button>
                )}
                <Button to="/placement" variant="ghost" className="mt-2 w-full" icon="refresh">
                  {t('placement.retakeShort')}
                </Button>
              </>
            ) : (
              <>
                <h3 className="mt-2 font-heading text-title-md text-on-surface">
                  {t('dashboard.placementPrompt')}
                </h3>
                <p className="mt-1 font-body-sm text-on-surface-variant">
                  {t('dashboard.placementPromptBody')}
                </p>
                <Button to="/placement" variant="secondary" className="mt-4 w-full" icon="explore">
                  {t('dashboard.takePlacement')}
                </Button>
              </>
            )}
          </Card>

          {/* Daily challenge */}
          {daily && (
            <Card className="p-5">
              <p className="flex items-center gap-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                <Icon name="calendar_today" size={14} />
                {t('dashboard.dailyChallenge')}
              </p>
              <h3 className="mt-2 font-heading text-title-md text-on-surface"><Authored>{daily.title}</Authored></h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <DifficultyBadge difficulty={daily.difficulty} />
                <ContentAccessBadge kind="challenge" id={daily.id} />
                <Badge tone="neutral"><Authored>{daily.category}</Authored></Badge>
                <Badge tone="primary">{t('common.xpPlus', { count: daily.xp })}</Badge>
              </div>
              <Button
                to={`/challenges/${daily.slug}`}
                variant={dailyDone ? 'secondary' : 'primary'}
                className="mt-4 w-full"
                icon={dailyDone ? 'check_circle' : 'play_arrow'}
              >
                {dailyDone ? t('dashboard.completedToday') : t('dashboard.startChallenge')}
              </Button>
            </Card>
          )}

          {/* Skill breakdown */}
          <AdvancedAnalyticsGate quiet>
            <Card className="p-5">
              <CardHeader title={t('dashboard.skillBreakdown')} />
              {startedTopics.length === 0 ? (
                <p className="mt-4 font-body-sm text-on-surface-variant">
                  {t('dashboard.skillBreakdownEmpty')}
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {startedTopics.slice(0, 6).map((topic) => (
                    <div key={topic.topicId}>
                      <div className="mb-1 flex items-center justify-between font-body-sm">
                        <span className="truncate text-on-surface-variant"><Authored>{topic.label}</Authored></span>
                        <span className="ml-2 shrink-0 font-mono text-on-surface">{Math.round(topic.score * 100)}%</span>
                      </div>
                      <ProgressBar value={topic.score} label={t('dashboard.topicMasteryLabel', { topic: topic.label })} />
                    </div>
                  ))}
                </div>
              )}
              <Button to="/my-learning" variant="ghost" size="sm" className="mt-4 w-full" iconRight="arrow_forward">
                {t('dashboard.viewSkillTree')}
              </Button>
            </Card>
          </AdvancedAnalyticsGate>

          {/* Stats */}
          <Card className="divide-y divide-[rgb(var(--c-outline-variant))] p-0">
            {[
              { key: 'dashboard.statLessons', value: `${progress.completed} / ${progress.lessons}`, icon: 'school' },
              { key: 'dashboard.statExercises', value: `${exStats.solved} / ${contentStats.exercises}`, icon: 'fitness_center' },
              { key: 'dashboard.statChallenges', value: `${chStats.solved} / ${contentStats.challenges}`, icon: 'trophy' },
              { key: 'dashboard.statProjects', value: `${prStats.completed} / ${contentStats.projects}`, icon: 'folder_special' },
              { key: 'dashboard.statQuizAccuracy', value: accuracy == null ? '—' : `${Math.round(accuracy * 100)}%`, icon: 'quiz' },
              { key: 'dashboard.statLongestStreak', value: t('common.dayCount', { count: state.streak.longest }), icon: 'local_fire_department' },
            ].map((stat) => (
              <div key={stat.key} className="flex items-center gap-3 px-5 py-3">
                <Icon name={stat.icon} size={16} className="text-on-surface-variant" />
                <span className="min-w-0 flex-1 truncate font-body-sm text-on-surface-variant">{t(stat.key)}</span>
                <span className="shrink-0 font-mono text-code-md text-on-surface">{stat.value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
