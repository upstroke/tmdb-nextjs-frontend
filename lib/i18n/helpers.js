import uiText from x27@/lib/i18n/ui.jsonx27;
import { DEFAULT_LOCALE } from x27@/lib/i18n/configx27;

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
    fallbacks: current.fallbacks,
  };
}
