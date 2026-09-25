'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useI18n, useLocale, setLocale } from '@/lib/stores/locale';
import { getSupportedLocales, resolveLocale } from '@/lib/i18n/helpers';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

export default function LanguageSwitcher() {
  const { labels } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const locales = getSupportedLocales().map((code) => ({ value: code, label: code.split('-')[0].toUpperCase() }));

  function handleChange(event) {
    const nextLocale = resolveLocale(event.currentTarget.value);
    setLocale(nextLocale);

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
      <label htmlFor="language-select" className="u-sr-only">{labels.languageSelect}</label>
      <select id="language-select" value={currentLocale} aria-label={labels.languageSelect} onChange={handleChange}>
        {locales.map((locale) => (<option key={locale.value} value={locale.value}>{locale.label}</option>))}
      </select>
    </div>
  );
}
