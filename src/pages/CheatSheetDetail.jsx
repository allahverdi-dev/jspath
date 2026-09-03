import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getCheatSheet, cheatSheetBySlug,
  lessonById, moduleById, referenceById, challengeById,
} from '../content/registry.js';
import { HighlightedCode } from '../components/code/CodeBlock.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Card, Button, Icon, Badge, EmptyState, SectionLabel } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { useT } from '../i18n/index.jsx';

/**
 * A comparison or mutation matrix. Cheat sheets live or die on these, and a
 * code block cannot express one. The wrapper scrolls horizontally so a wide
 * table never forces the page itself sideways on a phone.
 */
function SheetTable({ columns, rows }) {
  return (
    <div className="thin-scrollbar -mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[22rem] border-collapse text-left">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className="whitespace-nowrap border-b border-outline-variant pb-2 pr-3 font-heading text-label-md text-on-surface-variant"
              >
                <InlineMarkup text={col} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-outline-variant/40 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-3 align-top font-body-sm text-on-surface-variant">
                  <InlineMarkup text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatedList({ label, icon, items }) {
  if (items.length === 0) return null;
  return (
    <Card className="p-5">
      <SectionLabel className="mb-3">{label}</SectionLabel>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to} className="flex items-start gap-2">
            <Icon name={icon} size={15} className="mt-3 shrink-0 text-on-surface-variant" />
            <Link to={item.to} className="block py-2.5 font-body-md text-primary-ink underline underline-offset-2">
              <Authored>{item.label}</Authored>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function CheatSheetDetail() {
  const { slug } = useParams();
  const t = useT();
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState(null);
  const meta = cheatSheetBySlug[slug];

  useEffect(() => {
    let cancelled = false;
    setSheet(null); setError(null);
    if (!meta) { setError({ messageKey: 'cheatSheets.doesNotExist' }); return undefined; }
    getCheatSheet(meta.id).then((s) => { if (!cancelled) setSheet(s); }).catch((e) => { if (!cancelled) setError({ message: e.message }); });
    return () => { cancelled = true; };
  }, [meta]);

  if (error) {
    return (
      <EmptyState
        icon="search_off"
        title={t('cheatSheets.notFound')}
        message={error.messageKey ? t(error.messageKey) : t('cheatSheets.doesNotExist')}
        action={<Button to="/cheat-sheets" icon="description">{t('cheatSheets.short')}</Button>}
      />
    );
  }
  if (!sheet) return <ContentSkeleton lines={8} />;

  const lessons = (sheet.relatedLessons ?? [])
    .map((id) => lessonById[id])
    .filter((l) => l && moduleById[l.moduleId])
    .map((l) => ({ to: `/learn/${moduleById[l.moduleId].slug}/${l.slug}`, label: l.title }));

  const reference = (sheet.relatedReference ?? [])
    .map((id) => referenceById[id])
    .filter(Boolean)
    .map((r) => ({ to: `/reference/${r.slug}`, label: r.name }));

  const challenges = (sheet.relatedChallenges ?? [])
    .map((id) => challengeById[id])
    .filter(Boolean)
    .map((ch) => ({ to: `/challenges/${ch.slug}`, label: ch.title }));

  return (
    <div className="animate-fade-in">
      <Link to="/cheat-sheets" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> {t('cheatSheets.short')}
      </Link>

      <Badge tone="neutral" className="mb-3">{sheet.category}</Badge>
      <h1 className="font-display text-display-lg text-on-surface"><Authored>{sheet.title}</Authored></h1>
      <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant"><InlineMarkup text={sheet.description} /></p>

      <div className="mt-8 columns-1 gap-4 lg:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {sheet.groups.map((group, i) => (
          <Card key={i} className="p-5">
            <h2 className="mb-3 font-heading text-title-md text-on-surface"><InlineMarkup text={group.title} /></h2>
            {group.note && (
              <p className="mb-3 font-body-sm text-on-surface-variant">
                <InlineMarkup text={group.note} />
              </p>
            )}

            {group.kind === 'table' && <SheetTable columns={group.columns} rows={group.rows} />}

            {group.kind === 'rules' && (
              <ul className="space-y-2">
                {group.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                    <Icon name="chevron_right" size={15} className="mt-0.5 shrink-0 text-primary-ink" />
                    <span><InlineMarkup text={item} /></span>
                  </li>
                ))}
              </ul>
            )}

            {(group.kind ?? 'snippets') === 'snippets' && (
              <dl className="space-y-3">
                {group.entries.map((entry, j) => (
                  <div key={j}>
                    <dt className="overflow-x-auto rounded border border-outline-variant bg-surface-container-lowest px-3 py-2">
                      <HighlightedCode code={entry.code} />
                    </dt>
                    {entry.description && (
                      <dd className="mt-1 font-body-sm text-on-surface-variant">
                        <InlineMarkup text={entry.description} />
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            )}
          </Card>
        ))}
      </div>

      {(lessons.length > 0 || reference.length > 0 || challenges.length > 0) && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <RelatedList label={t('cheatSheets.learnItProperly')} icon="article" items={lessons} />
          <RelatedList label={t('cheatSheets.exactApiDetails')} icon="menu_book" items={reference} />
          <RelatedList label={t('cheatSheets.practiseIt')} icon="trophy" items={challenges} />
        </div>
      )}
    </div>
  );
}
