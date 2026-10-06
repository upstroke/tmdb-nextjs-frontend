/**
 * The tests cover empty input, URLs with and without protocol,
 * and the edge cases of the regex in formatHomepageLabel.
 */
import { describe, expect, it } from 'vitest';
import { formatHomepageLabel } from '@/lib/utils/formatHomepageLabel.js';

describe('formatHomepageLabel', () => {
  // Statement coverage: no argument uses the default empty string and returns empty.
  it('returns an empty string when called without arguments', () => {
    expect(formatHomepageLabel()).toBe('');
  });

  // Statement coverage: empty string input returns an empty string.
  it('returns an empty string for an empty string', () => {
    expect(formatHomepageLabel('')).toBe('');
  });

  // Branch coverage: https:// prefix is removed.
  it('removes the https:// protocol', () => {
    expect(formatHomepageLabel('https://example.com')).toBe('example.com');
  });

  // Branch coverage: http:// prefix is removed.
  it('removes the http:// protocol', () => {
    expect(formatHomepageLabel('http://example.com')).toBe('example.com');
  });

  // Branch coverage: URL without a protocol is returned unchanged.
  it('returns a URL without a protocol unchanged', () => {
    expect(formatHomepageLabel('example.com')).toBe('example.com');
  });

  // Branch coverage: URL with a path segment has only the protocol removed.
  it('removes the protocol but keeps the full path', () => {
    expect(formatHomepageLabel('https://example.com/path/to/page')).toBe(
      'example.com/path/to/page'
    );
  });

  // Branch coverage: ftp:// is not matched by the regex and is returned unchanged.
  it('returns a URL with an unsupported protocol unchanged', () => {
    expect(formatHomepageLabel('ftp://example.com')).toBe('ftp://example.com');
  });
});
