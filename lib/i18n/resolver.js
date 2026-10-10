import uiText from '@/lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const SUPPORTED_LOCALES = new Set(
  Object.values(uiText.locales)
    .map(({ languageCode }) => languageCode)
    .filter(Boolean)
);

/**
 * Validates a locale value against the locales defined in `ui.json`.
 *
 * @param {string|null|undefined} value - Locale code to check, e.g. `"de-DE"`.
 * @returns {string} The value itself when supported; otherwise `DEFAULT_LOCALE`.
 */
export function resolveLocale(value) {
  if (!value) return DEFAULT_LOCALE;
  return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
}
