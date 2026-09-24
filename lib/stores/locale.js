'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { resolveLocale } from '@/lib/i18n/helpers';
import { getLocaleText } from '@/lib/i18n/resolver';

const STORAGE_KEY = 'app-locale';

function readStoredLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function writeStoredLocale(locale) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, locale);
  } catch (err) {
    console.warn(`The locale could not be saved: ${err}`);
  }
}

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ initialLocale, children }) {
  const [locale, setLocaleState] = useState(() => {
    if (initialLocale) return resolveLocale(initialLocale);
    return readStoredLocale();
  });

  useEffect(() => {
    if (!initialLocale) {
      const stored = readStoredLocale();
      if (stored !== locale) setLocaleState(stored);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next) => {
    const resolved = resolveLocale(next);
    writeStoredLocale(resolved);
    setLocaleState(resolved);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext).locale;
}

export function useSetLocale() {
  return useContext(LocaleContext).setLocale;
}

export function useI18n() {
  const locale = useLocale();
  return getLocaleText(locale);
}

let _externalSetter = null;

export function _registerExternalSetter(fn) {
  _externalSetter = fn;
}

export function setLocale(next) {
  const resolved = resolveLocale(next);
  writeStoredLocale(resolved);
  _externalSetter?.(resolved);
}
