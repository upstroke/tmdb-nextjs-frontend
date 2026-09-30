/**
 * Unit tests for lib/utils/certificationMeta.js.
 *
 * getCertificationMeta(value, country) is tested across every branch:
 *
 * - empty / null / whitespace value  → returns null
 * - known rating in known system      → returns full metadata object
 * - unknown rating in known system    → returns transparent fallback
 * - unknown / blank rating system     → falls back to US, then fallback
 * - country normalisation (case, trim)
 * - numeric value coercion
 */
import { describe, it, expect } from 'vitest';
import { getCertificationMeta } from '@/lib/utils/certificationMeta';

// ─── null / empty inputs ───────────────────────────────────────────────────

describe('getCertificationMeta – empty value', () => {
  // Statement coverage: !normalizedValue branch → early return null.
  it('returns null for null', () => {
    expect(getCertificationMeta(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(getCertificationMeta(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getCertificationMeta('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(getCertificationMeta('   ')).toBeNull();
  });
});

// ─── known US ratings ─────────────────────────────────────────────────────

describe('getCertificationMeta – US ratings', () => {
  // Statement coverage: happy path – rating found in system, spread into result.
  it('returns correct metadata for G', () => {
    const result = getCertificationMeta('G', 'US');
    expect(result).toEqual({
      value: 'G',
      label: 'G',
      description: 'General Audiences',
      color: '#2e7d32',
      textColor: '#ffffff',
    });
  });

  it('returns correct metadata for PG-13', () => {
    const result = getCertificationMeta('PG-13', 'US');
    expect(result).toMatchObject({
      value: 'PG-13',
      label: 'PG-13',
      color: '#ef6c00',
      textColor: '#ffffff',
    });
  });

  it('returns correct metadata for R', () => {
    const result = getCertificationMeta('R', 'US');
    expect(result).toMatchObject({
      value: 'R',
      label: 'R',
      color: '#c62828',
    });
  });

  // Branch coverage: default country argument → US is used when country is omitted.
  it('defaults to US when country is omitted', () => {
    expect(getCertificationMeta('G')).toEqual(getCertificationMeta('G', 'US'));
  });
});

// ─── known DE ratings ─────────────────────────────────────────────────────

describe('getCertificationMeta – DE ratings', () => {
  it('returns correct metadata for FSK 12', () => {
    const result = getCertificationMeta('12', 'DE');
    expect(result).toEqual({
      value: '12',
      label: 'FSK 12',
      age: 12,
      color: '#4caf50',
      textColor: '#000000',
    });
  });

  it('returns correct metadata for FSK 18', () => {
    const result = getCertificationMeta('18', 'DE');
    expect(result).toMatchObject({
      value: '18',
      label: 'FSK 18',
      color: '#d32f2f',
      textColor: '#ffffff',
    });
  });

  // Branch coverage: numeric value coercion – number 6 is stringified to '6'.
  it('accepts a numeric value and resolves FSK 6', () => {
    const result = getCertificationMeta(6, 'DE');
    expect(result).toMatchObject({ value: '6', label: 'FSK 6' });
  });
});

// ─── country normalisation ──────────────────────────────────────────────────

describe('getCertificationMeta – country normalisation', () => {
  // Branch coverage: normalizeRatingSystem toUpperCase() path.
  it('treats lowercase country code the same as uppercase', () => {
    expect(getCertificationMeta('12', 'de')).toEqual(getCertificationMeta('12', 'DE'));
  });

  it('trims whitespace from country code', () => {
    expect(getCertificationMeta('12', '  DE  ')).toEqual(getCertificationMeta('12', 'DE'));
  });

  // Branch coverage: normalizeRatingSystem returns DEFAULT_RATING_SYSTEM for blank country.
  it('falls back to US when country is an empty string', () => {
    expect(getCertificationMeta('G', '')).toEqual(getCertificationMeta('G', 'US'));
  });

  it('falls back to US when country is null', () => {
    expect(getCertificationMeta('G', null)).toEqual(getCertificationMeta('G', 'US'));
  });
});

// ─── unknown rating in known system ─────────────────────────────────────────

describe('getCertificationMeta – unknown rating', () => {
  // Branch coverage: ratingSystem found but rating key missing → transparent fallback.
  it('returns transparent fallback for unknown US rating', () => {
    const result = getCertificationMeta('XX', 'US');
    expect(result).toEqual({
      value: 'XX',
      label: 'XX',
      color: 'transparent',
      textColor: 'inherit',
    });
  });

  it('returns transparent fallback for unknown DE rating', () => {
    const result = getCertificationMeta('99', 'DE');
    expect(result).toEqual({
      value: '99',
      label: '99',
      color: 'transparent',
      textColor: 'inherit',
    });
  });
});

// ─── unknown rating system ──────────────────────────────────────────────────

describe('getCertificationMeta – unknown rating system', () => {
  // Branch coverage: ratingSystem is undefined (country not in ratings.json)
  // → ratingSystem?.ratings?.[value] is undefined → transparent fallback.
  it('returns transparent fallback for completely unknown country code', () => {
    const result = getCertificationMeta('PG', 'ZZ');
    expect(result).toEqual({
      value: 'PG',
      label: 'PG',
      color: 'transparent',
      textColor: 'inherit',
    });
  });
});
