'use client';

import { useEffect } from 'react';
import { LocaleProvider, useSetLocale, _registerExternalSetter } from '@/lib/stores/locale';

function ExternalSetterRegistrar() {
  const setLocale = useSetLocale();
  useEffect(() => {
    _registerExternalSetter(setLocale);
    return () => _registerExternalSetter(() => {});
  }, [setLocale]);
  return null;
}

interface AppLocaleProviderProps {
  initialLocale?: string | null;
  children: React.ReactNode;
}

export function AppLocaleProvider({ initialLocale, children }: AppLocaleProviderProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <ExternalSetterRegistrar />
      {children}
    </LocaleProvider>
  );
}
