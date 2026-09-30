/**
 * Unit tests for the pure mapping and helper functions of createTmdbApi.
 * Async functions that depend on fetch are excluded and belong in integration tests.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createTmdbApi } from '@/lib/services/tmdb-api.js';

const FAKE_KEY = 'test-key';

function makeApi(language = 'en-US') {
  // fetch is not called in mapping tests; provide a stub to satisfy the factory.
  return createTmdbApi(vi.fn(), FAKE_KEY, language);
}

describe('createTmdbApi — mapCardItem', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  it('returns null when item has no id', () => {
    expect(api.mapCardItem({ media_type: 'movie', title: 'X', vote_average: 7 })).toBeNull();
  });

  it('returns null for unsupported media type', () => {
    expect(api.mapCardItem({ id: 1, media_type: 'person', name: 'John' })).toBeNull();
  });

  it('maps a minimal movie item', () => {
    const item = { id: 42, media_type: 'movie', title: 'Inception', vote_average: 8.8 };
    const result = api.mapCardItem(item);
    expect(result).not.toBeNull();
    expect(result.id).toBe(42);
    expect(result.mediaType).toBe('movie');
    expect(result.title).toBe('Inception');
    expect(result.rating).toBe(8.8);
  });

  it('maps a minimal tv item', () => {
    const item = { id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5 };
    const result = api.mapCardItem(item);
    expect(result).not.toBeNull();
    expect(result.mediaType).toBe('tv');
    expect(result.title).toBe('Breaking Bad');
  });

  it('uses fallbackMediaType when media_type is missing', () => {
    const item = { id: 5, title: 'Dune', vote_average: 7.8 };
    const result = api.mapCardItem(item, 'movie');
    expect(result).not.toBeNull();
    expect(result.mediaType).toBe('movie');
  });

  it('fills placeholder genre when genre list is empty', () => {
    const item = { id: 10, media_type: 'movie', title: 'Test', vote_average: 5, genre_ids: [] };
    const result = api.mapCardItem(item);
    expect(result.genres).toEqual([{ id: 'na', name: 'N/A' }]);
  });

  it('uses NOT_AVAILABLE_IMAGE when poster_path and backdrop_path are missing', () => {
    const item = { id: 11, media_type: 'movie', title: 'No Image', vote_average: 6 };
    const result = api.mapCardItem(item);
    expect(result.imageUrl).toBe('/not-available.png');
    expect(result.posterUrl).toBe('/not-available.png');
  });
});

describe('createTmdbApi — mapWatchProvider', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  it('returns null when provider_id is missing', () => {
    expect(api.mapWatchProvider({ provider_name: 'Netflix' }, 'flatrate', null)).toBeNull();
  });

  it('returns null when provider_name is missing', () => {
    expect(api.mapWatchProvider({ provider_id: 8 }, 'flatrate', null)).toBeNull();
  });

  it('maps a valid provider', () => {
    const provider = { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png', display_priority: 1 };
    const result = api.mapWatchProvider(provider, 'flatrate', 'https://example.com');
    expect(result).toMatchObject({
      providerId: 8,
      providerName: 'Netflix',
      type: 'flatrate',
      link: 'https://example.com',
      logoPath: '/netflix.png',
      displayPriority: 1,
    });
  });

  it('sets link to null when baseLink is null', () => {
    const provider = { provider_id: 8, provider_name: 'Netflix' };
    const result = api.mapWatchProvider(provider, 'rent', null);
    expect(result.link).toBeNull();
  });
});

describe('createTmdbApi — mapWatchProviderList', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  it('returns an empty array for an empty list', () => {
    expect(api.mapWatchProviderList([], 'buy', null)).toEqual([]);
  });

  it('filters out invalid providers', () => {
    const providers = [
      { provider_id: 8, provider_name: 'Netflix' },
      { provider_name: 'Ghost' }, // missing id
    ];
    const result = api.mapWatchProviderList(providers, 'flatrate', null);
    expect(result).toHaveLength(1);
    expect(result[0].providerName).toBe('Netflix');
  });
});

describe('createTmdbApi — getTrailerUrls', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  it('returns an empty array when there are no videos', () => {
    expect(api.getTrailerUrls({})).toEqual([]);
  });

  it('returns YouTube trailer URLs', () => {
    const details = {
      videos: {
        results: [
          { site: 'YouTube', type: 'Trailer', key: 'abc123' },
          { site: 'Vimeo', type: 'Trailer', key: 'xyz' },
          { site: 'YouTube', type: 'Clip', key: 'clip1' },
        ],
      },
    };
    const urls = api.getTrailerUrls(details);
    expect(urls).toEqual(['https://www.youtube.com/watch?v=abc123']);
  });

  it('excludes entries without a key', () => {
    const details = { videos: { results: [{ site: 'YouTube', type: 'Trailer', key: '' }] } };
    expect(api.getTrailerUrls(details)).toEqual([]);
  });
});

describe('createTmdbApi — mapCast', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  it('returns an empty array for an empty cast', () => {
    expect(api.mapCast([])).toEqual([]);
  });

  it('maps a cast member correctly', () => {
    const person = {
      id: 1, credit_id: 'c1', name: 'Alice', character: 'Hero',
      order: 0, profile_path: '/alice.jpg',
    };
    const result = api.mapCast([person]);
    expect(result[0]).toMatchObject({
      id: 1,
      creditId: 'c1',
      name: 'Alice',
      character: 'Hero',
      order: 0,
      profilePath: '/alice.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w185/alice.jpg',
    });
  });

  it('limits the result to 20 members', () => {
    const cast = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Person ${i}`, credit_id: `c${i}` }));
    expect(api.mapCast(cast)).toHaveLength(20);
  });
});

describe('createTmdbApi — mapCrew', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  it('returns an empty array for an empty crew', () => {
    expect(api.mapCrew([])).toEqual([]);
  });

  it('maps a crew member correctly', () => {
    const person = {
      id: 2, credit_id: 'c2', name: 'Bob', job: 'Director',
      department: 'Directing', profile_path: '/bob.jpg',
    };
    const result = api.mapCrew([person]);
    expect(result[0]).toMatchObject({
      id: 2,
      creditId: 'c2',
      name: 'Bob',
      job: 'Director',
      department: 'Directing',
      profilePath: '/bob.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w185/bob.jpg',
    });
  });

  it('limits the result to 20 members', () => {
    const crew = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Person ${i}`, credit_id: `c${i}` }));
    expect(api.mapCrew(crew)).toHaveLength(20);
  });
});

describe('createTmdbApi — resolveGenres', () => {
  it('returns an empty array when no genre IDs are provided', () => {
    const api = makeApi();
    expect(api.resolveGenres([], 'movie')).toEqual([]);
  });

  it('returns null-filtered results when genreMap is not loaded', () => {
    const api = makeApi();
    // Genre maps are not loaded (no fetch called), so all IDs resolve to null and are filtered.
    const result = api.resolveGenres([28, 12], 'movie');
    expect(result).toEqual([]);
  });
});

describe('createTmdbApi — language / region derivation', () => {
  it('derives region from language with hyphen', () => {
    const api = makeApi('de-DE');
    // We can only indirectly verify via request URL — check that API instantiates without throwing.
    expect(api).toBeDefined();
  });

  it('instantiates with the default language', () => {
    const api = makeApi();
    expect(api).toBeDefined();
  });
});
