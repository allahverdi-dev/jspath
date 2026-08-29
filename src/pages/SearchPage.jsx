import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { search, groupResults, KIND_LABEL } from '../features/search/searchIndex.js';
import { Card, Icon, Badge, Input, EmptyState, Tabs } from '../components/ui/index.jsx';
import { contentStats } from '../content/registry.js';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [kind, setKind] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setParams(query ? { q: query } : {}, { replace: true }), 400);
    return () => clearTimeout(t);
  }, [query, setParams]);

  const results = useMemo(() => (query.trim().length >= 2 ? search(query, { limit: 100 }) : []), [query]);
  const groups = useMemo(() => groupResults(results), [results]);
  const visible = kind === 'all' ? groups : groups.filter((g) => g.kind === kind);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">Search</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">
        Across {contentStats.lessons} lessons, {contentStats.exercises} exercises and everything else.
      </p>

      <Input
        icon="search"
        className="mt-6"
        placeholder="Search lessons, methods, challenges…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search"
        autoFocus
      />

      {groups.length > 0 && (
        <Tabs
          className="mt-5"
          tabs={[{ value: 'all', label: 'All', count: results.length }, ...groups.map((g) => ({ value: g.kind, label: KIND_LABEL[g.kind], count: g.items.length }))]}
          value={kind}
          onChange={setKind}
        />
      )}

      <div className="mt-6 space-y-8">
        {query.trim().length < 2 ? (
          <p className="font-body-sm text-on-surface-variant">Type at least two characters to search.</p>
        ) : results.length === 0 ? (
          <EmptyState icon="search_off" title={`No results for “${query}”`} message="Try a method name like reduce, or a concept like closure." />
        ) : (
          visible.map((group) => (
            <section key={group.kind}>
              <h2 className="mb-3 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                {KIND_LABEL[group.kind]}
              </h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <Card key={`${item.kind}-${item.id}`} as={Link} to={item.to} interactive className="flex items-start gap-3 p-4">
                    <Icon name={item.icon} size={18} className="mt-0.5 shrink-0 text-on-surface-variant" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-body-md font-medium text-on-surface">{item.title}</span>
                        {item.difficulty && <Badge tone="neutral">{item.difficulty}</Badge>}
                      </span>
                      {item.description && <span className="mt-1 block line-clamp-2 font-body-sm text-on-surface-variant">{item.description}</span>}
                    </span>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
