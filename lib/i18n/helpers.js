import uiText from '@/lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const SUPPORTED_LOCALES = new Set(
  Object.values(uiText.locales)
    .map(({ languageCode }) => languageCode)
    .filter(Boolean)
);

export function getSupportedLocales() {
  return [...SUPPORTED_LOCALES];
}

export function getLocaleText(locale = DEFAULT_LOCALE) {
  const locales = uiText.locales;
  const current = locales[locale] ?? locales[DEFAULT_LOCALE];

  return {
    locale,
    labels: current.labels,
    messages: current.messages,
    titles: current.titles,
    buttons: current.buttons,
    formats: current.formats,
    fallbacks: current.fallbacks
  };
}
