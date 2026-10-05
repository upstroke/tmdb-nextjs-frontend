/**
 * The tests cover null, undefined, empty, and whitespace values as well as
 * known ratings for US and DE, unknown ratings in known systems, unknown
 * rating systems, country normalisation (case, trim, null, blank), and
 * numeric value coercion.
 *
 * Expected values are derived from the ratings mock fixtures (ratings.mocks.js)
 * instead of being hardcoded — keeping tests in sync with lib/i18n/ratings.json
 * without duplication.
 */
import { describe, expect, it } from 'vitest';
import { getCertificationMeta } from '@/lib/utils/certificationMeta';
import { ratingsMockDefault, ratingsMockDE } from '@/tests/mocks/ratings.mocks';

const usRatings = ratingsMockDefault.ratingSystem.ratings;
const deRatings = ratingsMockDE.ratingSystem.ratings;

describe('getCertificationMeta', () => {
  // Statement coverage: !normalizedValue branch → early return null.
  it('returns null for null', () => {
    expect(getCertificationMeta(null)).toBeNull();
  });

  // Statement coverage: !normalizedValue branch → early return null.
  it('returns null for undefined', () => {
    expect(getCertificationMeta(undefined)).toBeNull();
  });

  // Statement coverage: !normalizedValue branch → early return null.
  it('returns null for an empty string', () => {
    expect(getCertificationMeta('')).toBeNull();
  });

  // Branch coverage: whitespace-only string is trimmed to '' → early return null.
  it('returns null for a whitespace-only string', () => {
    expect(getCertificationMeta('   ')).toBeNull();
  });

  // Statement coverage: happy path – rating found in US system, spread into result.
  it('returns correct metadata for US rating G', () => {
    expect(getCertificationMeta('G', 'US')).toEqual({
      value: 'G',
      ...usRatings['G']
    });
  });

  // Statement coverage: happy path – PG-13 is a multi-character rating key.
  it('returns correct metadata for US rating PG-13', () => {
    expect(getCertificationMeta('PG-13', 'US')).toMatchObject({
      value: 'PG-13',
      label: usRatings['PG-13'].label,
      color: usRatings['PG-13'].color,
      textColor: usRatings['PG-13'].textColor
    });
  });

  // Statement coverage: happy path – R rating in US system.
  it('returns correct metadata for US rating R', () => {
    expect(getCertificationMeta('R', 'US')).toMatchObject({
      value: 'R',
      label: usRatings['R'].label,
      color: usRatings['R'].color
    });
  });

  // Branch coverage: default country argument → US is used when country is omitted.
  it('defaults to US when country is omitted', () => {
    expect(getCertificationMeta('G')).toEqual(getCertificationMeta('G', 'US'));
  });

  // Statement coverage: happy path – rating found in DE system, spread into result.
  it('returns correct metadata for DE rating FSK 12', () => {
    expect(getCertificationMeta('12', 'DE')).toEqual({
      value: '12',
      ...deRatings['12']
    });
  });

  // Statement coverage: happy path – FSK 18 in DE system.
  it('returns correct metadata for DE rating FSK 18', () => {
    expect(getCertificationMeta('18', 'DE')).toMatchObject({
      value: '18',
      label: deRatings['18'].label,
      color: deRatings['18'].color,
      textColor: deRatings['18'].textColor
    });
  });

  // Branch coverage: numeric value coercion – number 6 is stringified to '6'.
  it('accepts a numeric value and resolves DE rating FSK 6', () => {
    expect(getCertificationMeta(6, 'DE')).toMatchObject({
      value: '6',
      label: deRatings['6'].label
    });
  });

  // Branch coverage: normalizeRatingSystem toUpperCase() path.
  it('treats lowercase country code the same as uppercase', () => {
    expect(getCertificationMeta('12', 'de')).toEqual(getCertificationMeta('12', 'DE'));
  });

  // Branch coverage: normalizeRatingSystem trims surrounding whitespace.
  it('trims whitespace from the country code', () => {
    expect(getCertificationMeta('12', '  DE  ')).toEqual(getCertificationMeta('12', 'DE'));
  });

  // Branch coverage: normalizeRatingSystem returns DEFAULT_RATING_SYSTEM for blank country.
  it('falls back to US when country is an empty string', () => {
    expect(getCertificationMeta('G', '')).toEqual(getCertificationMeta('G', 'US'));
  });

  // Branch coverage: normalizeRatingSystem coerces null to '' → falls back to US.
  it('falls back to US when country is null', () => {
    expect(getCertificationMeta('G', null)).toEqual(getCertificationMeta('G', 'US'));
  });

  // Branch coverage: ratingSystem found but rating key missing → transparent fallback.
  it('returns a transparent fallback for an unknown rating in a known system', () => {
    expect(getCertificationMeta('XX', 'US')).toEqual({
      value: 'XX',
      label: 'XX',
      color: 'transparent',
      textColor: 'inherit'
    });
  });

  // Branch coverage: ratingSystem found but rating key missing → transparent fallback.
  it('returns a transparent fallback for an unknown DE rating', () => {
    expect(getCertificationMeta('99', 'DE')).toEqual({
      value: '99',
      label: '99',
      color: 'transparent',
      textColor: 'inherit'
    });
  });

  // Branch coverage: ratingSystem is undefined (country not in ratings.json) → transparent fallback.
  it('returns a transparent fallback for a completely unknown country code', () => {
    expect(getCertificationMeta('PG', 'ZZ')).toEqual({
      value: 'PG',
      label: 'PG',
      color: 'transparent',
      textColor: 'inherit'
    });
  });
});
