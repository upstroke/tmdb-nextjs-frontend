'use client';

import { useEffect } from 'react';
import {
  LocaleProvider,
  useSetLocale,
  _registerExternalSetter,
  setLocale as setLocaleExternal
} from '@/lib/stores/locale';

/**
 *
 */
function ExternalSetterRegistrar() {
  const setLocale = useSetLocale();
  useEffect(() => {
    _registerExternalSetter(setLocale);
    return () => _registerExternalSetter(() => {});
  }, [setLocale]);
  return null;
}

// Receives the server-side locale from [locale]/layout and syncs the store
// without remounting the provider.
/**
 *
 * @param root0
 * @param root0.locale
 */
export function LocaleSyncer({ locale }) {
  useEffect(() => {
    setLocaleExternal(locale);
    document.documentElement.lang = locale;
     
  }, [locale]);
  return null;
}

/**
 *
 * @param root0
 * @param root0.children
 */
export function AppLocaleProvider({ children }) {
  return (
    <LocaleProvider>
      <ExternalSetterRegistrar />
      {children}
    </LocaleProvider>
  );
}
