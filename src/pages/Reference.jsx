import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Tabs, EmptyState, Input } from '../components/ui/index.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { references } from '../content/registry.js';
import { useEntitlements } from '../state/EntitlementProvider.jsx';

export default function Reference() {
  const { canAccessContent } = useEntitlements();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => [...new Set(references.map((r) => r.category))].sort(), []);
  const filtered = useMemo(
    () => references.filter((r) => {
      const q = query.trim().toLowerCase();
      const haystack = `${r.name} ${(r.aliases ?? []).join(' ')} ${r.summary} ${r.syntax}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (category !== 'all' && r.category !== category) return false;
      return true;
    }),
    [category, query],
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">JavaScript Reference</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            Precise API facts — signature, parameters, return value, whether it mutates. Lessons
            teach; this tells you exactly what something does.
          </p>
        </div>
        <Input icon="search" placeholder="Search the reference…" value={query} onChange={(e) => setQuery(e.target.value)} className="lg:w-72" aria-label="Search reference" />
      </div>

      {references.length > 0 && (
        <Tabs
          tabs={[{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c, label: c }))]}
          value={category}
          onChange={setCategory}
          className="mb-6"
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={references.length === 0 ? 'hourglass_empty' : 'search_off'}
          title={references.length === 0 ? 'No reference entries in this build' : 'Nothing matches'}
          message={references.length === 0 ? 'The reference has not been authored yet in this build.' : 'Try a different search term.'}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} as={Link} to={`/reference/${r.slug}`} interactive className="flex flex-col p-4">
              <p className="font-mono text-code-md font-semibold text-primary-ink">{r.name}</p>
              <p className="mt-1.5 flex-1 line-clamp-3 font-body-sm text-on-surface-variant"><InlineMarkup text={r.summary} /></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="neutral">{r.category}</Badge>
                {r.environment !== 'ECMAScript' && <Badge tone="info">{r.environment}</Badge>}
                {r.mutates && <Badge tone="warning" icon="edit">mutates</Badge>}
                {!canAccessContent('reference', r.id) && <Badge tone="primary" icon="lock">Pro</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
