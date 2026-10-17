'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n, useLocale, setLocale } from '@/lib/stores/locale';
import { getSupportedLocales } from '@/lib/i18n/helpers';
import { resolveLocale } from '@/lib/i18n/resolver';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

/**
 * Dropdown control for switching the active locale.
 *
 * On change the component updates the global locale store, replaces the locale
 * segment in the current pathname, and performs a client-side navigation to the
 * same route in the selected language. After the navigation, focus is restored
 * to the language select.
 *
 * @returns {JSX.Element}
 */
export default function LanguageSwitcher() {
  const { labels } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const selectRef = useRef(null);
  const shouldRestoreFocusRef = useRef(false);

  const locales = getSupportedLocales().map((code) => ({
    value: code,
    label: code.split('-')[0].toUpperCase()
  }));

  useEffect(() => {
    if (!shouldRestoreFocusRef.current) return;

    shouldRestoreFocusRef.current = false;
    selectRef.current?.focus();
  }, [currentLocale]);

  /**
   * Switches the app to the selected locale: stores it, swaps the locale
   * segment in the current pathname (or prepends it when missing), and replaces
   * the route without scrolling. Marks the select for focus restoration after
   * the locale change.
   *
   * @param {import('react').ChangeEvent<HTMLSelectElement>} event - Change event of the language select.
   * @returns {void}
   */
  function handleChange(event) {
    const nextLocale = resolveLocale(event.currentTarget.value);
    setLocale(nextLocale);
    shouldRestoreFocusRef.current = true;

    const currentSegment = SUPPORTED_LOCALES.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
    );
    const newPathname = currentSegment
      ? pathname.replace(`/${currentSegment}`, `/${nextLocale}`)
      : `/${nextLocale}${pathname}`;

    router.replace(newPathname, { scroll: false });
  }

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="u-sr-only">
        {labels.languageSelect}
      </label>
      <select
        ref={selectRef}
        id="language-select"
        value={currentLocale}
        aria-label={labels.languageSelect}
        onChange={handleChange}
      >
        {locales.map((locale) => (
          <option key={locale.value} value={locale.value}>
            {locale.label}
          </option>
        ))}
      </select>
    </div>
  );
}
