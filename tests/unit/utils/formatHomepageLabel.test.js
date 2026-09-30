import { describe, expect, it } from 'vitest';
import { formatHomepageLabel } from '@/lib/utils/formatHomepageLabel.js';

describe('formatHomepageLabel', () => {
  it('removes https:// prefix', () => {
    expect(formatHomepageLabel('https://example.com')).toBe('example.com');
  });

  it('removes http:// prefix', () => {
    expect(formatHomepageLabel('http://example.com')).toBe('example.com');
  });

  it('leaves a URL without protocol unchanged', () => {
    expect(formatHomepageLabel('example.com')).toBe('example.com');
  });

  it('returns an empty string for empty input', () => {
    expect(formatHomepageLabel('')).toBe('');
  });

  it('returns an empty string when called with no arguments', () => {
    expect(formatHomepageLabel()).toBe('');
  });

  it('does not strip a second https:// in the path', () => {
    expect(formatHomepageLabel('https://example.com/redirect?url=https://other.com')).toBe(
      'example.com/redirect?url=https://other.com',
    );
  });
});
