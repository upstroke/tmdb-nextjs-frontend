/**
 * Tests for lib/i18n/config.js.
 * Verifies that the exported constants have the correct values and types.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, STORAGE_KEY } from '@/lib/i18n/config.js';

describe('config', () => {
  describe('DEFAULT_LOCALE', () => {
    it('is a string', () => {
      expect(typeof DEFAULT_LOCALE).toBe('string');
    });

    it('equals en-US', () => {
      expect(DEFAULT_LOCALE).toBe('en-US');
    });
  });

  describe('SUPPORTED_LOCALES', () => {
    it('is an array', () => {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    });

    it('contains en-US', () => {
      expect(SUPPORTED_LOCALES).toContain('en-US');
    });

    it('contains de-DE', () => {
      expect(SUPPORTED_LOCALES).toContain('de-DE');
    });

    it('contains es-ES', () => {
      expect(SUPPORTED_LOCALES).toContain('es-ES');
    });

    it('contains fr-FR', () => {
      expect(SUPPORTED_LOCALES).toContain('fr-FR');
    });

    it('contains ru-RU', () => {
      expect(SUPPORTED_LOCALES).toContain('ru-RU');
    });

    it('contains vi-VN', () => {
      expect(SUPPORTED_LOCALES).toContain('vi-VN');
    });

    it('includes DEFAULT_LOCALE', () => {
      expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
    });
  });

  describe('STORAGE_KEY', () => {
    it('is a non-empty string', () => {
      expect(typeof STORAGE_KEY).toBe('string');
      expect(STORAGE_KEY.length).toBeGreaterThan(0);
    });
  });
});
