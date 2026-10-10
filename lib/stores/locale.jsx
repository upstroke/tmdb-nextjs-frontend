'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { resolveLocale } from '@/lib/i18n/resolver';
import { getLocaleText } from '@/lib/i18n/helpers';

const STORAGE_KEY = 'app-locale';

/* v8 ignore start */
/**
 *
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
 *
 * @param locale
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
 *
 * @param root0
 * @param root0.initialLocale
 * @param root0.children
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
 *
 */
export function useLocale() {
  return useContext(LocaleContext).locale;
}

/**
 *
 */
export function useSetLocale() {
  return useContext(LocaleContext).setLocale;
}

/**
 *
 */
export function useI18n() {
  const locale = useLocale();
  return getLocaleText(locale);
}
/* v8 ignore stop */

let _externalSetter = null;

/**
 *
 * @param fn
 */
export function _registerExternalSetter(fn) {
  _externalSetter = fn;
}

/**
 *
 * @param next
 */
export function setLocale(next) {
  const resolved = resolveLocale(next);
  writeStoredLocale(resolved);
  _externalSetter?.(resolved);
}
