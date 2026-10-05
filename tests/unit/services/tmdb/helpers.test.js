/**
 * Tests for lib/services/tmdb/helpers.js.
 * Covers getMediaType, getTitle, getDate, and getImageUrl.
 */
import { describe, expect, it } from 'vitest';
import { getMediaType, getTitle, getDate, getImageUrl } from '@/lib/services/tmdb/helpers.js';

describe('getMediaType', () => {
  // Branch: fallback is used when provided.
  it('returns the fallback when a fallback is provided', () => {
    expect(getMediaType({ media_type: 'tv' }, 'movie')).toBe('movie');
  });

  // Branch: explicit media_type field is used when no fallback.
  it('returns media_type from item when no fallback', () => {
    expect(getMediaType({ media_type: 'tv' })).toBe('tv');
  });

  // Branch: infers movie from title field.
  it('infers movie from title field', () => {
    expect(getMediaType({ title: 'Inception' })).toBe('movie');
  });

  // Branch: infers tv from name field when title is absent.
  it('infers tv from name field', () => {
    expect(getMediaType({ name: 'Breaking Bad' })).toBe('tv');
  });

  // Branch: returns null when type cannot be determined.
  it('returns null when no media_type, title, or name', () => {
    expect(getMediaType({})).toBeNull();
  });

  // Edge case: explicit fallback null returns item media_type.
  it('returns media_type from item when fallback is null', () => {
    expect(getMediaType({ media_type: 'movie' }, null)).toBe('movie');
  });
});

describe('getTitle', () => {
  // Statement: movie title.
  it('returns title for a movie item', () => {
    expect(getTitle({ title: 'Inception', name: 'Other' })).toBe('Inception');
  });

  // Branch: falls back to name when title is absent.
  it('returns name when title is absent', () => {
    expect(getTitle({ name: 'Breaking Bad' })).toBe('Breaking Bad');
  });

  // Branch: returns empty string when both are absent.
  it('returns empty string when neither title nor name is present', () => {
    expect(getTitle({})).toBe('');
  });
});

describe('getDate', () => {
  // Statement: movie release_date.
  it('returns release_date for a movie item', () => {
    expect(getDate({ release_date: '2010-07-16', first_air_date: '2008-01-01' })).toBe(
      '2010-07-16'
    );
  });

  // Branch: falls back to first_air_date.
  it('returns first_air_date when release_date is absent', () => {
    expect(getDate({ first_air_date: '2008-01-20' })).toBe('2008-01-20');
  });

  // Branch: returns empty string when both are absent.
  it('returns empty string when neither date field is present', () => {
    expect(getDate({})).toBe('');
  });
});

describe('getImageUrl', () => {
  // Statement: builds a full URL.
  it('returns a full image URL with the default size', () => {
    expect(getImageUrl('/abc123.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg');
  });

  // Branch: respects a custom size token.
  it('returns a URL with a custom size token', () => {
    expect(getImageUrl('/abc123.jpg', 'w185')).toBe('https://image.tmdb.org/t/p/w185/abc123.jpg');
  });

  // Branch: returns empty string for a falsy path.
  it('returns an empty string when path is empty', () => {
    expect(getImageUrl('')).toBe('');
  });

  it('returns an empty string when path is null', () => {
    expect(getImageUrl(null)).toBe('');
  });

  it('returns an empty string when path is undefined', () => {
    expect(getImageUrl(undefined)).toBe('');
  });
});
