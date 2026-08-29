import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { search, groupResults, KIND_LABEL } from './searchIndex.js';
import { Icon, Badge, cx } from '../../components/ui/index.jsx';
import { contentStats } from '../../content/registry.js';

const QUICK_LINKS = [
  { label: 'Curriculum', to: '/curriculum', icon: 'school' },
  { label: 'Practice Hub', to: '/practice', icon: 'fitness_center' },
  { label: 'Playground', to: '/playground', icon: 'terminal' },
  { label: 'Interview Prep', to: '/interview', icon: 'record_voice_over' },
  { label: 'Cheat Sheets', to: '/cheat-sheets', icon: 'description' },
];

/**
 * ⌘K command palette.
 *
 * Fully keyboard driven: arrows move, Enter opens, Escape closes. The active
 * option is linked with `aria-activedescendant` so screen readers follow the
 * selection without focus ever leaving the input.
 */
export function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => (query.trim().length >= 2 ? search(query, { limit: 24 }) : []), [query]);
  const groups = useMemo(() => groupResults(results), [results]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const go = (to) => {
    onClose();
    navigate(to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (flat.length === 0 ? 0 : (i + 1) % flat.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (flat.length === 0 ? 0 : (i - 1 + flat.length) % flat.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[active]) go(flat[active].to);
    }
  };

  let cursor = -1;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[10vh]">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high shadow-2xl animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label="Search JSPath"
      >
        <div className="flex items-center gap-3 border-b border-outline-variant px-4">
          <Icon name="search" size={20} className="text-on-surface-variant" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search lessons, methods, challenges, interview questions…"
            className="h-14 flex-1 bg-transparent font-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={flat[active] ? `search-option-${active}` : undefined}
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="hidden rounded border border-outline-variant px-1.5 py-0.5 font-mono text-code-sm text-on-surface-variant sm:inline">
            ESC
          </kbd>
        </div>

        <div ref={listRef} id="search-results" role="listbox" className="thin-scrollbar flex-1 overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <div className="p-2">
              <p className="px-2 pb-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                Jump to
              </p>
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => go(link.to)}
                  className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors hover:bg-surface-container"
                >
                  <Icon name={link.icon} size={18} className="text-on-surface-variant" />
                  <span className="font-body-sm text-on-surface">{link.label}</span>
                </button>
              ))}
              <p className="px-3 pt-4 font-body-sm text-on-surface-variant">
                Searching {contentStats.lessons} lessons, {contentStats.exercises} exercises,{' '}
                {contentStats.challenges} challenges and {contentStats.interviewQuestions} interview questions.
              </p>
            </div>
          ) : flat.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Icon name="search_off" size={32} className="mx-auto mb-3 text-on-surface-variant" />
              <p className="font-body-md text-on-surface">No results for “{query}”</p>
              <p className="mt-1 font-body-sm text-on-surface-variant">
                Try a method name like <code className="font-mono">reduce</code>, or a concept like{' '}
                <code className="font-mono">closure</code>.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.kind} className="mb-2">
                <p className="px-3 py-1.5 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
                  {KIND_LABEL[group.kind]}
                </p>
                {group.items.map((item) => {
                  cursor += 1;
                  const index = cursor;
                  const isActive = index === active;
                  return (
                    <button
                      key={`${item.kind}-${item.id}`}
                      id={`search-option-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isActive}
                      type="button"
                      onClick={() => go(item.to)}
                      onMouseEnter={() => setActive(index)}
                      className={cx(
                        'flex w-full items-start gap-3 rounded px-3 py-2.5 text-left transition-colors',
                        isActive ? 'bg-surface-container-highest' : 'hover:bg-surface-container',
                      )}
                    >
                      <Icon name={item.icon} size={18} className="mt-0.5 text-on-surface-variant" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-body-sm font-medium text-on-surface">{item.title}</span>
                          {item.difficulty && <Badge tone="neutral">{item.difficulty}</Badge>}
                        </span>
                        {item.description && (
                          <span className="mt-0.5 block line-clamp-1 font-body-sm text-on-surface-variant">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {isActive && <Icon name="keyboard_return" size={16} className="mt-0.5 text-on-surface-variant" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-outline-variant px-4 py-2 font-mono text-code-sm text-on-surface-variant">
          <span className="flex items-center gap-1"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd>↵</kbd> open</span>
          <span className="ml-auto">{flat.length > 0 && `${flat.length} result${flat.length === 1 ? '' : 's'}`}</span>
        </div>
      </div>
    </div>
  );
}
