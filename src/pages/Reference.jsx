import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Tabs, EmptyState, Input } from '../components/ui/index.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { references } from '../content/registry.js';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { useT } from '../i18n/index.jsx';

export default function Reference() {
  const { canAccessContent } = useEntitlements();
  const t = useT();
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
          <h1 className="font-display text-display-lg text-on-surface">{t('reference.title')}</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {t('reference.subtitle')}
          </p>
        </div>
        <Input
          icon="search"
          placeholder={t('reference.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:w-72"
          aria-label={t('reference.searchLabel')}
        />
      </div>

      {references.length > 0 && (
        <Tabs
          tabs={[{ value: 'all', label: t('common.all') }, ...categories.map((c) => ({ value: c, label: c }))]}
          value={category}
          onChange={setCategory}
          className="mb-6"
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={references.length === 0 ? 'hourglass_empty' : 'search_off'}
          title={references.length === 0 ? t('reference.noneInBuild') : t('reference.nothingMatches')}
          message={references.length === 0 ? t('reference.noneInBuildBody') : t('reference.tryDifferentSearch')}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} as={Link} to={`/reference/${r.slug}`} interactive className="flex flex-col p-4">
              <p className="font-mono text-code-md font-semibold text-primary-ink"><Authored>{r.name}</Authored></p>
              <p className="mt-1.5 flex-1 line-clamp-3 font-body-sm text-on-surface-variant"><InlineMarkup text={r.summary} /></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="neutral"><Authored>{r.category}</Authored></Badge>
                {r.environment !== 'ECMAScript' && <Badge tone="info"><Authored>{r.environment}</Authored></Badge>}
                {r.mutates && <Badge tone="warning" icon="edit">{t('reference.mutatesShort')}</Badge>}
                {!canAccessContent('reference', r.id) && <Badge tone="primary" icon="lock">{t('common.pro')}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
