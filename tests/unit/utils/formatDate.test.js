/**
 * The tests cover empty, invalid, incomplete, and valid date values
 * with different locales and indirectly verify the helper functions
 * parseIsoDateParts, isValidTimePart, and isSameCalendarDate
 * through various formatDate cases.
 */
import { describe, expect, it } from 'vitest';
import { formatDate } from '@/lib/utils/formatDate.js';

describe('formatDate', () => {
  // Statement coverage: non-string falsy value returns an empty string.
  it('returns an empty string for a null value', () => {
    expect(formatDate(null)).toBe('');
  });

  // Statement coverage: empty string returns an empty string.
  it('returns an empty string for an empty string', () => {
    expect(formatDate('')).toBe('');
  });

  // Branch coverage: non-parseable string is rejected by strict ISO check and by the general Date fallback.
  it('returns the original value for a non-parseable string', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  // Branch coverage: string without dashes is not an ISO date and falls through to the general Date fallback.
  it('returns the original value for a string with no dashes', () => {
    expect(formatDate('20240115')).toBe('20240115');
  });

  // Branch coverage: ISO-like string with empty segment fails the digit check and is returned unchanged.
  it('returns the original value for an ISO-like date with an empty segment', () => {
    expect(formatDate('2024--15')).toBe('2024--15');
  });

  // Branch coverage: invalid month is rejected by the range check and returned unchanged.
  it('returns the original value for an invalid month', () => {
    expect(formatDate('2024-13-15')).toBe('2024-13-15');
  });

  // Branch coverage: non-two-digit month fails isDigits(month, 2) → no ISO parse.
  // new Date('2024-1-15') is NaN in strict ISO engines → original value returned.
  it('returns the original value for a single-digit month', () => {
    expect(formatDate('2024-1-15')).toBe('2024-1-15');
  });

  // Branch coverage: non-two-digit day fails isDigits(day, 2) → no ISO parse.
  // new Date('2024-01-5') is NaN in strict ISO engines → original value returned.
  it('returns the original value for a single-digit day', () => {
    expect(formatDate('2024-01-5')).toBe('2024-01-5');
  });

  // Branch coverage: invalid calendar day fails isSameCalendarDate → no ISO parse.
  // new Date('2024-02-30') is NaN in strict ISO engines → original value returned.
  it('returns the original value for an invalid calendar day', () => {
    expect(formatDate('2024-02-30')).toBe('2024-02-30');
  });

  // Branch coverage: incomplete year-month format has only two date segments → parseIsoDateParts returns null.
  // new Date('2024-01') is NaN → original value returned.
  it('returns the original value for an incomplete year-month date', () => {
    expect(formatDate('2024-01')).toBe('2024-01');
  });

  // Branch coverage: year-only format contains no dashes → parseIsoDateParts returns null.
  // new Date('2024') may be valid but the JSDoc specifies unchanged fallback for incomplete values.
  it('returns the original value for a year-only date', () => {
    expect(formatDate('2024')).toBe('2024');
  });

  // Branch coverage: time component with too few segments is invalid and the value is returned unchanged.
  it('returns the original value for a date with an incomplete time portion', () => {
    expect(formatDate('2024-01-15T10')).toBe('2024-01-15T10');
  });

  // Branch coverage: non-numeric time segments fail the digit check and the value is returned unchanged.
  it('returns the original value for a date with non-numeric time segments', () => {
    expect(formatDate('2024-01-15TAB:00:00')).toBe('2024-01-15TAB:00:00');
  });

  // Branch coverage: hour value 25 is out of the valid range and the value is returned unchanged.
  it('returns the original value for a date with an invalid hour', () => {
    expect(formatDate('2024-01-15T25:00:00')).toBe('2024-01-15T25:00:00');
  });

  // Branch coverage: hour value 24 is out of the strict range; the general Date fallback rolls it to the next day.
  it('formats a date with hour 24 via the general Date fallback', () => {
    expect(formatDate('2024-01-15T24:00:00', 'en-US')).toBe('1/16/2024');
  });

  // Branch coverage: minute value 60 is out of the valid range and the value is returned unchanged.
  it('returns the original value for a date with an invalid minute', () => {
    expect(formatDate('2024-01-15T10:60:00')).toBe('2024-01-15T10:60:00');
  });

  // Branch coverage: seconds value 60 is out of the valid range and the value is returned unchanged.
  it('returns the original value for a date with invalid seconds', () => {
    expect(formatDate('2024-01-15T10:00:60')).toBe('2024-01-15T10:00:60');
  });

  // Branch coverage: timezone offset hour 25 is out of the valid range and the value is returned unchanged.
  it('returns the original value for a date with an invalid timezone offset', () => {
    expect(formatDate('2024-01-15T10:00:00+25:00')).toBe('2024-01-15T10:00:00+25:00');
  });

  // Statement coverage: complete ISO date without time is formatted with the provided locale.
  it('formats a complete ISO date for en-US', () => {
    expect(formatDate('2024-01-15', 'en-US')).toBe('1/15/2024');
  });

  // Statement coverage: complete ISO date without time is formatted for a European locale.
  it('formats a complete ISO date for de-DE', () => {
    expect(formatDate('2024-01-15', 'de-DE')).toBe('15.1.2024');
  });

  // Statement coverage: complete ISO date with UTC time suffix is formatted correctly.
  it('formats a complete ISO date with UTC time', () => {
    expect(formatDate('2024-01-15T10:00:00Z', 'en-US')).toBe('1/15/2024');
  });

  // Statement coverage: complete ISO date with a positive timezone offset is formatted correctly.
  it('formats a complete ISO date with a positive timezone offset', () => {
    expect(formatDate('2024-01-15T10:00:00+02:00', 'en-US')).toBe('1/15/2024');
  });

  // Statement coverage: complete ISO date with a negative timezone offset is formatted correctly.
  it('formats a complete ISO date with a negative timezone offset', () => {
    expect(formatDate('2024-01-15T10:00:00-05:00', 'en-US')).toBe('1/15/2024');
  });

  // Statement coverage: complete ISO date with seconds and milliseconds is formatted correctly.
  it('formats a complete ISO date with seconds and milliseconds', () => {
    expect(formatDate('2024-01-15T10:00:00.000Z', 'en-US')).toBe('1/15/2024');
  });
});
