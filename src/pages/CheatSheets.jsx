import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, Badge, EmptyState, Input, Tabs } from '../components/ui/index.jsx';
import { cheatSheets } from '../content/registry.js';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { useT } from '../i18n/index.jsx';

export default function CheatSheets() {
  const { canAccessContent } = useEntitlements();
  const t = useT();
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
          <h1 className="font-display text-display-lg text-on-surface">{t('cheatSheets.title')}</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {t('cheatSheets.subtitle')}
          </p>
        </div>
        <Input
          icon="search"
          placeholder={t('cheatSheets.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:w-72"
          aria-label={t('cheatSheets.searchLabel')}
        />
      </div>

      {cheatSheets.length > 0 && (
        <Tabs
          tabs={[{ value: 'all', label: t('common.all') }, ...categories.map((c) => ({ value: c, label: c }))]}
          value={category}
          onChange={setCategory}
          className="mb-6"
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={cheatSheets.length === 0 ? 'hourglass_empty' : 'search_off'}
          title={cheatSheets.length === 0 ? t('cheatSheets.noneInBuild') : t('reference.nothingMatches')}
          message={cheatSheets.length === 0 ? t('cheatSheets.noneInBuildBody') : t('reference.tryDifferentSearch')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cs) => (
            <Card key={cs.id} as={Link} to={`/cheat-sheets/${cs.slug}`} interactive className="flex flex-col p-5">
              <Icon name={cs.icon} size={22} className="text-primary-ink" />
              <p className="mt-3 font-heading text-title-md text-on-surface"><Authored>{cs.title}</Authored></p>
              <p className="mt-1.5 flex-1 font-body-sm text-on-surface-variant"><InlineMarkup text={cs.description} /></p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="neutral"><Authored>{cs.category}</Authored></Badge>
                <Badge tone="neutral">{t('cheatSheets.entryCount', { count: cs.entryCount })}</Badge>
                {!canAccessContent('cheatsheet', cs.id) && <Badge tone="primary" icon="lock">{t('common.pro')}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
