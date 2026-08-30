import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Card, Button, Icon, Badge, DifficultyBadge, ProgressBar, EmptyState, SectionLabel,
} from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { moduleBySlug, lessonsByModule, moduleById, contentIndex } from '../content/registry.js';
import { moduleProgress } from '../features/progress/progressEngine.js';
import { allTopicMastery } from '../features/mastery/masteryEngine.js';
import { TRACK_LABEL } from '../content/schema/types.js';
import { TOPIC_BY_ID } from '../content/topics.js';
import { useEntitlements } from '../state/EntitlementProvider.jsx';

export default function ModuleDetail() {
  const { moduleSlug } = useParams();
  const { state } = useUserState();
  const { canAccessContent } = useEntitlements();
  const module = moduleBySlug[moduleSlug];

  const progress = useMemo(() => (module ? moduleProgress(state, module) : null), [state, module]);
  const topicScores = useMemo(() => {
    if (!module) return [];
    const topics = contentIndex.topics.filter((t) => module.topicIds.includes(t.id));
    return allTopicMastery(state, topics, contentIndex);
  }, [state, module]);

  if (!module) {
    return (
      <EmptyState
        icon="search_off"
        title="Module not found"
        message="That module does not exist."
        action={<Button to="/curriculum" icon="school">Back to curriculum</Button>}
      />
    );
  }

  const lessons = lessonsByModule[module.id] ?? [];
  const nextLesson = lessons.find((l) => !state.lessons[l.id]?.completedAt) ?? lessons[0];

  return (
    <div className="animate-fade-in">
      <Link to="/curriculum" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> Curriculum
      </Link>

      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-code-md text-on-surface-variant">
              Module {String(module.order).padStart(2, '0')}
            </span>
            <DifficultyBadge difficulty={module.difficulty} />
            <Badge tone="neutral">{TRACK_LABEL[module.track]}</Badge>
          </div>
          <h1 className="font-display text-display-lg text-on-surface">{module.title}</h1>
          <p className="mt-3 max-w-2xl font-body-lg text-on-surface-variant">{module.description}</p>
        </div>

        {nextLesson && (
          <Button to={`/learn/${module.slug}/${nextLesson.slug}`} size="lg" iconRight="arrow_forward" className="shrink-0">
            {progress.started ? 'Continue module' : 'Start module'}
          </Button>
        )}
      </div>

      {progress.total > 0 && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
            <span>{progress.completed} of {progress.total} lessons complete</span>
            <span>{Math.round(progress.ratio * 100)}%</span>
          </div>
          <ProgressBar value={progress.ratio} height={6} label={`${module.title} progress`} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h2 className="mb-4 font-heading text-headline-sm text-on-surface">Lessons</h2>
          {lessons.length === 0 ? (
            <EmptyState icon="hourglass_empty" title="No lessons yet" message="This module has no lessons in this build." />
          ) : (
            <ol className="space-y-2">
              {lessons.map((lesson, i) => {
                const done = Boolean(state.lessons[lesson.id]?.completedAt);
                const lessonUnlocked = canAccessContent('lesson', lesson.id);
                return (
                  <li key={lesson.id}>
                    <Card as={Link} to={`/learn/${module.slug}/${lesson.slug}`} interactive className="flex items-start gap-4 p-4">
                      <span className="mt-0.5 shrink-0">
                        <Icon
                          name={done ? 'check_circle' : 'radio_button_unchecked'}
                          size={20}
                          filled={done}
                          className={done ? 'text-success' : 'text-on-surface-variant'}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-code-sm text-on-surface-variant">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="font-body-md font-semibold text-on-surface">{lesson.title}</span>
                          {!lessonUnlocked && <Badge tone="primary" icon="lock">Pro</Badge>}
                        </span>
                        <span className="mt-1 block font-body-sm text-on-surface-variant">{lesson.description}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-3 font-mono text-code-sm text-on-surface-variant">
                          <span className="flex items-center gap-1"><Icon name="schedule" size={13} />{lesson.estimatedMinutes} min</span>
                          {lesson.exerciseIds.length > 0 && (
                            <span className="flex items-center gap-1"><Icon name="fitness_center" size={13} />{lesson.exerciseIds.length} exercises</span>
                          )}
                          {lesson.quizQuestionCount > 0 && (
                            <span className="flex items-center gap-1"><Icon name="quiz" size={13} />{lesson.quizQuestionCount} questions</span>
                          )}
                        </span>
                      </span>
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <p className="mb-3 flex items-center gap-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
              <Icon name="target" size={14} /> Learning objectives
            </p>
            <ul className="space-y-2">
              {module.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-primary-ink" />
                  {o}
                </li>
              ))}
            </ul>
          </Card>

          {module.prerequisites?.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Prerequisites</SectionLabel>
              <div className="space-y-2">
                {module.prerequisites.map((id) => {
                  const prereq = moduleById[id];
                  if (!prereq) return null;
                  return (
                    <Link
                      key={id}
                      to={`/curriculum/${prereq.slug}`}
                      className="flex items-center gap-2 font-body-sm text-on-surface-variant transition hover:text-on-surface"
                    >
                      <Icon name="arrow_back" size={14} />
                      {prereq.title}
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

          {topicScores.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Topics covered</SectionLabel>
              <div className="space-y-3">
                {topicScores.map((t) => (
                  <div key={t.topicId}>
                    <div className="mb-1 flex items-center justify-between font-body-sm">
                      <span className="truncate text-on-surface-variant">
                        {TOPIC_BY_ID[t.topicId]?.label ?? t.topicId}
                      </span>
                      <span className="ml-2 shrink-0 font-mono text-on-surface">{Math.round(t.score * 100)}%</span>
                    </div>
                    <ProgressBar value={t.score} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
