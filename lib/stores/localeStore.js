'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, STORAGE_KEY } from '@/lib/i18n/config';

const LocaleContext = createContext();

/**
 * Provides global locale state.
 *
 * Reads the persisted locale from `sessionStorage` on mount and
 * exposes `setLocale` to update and persist the active locale.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LOCALES.includes(stored)) {
        setLocaleState(stored);
      }
    } catch (error) {
      console.warn(`Locale could not be loaded from storage: ${error}`);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /**
   * Sets a new locale and persists it to `sessionStorage`.
   *
   * @param {string} newLocale - One of the supported locale codes.
   */
  function setLocale(newLocale) {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn(`Locale "${newLocale}" is not supported`);
      return;
    }

    setLocaleState(newLocale);

    try {
      sessionStorage.setItem(STORAGE_KEY, newLocale);
    } catch (storageError) {
      console.warn(`The locale could not be saved: ${storageError}`);
    }
  }

  if (!isLoaded) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, SUPPORTED_LOCALES }}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to access the locale store.
 *
 * @returns {{ locale: string, setLocale: (locale: string) => void, SUPPORTED_LOCALES: string[] }}
 */
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
}

/**
 * Hook for translated UI texts based on the current locale.
 *
 * @returns {Object} Translation object for the active locale.
 */
export function useI18n() {
  const { locale } = useLocale();
  const { getTranslations } = require('@/lib/i18n/helpers');
  return getTranslations(locale);
}
