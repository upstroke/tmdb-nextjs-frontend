import uiText from '@/lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const SUPPORTED_LOCALES = new Set(
  Object.values(uiText.locales)
    .map(({ languageCode }) => languageCode)
    .filter(Boolean)
);

/**
 * Returns all locale codes defined in `ui.json`.
 *
 * @returns {string[]} Unique language codes, e.g. `["en-US", "de-DE"]`.
 */
export function getSupportedLocales() {
  return [...SUPPORTED_LOCALES];
}

/**
 * Returns the UI text bundle for a locale.
 *
 * Falls back to the texts of `DEFAULT_LOCALE` when the locale is not defined in
 * `ui.json`. The returned `locale` field echoes the requested value, not the
 * fallback.
 *
 * @param {string} [locale=DEFAULT_LOCALE] - Locale code to load.
 * @returns {{
 *   locale: string,
 *   labels: object,
 *   messages: object,
 *   titles: object,
 *   buttons: object,
 *   formats: object,
 *   fallbacks: object
 * }} Text groups for the locale.
 */
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
