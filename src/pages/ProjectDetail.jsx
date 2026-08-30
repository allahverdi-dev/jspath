import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProject, projectBySlug, lessonById, moduleById, challengeById } from '../content/registry.js';
import { Card, Button, Icon, Badge, DifficultyBadge, ProgressBar, EmptyState, Disclosure, SectionLabel, cx } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { HighlightedCode } from '../components/code/CodeBlock.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { topicLabel } from '../content/topics.js';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { state, actions } = useUserState();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [hints, setHints] = useState(0);
  const [showSolutionNotes, setShowSolutionNotes] = useState(false);

  const meta = projectBySlug[slug];

  useEffect(() => {
    let cancelled = false;
    setProject(null); setError(null); setHints(0); setShowSolutionNotes(false);
    if (!meta) { setError(new Error('That project does not exist.')); return undefined; }
    getProject(meta.id).then((p) => { if (!cancelled) setProject(p); }).catch((e) => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, [meta]);

  if (error) {
    return <EmptyState icon="search_off" title="Project not found" message={error.message} action={<Button to="/projects" icon="folder_open">All projects</Button>} />;
  }
  if (!project) return <ContentSkeleton lines={8} />;

  const record = state.projects[project.id];
  const doneCount = Object.values(record?.milestones ?? {}).filter(Boolean).length;
  const ratio = project.milestones.length ? doneCount / project.milestones.length : 0;

  return (
    <div className="animate-fade-in">
      <Link to="/projects" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> Projects
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={project.difficulty} />
        {project.estimatedHours && <Badge tone="neutral" icon="schedule">{project.estimatedHours}h</Badge>}
        {record?.completedAt && <Badge tone="success" icon="check_circle">Completed</Badge>}
      </div>

      <h1 className="font-display text-display-lg text-on-surface">{project.title}</h1>
      <p className="mt-3 max-w-2xl font-body-lg leading-8 text-on-surface-variant"><InlineMarkup text={project.brief} /></p>

      {project.topicIds?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.topicIds.map((t) => (
            <Badge key={t} tone="neutral">{topicLabel(t)}</Badge>
          ))}
        </div>
      )}

      {project.prerequisites?.length > 0 && (
        <div className="mt-4 max-w-2xl rounded border border-outline-variant bg-surface-container-low px-4 py-3">
          <p className="mb-1.5 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">Before you start</p>
          <ul className="space-y-1">
            {project.prerequisites.map((p, i) => (
              <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                <Icon name="task_alt" size={14} className="mt-0.5 shrink-0" />
                <InlineMarkup text={p} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {record && (
        <div className="mt-6 max-w-md">
          <div className="mb-2 flex items-center justify-between font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
            <span>{doneCount} of {project.milestones.length} milestones</span>
            <span>{Math.round(ratio * 100)}%</span>
          </div>
          <ProgressBar value={ratio} height={6} label="Project progress" />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="p-5">
            <SectionLabel className="mb-3">Required features</SectionLabel>
            <ul className="space-y-2">
              {project.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 font-body-md text-on-surface-variant">
                  <Icon name="check_box_outline_blank" size={17} className="mt-0.5 shrink-0 text-on-surface-variant" />
                  <InlineMarkup text={r} />
                </li>
              ))}
            </ul>
          </Card>

          <div>
            <h2 className="mb-3 font-heading text-headline-sm text-on-surface">Milestones</h2>
            <p className="mb-4 font-body-sm text-on-surface-variant">
              Work through these in order. Tick one off when it genuinely works — the checklist is
              yours, and marking it complete records real progress.
            </p>
            <div className="space-y-3">
              {project.milestones.map((m, i) => {
                const done = Boolean(record?.milestones?.[m.id]);
                return (
                  <Card key={m.id} className={cx('p-5', done && 'border-success/40 bg-success/5')}>
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => actions.toggleMilestone(project, m.id)}
                        className="mt-0.5 shrink-0"
                        aria-pressed={done}
                        aria-label={done ? `Mark "${m.title}" incomplete` : `Mark "${m.title}" complete`}
                      >
                        <Icon name={done ? 'check_circle' : 'radio_button_unchecked'} size={22} filled={done} className={done ? 'text-success' : 'text-on-surface-variant'} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-body-md font-semibold text-on-surface">
                          <span className="mr-2 font-mono text-code-sm text-on-surface-variant">{String(i + 1).padStart(2, '0')}</span>
                          {m.title}
                        </p>
                        {m.description && <p className="mt-1 font-body-sm text-on-surface-variant"><InlineMarkup text={m.description} /></p>}
                        <ul className="mt-3 space-y-1.5">
                          {m.tasks.map((t, j) => (
                            <li key={j} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                              <Icon name="chevron_right" size={15} className="mt-0.5 shrink-0" />
                              <InlineMarkup text={t} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="p-5">
            <SectionLabel className="mb-3">Completion criteria</SectionLabel>
            <ul className="space-y-2">
              {project.completionCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 font-body-sm text-on-surface-variant">
                  <Icon name="verified" size={16} className="mt-0.5 shrink-0 text-primary-ink" />
                  <InlineMarkup text={c} />
                </li>
              ))}
            </ul>
          </Card>

          {project.testingChecklist?.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Verify it works</SectionLabel>
              <p className="mb-3 font-body-sm text-on-surface-variant">
                Walk through these cases by hand — or write tests for them — before calling the
                project done.
              </p>
              <ul className="space-y-2">
                {project.testingChecklist.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 font-body-sm text-on-surface-variant">
                    <Icon name="fact_check" size={16} className="mt-0.5 shrink-0 text-on-surface-variant" />
                    <InlineMarkup text={t} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {project.starterFiles?.length > 0 && (
            <Disclosure title="Starter files" icon="description">
              <p className="mb-3 font-body-sm text-on-surface-variant">
                Copy these into your own project as a starting point. They set up structure, not
                the solution.
              </p>
              <div className="space-y-3">
                {project.starterFiles.map((f, i) => (
                  <div key={i}>
                    <p className="mb-1.5 font-mono text-code-sm text-on-surface-variant">{f.filename}</p>
                    <div className="overflow-hidden rounded border border-outline-variant px-4 py-3">
                      <HighlightedCode code={f.code} showLineNumbers />
                    </div>
                  </div>
                ))}
              </div>
            </Disclosure>
          )}

          {project.reflectionQuestions?.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Reflect</SectionLabel>
              <ul className="space-y-2.5">
                {project.reflectionQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5 font-body-sm italic text-on-surface-variant">
                    <Icon name="psychology" size={16} className="mt-0.5 shrink-0" />
                    <InlineMarkup text={q} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {project.solutionNotes && (
            <div>
              {showSolutionNotes ? (
                <Disclosure title="Implementation notes" icon="key" defaultOpen>
                  <p className="font-body-sm leading-7 text-on-surface-variant"><InlineMarkup text={project.solutionNotes} /></p>
                </Disclosure>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSolutionNotes(true)}
                  className="font-body-sm text-on-surface-variant underline underline-offset-2 hover:text-on-surface"
                >
                  Show implementation notes (after you&rsquo;ve built it)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <SectionLabel className="mb-3">Learning objectives</SectionLabel>
            <ul className="space-y-2">
              {project.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-primary-ink" />
                  <InlineMarkup text={o} />
                </li>
              ))}
            </ul>
          </Card>

          {project.relatedLessons?.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Relevant lessons</SectionLabel>
              <div className="space-y-2">
                {project.relatedLessons.map((id) => {
                  const lesson = lessonById[id];
                  if (!lesson) return null;
                  const module = moduleById[lesson.moduleId];
                  if (!module) return null;
                  return (
                    <Link key={id} to={`/learn/${module.slug}/${lesson.slug}`} className="block font-body-sm text-on-surface-variant transition hover:text-on-surface">
                      <Icon name="article" size={14} className="mr-1.5 inline" />{lesson.title}
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

          {project.relatedChallenges?.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Warm up with</SectionLabel>
              <div className="space-y-2">
                {project.relatedChallenges.map((id) => {
                  const challenge = challengeById[id];
                  if (!challenge) return null;
                  return (
                    <Link key={id} to={`/challenges/${challenge.slug}`} className="block font-body-sm text-on-surface-variant transition hover:text-on-surface">
                      <Icon name="trophy" size={14} className="mr-1.5 inline" />{challenge.title}
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <SectionLabel className="mb-3">Stuck?</SectionLabel>
            <p className="mb-3 font-body-sm text-on-surface-variant">
              Hints reveal one at a time. Try for a while first — the struggle is where the learning
              happens.
            </p>
            {hints < project.hints.length ? (
              <Button variant="secondary" size="sm" onClick={() => setHints((n) => n + 1)} icon="lightbulb" className="w-full">
                {hints === 0 ? 'Reveal first hint' : 'Next hint'}
              </Button>
            ) : (
              <p className="font-body-sm text-on-surface-variant">All hints revealed.</p>
            )}
            {hints > 0 && (
              <div className="mt-3 space-y-2">
                {project.hints.slice(0, hints).map((h, i) => (
                  <p key={i} className="rounded border border-warning/30 bg-warning/5 px-3 py-2 font-body-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface">Hint {i + 1}. </span><InlineMarkup text={h} />
                  </p>
                ))}
              </div>
            )}
          </Card>

          <Disclosure title="Stretch goals" icon="rocket_launch">
            <ul className="space-y-2">
              {project.stretchGoals.map((g, i) => (
                <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="add" size={15} className="mt-0.5 shrink-0" /><InlineMarkup text={g} />
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      </div>
    </div>
  );
}
