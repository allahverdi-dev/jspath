/**
 * The translation core.
 *
 * JSPath ships five production dependencies on purpose, and what an i18n library
 * would add here is key lookup, interpolation and plural selection. The first two
 * are a few lines; the third is the only genuinely hard part, and the platform
 * already solves it properly through `Intl.PluralRules` — which knows that
 * Russian has four plural categories and Azerbaijani has one, and knows it better
 * than a hand-written rule table would.
 *
 * So this is deliberately small, and deliberately does not invent its own
 * locale intelligence: dates go through `Intl.DateTimeFormat`, numbers through
 * `Intl.NumberFormat`, plurals through `Intl.PluralRules`.
 */

export const DEFAULT_LOCALE = 'en';

/**
 * The locales the product actually ships. A saved preference outside this set —
 * or a browser locale we do not support — falls back to English rather than
 * silently half-translating the interface.
 */
export const SUPPORTED_LOCALES = Object.freeze(['en', 'az', 'ru']);

/** Shown in the language selector, each in its own language. */
export const LOCALE_NAMES = Object.freeze({
  en: 'English',
  az: 'Azərbaycan dili',
  ru: 'Русский',
});

/** BCP 47 tags for `Intl`. The app's own codes stay short and stable. */
export const INTL_LOCALES = Object.freeze({
  en: 'en',
  az: 'az-AZ',
  ru: 'ru-RU',
});

export const isSupportedLocale = (value) => SUPPORTED_LOCALES.includes(value);

/** Normalise anything — a saved value, a browser tag — to a locale we support. */
export function normaliseLocale(value) {
  if (typeof value !== 'string') return null;
  const lower = value.toLowerCase();
  if (isSupportedLocale(lower)) return lower;
  // "ru-RU", "az-Latn-AZ" and friends resolve to their base language.
  const base = lower.split('-')[0];
  return isSupportedLocale(base) ? base : null;
}

/* ------------------------------------------------------------------ *
 * Lookup
 * ------------------------------------------------------------------ */

/** Walk a dotted key through a nested dictionary. */
function lookup(dict, key) {
  let node = dict;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return node;
}

const INTERPOLATION = /\{(\w+)\}/g;

function interpolate(template, values) {
  if (!values) return template;
  return template.replace(INTERPOLATION, (whole, name) =>
    (Object.hasOwn(values, name) ? String(values[name]) : whole));
}

/**
 * Choose a plural form.
 *
 * A pluralised entry is an object keyed by CLDR category — `one`, `few`, `many`,
 * `other` — and `Intl.PluralRules` picks which one applies for the locale and
 * count. Russian genuinely needs `one/few/many`; Azerbaijani uses one form after
 * a numeral, so its entries carry `other` alone and still select correctly.
 */
function selectPlural(entry, locale, count) {
  if (typeof count !== 'number' || Number.isNaN(count)) return entry.other ?? entry.one;
  let category;
  try {
    category = new Intl.PluralRules(INTL_LOCALES[locale] ?? locale).select(count);
  } catch {
    category = count === 1 ? 'one' : 'other';
  }
  // Fall back along the CLDR chain so an incomplete entry still reads correctly.
  return entry[category] ?? entry.other ?? entry.many ?? entry.few ?? entry.one;
}

/**
 * Build a `t` function for one locale.
 *
 * Missing keys fall back to English, and a key that is missing everywhere
 * returns its last segment in a readable form rather than the raw dotted key —
 * a user should never see `billing.canceling.message` on screen.
 *
 * `onMissing` exists so development and tests can be strict about it while
 * production stays forgiving.
 */
export function createTranslator({ locale, dictionary, fallbackDictionary, onMissing }) {
  return function t(key, values) {
    let entry = lookup(dictionary, key);
    let usedFallback = false;

    if (entry === undefined && fallbackDictionary) {
      entry = lookup(fallbackDictionary, key);
      usedFallback = entry !== undefined;
    }

    if (entry === undefined) {
      onMissing?.(key, locale);
      // Readable last resort: "billing.pendingCancellation" → "Pending cancellation".
      // Sentence case, not title case: a stray "Pending Cancellation" in the middle
      // of a page reads like a heading that lost its content.
      const tail = key.split('.').pop() ?? key;
      return tail
        .replace(/([a-z0-9])([A-Z])/g, (_, a, b) => `${a} ${b.toLowerCase()}`)
        .replace(/[_-]+/g, ' ')
        .replace(/^./, (c) => c.toUpperCase());
    }

    if (usedFallback) onMissing?.(key, locale);

    if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
      entry = selectPlural(entry, usedFallback ? DEFAULT_LOCALE : locale, values?.count);
    }

    return typeof entry === 'string' ? interpolate(entry, values) : String(entry ?? '');
  };
}

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

const dateCache = new Map();
const numberCache = new Map();

function cached(store, key, build) {
  if (!store.has(key)) store.set(key, build());
  return store.get(key);
}

/**
 * Azerbaijani, formatted here rather than by `Intl`.
 *
 * Not a stylistic preference. Several runtimes — including the Chromium the
 * project previews in — report `az` as supported (`supportedLocalesOf` returns
 * it, `resolvedOptions().locale` says `az-AZ`) while shipping no Azerbaijani
 * date patterns, so `Intl` silently produces the root fallback: 14 March 2026
 * renders as "2026 M03 14", and 12345 as "12,345" with English grouping. A
 * runtime with full ICU gets it right, which is exactly what makes the failure
 * easy to miss — it depends on the user's browser build, not on our code.
 *
 * Azerbaijani date and number formats are simple and stable, so producing them
 * directly is both shorter than detecting the broken output and correct on every
 * runtime. English and Russian have dependable ICU data and keep using `Intl`.
 */
const AZ_MONTHS_LONG = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
];
const AZ_MONTHS_SHORT = [
  'yan', 'fev', 'mar', 'apr', 'may', 'iyn',
  'iyl', 'avq', 'sen', 'okt', 'noy', 'dek',
];

function formatAzerbaijaniDate(date, options) {
  const day = date.getDate();
  const year = date.getFullYear();
  const style = options?.dateStyle ?? 'long';
  if (style === 'short') {
    const dd = String(day).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${year}`;
  }
  const months = style === 'medium' ? AZ_MONTHS_SHORT : AZ_MONTHS_LONG;
  return `${day} ${months[date.getMonth()]} ${year}`;
}

/** Azerbaijani groups thousands with "." and marks decimals with ",". */
function formatAzerbaijaniNumber(value, options) {
  // Match Intl's defaults: up to three fraction digits, never zero-padded.
  const digits = options?.maximumFractionDigits ?? 3;
  const [whole, rawFraction = ''] = Math.abs(value).toFixed(digits).split('.');
  const fraction = rawFraction.replace(/0+$/, '');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = value < 0 ? '-' : '';
  return fraction ? `${sign}${grouped},${fraction}` : `${sign}${grouped}`;
}

/** Format a date for the active locale. Never build date strings by hand. */
export function formatDate(value, locale = DEFAULT_LOCALE, options = { dateStyle: 'long' }) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  if (locale === 'az') return formatAzerbaijaniDate(date, options);
  const tag = INTL_LOCALES[locale] ?? DEFAULT_LOCALE;
  const key = `${tag}:${JSON.stringify(options)}`;
  try {
    return cached(dateCache, key, () => new Intl.DateTimeFormat(tag, options)).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Format a number for the active locale. Not for code output — only prose. */
export function formatNumber(value, locale = DEFAULT_LOCALE, options) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  if (locale === 'az') return formatAzerbaijaniNumber(value, options);
  const tag = INTL_LOCALES[locale] ?? DEFAULT_LOCALE;
  const key = `${tag}:${JSON.stringify(options ?? {})}`;
  try {
    return cached(numberCache, key, () => new Intl.NumberFormat(tag, options)).format(value);
  } catch {
    return String(value);
  }
}
