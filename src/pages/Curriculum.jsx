import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, Button, Icon, Badge, DifficultyBadge, ProgressBar, ProgressRing, Tabs, Input,
  SectionLabel, EmptyState, cx,
} from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { contentIndex, lessonsByModule, contentStats } from '../content/registry.js';
import { moduleProgress, curriculumProgress } from '../features/progress/progressEngine.js';
import { overallMastery, rankFor } from '../features/mastery/masteryEngine.js';
import { TRACK_LABEL } from '../content/schema/types.js';
import { useEntitlements } from '../state/EntitlementProvider.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'not-started', label: 'Not started' },
];

/**
 * The curriculum screen.
 *
 * Every count shown here is derived from the actual content — a module reporting
 * "14 lessons" has fourteen real lessons behind it. Modules are ordered as a
 * recommended path, while explicit access tags determine any Pro content.
 */
export default function Curriculum() {
  const { state } = useUserState();
  const { canAccessContent } = useEntitlements();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);

  const progress = useMemo(() => curriculumProgress(state, contentIndex.modules), [state]);
  const mastery = useMemo(() => overallMastery(state, contentIndex.topics, contentIndex), [state]);

  const modules = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contentIndex.modules
      .map((m) => ({ ...m, progress: moduleProgress(state, m) }))
      .filter((m) => {
        if (q && !`${m.title} ${m.description} ${m.shortTitle}`.toLowerCase().includes(q)) return false;
        if (filter === 'in-progress') return m.progress.started && !m.progress.complete;
        if (filter === 'completed') return m.progress.complete;
        if (filter === 'not-started') return !m.progress.started;
        return true;
      });
  }, [state, filter, query]);

  const counts = useMemo(() => {
    const withProgress = contentIndex.modules.map((m) => moduleProgress(state, m));
    return {
      all: withProgress.length,
      'in-progress': withProgress.filter((p) => p.started && !p.complete).length,
      completed: withProgress.filter((p) => p.complete).length,
      'not-started': withProgress.filter((p) => !p.started).length,
    };
  }, [state]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">Curriculum</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {contentStats.modules} modules, {contentStats.lessons} lessons and{' '}
            {Math.round(contentStats.totalMinutes / 60)} hours of material — from your first line of
            code to professional JavaScript.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Input
            icon="search"
            placeholder="Search modules…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:w-56"
            aria-label="Search modules"
          />
        </div>
      </div>

      <Tabs
        tabs={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
        value={filter}
        onChange={setFilter}
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {modules.length === 0 ? (
            <EmptyState
              icon="filter_alt_off"
              title="No modules match"
              message="Try a different filter or clear your search."
              action={<Button variant="secondary" onClick={() => { setFilter('all'); setQuery(''); }}>Clear filters</Button>}
            />
          ) : (
            modules.map((module) => {
              const lessons = lessonsByModule[module.id] ?? [];
              const isOpen = expanded === module.id;
              const p = module.progress;
              const moduleUnlocked = canAccessContent('module', module.id);

              return (
                <Card key={module.id} className="overflow-hidden">
                  {/* Track accent stripe */}
                  <div className="flex">
                    <div className={cx('w-1 shrink-0', p.complete ? 'bg-success' : p.started ? 'bg-primary' : 'bg-outline-variant')} />
                    <div className="min-w-0 flex-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-code-sm text-on-surface-variant">
                              {String(module.order).padStart(2, '0')}
                            </span>
                            <DifficultyBadge difficulty={module.difficulty} />
                            <Badge tone="neutral">{TRACK_LABEL[module.track]}</Badge>
                            {!moduleUnlocked && <Badge tone="primary" icon="lock">Pro</Badge>}
                          </div>
                          <h2 className="font-heading text-title-md text-on-surface">
                            <Link to={`/curriculum/${module.slug}`} className="hover:text-primary-ink">
                              {module.title}
                            </Link>
                          </h2>
                          <p className="mt-1.5 max-w-2xl font-body-sm text-on-surface-variant">{module.description}</p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-right">
                            <p className="font-mono text-code-md text-on-surface">
                              {p.completed}/{p.total}
                            </p>
                            <SectionLabel>Lessons</SectionLabel>
                          </div>
                          {p.complete && <Icon name="check_circle" size={22} className="text-success" filled />}
                        </div>
                      </div>

                      {p.started && <ProgressBar value={p.ratio} className="mt-4" label={`${module.title} progress`} />}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          to={`/curriculum/${module.slug}`}
                          variant={p.started ? 'secondary' : 'primary'}
                          size="sm"
                          iconRight="arrow_forward"
                        >
                          {p.complete ? 'Review module' : p.started ? 'Continue' : 'Start module'}
                        </Button>
                        {lessons.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(isOpen ? null : module.id)}
                            icon={isOpen ? 'expand_less' : 'expand_more'}
                            aria-expanded={isOpen}
                          >
                            {isOpen ? 'Hide lessons' : `Show ${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`}
                          </Button>
                        )}
                      </div>

                      {isOpen && (
                        <ul className="mt-4 space-y-0.5 border-t border-outline-variant pt-3">
                          {lessons.map((lesson, i) => {
                            const done = Boolean(state.lessons[lesson.id]?.completedAt);
                            const visited = Boolean(state.lessons[lesson.id]?.lastVisitedAt);
                            const lessonUnlocked = canAccessContent('lesson', lesson.id);
                            return (
                              <li key={lesson.id}>
                                <Link
                                  to={`/learn/${module.slug}/${lesson.slug}`}
                                  className="flex items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-surface-container"
                                >
                                  <Icon
                                    name={done ? 'check_circle' : visited ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    size={18}
                                    filled={done}
                                    className={done ? 'text-success' : 'text-on-surface-variant'}
                                  />
                                  <span className="min-w-0 flex-1 truncate font-body-sm text-on-surface">
                                    <span className="mr-2 font-mono text-code-sm text-on-surface-variant">
                                      {String(i + 1).padStart(2, '0')}
                                    </span>
                                    {lesson.title}
                                  </span>
                                  {!lessonUnlocked && <Badge tone="primary" icon="lock">Pro</Badge>}
                                  <span className="shrink-0 font-mono text-code-sm text-on-surface-variant">
                                    {lesson.estimatedMinutes}m
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Progress rail */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card className="p-6 text-center">
              <h3 className="font-heading text-title-md text-on-surface">Your progress</h3>
              <ProgressRing value={progress.ratio} size={128} stroke={6} className="mx-auto mt-5">
                <span className="font-heading text-headline-md text-on-surface">
                  {Math.round(progress.ratio * 100)}%
                </span>
              </ProgressRing>

              <div className="mt-6 space-y-3 text-left">
                {[
                  ['Modules completed', `${progress.modulesComplete}/${progress.modules}`],
                  ['Lessons completed', `${progress.completed}/${progress.lessons}`],
                  ['Topics mastered', `${mastery.mastered}/${mastery.total}`],
                  ['Rank', rankFor(mastery.score)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between font-body-sm">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-mono text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <p className="font-body-sm text-on-surface-variant">
                Nothing here is locked. The order is a recommended path, but you can open any module
                at any time — and if you already know a topic, skip ahead.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
