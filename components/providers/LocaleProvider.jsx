'use client';

import { useEffect } from 'react';
import {
  LocaleProvider,
  useSetLocale,
  _registerExternalSetter,
  setLocale as setLocaleExternal
} from '@/lib/stores/locale';

/**
 * Registers the context setter, so that `setLocale` can be called from outside
 * of React. Renders nothing.
 *
 * @returns {null} Nothing.
 */
function ExternalSetterRegistrar() {
  const setLocale = useSetLocale();
  useEffect(() => {
    _registerExternalSetter(setLocale);
    return () => _registerExternalSetter(() => {});
  }, [setLocale]);
  return null;
}

/**
 * Applies a locale to the store and to `document.documentElement.lang`.
 *
 * The locale layout already renders the locale of the URL on the server, so
 * the app itself does not need this component any more. It stays for code and
 * tests that simulate a route change without the layout.
 *
 * @param {object} props - Component props.
 * @param {string} props.locale - Locale to apply, e.g. `"de-DE"`.
 * @returns {null} Nothing.
 */
export function LocaleSyncer({ locale }) {
  useEffect(() => {
    setLocaleExternal(locale);
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

/**
 * Provides the locale context and the external setter.
 *
 * @param {object} props - Component props.
 * @param {string} [props.initialLocale] - Locale of the URL. The provider follows it when it changes.
 * @param {import('react').ReactNode} props.children - Content rendered inside the provider.
 * @returns {JSX.Element} The locale provider.
 */
export function AppLocaleProvider({ initialLocale, children }) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <ExternalSetterRegistrar />
      {children}
    </LocaleProvider>
  );
}
