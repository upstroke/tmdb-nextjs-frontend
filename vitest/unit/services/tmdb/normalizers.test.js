import { describe, expect, it } from 'vitest';
import {
  NOT_AVAILABLE_IMAGE,
  toNumberOrNull,
  toProductionCompanies,
  toRating,
  toArray,
  toStringValue
} from '@/lib/services/tmdb/normalizers';

describe('toStringValue', () => {
  it('returns a string unchanged', () => {
    expect(toStringValue('Fight Club')).toBe('Fight Club');
  });

  it('returns the default fallback for non-string values', () => {
    expect(toStringValue(null)).toBe('');
    expect(toStringValue(undefined)).toBe('');
    expect(toStringValue(42)).toBe('');
    expect(toStringValue({})).toBe('');
  });

  it('returns a custom fallback for non-string values', () => {
    expect(toStringValue(null, 'N/A')).toBe('N/A');
    expect(toStringValue(undefined, 'N/A')).toBe('N/A');
  });

  it('returns an empty string for an empty string', () => {
    expect(toStringValue('')).toBe('');
  });
});

describe('toNumberOrNull', () => {
  it('returns finite numbers unchanged', () => {
    expect(toNumberOrNull(0)).toBe(0);
    expect(toNumberOrNull(7.5)).toBe(7.5);
    expect(toNumberOrNull(-3)).toBe(-3);
  });

  it('returns null for non-finite numbers', () => {
    expect(toNumberOrNull(Number.NaN)).toBeNull();
    expect(toNumberOrNull(Number.POSITIVE_INFINITY)).toBeNull();
    expect(toNumberOrNull(Number.NEGATIVE_INFINITY)).toBeNull();
  });

  it('returns null for non-number values', () => {
    expect(toNumberOrNull('8.8')).toBeNull();
    expect(toNumberOrNull(null)).toBeNull();
    expect(toNumberOrNull(undefined)).toBeNull();
    expect(toNumberOrNull({})).toBeNull();
  });
});

describe('toRating', () => {
  it('returns finite ratings unchanged', () => {
    expect(toRating(0)).toBe(0);
    expect(toRating(8.8)).toBe(8.8);
  });

  it('returns zero for non-finite ratings', () => {
    expect(toRating(Number.NaN)).toBe(0);
    expect(toRating(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('returns zero for non-number ratings', () => {
    expect(toRating('8.8')).toBe(0);
    expect(toRating(null)).toBe(0);
    expect(toRating(undefined)).toBe(0);
  });
});

describe('toArray', () => {
  it('returns arrays unchanged', () => {
    const value = [1, 2, 3];

    expect(toArray(value)).toBe(value);
  });

  it('returns an empty array for non-array values', () => {
    expect(toArray(null)).toEqual([]);
    expect(toArray(undefined)).toEqual([]);
    expect(toArray('items')).toEqual([]);
    expect(toArray({ length: 2 })).toEqual([]);
  });

  it('returns an empty array for an empty array', () => {
    expect(toArray([])).toEqual([]);
  });
});

describe('toProductionCompanies', () => {
  it('normalizes companies and converts missing logos to null', () => {
    const companies = toProductionCompanies([
      { id: 1, name: 'A24', logo_path: '/a24.png' },
      { id: 2, name: 'Netflix', logo_path: null },
      { id: 3, name: 'No Logo' }
    ]);

    expect(companies).toEqual([
      { id: 1, name: 'A24', logo_path: '/a24.png' },
      { id: 2, name: 'Netflix', logo_path: null },
      { id: 3, name: 'No Logo', logo_path: null }
    ]);
  });

  it('returns an empty array for non-array input', () => {
    expect(toProductionCompanies(null)).toEqual([]);
    expect(toProductionCompanies(undefined)).toEqual([]);
    expect(toProductionCompanies({})).toEqual([]);
  });

  it('returns an empty array for an empty array', () => {
    expect(toProductionCompanies([])).toEqual([]);
  });
});

describe('NOT_AVAILABLE_IMAGE', () => {
  it('uses the local placeholder image', () => {
    expect(NOT_AVAILABLE_IMAGE).toBe('/not-available.png');
  });
});
