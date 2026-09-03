import { describe, expect, it } from 'vitest';
import en from './locales/en.js';
import az from './locales/az.js';
import ru from './locales/ru.js';
import {
  DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_NAMES, INTL_LOCALES,
  normaliseLocale, isSupportedLocale, createTranslator, formatDate, formatNumber,
} from './core.js';

/**
 * Dictionary and core-behaviour validation.
 *
 * The failure mode this guards against is a translator seeing English inside a
 * Russian interface, or worse a raw `billing.canceling.message` on screen. Both
 * are prevented here rather than by hoping someone notices at runtime.
 */

const DICTS = { en, az, ru };

/** Flatten to dotted keys. A pluralised entry is one key, not one per category. */
const PLURAL_CATEGORIES = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

function flatten(node, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value);
      const isPlural = keys.length > 0 && keys.every((k) => PLURAL_CATEGORIES.has(k));
      if (isPlural) out.set(path, value);
      else flatten(value, path, out);
    } else {
      out.set(path, value);
    }
  }
  return out;
}

const FLAT = Object.fromEntries(Object.entries(DICTS).map(([l, d]) => [l, flatten(d)]));

/** Interpolation variables a string expects, e.g. "{count}" → "count". */
function variablesIn(value) {
  const text = typeof value === 'string'
    ? value
    : Object.values(value ?? {}).filter((v) => typeof v === 'string').join(' ');
  return new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
}

describe('locale coverage', () => {
  it('ships exactly the supported locales', () => {
    expect(Object.keys(DICTS).sort()).toEqual([...SUPPORTED_LOCALES].sort());
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('names every locale in its own language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_NAMES[locale], locale).toBeTruthy();
      expect(INTL_LOCALES[locale], locale).toBeTruthy();
    }
    expect(LOCALE_NAMES.az).toBe('Azərbaycan dili');
    expect(LOCALE_NAMES.ru).toBe('Русский');
  });

  it('has a meaningful number of keys, so this file cannot pass on an empty dictionary', () => {
    expect(FLAT.en.size).toBeGreaterThan(250);
  });

  it.each(['az', 'ru'])('%s defines every English key', (locale) => {
    const missing = [...FLAT.en.keys()].filter((k) => !FLAT[locale].has(k));
    expect(missing).toEqual([]);
  });

  it.each(['az', 'ru'])('%s defines no key English does not have', (locale) => {
    const extra = [...FLAT[locale].keys()].filter((k) => !FLAT.en.has(k));
    expect(extra).toEqual([]);
  });

  it.each(['en', 'az', 'ru'])('%s has no empty string', (locale) => {
    const empty = [...FLAT[locale].entries()]
      .filter(([, v]) => (typeof v === 'string' ? v.trim() === '' : false))
      .map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it.each(['az', 'ru'])('%s uses the same interpolation variables as English', (locale) => {
    const mismatched = [];
    for (const [key, value] of FLAT.en) {
      const expected = variablesIn(value);
      const actual = variablesIn(FLAT[locale].get(key));
      const missing = [...expected].filter((v) => !actual.has(v));
      const unknown = [...actual].filter((v) => !expected.has(v));
      if (missing.length || unknown.length) mismatched.push({ key, missing, unknown });
    }
    expect(mismatched).toEqual([]);
  });

  it('gives Russian the plural categories the language actually needs', () => {
    // A Russian counted noun that only carried `other` would read wrongly for
    // most numbers, so every pluralised entry must supply one/few/many.
    const plurals = [...FLAT.ru.entries()].filter(([, v]) => v && typeof v === 'object');
    expect(plurals.length).toBeGreaterThan(0);
    for (const [key, entry] of plurals) {
      for (const category of ['one', 'few', 'many']) {
        expect(Object.keys(entry), `ru.${key}`).toContain(category);
      }
    }
  });

  it('keeps Azerbaijani counted nouns in the singular form the language uses', () => {
    // "5 dərs", not "5 dərslər".
    expect(az.common.lessonCount.other).toContain('dərs');
    expect(az.common.lessonCount.other).not.toContain('dərslər');
    expect(az.common.questionCount.other).not.toMatch(/suallar/);
  });
});

describe('locale normalisation', () => {
  it.each(['en', 'az', 'ru'])('accepts %s', (locale) => {
    expect(normaliseLocale(locale)).toBe(locale);
    expect(isSupportedLocale(locale)).toBe(true);
  });

  it('resolves a regional tag to its base language', () => {
    expect(normaliseLocale('ru-RU')).toBe('ru');
    expect(normaliseLocale('az-Latn-AZ')).toBe('az');
    expect(normaliseLocale('en-GB')).toBe('en');
  });

  it('rejects anything unsupported rather than half-translating', () => {
    for (const value of ['tr', 'de', 'fr', 'zz', '', null, undefined, 42, {}]) {
      expect(normaliseLocale(value), String(value)).toBeNull();
    }
  });
});

describe('the translator', () => {
  const t = (locale) => createTranslator({
    locale,
    dictionary: DICTS[locale],
    fallbackDictionary: en,
  });

  it('returns the string for the active locale', () => {
    expect(t('en')('nav.dashboard')).toBe('Dashboard');
    expect(t('az')('nav.dashboard')).toBe('İdarə paneli');
    expect(t('ru')('nav.dashboard')).toBe('Панель');
  });

  it('interpolates values', () => {
    expect(t('en')('common.xp', { count: 40 })).toBe('40 XP');
    expect(t('ru')('dashboard.greetingMorning', { name: 'Аня' })).toContain('Аня');
  });

  it('leaves an unknown placeholder alone rather than printing undefined', () => {
    expect(t('en')('dashboard.greetingMorning', {})).toContain('{name}');
  });

  it('falls back to English for a key a locale is missing', () => {
    const partial = createTranslator({
      locale: 'az',
      dictionary: { nav: {} },
      fallbackDictionary: en,
    });
    expect(partial('nav.dashboard')).toBe('Dashboard');
  });

  it('never renders a raw dotted key to the user', () => {
    const orphan = createTranslator({ locale: 'en', dictionary: {}, fallbackDictionary: {} });
    const out = orphan('billing.pendingCancellation');
    expect(out).not.toContain('.');
    expect(out).toBe('Pending cancellation');
  });

  it('selects Russian plural forms correctly', () => {
    const ruT = t('ru');
    expect(ruT('common.lessonCount', { count: 1 })).toBe('1 урок');
    expect(ruT('common.lessonCount', { count: 2 })).toBe('2 урока');
    expect(ruT('common.lessonCount', { count: 5 })).toBe('5 уроков');
    expect(ruT('common.lessonCount', { count: 21 })).toBe('21 урок');
    expect(ruT('common.lessonCount', { count: 11 })).toBe('11 уроков');
  });

  it('keeps the Azerbaijani noun singular after any numeral', () => {
    const azT = t('az');
    expect(azT('common.lessonCount', { count: 1 })).toBe('1 dərs');
    expect(azT('common.lessonCount', { count: 5 })).toBe('5 dərs');
    expect(azT('common.lessonCount', { count: 21 })).toBe('21 dərs');
  });

  it('pluralises English the ordinary way', () => {
    const enT = t('en');
    expect(enT('common.lessonCount', { count: 1 })).toBe('1 lesson');
    expect(enT('common.lessonCount', { count: 2 })).toBe('2 lessons');
  });
});

describe('formatting', () => {
  const date = new Date('2026-09-30T12:00:00.000Z');

  it('formats a date in each locale rather than building the string by hand', () => {
    const enOut = formatDate(date, 'en');
    const ruOut = formatDate(date, 'ru');
    expect(enOut).toMatch(/2026/);
    expect(ruOut).toMatch(/2026/);
    // Different locales must not produce byte-identical output.
    expect(ruOut).not.toBe(enOut);
    expect(ruOut).toMatch(/сент/i);
  });

  it('returns nothing for an invalid date instead of "Invalid Date"', () => {
    expect(formatDate('not-a-date', 'en')).toBe('');
    expect(formatDate(undefined, 'ru')).toBe('');
  });

  it('formats numbers per locale', () => {
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
    // Russian groups with a non-breaking space rather than a comma.
    expect(formatNumber(1234567, 'ru')).not.toBe('1,234,567');
    expect(formatNumber(Number.NaN, 'en')).toBe('');
  });

  /*
   * Azerbaijani is formatted by `core.js` rather than by `Intl`.
   *
   * Several runtimes report `az` as supported while shipping no Azerbaijani
   * patterns, so `Intl` silently returns the root fallback — 14 March 2026
   * comes out as "2026 M03 14" and 12345 keeps English grouping. Whether a
   * learner saw that depended on their browser build, which is why these
   * assertions are exact rather than merely "different from English".
   */
  it('formats Azerbaijani dates in words, on every runtime', () => {
    expect(formatDate(date, 'az')).toBe('30 sentyabr 2026');
    expect(formatDate(date, 'az', { dateStyle: 'medium' })).toBe('30 sen 2026');
    expect(formatDate(date, 'az', { dateStyle: 'short' })).toBe('30.09.2026');
    // The failure this replaced: a numeric-month root fallback.
    expect(formatDate(date, 'az')).not.toMatch(/M\d\d/);
  });

  it('groups Azerbaijani numbers with a dot and marks decimals with a comma', () => {
    expect(formatNumber(1234567, 'az')).toBe('1.234.567');
    expect(formatNumber(1000, 'az')).toBe('1.000');
    expect(formatNumber(-9876.5, 'az')).toBe('-9.876,5');
    // Integers keep every digit: a blanket trailing-zero trim once turned 10 into 1.
    expect(formatNumber(10, 'az')).toBe('10');
    expect(formatNumber(100, 'az')).toBe('100');
    expect(formatNumber(10, 'az', { maximumFractionDigits: 0 })).toBe('10');
    expect(formatNumber(Number.NaN, 'az')).toBe('');
  });
});

describe('stable internal values are never translated', () => {
  it('keeps difficulty ids out of the dictionaries as values', () => {
    // Display labels are translated; the stored values stay lowercase English.
    for (const locale of SUPPORTED_LOCALES) {
      const labels = DICTS[locale].difficulty;
      expect(Object.keys(labels).sort()).toEqual(['beginner', 'easy', 'expert', 'hard', 'medium']);
    }
    expect(en.difficulty.beginner).toBe('Beginner');
    expect(az.difficulty.beginner).toBe('Başlanğıc');
    expect(ru.difficulty.beginner).toBe('Начальный');
  });

  it('keeps plan names in English across every locale, because they are product names', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(DICTS[locale].common.free).toBe('Free');
      expect(DICTS[locale].common.pro).toBe('Pro');
    }
  });

  it('leaves established developer terminology in English', () => {
    // These read better untranslated for the audience, and the policy is
    // deliberate rather than an oversight.
    expect(az.nav.playground).toBe('Playground');
    expect(ru.nav.playground).toBe('Playground');
    expect(az.learning.codeEditor).toContain('JavaScript');
    expect(ru.learning.codeEditor).toContain('JavaScript');
    // `event loop`, `DOM` and `HTTP` are read in English by this audience.
    expect(az.interviewKind.async).toContain('event loop');
    expect(ru.interviewKind.async).toContain('event loop');
    expect(az.interviewKind.browser).toContain('DOM');
    expect(ru.interviewKind.browser).toContain('DOM');
    expect(az.interviewKind.http).toContain('HTTP');
    expect(ru.interviewKind.http).toContain('HTTP');
  });

  it('translates curriculum track names, which are section headings rather than code', () => {
    // The counterpart to the rule above: a track name sits beside "Основы" and
    // "Браузер и DOM" in the sidebar, so leaving one bare English word there
    // reads as an untranslated string rather than as terminology.
    expect(az.track.async).not.toBe('Async');
    expect(ru.track.async).not.toBe('Async');
    expect(en.track.async).toBe('Asynchronous');
  });
});
