// tests/vitest/security/search-input.test.jsx
//
// Security tests for sanitizeSearchInput utility.
// Target: ≥80% statement coverage, ≥80% branch coverage.
//
// Coverage notes:
// - it('rejects XSS attempts'): Covers dangerous tag removal branch.
// - it('preserves HTML special characters'): Covers safe text passthrough branch.
// - it('truncates overly long inputs'): Covers maxLength truncation branch.
// - Additional tests below cover: non-string input, empty string, control char removal.

import { describe, it, expect } from 'vitest';
import { sanitizeSearchInput } from '../../../lib/utils/sanitize.js';

describe('Security: Search Input', () => {
  // Statement coverage: dangerous tag removal branch
  it('rejects XSS attempts', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeSearchInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });

  // Statement coverage: safe text passthrough branch
  it('preserves HTML special characters', () => {
    const input = 'Movie & TV <Show>';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('Movie & TV <Show>');
  });

  // Statement coverage: maxLength truncation branch
  it('truncates overly long inputs', () => {
    const longInput = 'a'.repeat(200);
    const sanitized = sanitizeSearchInput(longInput);
    expect(sanitized.length).toBeLessThanOrEqual(100);
  });

  // Statement coverage: non-string input branch (returns '')
  it('returns empty string for non-string inputs', () => {
    expect(sanitizeSearchInput(null)).toBe('');
    expect(sanitizeSearchInput(undefined)).toBe('');
    expect(sanitizeSearchInput(123)).toBe('');
    expect(sanitizeSearchInput({})).toBe('');
  });

  // Statement coverage: empty string handling
  it('handles empty inputs correctly', () => {
    expect(sanitizeSearchInput('')).toBe('');
    expect(sanitizeSearchInput('   ')).toBe('');
  });

  // Statement coverage: control character removal branch
  it('removes control characters', () => {
    const inputWithControlChars = 'test\x00\x1F\x7Finput';
    const sanitized = sanitizeSearchInput(inputWithControlChars);
    expect(sanitized).toBe('testinput');
  });

  // Statement coverage: trim + maxLength combined
  it('trims and truncates simultaneously', () => {
    const input = '   ' + 'a'.repeat(150) + '   ';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('a'.repeat(100));
  });

  // Statement coverage: dangerous iframe tag removal
  it('removes iframe tags', () => {
    const input = 'text<iframe src="evil.com"></iframe>more';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('textmore');
  });

  // Statement coverage: event handler removal
  it('removes event handlers', () => {
    const input = '<img src=x onerror=alert(1)>';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('<img src=x>');
  });
});
