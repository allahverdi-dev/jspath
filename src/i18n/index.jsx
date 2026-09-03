import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import {
  DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_NAMES, INTL_LOCALES,
  isSupportedLocale, normaliseLocale, createTranslator, formatDate, formatNumber,
} from './core.js';
import en from './locales/en.js';
import az from './locales/az.js';
import ru from './locales/ru.js';
import { useUserState } from '../state/UserStateProvider.jsx';

export {
  DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_NAMES, INTL_LOCALES,
  isSupportedLocale, normaliseLocale,
};

/**
 * Locale for the product interface.
 *
 * All three dictionaries are bundled. They are small — a few thousand short
 * strings — and lazy-loading them would buy a couple of kilobytes at the cost of
 * a loading state on every language switch, which is the wrong trade here.
 *
 * The preference lives in the existing settings slice, so it persists locally for
 * guests and rides the normal cloud sync for signed-in learners. It is a display
 * preference and nothing else: it never touches entitlement, and the premium
 * content endpoint neither sends nor receives it.
 */

const DICTIONARIES = { en, az, ru };

const I18nContext = createContext(null);

/**
 * Report a key that had to fall back.
 *
 * Loud in development and in tests, silent in production — a user should never
 * be shown a raw key, and a developer should never be allowed to miss one.
 */
function reportMissing(key, locale) {
  if (import.meta.env?.DEV || import.meta.env?.MODE === 'test') {
    // eslint-disable-next-line no-console
    console.warn(`[i18n] missing key "${key}" for locale "${locale}"`);
  }
}

export function I18nProvider({ children }) {
  const { state, actions } = useUserState();

  // An unknown or corrupted saved value falls back to English rather than
  // leaving the interface half-translated.
  const locale = normaliseLocale(state?.settings?.locale) ?? DEFAULT_LOCALE;

  const setLocale = useCallback(
    (next) => {
      const valid = normaliseLocale(next);
      if (valid) actions.updateSettings({ locale: valid });
    },
    [actions],
  );

  // Assistive technology needs to know which language it is reading, and the
  // browser needs it for hyphenation and font selection.
  useEffect(() => {
    const root = globalThis.document?.documentElement;
    if (root) root.lang = locale;
  }, [locale]);

  const value = useMemo(() => {
    const t = createTranslator({
      locale,
      dictionary: DICTIONARIES[locale] ?? en,
      fallbackDictionary: en,
      onMissing: reportMissing,
    });
    return {
      locale,
      setLocale,
      t,
      formatDate: (v, options) => formatDate(v, locale, options),
      formatNumber: (v, options) => formatNumber(v, locale, options),
      locales: SUPPORTED_LOCALES,
      localeNames: LOCALE_NAMES,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Read the active locale and translator.
 *
 * Usable outside a provider — it falls back to English rather than throwing, so
 * a component rendered in isolation (a test, an error boundary above the
 * provider) still produces readable text instead of crashing.
 */
export function useI18n() {
  const context = useContext(I18nContext);
  return useMemo(() => {
    if (context) return context;
    const t = createTranslator({ locale: DEFAULT_LOCALE, dictionary: en, fallbackDictionary: en });
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t,
      formatDate: (v, options) => formatDate(v, DEFAULT_LOCALE, options),
      formatNumber: (v, options) => formatNumber(v, DEFAULT_LOCALE, options),
      locales: SUPPORTED_LOCALES,
      localeNames: LOCALE_NAMES,
    };
  }, [context]);
}

/** Shorthand for the common case of needing only the translator. */
export function useT() {
  return useI18n().t;
}

export { DICTIONARIES };
