import { describe, expect, it } from 'vitest';
import { formatDate } from '@/lib/utils/formatDate.js';

describe('formatDate', () => {
  it('formats a valid ISO date for en-US', () => {
    expect(formatDate('2024-05-01', 'en-US')).toBe('5/1/2024');
  });

  it('formats a valid ISO date for de-DE', () => {
    expect(formatDate('2024-05-01', 'de-DE')).toBe('1.5.2024');
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

  it('formats an ISO datetime string containing the year for en-US', () => {
    expect(formatDate('2024-05-01T10:00:00Z', 'en-US')).toMatch(/2024/);
  });
});
