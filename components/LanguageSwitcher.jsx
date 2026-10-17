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

  const locales = getSupportedLocales().map((code) => ({
    value: code,
    label: code.split('-')[0].toUpperCase()
  }));

  useEffect(() => {
    if (sessionStorage.getItem(RESTORE_FOCUS_KEY) !== 'true') return;

    sessionStorage.removeItem(RESTORE_FOCUS_KEY);

    // The locale change reloads the route. A late hydration/navigation step
    // can reset focus to <body> after the initial focus() call, so keep
    // restoring it for a short, bounded window.
    let frames = 0;

    const restoreFocus = () => {
      const select = selectRef.current;
      if (!select) return;

      if (document.activeElement !== select) {
        select.focus();
      }

      frames += 1;
      if (frames < 20) {
        requestAnimationFrame(restoreFocus);
      }
    };

    restoreFocus();
  }, [currentLocale]);

  /**
   * Switches the app to the selected locale: stores it, swaps the locale
   * segment in the current pathname (or prepends it when missing), and replaces
   * the route without scrolling. Sets a one-shot session flag so the newly
   * mounted language select can restore focus after the navigation.
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
