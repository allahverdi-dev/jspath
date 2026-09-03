import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, Badge, DifficultyBadge, Tabs, EmptyState, ProgressBar } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { projects as allProjects } from '../content/registry.js';
import { DIFFICULTY_ORDER, DIFFICULTY_KEY } from '../content/schema/types.js';
import { useT } from '../i18n/index.jsx';
import { topicLabel } from '../content/topics.js';
import { ContentAccessBadge } from '../components/billing/ContentAccessBadge.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';

export default function Projects() {
  const { state } = useUserState();
  const t = useT();
  const [difficulty, setDifficulty] = useState('all');

  const filtered = useMemo(
    () => allProjects.filter((p) => difficulty === 'all' || p.difficulty === difficulty),
    [difficulty],
  );
  const completed = allProjects.filter((p) => state.projects[p.id]?.completedAt).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-display-lg text-on-surface">{t('projects.title')}</h1>
        <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
          {t('projects.subtitle', { completed, total: allProjects.length })}
        </p>
      </div>

      <Tabs
        tabs={[
          { value: 'all', label: t('common.all') },
          ...DIFFICULTY_ORDER.map((d) => ({ value: d, label: t(DIFFICULTY_KEY[d]) })),
        ]}
        value={difficulty}
        onChange={setDifficulty}
        className="mb-6"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={allProjects.length === 0 ? 'hourglass_empty' : 'filter_alt_off'}
          title={allProjects.length === 0 ? t('projects.noneInBuild') : t('projects.noneMatch')}
          message={allProjects.length === 0 ? t('projects.noneInBuildBody') : t('projects.tryAnotherDifficulty')}
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
                  <span className="flex items-center gap-2">
                    <ContentAccessBadge kind="project" id={p.id} />
                    {record?.completedAt && <Icon name="check_circle" size={18} className="text-success" filled />}
                  </span>
                </div>
                <p className="font-heading text-title-md text-on-surface"><Authored>{p.title}</Authored></p>
                <p className="mt-1.5 line-clamp-3 font-body-sm text-on-surface-variant"><InlineMarkup text={p.tagline} /></p>
                {p.topicIds?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {p.topicIds.slice(0, 3).map((id) => (
                      <span key={id} className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                        <Authored>{topicLabel(id)}</Authored>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex-1" />
                {record && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between font-mono text-code-sm text-on-surface-variant">
                      <span>{t('projects.milestoneProgress', { done, total: p.milestoneCount })}</span>
                      <span>{Math.round(ratio * 100)}%</span>
                    </div>
                    <ProgressBar value={ratio} label={t('projects.progressLabel', { title: p.title })} />
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Badge tone="neutral" icon="checklist">{t('projects.featureCount', { count: p.requirementCount })}</Badge>
                  {p.estimatedHours && <Badge tone="neutral" icon="schedule">{t('common.hoursShort', { count: p.estimatedHours })}</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
