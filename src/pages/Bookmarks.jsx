import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, EmptyState, Tabs } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useState } from 'react';

const KIND_ICON = { lesson: 'article', exercise: 'fitness_center', challenge: 'trophy', project: 'folder_special', reference: 'menu_book', cheatsheet: 'description', interview: 'record_voice_over' };

export default function Bookmarks() {
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
      <h1 className="font-display text-display-lg text-on-surface">Bookmarks</h1>
      <p className="mt-2 font-body-lg text-on-surface-variant">Everything you saved for later.</p>

      {items.length > 0 && (
        <Tabs
          className="mt-6"
          tabs={[{ value: 'all', label: 'All', count: items.length }, ...kinds.map((k) => ({ value: k, label: k, count: items.filter((i) => i.kind === k).length }))]}
          value={kind}
          onChange={setKind}
        />
      )}

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon="bookmark_border"
            title="No bookmarks yet"
            message="Use the bookmark icon on any lesson, reference entry or interview question to save it here."
            action={<Button to="/curriculum" icon="school">Browse the curriculum</Button>}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <Card key={`${item.kind}:${item.refId}`} className="flex items-center gap-3 p-4">
                <Icon name={KIND_ICON[item.kind] ?? 'bookmark'} size={18} className="shrink-0 text-on-surface-variant" />
                <Link to={item.to ?? '#'} className="min-w-0 flex-1 truncate font-body-md text-on-surface hover:text-primary-ink">
                  {item.title ?? item.refId}
                </Link>
                <Badge tone="neutral">{item.kind}</Badge>
                <button
                  type="button"
                  onClick={() => actions.toggleBookmark(item.kind, item.refId)}
                  className="rounded p-1.5 text-on-surface-variant transition hover:text-error"
                  aria-label={`Remove bookmark for ${item.title ?? item.refId}`}
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
