'use client';

import { useEffect } from 'react';
import { LocaleProvider, useSetLocale, _registerExternalSetter } from '@/lib/stores/locale';

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
