'use client';

import { useEffect } from 'react';
import {
  LocaleProvider,
  useSetLocale,
  _registerExternalSetter,
  setLocale as setLocaleExternal
} from '@/lib/stores/locale';

/**
 * Registers the locale setter of the provider as the external setter, so that
 * non-React code can change the locale through `setLocale` from the store.
 * Unregisters it again on unmount.
 *
 * @returns {null} Renders nothing.
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
 * Receives the server-side locale from `[locale]/layout` and syncs the store
 * and the `lang` attribute of the document without remounting the provider.
 *
 * @param {object} props - Component props.
 * @param {string} props.locale - Locale resolved on the server, e.g. `"de-DE"`.
 * @returns {null} Renders nothing.
 */
export function LocaleSyncer({ locale }) {
  useEffect(() => {
    setLocaleExternal(locale);
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

/**
 * Wraps the app in the locale context and registers the external setter.
 *
 * @param {object} props - Component props.
 * @param {import('react').ReactNode} props.children - Content rendered inside the provider.
 * @returns {JSX.Element} The locale provider with its children.
 */
export function AppLocaleProvider({ children }) {
  return (
    <LocaleProvider>
      <ExternalSetterRegistrar />
      {children}
    </LocaleProvider>
  );
}
