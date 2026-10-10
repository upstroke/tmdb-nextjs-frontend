'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { resolveLocale } from '@/lib/i18n/resolver';
import { getLocaleText } from '@/lib/i18n/helpers';

const STORAGE_KEY = 'app-locale';

/* v8 ignore start */
/**
 * Reads the stored locale from sessionStorage.
 *
 * @returns {string} The stored locale, or `DEFAULT_LOCALE` on the server, when
 *   nothing is stored, or when storage is unavailable.
 */
function readStoredLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Writes the locale to sessionStorage. Logs a warning when storage fails.
 *
 * @param {string} locale - Locale to store, e.g. `"de-DE"`.
 * @returns {void}
 */
function writeStoredLocale(locale) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, locale);
  } catch (err) {
    console.warn(`The locale could not be saved: ${err}`);
  }
}
/* v8 ignore stop */

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {}
});

/* v8 ignore start */
/**
 * Provides the active locale and its setter through React context.
 *
 * Starts with `initialLocale` when given (the URL is the source of truth),
 * otherwise with the locale stored in sessionStorage.
 *
 * @param {object} props - Component props.
 * @param {string} [props.initialLocale] - Locale resolved from the URL.
 * @param {import('react').ReactNode} props.children - Content rendered inside the provider.
 * @returns {JSX.Element} The context provider.
 */
export function LocaleProvider({ initialLocale, children }) {
  const [locale, setLocaleState] = useState(() => {
    if (initialLocale) return resolveLocale(initialLocale);
    return readStoredLocale();
  });

  useEffect(() => {
    if (initialLocale) {
      // URL is the source of truth — sync sessionStorage to prevent stale value flash
      writeStoredLocale(resolveLocale(initialLocale));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next) => {
    const resolved = resolveLocale(next);
    writeStoredLocale(resolved);
    setLocaleState(resolved);
  }, []);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

/**
 * Returns the active locale.
 *
 * @returns {string} The active locale, e.g. `"de-DE"`.
 */
export function useLocale() {
  return useContext(LocaleContext).locale;
}

/**
 * Returns the function that changes the active locale.
 *
 * @returns {(next: string) => void} Setter that resolves, stores and applies a locale.
 */
export function useSetLocale() {
  return useContext(LocaleContext).setLocale;
}

/**
 * Returns the translated texts (labels, messages, titles, formats, fallbacks)
 * for the active locale.
 *
 * @returns {object} Locale text bundle from `getLocaleText`.
 */
export function useI18n() {
  const locale = useLocale();
  return getLocaleText(locale);
}
/* v8 ignore stop */

let _externalSetter = null;

/**
 * Registers the function that applies a locale change to the React state.
 * Used by `AppLocaleProvider` so that non-React code can call `setLocale`.
 *
 * @param {(next: string) => void} fn - Setter to call on locale changes.
 * @returns {void}
 */
export function _registerExternalSetter(fn) {
  _externalSetter = fn;
}

/**
 * Changes the locale from outside of React: resolves it, stores it in
 * sessionStorage and forwards it to the registered setter.
 *
 * @param {string} next - Requested locale.
 * @returns {void}
 */
export function setLocale(next) {
  const resolved = resolveLocale(next);
  writeStoredLocale(resolved);
  _externalSetter?.(resolved);
}
