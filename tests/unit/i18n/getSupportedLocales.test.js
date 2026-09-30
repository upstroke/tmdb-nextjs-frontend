import { describe, expect, it } from 'vitest';
import { getSupportedLocales } from '@/lib/i18n/helpers.js';

describe('getSupportedLocales', () => {
  it('returns an array', () => {
    expect(Array.isArray(getSupportedLocales())).toBe(true);
  });

  it('contains en-US', () => {
    expect(getSupportedLocales()).toContain('en-US');
  });

  it('contains de-DE', () => {
    expect(getSupportedLocales()).toContain('de-DE');
  });

  it('returns only non-empty strings', () => {
    const locales = getSupportedLocales();
    locales.forEach((l) => {
      expect(typeof l).toBe('string');
      expect(l.length).toBeGreaterThan(0);
    });
  });

  it('returns no duplicate locales', () => {
    const locales = getSupportedLocales();
    expect(new Set(locales).size).toBe(locales.length);
  });
});
