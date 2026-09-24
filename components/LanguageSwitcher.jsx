'use client';

import { useLocale, useSetLocale } from '@/lib/stores/locale';
import { SUPPORTED_LOCALES } from '@/lib/constants/locales';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <div className="language-switcher">
      <select
        className="language-switcher-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        aria-label="Sprache wählen"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc.value} value={loc.value}>{loc.label}</option>
        ))}
      </select>
    </div>
  );
}
