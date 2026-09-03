import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getReference, referenceBySlug, referenceById,
  lessonById, moduleById, challengeById, exerciseById,
} from '../content/registry.js';
import { CodeBlock } from '../components/code/CodeBlock.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Card, Button, Icon, Badge, EmptyState, SectionLabel } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { useT } from '../i18n/index.jsx';

/** ECMAScript / DOM / Web API — the tone makes the boundary readable at a glance. */
const ENV_TONE = { ECMAScript: 'primary', DOM: 'info', 'Web API': 'info' };

export default function ReferenceDetail() {
  const { slug } = useParams();
  const t = useT();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState(null);
  const meta = referenceBySlug[slug];

  useEffect(() => {
    let cancelled = false;
    setEntry(null); setError(null);
    if (!meta) { setError({ messageKey: 'reference.doesNotExist' }); return undefined; }
    getReference(meta.id).then((r) => { if (!cancelled) setEntry(r); }).catch((e) => { if (!cancelled) setError({ message: e.message }); });
    return () => { cancelled = true; };
  }, [meta]);

  if (error) {
    return (
      <EmptyState
        icon="search_off"
        title={t('reference.notFound')}
        message={error.messageKey ? t(error.messageKey) : t('reference.doesNotExist')}
        action={<Button to="/reference" icon="menu_book">{t('reference.short')}</Button>}
      />
    );
  }
  if (!entry) return <ContentSkeleton lines={8} />;

  const lesson = entry.lessonId ? lessonById[entry.lessonId] : null;
  const relatedLessons = (entry.relatedLessons ?? []).map((id) => lessonById[id]).filter(Boolean);
  const related = (entry.relatedEntries ?? []).map((id) => referenceById[id]).filter(Boolean);
  const practice = (entry.practiceIds ?? [])
    .map((id) => challengeById[id] ?? exerciseById[id])
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link to="/reference" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> {t('reference.short')}
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="neutral"><Authored>{entry.category}</Authored></Badge>
        <Badge tone={ENV_TONE[entry.environment] ?? 'neutral'}><Authored>{entry.environment}</Authored></Badge>
        <Badge tone={entry.mutates ? 'warning' : 'success'} icon={entry.mutates ? 'edit' : 'lock'}>
          {entry.mutates ? t('reference.mutates') : t('reference.doesNotMutate')}
        </Badge>
        {entry.throws && <Badge tone="error" icon="error">{t('reference.canThrow')}</Badge>}
      </div>

      <h1 className="font-mono text-headline-md text-on-surface"><Authored>{entry.name}</Authored></h1>
      <p className="mt-3 font-body-lg leading-8 text-on-surface-variant">
        <InlineMarkup text={entry.summary} />
      </p>

      <Card className="mt-6 p-5">
        <SectionLabel className="mb-2">{t('reference.syntax')}</SectionLabel>
        <pre lang="en" className="thin-scrollbar overflow-x-auto font-mono text-code-md text-on-surface">{entry.syntax}</pre>
      </Card>

      {entry.parameters.length > 0 && (
        <Card className="mt-4 p-5">
          <SectionLabel className="mb-3">{t('reference.parameters')}</SectionLabel>
          <dl className="space-y-3">
            {entry.parameters.map((p, i) => (
              <div key={i} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="font-mono text-code-md text-primary-ink">
                  <Authored>{p.name}</Authored>
                  {p.optional && <span className="ml-1 text-on-surface-variant">?</span>}
                </dt>
                <dd className="font-body-sm text-on-surface-variant"><InlineMarkup text={p.description} /></dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      <Card className="mt-4 p-5">
        <SectionLabel className="mb-2">{t('reference.returns')}</SectionLabel>
        <p className="font-body-md text-on-surface-variant"><InlineMarkup text={entry.returns} /></p>
      </Card>

      {entry.throws && (
        <Card className="mt-4 p-5">
          <SectionLabel className="mb-2">{t('reference.throws')}</SectionLabel>
          <p className="font-body-md text-on-surface-variant"><InlineMarkup text={entry.throws} /></p>
        </Card>
      )}

      {entry.description?.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-heading text-headline-sm text-on-surface">{t('reference.behaviour')}</h2>
          <div className="space-y-3">
            {entry.description.map((p, i) => (
              <p key={i} className="font-body-md leading-7 text-on-surface-variant">
                <InlineMarkup text={p} />
              </p>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-3 mt-8 font-heading text-headline-sm text-on-surface">{t('reference.examples')}</h2>
      <div className="space-y-4">
        {entry.examples.map((ex, i) => (
          <CodeBlock
            key={i}
            code={ex.code}
            output={ex.output}
            caption={ex.caption}
            runnable={ex.runnable !== false}
            needsDom={ex.needsDom ?? false}
            html={ex.html}
          />
        ))}
      </div>

      {entry.caveats?.length > 0 && (
        <Card className="mt-6 border-warning/40 bg-warning/5 p-5">
          <SectionLabel className="mb-3">{t('reference.caveats')}</SectionLabel>
          <ul className="space-y-2">
            {entry.caveats.map((c, i) => (
              <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                <Icon name="warning" size={15} className="mt-0.5 shrink-0 text-warning" />
                <span><InlineMarkup text={c} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {entry.commonMistakes?.length > 0 && (
        <Card className="mt-4 p-5">
          <SectionLabel className="mb-3">{t('reference.commonMistakes')}</SectionLabel>
          <ul className="space-y-2">
            {entry.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                <Icon name="close" size={15} className="mt-0.5 shrink-0 text-error" />
                <span><InlineMarkup text={m} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {related.length > 0 && (
        <Card className="mt-4 p-5">
          <SectionLabel className="mb-3">{t('reference.relatedApis')}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/reference/${r.slug}`}
                className="rounded-lg border border-outline-variant bg-surface-container px-2.5 py-1 font-mono text-code-sm text-primary-ink transition hover:border-primary/40"
              >
                <Authored>{r.name}</Authored>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {(lesson || relatedLessons.length > 0 || practice.length > 0) && (
        <Card className="mt-4 p-5">
          <SectionLabel className="mb-3">{t('reference.learnThisProperly')}</SectionLabel>
          <ul className="space-y-2">
            {[lesson, ...relatedLessons].filter((l) => l && moduleById[l.moduleId]).map((l, i, all) => (
              all.findIndex((x) => x.id === l.id) !== i ? null : (
                <li key={l.id} className="flex items-start gap-2">
                  <Icon name="article" size={15} className="mt-1 shrink-0 text-on-surface-variant" />
                  <Link
                    to={`/learn/${moduleById[l.moduleId].slug}/${l.slug}`}
                    className="font-body-md text-primary-ink underline underline-offset-2"
                  >
                    <Authored>{l.title}</Authored>
                  </Link>
                </li>
              )
            ))}
            {practice.map((p) => (
              <li key={p.id} className="flex items-start gap-2">
                <Icon name="fitness_center" size={15} className="mt-1 shrink-0 text-on-surface-variant" />
                <Link
                  to={p.slug ? `/challenges/${p.slug}` : `/practice/exercise/${p.id}`}
                  className="font-body-md text-primary-ink underline underline-offset-2"
                >
                  <Authored>{p.title}</Authored>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
