import uiText from x27@/lib/i18n/ui.jsonx27;
import { DEFAULT_LOCALE } from x27@/lib/i18n/configx27;

const SUPPORTED_LOCALES = new Set(
  Object.values(uiText.locales)
    .map(({ languageCode }) => languageCode)
    .filter(Boolean)
);

export function resolveLocale(value) {
  if (!value) return DEFAULT_LOCALE;
  return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
}
