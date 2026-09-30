import { describe, expect, it } from 'vitest';
import { resolveLocale } from '@/lib/i18n/resolver.js';
import { DEFAULT_LOCALE } from '@/lib/i18n/config.js';

describe('resolveLocale', () => {
  it('returns the locale unchanged when it is supported', () => {
    expect(resolveLocale('de-DE')).toBe('de-DE');
  });

  it('returns DEFAULT_LOCALE for an unsupported locale', () => {
    expect(resolveLocale('xx-XX')).toBe(DEFAULT_LOCALE);
  });

  it('returns DEFAULT_LOCALE for undefined', () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it('returns DEFAULT_LOCALE for null', () => {
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
  });

  it('returns DEFAULT_LOCALE for an empty string', () => {
    expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
  });

  it('resolves all supported locales correctly', () => {
    const supported = ['en-US', 'de-DE', 'es-ES', 'fr-FR', 'ru-RU', 'vi-VN'];
    supported.forEach((locale) => {
      expect(resolveLocale(locale)).toBe(locale);
    });
  });
});
