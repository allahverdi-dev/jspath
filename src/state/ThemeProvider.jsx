import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { STORAGE_KEYS, readJson, writeJson } from '../services/storage.js';

const ThemeContext = createContext(null);

export const THEMES = ['system', 'light', 'dark'];

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

/**
 * Theme.
 *
 * The design is dark-first, so `system` resolves to dark unless the OS explicitly
 * asks for light. The resolved class is written to <html> where the token layer
 * picks it up; nothing else in the app needs to know which theme is active.
 */
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => readJson(STORAGE_KEYS.theme, 'dark'));
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolved === 'dark' ? '#0A0A0A' : '#FFFFFF');
  }, [resolved]);

  const setTheme = useCallback((next) => {
    setPreference(next);
    writeJson(STORAGE_KEYS.theme, next);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setTheme, isDark: resolved === 'dark' }),
    [preference, resolved, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
