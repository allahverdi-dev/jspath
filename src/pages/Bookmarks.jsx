import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, EmptyState, Tabs } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useState } from 'react';
import { useT } from '../i18n/index.jsx';

const KIND_ICON = { lesson: 'article', exercise: 'fitness_center', challenge: 'trophy', project: 'folder_special', reference: 'menu_book', cheatsheet: 'description', interview: 'record_voice_over' };

/* Bookmark kinds are stored tokens; only the chip wording is per-language. */
const KIND_KEY = {
  lesson: 'contentKind.lesson',
  exercise: 'contentKind.exercise',
  challenge: 'contentKind.challenge',
  project: 'contentKind.project',
  reference: 'contentKind.reference',
  cheatsheet: 'contentKind.cheatsheet',
  interview: 'contentKind.interview',
  module: 'contentKind.module',
};

export default function Bookmarks() {
  const t = useT();
  const { state, actions } = useUserState();
  const [kind, setKind] = useState('all');

  const items = useMemo(
    () => Object.values(state.bookmarks).sort((a, b) => (a.at < b.at ? 1 : -1)),
    [state.bookmarks],
  );
  const kinds = useMemo(() => [...new Set(items.map((i) => i.kind))], [items]);
  const filtered = kind === 'all' ? items : items.filter((i) => i.kind === kind);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <h1 className="font-display text-display-lg text-on-surface">{t('bookmarks.title')}</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">{t('bookmarks.subtitle')}</p>

      {items.length > 0 && (
        <Tabs
          className="mt-6"
          tabs={[
            { value: 'all', label: t('common.all'), count: items.length },
            ...kinds.map((k) => ({
              value: k,
              label: KIND_KEY[k] ? t(KIND_KEY[k]) : k,
              count: items.filter((i) => i.kind === k).length,
            })),
          ]}
          value={kind}
          onChange={setKind}
        />
      )}

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon="bookmark_border"
            title={t('bookmarks.empty')}
            message={t('bookmarks.emptyBody')}
            action={<Button to="/curriculum" icon="school">{t('learning.browseCurriculum')}</Button>}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <Card key={`${item.kind}:${item.refId}`} className="flex items-center gap-3 p-4">
                <Icon name={KIND_ICON[item.kind] ?? 'bookmark'} size={18} className="shrink-0 text-on-surface-variant" />
                <Link to={item.to ?? '#'} className="min-w-0 flex-1 truncate font-body-md text-on-surface hover:text-primary-ink">
                  {item.title ?? item.refId}
                </Link>
                <Badge tone="neutral">{KIND_KEY[item.kind] ? t(KIND_KEY[item.kind]) : item.kind}</Badge>
                <button
                  type="button"
                  onClick={() => actions.toggleBookmark(item.kind, item.refId)}
                  className="rounded p-1.5 text-on-surface-variant transition hover:text-error"
                  aria-label={t('bookmarks.removeNamed', { title: item.title ?? item.refId })}
                >
                  <Icon name="delete" size={17} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
