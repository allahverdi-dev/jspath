import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, DifficultyBadge, Tabs, EmptyState, Input, SectionLabel } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { challenges as allChallenges, contentIndex } from '../content/registry.js';
import { dailyChallenge } from '../features/progress/recommendations.js';
import { DIFFICULTY_ORDER } from '../content/schema/types.js';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { FEATURE } from '../features/billing/plans.js';

export default function Challenges() {
  const { state } = useUserState();
  const { hasFeature } = useEntitlements();
  const challengesUnlocked = hasFeature(FEATURE.CHALLENGES);
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
          <h1 className="font-display text-display-lg text-on-surface">Challenges</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            Self-contained problems with executable tests. {solved} of {allChallenges.length} solved.
          </p>
        </div>
        <Input icon="search" placeholder="Search challenges…" value={query} onChange={(e) => setQuery(e.target.value)} className="lg:w-64" aria-label="Search challenges" />
      </div>

      {daily && (
        <Card className="mb-6 flex flex-wrap items-center gap-4 border-primary/30 bg-primary/5 p-5">
          <Icon name="calendar_today" size={22} className="text-primary-ink" />
          <div className="min-w-0 flex-1">
            <SectionLabel>Today’s challenge</SectionLabel>
            <p className="mt-1 font-heading text-title-md text-on-surface">{daily.title}</p>
          </div>
          <Button to={`/challenges/${daily.slug}`} iconRight="arrow_forward">Start</Button>
        </Card>
      )}

      <div className="mb-4 space-y-3">
        <Tabs
          tabs={[{ value: 'all', label: 'All levels' }, ...DIFFICULTY_ORDER.map((d) => ({ value: d, label: d }))]}
          value={difficulty}
          onChange={setDifficulty}
        />
        <Tabs
          tabs={[{ value: 'all', label: 'All topics' }, ...categories.map((c) => ({ value: c, label: c }))]}
          value={category}
          onChange={setCategory}
          size="sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={allChallenges.length === 0 ? 'hourglass_empty' : 'filter_alt_off'}
          title={allChallenges.length === 0 ? 'No challenges in this build' : 'No challenges match'}
          message={allChallenges.length === 0 ? 'The challenge library has not been authored yet in this build.' : 'Try widening your filters.'}
          action={allChallenges.length > 0 ? <Button variant="secondary" onClick={() => { setDifficulty('all'); setCategory('all'); setQuery(''); }}>Clear filters</Button> : null}
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
                    {!challengesUnlocked && <Badge tone="primary" icon="lock">Pro</Badge>}
                    {record?.solved && <Icon name="check_circle" size={18} className="text-success" filled />}
                  </span>
                </div>
                <p className="font-body-md font-semibold text-on-surface">{c.title}</p>
                <p className="mt-1.5 line-clamp-3 flex-1 font-body-sm text-on-surface-variant">{c.prompt}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge tone="neutral">{c.category}</Badge>
                  <Badge tone="primary">+{c.xp} XP</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
