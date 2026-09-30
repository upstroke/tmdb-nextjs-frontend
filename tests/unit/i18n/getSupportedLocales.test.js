/**
 * The tests verify the return type, the presence of all known locales,
 * and the absence of unknown values in the list returned by getSupportedLocales.
 */
import { describe, expect, it } from 'vitest';
import { getSupportedLocales } from '@/lib/i18n/helpers.js';

describe('getSupportedLocales', () => {
  // Statement coverage: the function returns an array.
  it('returns an array', () => {
    expect(Array.isArray(getSupportedLocales())).toBe(true);
  });

  // Statement coverage: the array is not empty.
  it('returns a non-empty array', () => {
    expect(getSupportedLocales().length).toBeGreaterThan(0);
  });

  // Branch coverage: each known supported locale is included.
  it.each(['en-US', 'de-DE', 'es-ES', 'fr-FR', 'ru-RU', 'vi-VN'])(
    'includes %s in the supported locales',
    (locale) => {
      expect(getSupportedLocales()).toContain(locale);
    }
  );

  // Branch coverage: unsupported locales are not included.
  it('does not include unsupported locales', () => {
    const locales = getSupportedLocales();
    expect(locales).not.toContain('ja-JP');
    expect(locales).not.toContain('zh-CN');
  });

  // Statement coverage: every entry in the array is a non-empty string.
  it('contains only non-empty strings', () => {
    const locales = getSupportedLocales();
    for (const locale of locales) {
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(0);
    }
  });
});
