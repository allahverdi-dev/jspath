import { useMemo } from 'react';
import { Card, Icon, ProgressBar, MasteryBadge, SectionLabel, EmptyState, Stat } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { contentIndex, lessonById } from '../content/registry.js';
import { allTopicMastery } from '../features/mastery/masteryEngine.js';
import { curriculumProgress, exerciseStats, quizAccuracy, minutesLearned } from '../features/progress/progressEngine.js';
import { AdvancedAnalyticsGate } from '../components/billing/AdvancedAnalyticsGate.jsx';

export default function MyLearning() {
  const { state, xp, streak } = useUserState();

  const topics = useMemo(() => allTopicMastery(state, contentIndex.topics, contentIndex), [state]);
  const progress = useMemo(() => curriculumProgress(state, contentIndex.modules), [state]);
  const exStats = useMemo(() => exerciseStats(state), [state]);
  const accuracy = useMemo(() => quizAccuracy(state), [state]);
  const minutes = useMemo(() => minutesLearned(state, lessonById), [state]);

  const grouped = useMemo(() => {
    const out = {};
    for (const t of topics) (out[t.group] ??= []).push(t);
    return out;
  }, [topics]);

  const recent = state.activity.slice(0, 15);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">My Learning</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">
        Your learning progress. Go deeper with Pro topic mastery and assessment evidence.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="XP" value={xp.toLocaleString()} icon="bolt" tone="primary" hint={`${streak} day streak`} />
        <Stat label="Lessons" value={`${progress.completed}/${progress.lessons}`} icon="school" />
        <Stat label="Exercises solved" value={exStats.solved} icon="fitness_center" hint={exStats.accuracy != null ? `${Math.round(exStats.accuracy * 100)}% of attempted` : undefined} />
        <Stat label="Quiz accuracy" value={accuracy == null ? '—' : `${Math.round(accuracy * 100)}%`} icon="quiz" hint={accuracy == null ? 'no quizzes taken yet' : undefined} />
        <Stat label="Lesson time estimate" value={`${Math.floor(minutes / 60)}h ${minutes % 60}m`} icon="schedule" hint="Estimated duration of completed lessons, not tracked time" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AdvancedAnalyticsGate>
            <h2 className="mb-4 font-heading text-headline-sm text-on-surface">Advanced Analytics: skill tree</h2>
            <p className="mb-4 font-body-sm text-on-surface-variant">Scores combine lesson coverage, attempt-weighted exercise and challenge solves, and your best quiz attempts. They are learning indicators, not a certification or a prediction of interview success.</p>
            <div className="space-y-6">
              {Object.entries(grouped).map(([group, list]) => (
                <div key={group}>
                  <SectionLabel className="mb-3">{group}</SectionLabel>
                  <div className="space-y-2">
                    {list.map((t) => (
                      <Card key={t.topicId} className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-body-md font-medium text-on-surface">{t.label}</span>
                          <div className="flex items-center gap-2">
                            <MasteryBadge level={t.level} />
                            <span className="font-mono text-code-md text-on-surface">{Math.round(t.score * 100)}%</span>
                          </div>
                        </div>
                        <ProgressBar value={t.score} className="mt-2.5" label={`${t.label} mastery`} />
                        <p className="mt-2 font-body-sm text-on-surface-variant">
                          {t.evidence.lessonsDone}/{t.evidence.lessonsAvailable} lessons ·{' '}
                          {t.evidence.exercisesSolved}/{t.evidence.exercisesAvailable} exercises ·{' '}
                          {t.evidence.challengesSolved}/{t.evidence.challengesAvailable} challenges ·{' '}
                          {t.evidence.quizAccuracy == null ? 'no quiz data' : `${Math.round(t.evidence.quizAccuracy * 100)}% quiz accuracy`}
                          {t.evidence.decayApplied && t.evidence.idleDays != null && ` · idle ${t.evidence.idleDays} days`}
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
            <SectionLabel className="mb-3">How mastery is calculated</SectionLabel>
            <ul className="space-y-2 font-body-sm text-on-surface-variant">
              <li>• Lessons completed — 30%</li>
              <li>• Exercises solved — 30%</li>
              <li>• Quiz accuracy — 25%</li>
              <li>• Challenges solved — 15%</li>
            </ul>
            <p className="mt-3 font-body-sm text-on-surface-variant">
              Reaching <strong className="text-on-surface">Mastered</strong> also requires real
              assessment evidence — reading every lesson is not enough. Scores taper if a topic is
              left untouched for three weeks.
            </p>
          </Card>

          <Card className="p-5">
            <SectionLabel className="mb-3">Recent activity</SectionLabel>
            {recent.length === 0 ? (
              <EmptyState icon="timeline" title="Nothing recorded yet" message="Complete a lesson, exercise or quiz and it will show up here." />
            ) : (
              <ul className="space-y-2">
                {recent.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                    <Icon name="circle" size={7} className="mt-2 shrink-0 text-primary-ink" filled />
                    <span className="min-w-0 flex-1">
                      <span className="text-on-surface">{a.type.replace('.', ' ')}</span>
                      <span className="ml-1 opacity-70">{new Date(a.at).toLocaleDateString()}</span>
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
