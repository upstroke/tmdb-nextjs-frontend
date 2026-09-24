'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/stores/i18n';
import { useLocale, setLocale } from '@/lib/stores/locale';
import { getSupportedLocales, resolveLocale } from '@/lib/i18n/helpers';

/**
 * Provides the language selector in the header.
 * Synchronizes the selection with the URL, locale store, and current route.
 */
export default function LanguageSwitcher() {
  const { labels } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale();

  const locales = getSupportedLocales().map((code) => ({
    value: code,
    label: code.split('-')[0].toUpperCase(),
  }));

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = resolveLocale(event.currentTarget.value);
    setLocale(nextLocale);

    // Update URL search param ?locale=
    const params = new URLSearchParams(searchParams.toString());
    params.set('locale', nextLocale);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="u-sr-only">
        {labels.languageSelect}
      </label>
      <select
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
