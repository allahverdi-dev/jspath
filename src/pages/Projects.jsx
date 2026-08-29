import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, Badge, DifficultyBadge, Tabs, EmptyState, ProgressBar } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { projects as allProjects } from '../content/registry.js';
import { DIFFICULTY_ORDER } from '../content/schema/types.js';
import { topicLabel } from '../content/topics.js';

export default function Projects() {
  const { state } = useUserState();
  const [difficulty, setDifficulty] = useState('all');

  const filtered = useMemo(
    () => allProjects.filter((p) => difficulty === 'all' || p.difficulty === difficulty),
    [difficulty],
  );
  const completed = allProjects.filter((p) => state.projects[p.id]?.completedAt).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-display-lg text-on-surface">Projects</h1>
        <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
          Guided builds with briefs, milestones and progressive hints — never a finished solution
          handed to you up front. {completed} of {allProjects.length} completed.
        </p>
      </div>

      <Tabs
        tabs={[{ value: 'all', label: 'All' }, ...DIFFICULTY_ORDER.map((d) => ({ value: d, label: d }))]}
        value={difficulty}
        onChange={setDifficulty}
        className="mb-6"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={allProjects.length === 0 ? 'hourglass_empty' : 'filter_alt_off'}
          title={allProjects.length === 0 ? 'No projects in this build' : 'No projects match'}
          message={allProjects.length === 0 ? 'The project library has not been authored yet in this build.' : 'Try another difficulty.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const record = state.projects[p.id];
            const done = Object.values(record?.milestones ?? {}).filter(Boolean).length;
            const ratio = p.milestoneCount ? done / p.milestoneCount : 0;
            return (
              <Card key={p.id} as={Link} to={`/projects/${p.slug}`} interactive className="flex flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <DifficultyBadge difficulty={p.difficulty} />
                  {record?.completedAt && <Icon name="check_circle" size={18} className="text-success" filled />}
                </div>
                <p className="font-heading text-title-md text-on-surface">{p.title}</p>
                <p className="mt-1.5 line-clamp-3 font-body-sm text-on-surface-variant">{p.tagline}</p>
                {p.topicIds?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {p.topicIds.slice(0, 3).map((t) => (
                      <span key={t} className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                        {topicLabel(t)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex-1" />
                {record && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between font-mono text-code-sm text-on-surface-variant">
                      <span>{done}/{p.milestoneCount} milestones</span>
                      <span>{Math.round(ratio * 100)}%</span>
                    </div>
                    <ProgressBar value={ratio} label={`${p.title} progress`} />
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Badge tone="neutral" icon="checklist">{p.requirementCount} features</Badge>
                  {p.estimatedHours && <Badge tone="neutral" icon="schedule">{p.estimatedHours}h</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
