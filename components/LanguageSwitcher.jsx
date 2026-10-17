'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n, useLocale, setLocale } from '@/lib/stores/locale';
import { getSupportedLocales } from '@/lib/i18n/helpers';
import { resolveLocale } from '@/lib/i18n/resolver';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

const RESTORE_FOCUS_KEY = 'restore-language-select-focus';

/**
 * Dropdown control for switching the active locale.
 *
 * On change the component updates the global locale store, replaces the locale
 * segment in the current pathname, and performs a client-side navigation to the
 * same route in the selected language. The select element can be replaced by a
 * later render; a ref callback restores focus to each newly mounted select
 * while the one-shot session flag is present.
 *
 * @returns {JSX.Element}
 */
export default function LanguageSwitcher() {
  const { labels } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const selectRef = useRef(null);

  const locales = getSupportedLocales().map((code) => ({
    value: code,
    label: code.split('-')[0].toUpperCase()
  }));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      sessionStorage.removeItem(RESTORE_FOCUS_KEY);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  /**
   * Stores the select node and restores focus when a new select mounts while
   * the one-shot locale-focus flag is present.
   *
   * @param {HTMLSelectElement|null} node - Mounted select element.
   * @returns {void}
   */
  function handleSelectRef(node) {
    selectRef.current = node;

    if (node && sessionStorage.getItem(RESTORE_FOCUS_KEY) === 'true') {
      node.focus();
    }
  }

  /**
   * Switches the app to the selected locale: stores it, swaps the locale
   * segment in the current pathname (or prepends it when missing), and replaces
   * the route without scrolling. Sets a one-shot session flag so newly mounted
   * language selects can restore focus after the navigation.
   *
   * @param {import('react').ChangeEvent<HTMLSelectElement>} event - Change event of the language select.
   * @returns {void}
   */
  function handleChange(event) {
    const nextLocale = resolveLocale(event.currentTarget.value);
    setLocale(nextLocale);
    sessionStorage.setItem(RESTORE_FOCUS_KEY, 'true');

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
        ref={handleSelectRef}
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
