/**
 * The tests verify that getLocaleText returns all required keys,
 * falls back to the default locale for unknown values,
 * and exposes the locale string in the returned object.
 */
import { describe, expect, it } from 'vitest';
import { getLocaleText } from '@/lib/i18n/helpers.js';

const REQUIRED_KEYS = ['locale', 'labels', 'messages', 'titles', 'buttons', 'formats', 'fallbacks'];

describe('getLocaleText', () => {
  // Statement coverage: calling without arguments uses the default locale.
  it('returns a result for the default locale when called without arguments', () => {
    const result = getLocaleText();
    expect(result.locale).toBe('en-US');
  });

  // Statement coverage: all required top-level keys are present.
  it('returns all required top-level keys for a supported locale', () => {
    const result = getLocaleText('en-US');
    for (const key of REQUIRED_KEYS) {
      expect(result).toHaveProperty(key);
    }
  });

  // Branch coverage: an unsupported locale falls back to the default locale data.
  it('falls back to the default locale for an unsupported locale', () => {
    const fallback = getLocaleText('en-US');
    const result = getLocaleText('ja-JP');
    expect(result.labels).toEqual(fallback.labels);
  });

  // Branch coverage: the locale field in the returned object reflects the requested locale, not the fallback.
  it('sets the locale field to the requested value even when falling back', () => {
    const result = getLocaleText('ja-JP');
    expect(result.locale).toBe('ja-JP');
  });

  // Statement coverage: de-DE returns different labels than en-US.
  it('returns locale-specific labels for de-DE', () => {
    const enResult = getLocaleText('en-US');
    const deResult = getLocaleText('de-DE');
    expect(deResult.labels).not.toEqual(enResult.labels);
  });

  // Branch coverage: all supported locales return an object with all required keys.
  it.each(['en-US', 'de-DE', 'es-ES', 'fr-FR', 'ru-RU', 'vi-VN'])(
    'returns all required keys for %s',
    (locale) => {
      const result = getLocaleText(locale);
      for (const key of REQUIRED_KEYS) {
        expect(result).toHaveProperty(key);
      }
    }
  );
});
