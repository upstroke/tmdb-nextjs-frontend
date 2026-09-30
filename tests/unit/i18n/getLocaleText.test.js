import { describe, expect, it } from 'vitest';
import { getLocaleText } from '@/lib/i18n/helpers.js';
import { DEFAULT_LOCALE } from '@/lib/i18n/config.js';

describe('getLocaleText', () => {
  it('returns an object with expected keys for en-US', () => {
    const result = getLocaleText('en-US');
    expect(result).toHaveProperty('locale', 'en-US');
    expect(result).toHaveProperty('labels');
    expect(result).toHaveProperty('messages');
    expect(result).toHaveProperty('titles');
    expect(result).toHaveProperty('buttons');
    expect(result).toHaveProperty('formats');
    expect(result).toHaveProperty('fallbacks');
  });

  it('returns an object with expected keys for de-DE', () => {
    const result = getLocaleText('de-DE');
    expect(result).toHaveProperty('locale', 'de-DE');
    expect(result).toHaveProperty('labels');
  });

  it('falls back to DEFAULT_LOCALE for an unknown locale', () => {
    const result = getLocaleText('xx-XX');
    const fallback = getLocaleText(DEFAULT_LOCALE);
    expect(result.labels).toEqual(fallback.labels);
  });

  it('uses DEFAULT_LOCALE when called without arguments', () => {
    const result = getLocaleText();
    expect(result.locale).toBe(DEFAULT_LOCALE);
  });
});
