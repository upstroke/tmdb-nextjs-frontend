import { describe, it, expect } from 'vitest';
import { sanitizeSearchInput } from '@/lib/utils/sanitize';

describe('Security: Search Input', () => {
  it('rejects XSS attempts', () => {
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)"></iframe>',
    ];

    for (const input of maliciousInputs) {
      const sanitized = sanitizeSearchInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('<iframe>');
    }
  });

  it('preserves HTML special characters', () => {
    const safeInputs = [
      'The Godfather & The Godfather Part II',
      'Batman: The Dark Knight',
      'Is 300 a movie?',
      'Movies with "quotes"',
    ];

    for (const input of safeInputs) {
      const sanitized = sanitizeSearchInput(input);
      expect(sanitized).toBe(input);
    }
  });

  it('truncates overly long inputs', () => {
    const longInput = 'a'.repeat(1000);
    const sanitized = sanitizeSearchInput(longInput);
    expect(sanitized.length).toBeLessThanOrEqual(100);
  });

  it('returns empty string for non-string inputs', () => {
    expect(sanitizeSearchInput(null)).toBe('');
    expect(sanitizeSearchInput(undefined)).toBe('');
    expect(sanitizeSearchInput(123)).toBe('');
    expect(sanitizeSearchInput({})).toBe('');
    expect(sanitizeSearchInput([])).toBe('');
  });

  it('handles empty inputs correctly', () => {
    expect(sanitizeSearchInput('')).toBe('');
    expect(sanitizeSearchInput('   ')).toBe('');
  });

  it('removes control characters', () => {
    const input = 'test\u0000\u001F\u007Finput';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('testinput');
  });

  it('trims and truncates simultaneously', () => {
    const input = '   ' + 'a'.repeat(200) + '   ';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized.length).toBeLessThanOrEqual(100);
    expect(sanitized.startsWith(' ')).toBe(false);
    expect(sanitized.endsWith(' ')).toBe(false);
  });

  it('removes iframe tags', () => {
    const input = '<iframe src="https://example.com"></iframe>movie';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).not.toContain('<iframe>');
    expect(sanitized).not.toContain('</iframe>');
  });

  it('removes event handlers', () => {
    const input = '<div onclick="alert(1)">test</div>';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).not.toContain('onclick');
  });
});
