'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { resolveLocale } from '@/lib/i18n/resolver';
import { getLocaleText } from '@/lib/i18n/helpers';

const STORAGE_KEY = 'app-locale';

/* v8 ignore start */
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
 * The locale comes from `initialLocale` (the URL segment, rendered on the
 * server) or `DEFAULT_LOCALE`. The start value never depends on the browser,
 * so the server output and the first client render match. When `initialLocale`
 * changes, for example after a language switch, the provider follows it.
 * `setLocale` changes the locale at once, before the new route has loaded.
 *
 * @param {object} props - Component props.
 * @param {string} [props.initialLocale] - Locale resolved from the URL.
 * @param {import('react').ReactNode} props.children - Content rendered inside the provider.
 * @returns {JSX.Element} The context provider.
 */
export function LocaleProvider({ initialLocale, children }) {
  const [state, setState] = useState(() => ({
    source: initialLocale,
    locale: initialLocale ? resolveLocale(initialLocale) : DEFAULT_LOCALE
  }));

  let locale = state.locale;
  if (initialLocale !== state.source) {
    locale = initialLocale ? resolveLocale(initialLocale) : DEFAULT_LOCALE;
    setState({ source: initialLocale, locale });
  }

  useEffect(() => {
    writeStoredLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next) => {
    const resolved = resolveLocale(next);
    writeStoredLocale(resolved);
    setState((current) => ({ ...current, locale: resolved }));
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
