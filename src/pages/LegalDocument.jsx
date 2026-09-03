import { Link } from 'react-router-dom';
import { Card, Icon, SectionLabel } from '../components/ui/index.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { DOCUMENTS, resolveDocument } from '../legal/documents.js';
import { LAST_UPDATED, LEGAL_FACTS, LEGAL_PUBLISHABLE, pendingDecisionKeys } from '../legal/config.js';

/**
 * One renderer for all three policies.
 *
 * The text is product content in the reader's own language, not authored English
 * learning material, so nothing here carries `lang="en"` — the document language
 * follows the interface locale, which `I18nProvider` already puts on `<html>`.
 *
 * The page sits inside `AppShell`, which owns `<main>`; this renders the
 * `<article>` within it rather than opening a second main landmark.
 */
export default function LegalDocument({ documentId }) {
  const { t, locale, formatDate } = useI18n();
  const doc = resolveDocument(documentId, locale);

  useDocumentTitle(doc ? `${doc.title} | JSPath` : undefined);

  if (!doc) return null;

  const others = DOCUMENTS.filter((d) => d.id !== documentId);
  const pending = pendingDecisionKeys().map((key) => t(key));

  return (
    <div className="animate-fade-in">
      {/* ~768px: long enough to read comfortably, short enough not to tire the eye. */}
      <article className="mx-auto w-full max-w-3xl pb-4">
        <header>
          <SectionLabel>{t('legal.legal')}</SectionLabel>
          <h1 className="mt-3 font-display text-display-lg text-on-surface">{doc.title}</h1>
          <p className="mt-3 font-body-sm text-on-surface-variant">
            {t('legal.lastUpdated', { date: formatDate(LAST_UPDATED, { dateStyle: 'long' }) })}
          </p>
          <p className="mt-5 font-body-lg text-on-surface-variant">{doc.intro}</p>
        </header>

        {/*
         * Said plainly rather than hidden: some topics have no answer yet, and a
         * guessed one would be worse than none. The notice removes itself when
         * the outstanding decisions in `legal/config.js` are made.
         */}
        {!LEGAL_PUBLISHABLE && pending.length > 0 && (
          <Card className="mt-8 flex flex-wrap items-start gap-3 border-warning/40 bg-warning/5 p-4">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-warning" />
            <div className="min-w-0 flex-1 basis-64">
              <p className="font-heading text-title-md text-on-surface">{t('legal.draftTitle')}</p>
              <p className="mt-1 font-body-sm text-on-surface-variant">
                {t('legal.draftBody', { topics: formatList(pending, locale) })}
              </p>
            </div>
          </Card>
        )}

        <nav className="mt-8 rounded-lg border border-outline-variant p-4" aria-label={t('legal.onThisPage')}>
          <p className="font-heading text-title-md text-on-surface">{t('legal.onThisPage')}</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {doc.sections.map((section, index) => (
              <li key={section.id} className="min-w-0 font-body-sm">
                <a
                  href={`#${section.id}`}
                  className="text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
                >
                  <span className="font-mono text-label-caps text-on-surface-variant/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>{' '}
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-headline-sm text-on-surface">{section.heading}</h2>
              <div className="prose-jspath mt-3">
                {section.blocks.map((block, index) =>
                  block.ul ? (
                    <ul key={index}>
                      {block.ul.map((item, itemIndex) => <li key={itemIndex}><Prose text={item} /></li>)}
                    </ul>
                  ) : (
                    <p key={index}><Prose text={block.p} /></p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <nav className="mt-12 border-t border-outline-variant pt-6" aria-label={t('legal.otherPolicies')}>
          <p className="font-heading text-title-md text-on-surface">{t('legal.otherPolicies')}</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {others.map((other) => (
              <li key={other.id} className="font-body-sm">
                <Link to={other.path} className="text-primary-ink underline-offset-2 hover:underline">
                  {t(other.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </div>
  );
}

/**
 * Policy prose, with the contact address as a usable link.
 *
 * The address is written into the text once, from `LEGAL_FACTS`, so it cannot
 * differ between languages. Turning it into a `mailto:` here rather than storing
 * markup in the locale files keeps the prose plain text — nothing in a
 * translation can inject a link, and there is no markup for a translator to get
 * wrong.
 */
function Prose({ text }) {
  const email = LEGAL_FACTS.email;
  if (!text?.includes(email)) return text ?? null;

  return text.split(email).flatMap((part, index) => (
    index === 0
      ? [part]
      : [
        <a
          key={`mail-${index}`}
          href={`mailto:${email}`}
          className="text-primary-ink underline underline-offset-2 hover:opacity-80"
        >
          {email}
        </a>,
        part,
      ]
  ));
}

/**
 * "a, b and c" in the reader's language.
 *
 * `Intl.ListFormat` is missing on some runtimes and, as with dates, reduced-ICU
 * builds accept `az` and quietly return the root format. A comma-joined list is
 * the honest fallback rather than a list that reads as English in Azerbaijani.
 */
function formatList(items, locale) {
  try {
    if (typeof Intl?.ListFormat === 'function' && locale !== 'az') {
      return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);
    }
  } catch {
    /* fall through */
  }
  if (items.length < 2) return items.join('');
  const conjunction = { en: 'and', az: 'və', ru: 'и' }[locale] ?? 'and';
  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1]}`;
}
