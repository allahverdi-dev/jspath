import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, Badge, EmptyState, Input, Tabs } from '../components/ui/index.jsx';
import { cheatSheets } from '../content/registry.js';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';

export default function CheatSheets() {
  const { canAccessContent } = useEntitlements();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(
    () => [...new Set(cheatSheets.map((cs) => cs.category))].sort(),
    [],
  );

  const filtered = useMemo(
    () => cheatSheets.filter((cs) => {
      const q = query.trim().toLowerCase();
      const haystack = `${cs.title} ${(cs.aliases ?? []).join(' ')} ${cs.description}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (category !== 'all' && cs.category !== category) return false;
      return true;
    }),
    [category, query],
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">Cheat Sheets</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            Dense, scannable references for revision and quick lookup — built for the day before an
            interview.
          </p>
        </div>
        <Input
          icon="search"
          placeholder="Search cheat sheets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:w-72"
          aria-label="Search cheat sheets"
        />
      </div>

      {cheatSheets.length > 0 && (
        <Tabs
          tabs={[{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c, label: c }))]}
          value={category}
          onChange={setCategory}
          className="mb-6"
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={cheatSheets.length === 0 ? 'hourglass_empty' : 'search_off'}
          title={cheatSheets.length === 0 ? 'No cheat sheets in this build' : 'Nothing matches'}
          message={cheatSheets.length === 0 ? 'The cheat sheets have not been authored yet in this build.' : 'Try a different search term.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cs) => (
            <Card key={cs.id} as={Link} to={`/cheat-sheets/${cs.slug}`} interactive className="flex flex-col p-5">
              <Icon name={cs.icon} size={22} className="text-primary-ink" />
              <p className="mt-3 font-heading text-title-md text-on-surface">{cs.title}</p>
              <p className="mt-1.5 flex-1 font-body-sm text-on-surface-variant"><InlineMarkup text={cs.description} /></p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="neutral">{cs.category}</Badge>
                <Badge tone="neutral">{cs.entryCount} entries</Badge>
                {!canAccessContent('cheatsheet', cs.id) && <Badge tone="primary" icon="lock">Pro</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
