import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, Button, Icon, Badge, DifficultyBadge, ProgressBar, ProgressRing, Tabs, Input,
  SectionLabel, EmptyState, cx,
} from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useT } from '../i18n/index.jsx';
import { contentIndex, lessonsByModule, contentStats } from '../content/registry.js';
import { moduleProgress, curriculumProgress } from '../features/progress/progressEngine.js';
import { overallMastery, rankKeyFor } from '../features/mastery/masteryEngine.js';
import { TRACK_KEY } from '../content/schema/types.js';
import { Authored } from '../components/learning/Authored.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';

/* The filter values are stable tokens; only their labels are per-language. */
const FILTERS = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'in-progress', labelKey: 'learning.filterInProgress' },
  { value: 'completed', labelKey: 'learning.filterCompleted' },
  { value: 'not-started', labelKey: 'learning.filterNotStarted' },
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
  const t = useT();
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
          <h1 className="font-display text-display-lg text-on-surface">{t('learning.curriculum')}</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {t('learning.curriculumSummary', {
              modules: contentStats.modules,
              lessons: contentStats.lessons,
              hours: Math.round(contentStats.totalMinutes / 60),
            })}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Input
            icon="search"
            placeholder={t('learning.searchModulesPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:w-56"
            aria-label={t('learning.searchModules')}
          />
        </div>
      </div>

      <Tabs
        tabs={FILTERS.map((f) => ({ value: f.value, label: t(f.labelKey), count: counts[f.value] }))}
        value={filter}
        onChange={setFilter}
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {modules.length === 0 ? (
            <EmptyState
              icon="filter_alt_off"
              title={t('learning.noModulesMatch')}
              message={t('learning.noModulesMatchBody')}
              action={(
                <Button variant="secondary" onClick={() => { setFilter('all'); setQuery(''); }}>
                  {t('common.clearFilters')}
                </Button>
              )}
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
                            <Badge tone="neutral">{t(TRACK_KEY[module.track] ?? 'track.core')}</Badge>
                            {!moduleUnlocked && <Badge tone="primary" icon="lock">{t('common.pro')}</Badge>}
                          </div>
                          <h2 className="font-heading text-title-md text-on-surface">
                            <Link to={`/curriculum/${module.slug}`} className="hover:text-primary-ink">
                              <Authored>{module.title}</Authored>
                            </Link>
                          </h2>
                          <p className="mt-1.5 max-w-2xl font-body-sm text-on-surface-variant"><Authored>{module.description}</Authored></p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-right">
                            <p className="font-mono text-code-md text-on-surface">
                              {p.completed}/{p.total}
                            </p>
                            <SectionLabel>{t('learning.lessons')}</SectionLabel>
                          </div>
                          {p.complete && <Icon name="check_circle" size={22} className="text-success" filled />}
                        </div>
                      </div>

                      {p.started && (
                        <ProgressBar
                          value={p.ratio}
                          className="mt-4"
                          label={t('learning.moduleProgressLabel', { module: module.title })}
                        />
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          to={`/curriculum/${module.slug}`}
                          variant={p.started ? 'secondary' : 'primary'}
                          size="sm"
                          iconRight="arrow_forward"
                        >
                          {p.complete
                            ? t('learning.reviewModule')
                            : p.started
                              ? t('common.continue')
                              : t('learning.startModule')}
                        </Button>
                        {lessons.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(isOpen ? null : module.id)}
                            icon={isOpen ? 'expand_less' : 'expand_more'}
                            aria-expanded={isOpen}
                          >
                            {isOpen
                              ? t('learning.hideLessons')
                              : t('learning.showLessons', { count: lessons.length })}
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
                                    <Authored>{lesson.title}</Authored>
                                  </span>
                                  {!lessonUnlocked && <Badge tone="primary" icon="lock">{t('common.pro')}</Badge>}
                                  <span className="shrink-0 font-mono text-code-sm text-on-surface-variant">
                                    {t('common.minutesShort', { count: lesson.estimatedMinutes })}
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
              <h3 className="font-heading text-title-md text-on-surface">{t('learning.yourProgress')}</h3>
              <ProgressRing value={progress.ratio} size={128} stroke={6} className="mx-auto mt-5">
                <span className="font-heading text-headline-md text-on-surface">
                  {Math.round(progress.ratio * 100)}%
                </span>
              </ProgressRing>

              <div className="mt-6 space-y-3 text-left">
                {[
                  ['learning.modulesCompleted', `${progress.modulesComplete}/${progress.modules}`],
                  ['learning.lessonsCompleted', `${progress.completed}/${progress.lessons}`],
                  ['learning.topicsMastered', `${mastery.mastered}/${mastery.total}`],
                  ['learning.rank', t(rankKeyFor(mastery.score))],
                ].map(([labelKey, value]) => (
                  <div key={labelKey} className="flex items-center justify-between font-body-sm">
                    <span className="text-on-surface-variant">{t(labelKey)}</span>
                    <span className="font-mono text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <p className="font-body-sm text-on-surface-variant">
                {t('learning.nothingLocked')}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
