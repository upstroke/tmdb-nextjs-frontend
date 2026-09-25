'use client';

import { useEffect } from 'react';
import { LocaleProvider, useSetLocale, _registerExternalSetter, setLocale as setLocaleExternal } from '@/lib/stores/locale';

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
export function LocaleSyncer({ locale }) {
  useEffect(() => {
    setLocaleExternal(locale);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  return null;
}

export function AppLocaleProvider({ children }) {
  return (
    <LocaleProvider>
      <ExternalSetterRegistrar />
      {children}
    </LocaleProvider>
  );
}
