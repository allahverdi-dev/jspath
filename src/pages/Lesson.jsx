import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  getLesson, lessonBySlug, moduleById, moduleBySlug, adjacentLessons, lessonById,
} from '../content/registry.js';
import { LessonSection, headingId } from '../components/learning/LessonSections.jsx';
import { ExerciseRunner } from '../features/exercises/ExerciseRunner.jsx';
import { QuizRunner } from '../features/quizzes/QuizRunner.jsx';
import {
  Button, Icon, Badge, DifficultyBadge, ProgressBar, EmptyState, cx, Card,
} from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { SECTION } from '../content/schema/types.js';
import { Logo } from '../layouts/AppShell.jsx';

/**
 * The lesson reader — the screen learners spend most of their time in.
 *
 * Layout follows the Stitch `array.map` export: a centre reading column with a
 * sticky "on this page" rail on the right. Below `xl` the rail collapses and the
 * lesson becomes a single readable column.
 */
export default function Lesson() {
  const { moduleSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useUserState();

  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  const [activeHeading, setActiveHeading] = useState(null);
  const visitedRef = useRef(null);

  const meta = lessonBySlug[lessonSlug];
  const module = moduleBySlug[moduleSlug] ?? (meta ? moduleById[meta.moduleId] : null);

  useEffect(() => {
    let cancelled = false;
    setLesson(null);
    setError(null);

    if (!meta) {
      setError(new Error('That lesson does not exist.'));
      return undefined;
    }

    getLesson(meta.id)
      .then((full) => {
        if (!cancelled) setLesson(full);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });

    return () => { cancelled = true; };
  }, [meta]);

  /* Count the visit once per lesson, not on every re-render. */
  useEffect(() => {
    if (lesson && visitedRef.current !== lesson.id) {
      visitedRef.current = lesson.id;
      actions.visitLesson(lesson.id);
    }
  }, [lesson, actions]);

  const headings = useMemo(
    () =>
      (lesson?.sections ?? [])
        .map((s, i) => (s.kind === SECTION.HEADING ? { id: headingId(s.text, i), text: s.text } : null))
        .filter(Boolean),
    [lesson],
  );

  /* Highlight the heading currently in view. */
  useEffect(() => {
    if (headings.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon="search_off"
          title="Lesson not found"
          message={error.message}
          action={<Button to="/curriculum" icon="school">Browse the curriculum</Button>}
        />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ContentSkeleton lines={10} />
      </div>
    );
  }

  const { previous, next } = adjacentLessons(lesson.id);
  const isComplete = Boolean(state.lessons[lesson.id]?.completedAt);
  const isBookmarked = Boolean(state.bookmarks[`lesson:${lesson.id}`]);
  const exercises = lesson.exercises ?? [];
  const inlineExerciseIds = new Set(
    (lesson.sections ?? []).filter((s) => s.kind === SECTION.EXERCISE_REF).map((s) => s.exerciseId),
  );
  const trailingExercises = exercises.filter((e) => !inlineExerciseIds.has(e.id));

  const goToLesson = (target) => {
    const mod = moduleById[target.moduleId];
    navigate(`/learn/${mod.slug}/${target.slug}`);
  };

  const complete = () => {
    actions.completeLesson(lesson);
    if (next) goToLesson(next);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Lesson header bar — replaces the app shell for focused reading */}
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-container-max items-center gap-3 px-4 lg:px-8">
          <Link to="/curriculum" className="flex items-center gap-2 text-on-surface-variant transition hover:text-on-surface">
            <Icon name="arrow_back" size={18} />
            <span className="hidden font-body-sm sm:inline">Curriculum</span>
          </Link>

          <div className="mx-2 hidden h-5 w-px bg-outline-variant sm:block" aria-hidden="true" />

          <Link to="/dashboard" className="hidden sm:block"><Logo size="sm" /></Link>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => actions.toggleBookmark('lesson', lesson.id, { title: lesson.title, to: `/learn/${module.slug}/${lesson.slug}` })}
              className={cx(
                'rounded p-2 transition-colors',
                isBookmarked ? 'text-primary-ink' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
            >
              <Icon name="bookmark" size={20} filled={isBookmarked} />
            </button>
            {isComplete ? (
              <Badge tone="success" icon="check_circle">Completed</Badge>
            ) : (
              <Button size="sm" onClick={complete} icon="check">Mark complete</Button>
            )}
          </div>
        </div>
        <ProgressBar
          value={module ? (module.lessonIds.indexOf(lesson.id) + 1) / module.lessonIds.length : 0}
          height={2}
          label={`Progress through ${module?.title ?? 'module'}`}
        />
      </header>

      <div className="mx-auto grid w-full max-w-container-max gap-10 px-4 py-8 lg:px-8 xl:grid-cols-[minmax(0,1fr)_16rem]">
        {/* Reading column */}
        <article className="min-w-0">
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {module && (
                <Link to={`/curriculum/${module.slug}`}>
                  <Badge tone="primary">
                    Module {String(module.order).padStart(2, '0')} · {module.shortTitle}
                  </Badge>
                </Link>
              )}
              <DifficultyBadge difficulty={lesson.difficulty} />
              <Badge tone="neutral" icon="schedule">{lesson.estimatedMinutes} min</Badge>
              <Badge tone="neutral" icon="star">+{lesson.xp} XP</Badge>
            </div>

            <h1 className="font-display text-display-lg text-on-surface">{lesson.title}</h1>
            <p className="mt-3 max-w-prose font-body-lg leading-8 text-on-surface-variant">{lesson.description}</p>
          </div>

          {/* Objectives */}
          <Card className="mb-10 p-5">
            <p className="mb-3 flex items-center gap-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
              <Icon name="target" size={14} />
              What you will be able to do
            </p>
            <ul className="space-y-2">
              {lesson.learningObjectives.map((objective, i) => (
                <li key={i} className="flex items-start gap-2.5 font-body-md text-on-surface-variant">
                  <Icon name="check" size={16} className="mt-1 shrink-0 text-primary-ink" />
                  {objective}
                </li>
              ))}
            </ul>
          </Card>

          {/* Body */}
          <div className="space-y-7">
            {lesson.sections.map((section, i) => (
              <LessonSection
                key={i}
                section={section}
                index={i}
                onExerciseRef={(exerciseId) => {
                  const exercise = exercises.find((e) => e.id === exerciseId);
                  return exercise ? <ExerciseRunner exercise={exercise} /> : null;
                }}
              />
            ))}
          </div>

          {/* Practice */}
          {trailingExercises.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-2 border-b border-outline-variant pb-2 font-heading text-headline-sm text-on-surface">
                Practice
              </h2>
              <p className="mb-6 font-body-md text-on-surface-variant">
                Reading is not the same as knowing. Work through these before moving on.
              </p>
              <div className="space-y-5">
                {trailingExercises.map((exercise) => (
                  <ExerciseRunner key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </section>
          )}

          {/* Quiz */}
          {lesson.quiz?.questions?.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-6 border-b border-outline-variant pb-2 font-heading text-headline-sm text-on-surface">
                Check your understanding
              </h2>
              <QuizRunner quiz={lesson.quiz} />
            </section>
          )}

          {/* Summary */}
          <section className="mt-14">
            <h2 className="mb-6 border-b border-outline-variant pb-2 font-heading text-headline-sm text-on-surface">
              Summary
            </h2>
            <p className="max-w-prose font-body-lg leading-8 text-on-surface-variant">{lesson.summary}</p>

            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
              <p className="mb-3 flex items-center gap-2 font-mono text-label-caps uppercase tracking-wider text-primary-ink">
                <Icon name="key" size={14} />
                Key takeaways
              </p>
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2.5 font-body-md text-on-surface-variant">
                    <Icon name="chevron_right" size={16} className="mt-1 shrink-0 text-primary-ink" />
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Interview connections */}
          {lesson.interviewConnections?.length > 0 && (
            <Card className="mt-8 p-5">
              <p className="mb-3 flex items-center gap-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                <Icon name="record_voice_over" size={14} />
                This comes up in interviews
              </p>
              <ul className="space-y-1.5">
                {lesson.interviewConnections.map((q, i) => (
                  <li key={i} className="font-body-md text-on-surface-variant">“{q}”</li>
                ))}
              </ul>
              <Button to="/interview" variant="secondary" size="sm" className="mt-4" icon="arrow_forward">
                Practise interview questions
              </Button>
            </Card>
          )}

          {/* Related */}
          {lesson.relatedLessons?.length > 0 && (
            <section className="mt-10">
              <p className="mb-3 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                Related lessons
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {lesson.relatedLessons.map((id) => {
                  const related = lessonById[id];
                  if (!related) return null;
                  const relatedModule = moduleById[related.moduleId];
                  return (
                    <Card
                      key={id}
                      as={Link}
                      to={`/learn/${relatedModule.slug}/${related.slug}`}
                      interactive
                      className="block p-4"
                    >
                      <p className="font-body-sm font-medium text-on-surface">{related.title}</p>
                      <p className="mt-1 line-clamp-2 font-body-sm text-on-surface-variant">{related.description}</p>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Completion + navigation */}
          <div className="mt-14 border-t border-outline-variant pt-8">
            {!isComplete && (
              <div className="mb-8 rounded-lg border border-outline-variant bg-surface-container-low p-6 text-center">
                <p className="font-heading text-title-md text-on-surface">Finished this lesson?</p>
                <p className="mx-auto mt-1 max-w-md font-body-sm text-on-surface-variant">
                  Marking it complete records your progress and earns {lesson.xp} XP. Your mastery
                  score, though, comes from the exercises and quiz above.
                </p>
                <Button className="mt-5" size="lg" onClick={complete} icon="check_circle">
                  Mark complete{next ? ' and continue' : ''}
                </Button>
              </div>
            )}

            <nav className="grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
              {previous ? (
                <Card as="button" type="button" onClick={() => goToLesson(previous)} interactive className="p-4 text-left">
                  <p className="flex items-center gap-1.5 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                    <Icon name="arrow_back" size={13} /> Previous
                  </p>
                  <p className="mt-1.5 font-body-md font-medium text-on-surface">{previous.title}</p>
                </Card>
              ) : (
                <div />
              )}
              {next && (
                <Card as="button" type="button" onClick={() => goToLesson(next)} interactive className="p-4 text-right">
                  <p className="flex items-center justify-end gap-1.5 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                    Next <Icon name="arrow_forward" size={13} />
                  </p>
                  <p className="mt-1.5 font-body-md font-medium text-on-surface">{next.title}</p>
                </Card>
              )}
            </nav>
          </div>
        </article>

        {/* On this page */}
        {headings.length > 1 && (
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <p className="mb-3 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                On this page
              </p>
              <nav aria-label="On this page">
                <ul className="space-y-1 border-l border-outline-variant">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={cx(
                          '-ml-px block border-l-2 py-1 pl-3 font-body-sm transition-colors',
                          activeHeading === h.id
                            ? 'border-primary text-on-surface'
                            : 'border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface',
                        )}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-6 border-t border-outline-variant pt-4">
                <p className="font-body-sm text-on-surface-variant">
                  {lesson.estimatedMinutes} min read
                  {exercises.length > 0 && ` · ${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`}
                  {lesson.quiz?.questions?.length > 0 && ` · ${lesson.quiz.questions.length} quiz questions`}
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
