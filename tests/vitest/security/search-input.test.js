// tests/vitest/security/search-input.test.js
import { sanitizeSearchInput } from '@/utils/sanitize';

describe('Security: Search Input', () => {
  it('weist XSS-Versuche ab', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeSearchInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });

  it('escapt HTML-Sonderzeichen', () => {
    const input = 'Movie & TV <Show>';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('Movie & TV <Show>');
  });

  it('kürzt zu lange Inputs', () => {
    const longInput = 'a'.repeat(200);
    const sanitized = sanitizeSearchInput(longInput);
    expect(sanitized.length).toBeLessThanOrEqual(100);
  });
});
