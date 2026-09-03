import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, DifficultyBadge, Tabs, EmptyState, Input, SectionLabel } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { challenges as allChallenges, contentIndex } from '../content/registry.js';
import { dailyChallenge } from '../features/progress/recommendations.js';
import { DIFFICULTY_ORDER, DIFFICULTY_KEY } from '../content/schema/types.js';
import { useT } from '../i18n/index.jsx';
import { ContentAccessBadge } from '../components/billing/ContentAccessBadge.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';

export default function Challenges() {
  const { state } = useUserState();
  const t = useT();
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => [...new Set(allChallenges.map((c) => c.category))].sort(), []);
  const daily = useMemo(() => dailyChallenge(contentIndex.challenges), []);

  const filtered = useMemo(
    () => allChallenges.filter((c) => {
      const q = query.trim().toLowerCase();
      if (q && !`${c.title} ${c.prompt}`.toLowerCase().includes(q)) return false;
      if (difficulty !== 'all' && c.difficulty !== difficulty) return false;
      if (category !== 'all' && c.category !== category) return false;
      return true;
    }),
    [difficulty, category, query],
  );

  const solved = allChallenges.filter((c) => state.challenges[c.id]?.solved).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">{t('challenges.title')}</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {t('challenges.subtitle', { solved, total: allChallenges.length })}
          </p>
        </div>
        <Input
          icon="search"
          placeholder={t('challenges.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:w-64"
          aria-label={t('challenges.searchLabel')}
        />
      </div>

      {daily && (
        <Card className="mb-6 flex flex-wrap items-center gap-4 border-primary/30 bg-primary/5 p-5">
          <Icon name="calendar_today" size={22} className="text-primary-ink" />
          <div className="min-w-0 flex-1">
            <SectionLabel>{t('challenges.todaysChallenge')}</SectionLabel>
            <p className="mt-1 font-heading text-title-md text-on-surface"><Authored>{daily.title}</Authored></p>
          </div>
          <ContentAccessBadge kind="challenge" id={daily.id} />
          <Button to={`/challenges/${daily.slug}`} iconRight="arrow_forward">{t('common.start')}</Button>
        </Card>
      )}

      <div className="mb-4 space-y-3">
        <Tabs
          tabs={[
            { value: 'all', label: t('practice.allLevels') },
            ...DIFFICULTY_ORDER.map((d) => ({ value: d, label: t(DIFFICULTY_KEY[d]) })),
          ]}
          value={difficulty}
          onChange={setDifficulty}
        />
        <Tabs
          tabs={[{ value: 'all', label: t('practice.allTopics') }, ...categories.map((c) => ({ value: c, label: c }))]}
          value={category}
          onChange={setCategory}
          size="sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={allChallenges.length === 0 ? 'hourglass_empty' : 'filter_alt_off'}
          title={allChallenges.length === 0 ? t('challenges.noneInBuild') : t('challenges.noneMatch')}
          message={allChallenges.length === 0 ? t('challenges.noneInBuildBody') : t('practice.tryWidening')}
          action={allChallenges.length > 0 ? <Button variant="secondary" onClick={() => { setDifficulty('all'); setCategory('all'); setQuery(''); }}>{t('common.clearFilters')}</Button> : null}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const record = state.challenges[c.id];
            return (
              <Card key={c.id} as={Link} to={`/challenges/${c.slug}`} interactive className="flex flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <DifficultyBadge difficulty={c.difficulty} />
                  <span className="flex items-center gap-2">
                    <ContentAccessBadge kind="challenge" id={c.id} />
                    {record?.solved && <Icon name="check_circle" size={18} className="text-success" filled />}
                  </span>
                </div>
                <p className="font-body-md font-semibold text-on-surface"><Authored>{c.title}</Authored></p>
                <p className="mt-1.5 line-clamp-3 flex-1 font-body-sm text-on-surface-variant"><InlineMarkup text={c.prompt} /></p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge tone="neutral"><Authored>{c.category}</Authored></Badge>
                  <Badge tone="primary">{t('common.xpPlus', { count: c.xp })}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
