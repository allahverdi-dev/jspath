/**
 * The structural spine of the legal documents.
 *
 * The three locale files carry prose and nothing else. This file decides which
 * sections exist, in what order they appear, and which of them depend on a fact
 * nobody has decided yet. A section listing `requires` is dropped from the
 * rendered page while any of those facts is `null`, so an undecided refund
 * window is simply absent rather than guessed at or shipped as a placeholder.
 *
 * Keeping the order here rather than in the locale files is what makes the three
 * languages structurally identical by construction: a translator can only fill
 * in sections that exist, and `legal.test.js` fails if one is missing.
 */
import { applyFacts, hasFacts } from './config.js';
import en from './en.js';
import az from './az.js';
import ru from './ru.js';

const DOCUMENTS_BY_LOCALE = { en, az, ru };

/**
 * `requires` names keys of `REQUIRED_DECISIONS`. Everything without it rests on
 * something the repository already proves.
 */
export const DOCUMENTS = Object.freeze([
  {
    id: 'terms',
    path: '/terms',
    labelKey: 'legal.terms',
    sections: Object.freeze([
      { id: 'agreement' },
      { id: 'what-jspath-is' },
      { id: 'operator' },
      { id: 'accounts' },
      { id: 'age', requires: ['minimumAge'] },
      { id: 'guest-use' },
      { id: 'acceptable-use' },
      { id: 'learning-content' },
      { id: 'free-and-pro' },
      { id: 'subscriptions' },
      { id: 'cancellation' },
      { id: 'refunds' },
      { id: 'third-parties' },
      { id: 'intellectual-property' },
      { id: 'availability' },
      { id: 'service-changes' },
      { id: 'terms-changes' },
      { id: 'suspension' },
      { id: 'liability' },
      { id: 'governing-law', requires: ['governingLaw'] },
      { id: 'contact', requires: ['contact'] },
    ]),
  },
  {
    id: 'privacy',
    path: '/privacy',
    labelKey: 'legal.privacy',
    sections: Object.freeze([
      { id: 'scope' },
      { id: 'guest-and-account' },
      { id: 'account-data' },
      { id: 'learning-data' },
      { id: 'billing-data' },
      { id: 'technical-data' },
      { id: 'browser-storage' },
      { id: 'third-parties' },
      { id: 'cookies' },
      { id: 'security' },
      { id: 'your-controls' },
      { id: 'deletion', requires: ['accountDeletion', 'contact'] },
      { id: 'retention' },
      { id: 'your-rights' },
      { id: 'children', requires: ['minimumAge'] },
      { id: 'policy-changes' },
      { id: 'contact', requires: ['contact'] },
    ]),
  },
  {
    id: 'refund',
    path: '/refund-policy',
    labelKey: 'legal.refund',
    sections: Object.freeze([
      { id: 'scope' },
      { id: 'who-you-pay' },
      { id: 'cancellation-is-not-a-refund' },
      { id: 'eligibility', requires: ['refund'] },
      { id: 'how-to-request', requires: ['refund', 'contact'] },
      { id: 'access-after-a-refund' },
      { id: 'payment-problems' },
      { id: 'statutory-rights' },
      { id: 'policy-changes' },
      { id: 'contact', requires: ['contact'] },
    ]),
  },
]);

export const LEGAL_PATHS = Object.freeze(DOCUMENTS.map((d) => d.path));

export function documentById(id) {
  return DOCUMENTS.find((d) => d.id === id) ?? null;
}

/** Sections whose facts all exist, in document order. */
export function publishableSections(documentId) {
  return (documentById(documentId)?.sections ?? []).filter((s) => hasFacts(s.requires));
}

/** Sections held back because a fact is still undecided. */
export function withheldSections(documentId) {
  return (documentById(documentId)?.sections ?? []).filter((s) => !hasFacts(s.requires));
}

/**
 * Resolve one document into renderable content for a locale.
 *
 * Falls back to English per field rather than per document, so a locale that is
 * mid-translation shows the sections it has translated and readable English for
 * the rest — never an empty page and never a raw section id.
 */
export function resolveDocument(documentId, locale) {
  const definition = documentById(documentId);
  if (!definition) return null;

  const dictionary = DOCUMENTS_BY_LOCALE[locale] ?? DOCUMENTS_BY_LOCALE.en;
  const fallback = DOCUMENTS_BY_LOCALE.en;
  const localized = dictionary[documentId] ?? fallback[documentId];
  const localizedFallback = fallback[documentId];

  return {
    id: definition.id,
    path: definition.path,
    title: applyFacts(localized.title ?? localizedFallback.title),
    intro: applyFacts(localized.intro ?? localizedFallback.intro),
    sections: publishableSections(documentId)
      // A fact can be decided before its wording is written. Rendering a bare
      // heading with nothing under it would be worse than leaving the section
      // out, so content is required as well as facts.
      .map((section) => ({
        id: section.id,
        content: localized.sections?.[section.id] ?? localizedFallback.sections?.[section.id] ?? null,
      }))
      .filter(({ content }) => content?.heading && content.blocks?.length)
      .map(({ id, content }) => ({
        id,
        heading: applyFacts(content.heading),
        blocks: content.blocks.map((block) => (
          block.ul
            ? { ul: block.ul.map(applyFacts) }
            : { p: applyFacts(block.p) }
        )),
      })),
  };
}
