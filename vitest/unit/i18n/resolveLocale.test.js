/**
 * The tests cover falsy input, unknown locales, and all supported locales
 * to verify that resolveLocale always returns a valid locale string.
 */
import { describe, expect, it } from 'vitest';
import { resolveLocale } from '@/lib/i18n/resolver.js';

describe('resolveLocale', () => {
  // Statement coverage: null input returns the default locale.
  it('returns the default locale for null', () => {
    expect(resolveLocale(null)).toBe('en-US');
  });

  // Branch coverage: undefined input returns the default locale.
  it('returns the default locale for undefined', () => {
    expect(resolveLocale(undefined)).toBe('en-US');
  });

  // Branch coverage: empty string returns the default locale.
  it('returns the default locale for an empty string', () => {
    expect(resolveLocale('')).toBe('en-US');
  });

  // Branch coverage: an unknown locale string returns the default locale.
  it('returns the default locale for an unsupported locale', () => {
    expect(resolveLocale('ja-JP')).toBe('en-US');
  });

  // Statement coverage: a known locale is returned as-is.
  it('returns en-US when en-US is provided', () => {
    expect(resolveLocale('en-US')).toBe('en-US');
  });

  // Branch coverage: each supported locale is returned unchanged.
  it('returns de-DE when de-DE is provided', () => {
    expect(resolveLocale('de-DE')).toBe('de-DE');
  });

  it('returns es-ES when es-ES is provided', () => {
    expect(resolveLocale('es-ES')).toBe('es-ES');
  });

  it('returns fr-FR when fr-FR is provided', () => {
    expect(resolveLocale('fr-FR')).toBe('fr-FR');
  });

  it('returns ru-RU when ru-RU is provided', () => {
    expect(resolveLocale('ru-RU')).toBe('ru-RU');
  });

  it('returns vi-VN when vi-VN is provided', () => {
    expect(resolveLocale('vi-VN')).toBe('vi-VN');
  });
});
