import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { search, groupResults, KIND_KEY } from '../features/search/searchIndex.js';
import { Card, Icon, Badge, Input, EmptyState, Tabs } from '../components/ui/index.jsx';
import { contentStats } from '../content/registry.js';
import { ContentAccessBadge } from '../components/billing/ContentAccessBadge.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { useT } from '../i18n/index.jsx';
import { DIFFICULTY_KEY } from '../content/schema/types.js';

export default function SearchPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [kind, setKind] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setParams(query ? { q: query } : {}, { replace: true }), 400);
    return () => clearTimeout(timer);
  }, [query, setParams]);

  const results = useMemo(() => (query.trim().length >= 2 ? search(query, { limit: 100 }) : []), [query]);
  const groups = useMemo(() => groupResults(results), [results]);
  const visible = kind === 'all' ? groups : groups.filter((g) => g.kind === kind);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">{t('search.title')}</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">
        {t('search.subtitle', { lessons: contentStats.lessons, exercises: contentStats.exercises })}
      </p>

      <Input
        icon="search"
        className="mt-6"
        placeholder={t('search.pagePlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t('search.title')}
        autoFocus
      />

      {groups.length > 0 && (
        <Tabs
          className="mt-5"
          tabs={[
            { value: 'all', label: t('common.all'), count: results.length },
            ...groups.map((g) => ({ value: g.kind, label: t(KIND_KEY[g.kind]), count: g.items.length })),
          ]}
          value={kind}
          onChange={setKind}
        />
      )}

      <div className="mt-6 space-y-8">
        {query.trim().length < 2 ? (
          <p className="font-body-sm text-on-surface-variant">{t('search.typeAtLeast')}</p>
        ) : results.length === 0 ? (
          <EmptyState
            icon="search_off"
            title={t('search.noResults', { query })}
            message={t('search.noResultsHint')}
          />
        ) : (
          visible.map((group) => (
            <section key={group.kind}>
              <h2 className="mb-3 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                {t(KIND_KEY[group.kind])}
              </h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <Card key={`${item.kind}-${item.id}`} as={Link} to={item.to} interactive className="flex items-start gap-3 p-4">
                    <Icon name={item.icon} size={18} className="mt-0.5 shrink-0 text-on-surface-variant" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-body-md font-medium text-on-surface"><InlineMarkup text={item.title} /></span>
                        {item.difficulty && (
                          <Badge tone="neutral">
                            {DIFFICULTY_KEY[item.difficulty] ? t(DIFFICULTY_KEY[item.difficulty]) : item.difficulty}
                          </Badge>
                        )}
                        <ContentAccessBadge kind={item.kind} id={item.id} />
                      </span>
                      {item.description && <span className="mt-1 block line-clamp-2 font-body-sm text-on-surface-variant"><InlineMarkup text={item.description} /></span>}
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
