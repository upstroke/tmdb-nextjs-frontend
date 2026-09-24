/**
 * i18n helpers — ported from SvelteKit src/lib/i18n/helpers.js
 * No framework-specific changes needed; $lib/... replaced with @/lib/...
 */
import uiText from '@/lib/i18n/ui.json';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const SUPPORTED_LOCALES = new Set(
  Object.values(uiText.locales)
    .map(({ languageCode }) => languageCode)
    .filter(Boolean)
);

/**
 * Normalizes a locale to a language supported in the project.
 * Empty or unknown values fall back to the default locale.
 */
export function resolveLocale(value: string | null | undefined): string {
  if (!value) return DEFAULT_LOCALE;
  return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
}

export function getSupportedLocales(): string[] {
  return [...SUPPORTED_LOCALES];
}
