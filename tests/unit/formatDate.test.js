import { describe, expect, it } from 'vitest';
import { formatDate } from '@/lib/utils/formatDate.js';

describe('formatDate', () => {
  it('formats a valid ISO date for en-US', () => {
    const result = formatDate('2024-05-01', 'en-US');

    expect(result).toBe('5/1/2024');
  });

  it('formats a valid ISO date for de-DE', () => {
    const result = formatDate('2024-05-01', 'de-DE');

    expect(result).toBe('1.5.2024');
  });

  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('returns the original string for a fully invalid date', () => {
    expect(formatDate('not-a-date', 'en-US')).toBe('not-a-date');
  });

  it('returns the original string for an incomplete ISO date (YYYY-MM)', () => {
    expect(formatDate('2024-05', 'en-US')).toBe('2024-05');
  });

  it('returns the original string for a rolled-over invalid date (2024-02-30)', () => {
    expect(formatDate('2024-02-30', 'en-US')).toBe('2024-02-30');
  });

  it('formats an ISO datetime string for en-US', () => {
    const result = formatDate('2024-05-01T10:00:00Z', 'en-US');

    expect(result).toMatch(/2024/);
  });
});
