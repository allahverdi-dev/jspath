import { useMemo } from 'react';
import { Card, Icon, ProgressBar, MasteryBadge, SectionLabel, EmptyState, Stat } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { contentIndex, lessonById } from '../content/registry.js';
import { allTopicMastery } from '../features/mastery/masteryEngine.js';
import { curriculumProgress, exerciseStats, quizAccuracy, minutesLearned } from '../features/progress/progressEngine.js';
import { AdvancedAnalyticsGate } from '../components/billing/AdvancedAnalyticsGate.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { useI18n, useT } from '../i18n/index.jsx';

export default function MyLearning() {
  const { state, xp, streak } = useUserState();
  const t = useT();
  const { formatDate, formatNumber } = useI18n();

  const topics = useMemo(() => allTopicMastery(state, contentIndex.topics, contentIndex), [state]);
  const progress = useMemo(() => curriculumProgress(state, contentIndex.modules), [state]);
  const exStats = useMemo(() => exerciseStats(state), [state]);
  const accuracy = useMemo(() => quizAccuracy(state), [state]);
  const minutes = useMemo(() => minutesLearned(state, lessonById), [state]);

  const grouped = useMemo(() => {
    const out = {};
    for (const topic of topics) (out[topic.group] ??= []).push(topic);
    return out;
  }, [topics]);

  const recent = state.activity.slice(0, 15);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">{t('myLearning.title')}</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">
        {t('myLearning.subtitle')} {t('myLearning.proUpsell')}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat
          label={t('dashboard.xp')}
          value={formatNumber(xp)}
          icon="bolt"
          tone="primary"
          hint={t('common.dayStreak', { count: streak })}
        />
        <Stat label={t('myLearning.lessons')} value={`${progress.completed}/${progress.lessons}`} icon="school" />
        <Stat
          label={t('myLearning.exercisesSolved')}
          value={exStats.solved}
          icon="fitness_center"
          hint={exStats.accuracy != null ? t('myLearning.ofAttempted', { percent: Math.round(exStats.accuracy * 100) }) : undefined}
        />
        <Stat
          label={t('myLearning.quizAccuracy')}
          value={accuracy == null ? '—' : `${Math.round(accuracy * 100)}%`}
          icon="quiz"
          hint={accuracy == null ? t('myLearning.noQuizzesYet') : undefined}
        />
        <Stat
          label={t('myLearning.lessonTimeEstimate')}
          value={t('common.hoursMinutes', { hours: Math.floor(minutes / 60), minutes: minutes % 60 })}
          icon="schedule"
          hint={t('myLearning.lessonTimeHint')}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AdvancedAnalyticsGate>
            <h2 className="mb-4 font-heading text-headline-sm text-on-surface">{t('myLearning.skillTree')}</h2>
            <p className="mb-4 font-body-sm text-on-surface-variant">{t('myLearning.masteryExplained')}</p>
            <div className="space-y-6">
              {Object.entries(grouped).map(([group, list]) => (
                <div key={group}>
                  <SectionLabel className="mb-3"><Authored>{group}</Authored></SectionLabel>
                  <div className="space-y-2">
                    {list.map((topic) => (
                      <Card key={topic.topicId} className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-body-md font-medium text-on-surface"><Authored>{topic.label}</Authored></span>
                          <div className="flex items-center gap-2">
                            <MasteryBadge level={topic.level} />
                            <span className="font-mono text-code-md text-on-surface">{Math.round(topic.score * 100)}%</span>
                          </div>
                        </div>
                        <ProgressBar
                          value={topic.score}
                          className="mt-2.5"
                          label={t('dashboard.topicMasteryLabel', { topic: topic.label })}
                        />
                        <p className="mt-2 font-body-sm text-on-surface-variant">
                          {[
                            t('myLearning.evidenceLessons', { done: topic.evidence.lessonsDone, total: topic.evidence.lessonsAvailable }),
                            t('myLearning.evidenceExercises', { done: topic.evidence.exercisesSolved, total: topic.evidence.exercisesAvailable }),
                            t('myLearning.evidenceChallenges', { done: topic.evidence.challengesSolved, total: topic.evidence.challengesAvailable }),
                            topic.evidence.quizAccuracy == null
                              ? t('myLearning.noQuizData')
                              : t('myLearning.evidenceQuiz', { percent: Math.round(topic.evidence.quizAccuracy * 100) }),
                            topic.evidence.decayApplied && topic.evidence.idleDays != null
                              ? t('myLearning.idleDays', { count: topic.evidence.idleDays })
                              : null,
                          ].filter(Boolean).join(' · ')}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdvancedAnalyticsGate>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <SectionLabel className="mb-3">{t('myLearning.howMasteryCalculated')}</SectionLabel>
            <ul className="space-y-2 font-body-sm text-on-surface-variant">
              <li>{t('myLearning.weightLessons')}</li>
              <li>{t('myLearning.weightExercises')}</li>
              <li>{t('myLearning.weightQuiz')}</li>
              <li>{t('myLearning.weightChallenges')}</li>
            </ul>
            <p className="mt-3 font-body-sm text-on-surface-variant">
              {t('myLearning.masteredRequires', { mastered: t('mastery.mastered') })}
            </p>
          </Card>

          <Card className="p-5">
            <SectionLabel className="mb-3">{t('myLearning.recentActivity')}</SectionLabel>
            {recent.length === 0 ? (
              <EmptyState
                icon="timeline"
                title={t('myLearning.nothingRecorded')}
                message={t('myLearning.nothingRecordedBody')}
              />
            ) : (
              <ul className="space-y-2">
                {recent.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                    <Icon name="circle" size={7} className="mt-2 shrink-0 text-primary-ink" filled />
                    <span className="min-w-0 flex-1">
                      <span className="text-on-surface">{t('activity.' + a.type)}</span>
                      <span className="ml-1 opacity-70">{formatDate(a.at, { dateStyle: 'medium' })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
