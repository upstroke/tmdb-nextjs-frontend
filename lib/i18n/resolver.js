import uiText from '@/lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const SUPPORTED_LOCALES = new Set(
  Object.values(uiText.locales)
    .map(({ languageCode }) => languageCode)
    .filter(Boolean)
);

/**
 *
 * @param value
 */
export function resolveLocale(value) {
  if (!value) return DEFAULT_LOCALE;
  return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
}
