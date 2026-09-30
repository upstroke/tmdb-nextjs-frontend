/**
 * Unit tests for createTmdbApi.
 *
 * Pure mapping / helper functions are tested with a stub fetch that must never
 * be called (any accidental invocation throws immediately).
 *
 * Async functions that depend on fetch (getTVShowDetails, getTVSeasonDetails,
 * getMovieDetails, …) are tested with a controlled mock fetch so every HTTP
 * boundary is exercised in-process, without a real network.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createTmdbApi } from '@/lib/services/tmdb-api.js';

const FAKE_KEY = 'test-key';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns an API instance whose fetch stub must never be called. */
function makeApi(language = 'en-US') {
  return createTmdbApi(vi.fn(), FAKE_KEY, language);
}

/**
 * Builds a fetch mock that returns the given payloads in order.
 * Each call consumes the next entry from `responses`.
 *
 * @param {Array<{ok: boolean, status?: number, body: object}>} responses
 */
function makeFetch(responses) {
  let index = 0;
  return vi.fn(async () => {
    const entry = responses[index++];
    return {
      ok: entry.ok ?? true,
      status: entry.status ?? 200,
      statusText: entry.ok === false ? 'Not Found' : 'OK',
      json: async () => entry.body,
    };
  });
}

// ---------------------------------------------------------------------------
// Shared raw-data fixtures
// ---------------------------------------------------------------------------

const RAW_TV_SHOW = {
  id: 1399,
  name: 'Game of Thrones',
  overview: 'Dragons and politics.',
  homepage: 'https://hbo.com/got',
  backdrop_path: '/got_backdrop.jpg',
  poster_path: '/got_poster.jpg',
  first_air_date: '2011-04-17',
  vote_average: 9.2,
  genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
  runtime: null,
  episode_run_time: [60],
  production_companies: [],
  number_of_seasons: 8,
  number_of_episodes: 73,
  seasons: [
    { id: 3624, season_number: 1, name: 'Season 1', episode_count: 10 },
  ],
  credits: { cast: [], crew: [] },
  videos: { results: [] },
};

const RAW_MOVIE = {
  id: 550,
  title: 'Fight Club',
  overview: 'Rules of Fight Club.',
  homepage: 'https://example.com/fightclub',
  backdrop_path: '/fc_backdrop.jpg',
  poster_path: '/fc_poster.jpg',
  release_date: '1999-10-15',
  vote_average: 8.8,
  genres: [{ id: 18, name: 'Drama' }],
  runtime: 139,
  episode_run_time: [],
  production_companies: [{ id: 1, name: 'Fox' }],
  credits: { cast: [], crew: [] },
  videos: { results: [] },
};

const RAW_SEASON_1 = {
  id: 3624,
  season_number: 1,
  name: 'Season 1',
  overview: 'The beginning.',
  air_date: '2011-04-17',
  poster_path: '/season1_poster.jpg',
  episodes: [
    {
      id: 63056,
      episode_number: 1,
      name: 'Winter Is Coming',
      overview: 'The Stark family.',
      air_date: '2011-04-17',
      runtime: 62,
      vote_average: 9.1,
      still_path: '/ep1_still.jpg',
    },
    {
      id: 63057,
      episode_number: 2,
      name: 'The Kingsroad',
      overview: null,
      air_date: null,
      runtime: null,
      vote_average: 8.5,
      still_path: null,
    },
  ],
};

/** Minimal content-ratings response (DE region to match 'de-DE' locale). */
const CONTENT_RATINGS_DE = {
  results: [{ iso_3166_1: 'DE', rating: '16' }],
};

/** Watch-providers response (no DE entry → providers will be null). */
const WATCH_PROVIDERS_EMPTY = { results: {} };

/** Watch-providers response with a DE flatrate entry. */
const WATCH_PROVIDERS_DE = {
  results: {
    DE: {
      link: 'https://www.justwatch.com/de',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png', display_priority: 1 },
      ],
    },
  },
};

/** Release-dates response for movie certification (DE region). */
const RELEASE_DATES_DE = {
  results: [
    {
      iso_3166_1: 'DE',
      release_dates: [{ certification: 'FSK 16', type: 3 }],
    },
  ],
};

/** Genre list responses. */
const GENRE_MOVIE_LIST = { genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }] };
const GENRE_TV_LIST = { genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }] };

// ---------------------------------------------------------------------------
// mapCardItem
// ---------------------------------------------------------------------------

describe('createTmdbApi — mapCardItem', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  // Branch coverage: returns null when item has no id.
  it('returns null when item has no id', () => {
    expect(api.mapCardItem({ media_type: 'movie', title: 'X', vote_average: 7 })).toBeNull();
  });

  // Branch coverage: returns null for unsupported media type.
  it('returns null for unsupported media type', () => {
    expect(api.mapCardItem({ id: 1, media_type: 'person', name: 'John' })).toBeNull();
  });

  // Statement coverage: maps a minimal movie item to a card shape.
  it('maps a minimal movie item', () => {
    const item = { id: 42, media_type: 'movie', title: 'Inception', vote_average: 8.8 };
    const result = api.mapCardItem(item);
    expect(result).not.toBeNull();
    expect(result.id).toBe(42);
    expect(result.mediaType).toBe('movie');
    expect(result.title).toBe('Inception');
    expect(result.rating).toBe(8.8);
  });

  // Statement coverage: maps a minimal tv item to a card shape.
  it('maps a minimal tv item', () => {
    const item = { id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5 };
    const result = api.mapCardItem(item);
    expect(result).not.toBeNull();
    expect(result.mediaType).toBe('tv');
    expect(result.title).toBe('Breaking Bad');
  });

  // Branch coverage: uses fallbackMediaType when media_type is missing.
  it('uses fallbackMediaType when media_type is missing', () => {
    const item = { id: 5, title: 'Dune', vote_average: 7.8 };
    const result = api.mapCardItem(item, 'movie');
    expect(result).not.toBeNull();
    expect(result.mediaType).toBe('movie');
  });

  // Branch coverage: fills placeholder genre when genre list is empty.
  it('fills placeholder genre when genre list is empty', () => {
    const item = { id: 10, media_type: 'movie', title: 'Test', vote_average: 5, genre_ids: [] };
    const result = api.mapCardItem(item);
    expect(result.genres).toEqual([{ id: 'na', name: 'N/A' }]);
  });

  // Branch coverage: uses NOT_AVAILABLE_IMAGE when no image paths are present.
  it('uses NOT_AVAILABLE_IMAGE when poster_path and backdrop_path are missing', () => {
    const item = { id: 11, media_type: 'movie', title: 'No Image', vote_average: 6 };
    const result = api.mapCardItem(item);
    expect(result.imageUrl).toBe('/not-available.png');
    expect(result.posterUrl).toBe('/not-available.png');
  });
});

// ---------------------------------------------------------------------------
// mapWatchProvider
// ---------------------------------------------------------------------------

describe('createTmdbApi — mapWatchProvider', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  // Branch coverage: returns null when provider_id is missing.
  it('returns null when provider_id is missing', () => {
    expect(api.mapWatchProvider({ provider_name: 'Netflix' }, 'flatrate', null)).toBeNull();
  });

  // Branch coverage: returns null when provider_name is missing.
  it('returns null when provider_name is missing', () => {
    expect(api.mapWatchProvider({ provider_id: 8 }, 'flatrate', null)).toBeNull();
  });

  // Statement coverage: maps a valid provider to the expected shape.
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

  // Branch coverage: sets link to null when baseLink is null.
  it('sets link to null when baseLink is null', () => {
    const provider = { provider_id: 8, provider_name: 'Netflix' };
    const result = api.mapWatchProvider(provider, 'rent', null);
    expect(result.link).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// mapWatchProviderList
// ---------------------------------------------------------------------------

describe('createTmdbApi — mapWatchProviderList', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  // Branch coverage: returns an empty array for an empty list.
  it('returns an empty array for an empty list', () => {
    expect(api.mapWatchProviderList([], 'buy', null)).toEqual([]);
  });

  // Branch coverage: filters out providers with missing id or name.
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

// ---------------------------------------------------------------------------
// getTrailerUrls
// ---------------------------------------------------------------------------

describe('createTmdbApi — getTrailerUrls', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  // Branch coverage: returns an empty array when there are no videos.
  it('returns an empty array when there are no videos', () => {
    expect(api.getTrailerUrls({})).toEqual([]);
  });

  // Statement coverage: returns only YouTube trailer URLs.
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

  // Branch coverage: excludes entries without a key.
  it('excludes entries without a key', () => {
    const details = { videos: { results: [{ site: 'YouTube', type: 'Trailer', key: '' }] } };
    expect(api.getTrailerUrls(details)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// mapCast
// ---------------------------------------------------------------------------

describe('createTmdbApi — mapCast', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

  // Branch coverage: returns an empty array for an empty cast.
  it('returns an empty array for an empty cast', () => {
    expect(api.mapCast([])).toEqual([]);
  });

  // Statement coverage: maps a cast member to the expected shape.
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

  // Branch coverage: limits the result to 20 members.
  it('limits the result to 20 members', () => {
    const cast = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Person ${i}`, credit_id: `c${i}` }));
    expect(api.mapCast(cast)).toHaveLength(20);
  });
});

// ---------------------------------------------------------------------------
// mapCrew
// ---------------------------------------------------------------------------

describe('createTmdbApi — mapCrew', () => {
  let api;
  beforeEach(() => { api = makeApi(); });

// Branch coverage: returns an empty array for an empty crew
  it('returns an empty array for an empty crew', () => {
    expect(api.mapCrew([])).toEqual([]);
  });

// Statement coverage: maps a crew member to the expected shape.
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

  // Branch coverage: limits the result to 20 members.
  it('limits the result to 20 members', () => {
    const crew = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Person ${i}`, credit_id: `c${i}` }));
    expect(api.mapCrew(crew)).toHaveLength(20);
  });
});

// ---------------------------------------------------------------------------
// resolveGenres
// ---------------------------------------------------------------------------

describe('createTmdbApi — resolveGenres', () => {
  // Branch coverage: returns an empty array when no genre IDs are provided.
  it('returns an empty array when no genre IDs are provided', () => {
    const api = makeApi();
    expect(api.resolveGenres([], 'movie')).toEqual([]);
  });

  // Branch coverage: returns empty array when genreMap is not loaded.
  it('returns null-filtered results when genreMap is not loaded', () => {
    const api = makeApi();
    // Genre maps are not loaded (no fetch called), so all IDs resolve to null and are filtered.
    const result = api.resolveGenres([28, 12], 'movie');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// language / region derivation
// ---------------------------------------------------------------------------

describe('createTmdbApi — language / region derivation', () => {
  // Statement coverage: instantiates without error when language contains a hyphen.
  it('derives region from language with hyphen', () => {
    const api = makeApi('de-DE');
    expect(api).toBeDefined();
  });

  // Statement coverage: instantiates without error with the default language.
  it('instantiates with the default language', () => {
    const api = makeApi();
    expect(api).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// mapDetails
// ---------------------------------------------------------------------------

describe('createTmdbApi — mapDetails', () => {
  let api;
  beforeEach(() => { api = makeApi('de-DE'); });

  // Statement coverage: maps a movie details object to the normalized shape.
  it('maps a movie details object correctly', () => {
    const result = api.mapDetails(RAW_MOVIE, 'movie');
    expect(result.id).toBe(550);
    expect(result.mediaType).toBe('movie');
    expect(result.title).toBe('Fight Club');
    expect(result.rating).toBe(8.8);
    expect(result.runtime).toBe(139);
  });

  // Statement coverage: maps a tv details object to the normalized shape.
  it('maps a tv details object correctly', () => {
    const result = api.mapDetails(RAW_TV_SHOW, 'tv');
    expect(result.id).toBe(1399);
    expect(result.mediaType).toBe('tv');
    expect(result.title).toBe('Game of Thrones');
  });

  // Statement coverage: includes cast and crew arrays from credits.
  it('includes cast and crew arrays', () => {
    const details = {
      ...RAW_MOVIE,
      credits: {
        cast: [{ id: 1, credit_id: 'c1', name: 'Actor', character: 'Hero', order: 0 }],
        crew: [{ id: 2, credit_id: 'c2', name: 'Director', job: 'Director', department: 'Directing' }],
      },
    };
    const result = api.mapDetails(details, 'movie');
    expect(result.cast).toHaveLength(1);
    expect(result.crew).toHaveLength(1);
  });

  // Statement coverage: passes through certification and providers from the details object.
  it('sets certification and providers from details object', () => {
    const details = { ...RAW_MOVIE, certification: 'FSK 16', providers: null };
    const result = api.mapDetails(details, 'movie');
    expect(result.certification).toBe('FSK 16');
    expect(result.providers).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// mapFeaturedItem
// ---------------------------------------------------------------------------

describe('createTmdbApi — mapFeaturedItem', () => {
  let api;
  beforeEach(() => { api = makeApi('de-DE'); });

  // Statement coverage: maps a tv show to the featured item shape.
  it('maps a tv show to a featured item', () => {
    const result = api.mapFeaturedItem(RAW_TV_SHOW, 'tv');
    expect(result.id).toBe(1399);
    expect(result.mediaType).toBe('tv');
    expect(result.title).toBe('Game of Thrones');
    expect(result.overview).toBe('Dragons and politics.');
    expect(result.homepage).toBe('https://hbo.com/got');
  });

  // Statement coverage: maps a movie to the featured item shape.
  it('maps a movie to a featured item', () => {
    const result = api.mapFeaturedItem(RAW_MOVIE, 'movie');
    expect(result.id).toBe(550);
    expect(result.mediaType).toBe('movie');
    expect(result.title).toBe('Fight Club');
  });

  // Branch coverage: uses backdrop_path as imageUrl.
  it('uses imageUrl from backdrop_path', () => {
    const result = api.mapFeaturedItem(RAW_TV_SHOW, 'tv');
    expect(result.imageUrl).toContain('got_backdrop');
  });
});

// ---------------------------------------------------------------------------
// getCertification  (async — uses mock fetch)
// ---------------------------------------------------------------------------

describe('createTmdbApi — getCertification', () => {
  // Statement coverage: returns movie certification from DE release_dates.
  it('returns movie certification from release_dates for DE region', async () => {
    const fetch = makeFetch([{ ok: true, body: RELEASE_DATES_DE }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getCertification('movie', 550);
    expect(result).toBe('FSK 16');
  });

  // Branch coverage: returns empty string when no DE entry exists for movie.
  it('returns empty string when no DE release_date entry exists for movie', async () => {
    const fetch = makeFetch([{ ok: true, body: { results: [] } }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getCertification('movie', 550);
    expect(result).toBe('');
  });

  // Statement coverage: returns tv certification from DE content_ratings.
  it('returns tv certification from content_ratings for DE region', async () => {
    const fetch = makeFetch([{ ok: true, body: CONTENT_RATINGS_DE }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getCertification('tv', 1399);
    expect(result).toBe('16');
  });

  // Branch coverage: caches the result — fetch is called only once for the same id.
  it('caches the result — fetch is called only once for the same id', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: CONTENT_RATINGS_DE },
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');
    await api.getCertification('tv', 1399);
    await api.getCertification('tv', 1399);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // Branch coverage: returns empty string when fetch throws.
  it('returns empty string when fetch throws', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');
    const result = await api.getCertification('movie', 1);
    expect(result).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getWatchProviders  (async — uses mock fetch)
// ---------------------------------------------------------------------------

describe('createTmdbApi — getWatchProviders', () => {
  // Branch coverage: returns null when results object has no regional entry.
  it('returns null when results object has no regional entry', async () => {
    const fetch = makeFetch([{ ok: true, body: WATCH_PROVIDERS_EMPTY }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getWatchProviders('movie', 550);
    expect(result).toBeNull();
  });

  // Statement coverage: returns mapped providers when a DE entry exists.
  it('returns mapped providers when a DE entry exists', async () => {
    const fetch = makeFetch([{ ok: true, body: WATCH_PROVIDERS_DE }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getWatchProviders('tv', 1399);
    expect(result).not.toBeNull();
    expect(result.providers).toHaveLength(1);
    expect(result.providers[0].providerName).toBe('Netflix');
    expect(result.link).toBe('https://www.justwatch.com/de');
  });

  // Branch coverage: caches the result — fetch is called only once for the same id.
  it('caches the result — fetch is called only once for the same id', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');
    await api.getWatchProviders('movie', 550);
    await api.getWatchProviders('movie', 550);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // Branch coverage: returns null and does not throw when fetch fails.
  it('returns null and does not throw when fetch fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');
    const result = await api.getWatchProviders('movie', 1);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// enrichCardCertifications  (async)
// ---------------------------------------------------------------------------

describe('createTmdbApi — enrichCardCertifications', () => {
  // Statement coverage: attaches certification to each card.
  it('attaches certification to each card', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: CONTENT_RATINGS_DE },
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');
    const cards = [
      { id: 550, mediaType: 'movie', title: 'Fight Club' },
      { id: 1399, mediaType: 'tv', title: 'GoT' },
    ];
    const result = await api.enrichCardCertifications(cards);
    expect(result).toHaveLength(2);
    expect(result[0].certification).toBe('FSK 16');
    expect(result[1].certification).toBe('16');
  });

  // Branch coverage: returns an empty array for an empty input.
  it('returns an empty array for an empty input', async () => {
    const api = makeApi();
    const result = await api.enrichCardCertifications([]);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// loadGenreMaps  (async)
// ---------------------------------------------------------------------------

describe('createTmdbApi — loadGenreMaps', () => {
  // Statement coverage: loads genre maps and makes resolveGenres return correct results.
  it('loads genre maps and makes resolveGenres work', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'en-US');
    await api.loadGenreMaps();
    const result = api.resolveGenres([18, 28], 'movie');
    expect(result).toEqual([
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' },
    ]);
  });

  // Branch coverage: does not call fetch a second time if already loaded.
  it('does not call fetch a second time if already loaded', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'en-US');
    await api.loadGenreMaps();
    await api.loadGenreMaps();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// getMovieDetails  (async — uses mock fetch)
// ---------------------------------------------------------------------------

describe('createTmdbApi — getMovieDetails', () => {
  function makeApiWithFetch(responses) {
    return createTmdbApi(makeFetch(responses), FAKE_KEY, 'de-DE');
  }

  // Statement coverage: returns normalized movie detail.
  it('returns normalized movie detail', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);
    const result = await api.getMovieDetails(550);
    expect(result.id).toBe(550);
    expect(result.mediaType).toBe('movie');
    expect(result.title).toBe('Fight Club');
    expect(result.runtime).toBe(139);
  });

  // Statement coverage: attaches movie certification.
  it('attaches movie certification', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);
    const result = await api.getMovieDetails(550);
    expect(result.certification).toBe('FSK 16');
  });

  // Statement coverage: attaches providers when available.
  it('attaches providers when available', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_DE },
    ]);
    const result = await api.getMovieDetails(550);
    expect(result.providers).not.toBeNull();
    expect(result.providers.providers[0].providerName).toBe('Netflix');
  });

  // Branch coverage: throws when the API returns a non-ok response.
  it('throws when the API returns a non-ok response', async () => {
    const api = makeApiWithFetch([
      { ok: false, status: 404, body: { status_message: 'Not Found' } },
    ]);
    await expect(api.getMovieDetails(99999)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// getList + list helpers (getTrendingAll, getPopularMovies, searchMedia etc.)
// ---------------------------------------------------------------------------

describe('createTmdbApi — getList and list endpoints', () => {
  /**
   * A minimal list response body that passes ListResponseSchema validation.
   * Includes one movie card with all required fields.
   */
  const LIST_BODY = {
    page: 1,
    total_pages: 2,
    results: [
      {
        id: 42,
        media_type: 'movie',
        title: 'Inception',
        vote_average: 8.8,
        poster_path: '/inception.jpg',
        genre_ids: [],
      },
    ],
  };

  /**
   * Fetch sequence for getList calls:
   *   1. endpoint request → LIST_BODY
   *   2. /genre/movie/list → GENRE_MOVIE_LIST  (from loadGenreMaps)
   *   3. /genre/tv/list   → GENRE_TV_LIST     (from loadGenreMaps)
   *   4. /movie/42/release_dates → RELEASE_DATES_DE  (enrichCardCertifications)
   */
  function makeListFetch(extra = []) {
    return makeFetch([
      { ok: true, body: LIST_BODY },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: RELEASE_DATES_DE },
      ...extra,
    ]);
  }

  // Statement coverage: returns a normalized ListResponse with hasMore=true.
  it('getList returns a normalized ListResponse with hasMore=true', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getList('/movie/popular', 1, 'movie');
    expect(result.page).toBe(1);
    expect(result.hasMore).toBe(true);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe('Inception');
  });

  // Statement coverage: getTrendingAll delegates to getList and returns results.
  it('getTrendingAll returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getTrendingAll(1);
    expect(Array.isArray(result.results)).toBe(true);
  });

  // Statement coverage: getTrendingMovies delegates to getList and returns results.
  it('getTrendingMovies returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getTrendingMovies(1);
    expect(Array.isArray(result.results)).toBe(true);
  });

  // Statement coverage: getTrendingTVShows delegates to getList and returns results.
  it('getTrendingTVShows returns a list response', async () => {
    const tvListBody = {
      ...LIST_BODY,
      results: [{ id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] }],
    };
    const fetch = makeFetch([
      { ok: true, body: tvListBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: CONTENT_RATINGS_DE },
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getTrendingTVShows(1);
    expect(Array.isArray(result.results)).toBe(true);
  });

  // Statement coverage: getPopularMovies delegates to getList and returns results.
  it('getPopularMovies returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getPopularMovies(1);
    expect(Array.isArray(result.results)).toBe(true);
  });

  // Statement coverage: getPopularTVShows delegates to getList and returns results.
  it('getPopularTVShows returns a list response', async () => {
    const tvBody = {
      ...LIST_BODY,
      results: [{ id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] }],
    };
    const fetch = makeFetch([
      { ok: true, body: tvBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: CONTENT_RATINGS_DE },
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getPopularTVShows(1);
    expect(Array.isArray(result.results)).toBe(true);
  });

  // Statement coverage: getTopRatedMovies delegates to getList and returns results.
  it('getTopRatedMovies returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getTopRatedMovies(1);
    expect(Array.isArray(result.results)).toBe(true);
  });

  // Statement coverage: getTopRatedTVShows delegates to getList and returns results.
  it('getTopRatedTVShows returns a list response', async () => {
    const tvBody = {
      ...LIST_BODY,
      results: [{ id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] }],
    };
    const fetch = makeFetch([
      { ok: true, body: tvBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: CONTENT_RATINGS_DE },
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getTopRatedTVShows(1);
    expect(Array.isArray(result.results)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// searchMedia  (async — uses mock fetch)
// ---------------------------------------------------------------------------

describe('createTmdbApi — searchMedia', () => {
  // Statement coverage: returns normalized search results with hasMore=false.
  it('returns normalized search results', async () => {
    const searchBody = {
      page: 1,
      total_pages: 1,
      results: [
        { id: 42, media_type: 'movie', title: 'Inception', vote_average: 8.8, genre_ids: [] },
        { id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] },
      ],
    };
    const fetch = makeFetch([
      { ok: true, body: searchBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.searchMedia('inception', 1);
    expect(result.page).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(result.results.length).toBeGreaterThan(0);
  });

  // Branch coverage: filters out person results from search.
  it('filters out person results from search', async () => {
    const searchBody = {
      page: 1,
      total_pages: 1,
      results: [
        { id: 1, media_type: 'person', name: 'Some Actor' },
        { id: 42, media_type: 'movie', title: 'Inception', vote_average: 8.8, genre_ids: [] },
      ],
    };
    const fetch = makeFetch([
      { ok: true, body: searchBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.searchMedia('inception');
    expect(result.results.every((r) => r.mediaType !== 'person')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTVShowDetails  (async — uses mock fetch)
// ---------------------------------------------------------------------------

describe('createTmdbApi — getTVShowDetails', () => {
  /**
   * Builds an API instance with a controlled fetch mock.
   * Call order expected by getTVShowDetails:
   *   1. GET /tv/:id?append_to_response=videos,credits  → RAW_TV_SHOW
   *   2. GET /tv/:id/content_ratings                    → CONTENT_RATINGS_DE
   *   3. GET /tv/:id/watch/providers                    → WATCH_PROVIDERS_EMPTY
   */
  function makeApiWithFetch(fetchResponses) {
    return createTmdbApi(makeFetch(fetchResponses), FAKE_KEY, 'de-DE');
  }

  // Statement coverage: returns normalized TV show detail with season metadata.
  it('returns normalized TV show detail with season metadata', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);

    const result = await api.getTVShowDetails(1399);

    expect(result.id).toBe(1399);
    expect(result.mediaType).toBe('tv');
    expect(result.title).toBe('Game of Thrones');
    expect(result.rating).toBe(9.2);
  });

  // Statement coverage: includes numberOfSeasons and numberOfEpisodes.
  it('includes numberOfSeasons and numberOfEpisodes', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);

    const result = await api.getTVShowDetails(1399);

    expect(result.numberOfSeasons).toBe(8);
    expect(result.numberOfEpisodes).toBe(73);
  });

  // Statement coverage: includes the seasons array from the raw response.
  it('includes the seasons array from the raw response', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);

    const result = await api.getTVShowDetails(1399);

    expect(Array.isArray(result.seasons)).toBe(true);
    expect(result.seasons).toHaveLength(1);
    expect(result.seasons[0].season_number).toBe(1);
  });

  // Statement coverage: attaches certification from content_ratings.
  it('attaches certification from content_ratings', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);

    const result = await api.getTVShowDetails(1399);

    expect(result.certification).toBe('16');
  });

  // Branch coverage: sets providers to null when no regional entry exists
  it('sets providers to null when no regional entry exists', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);

    const result = await api.getTVShowDetails(1399);

    expect(result.providers).toBeNull();
  });

  // Branch coverage: throws when the API returns a non-ok response.
  it('throws when the API returns a non-ok response', async () => {
    const api = makeApiWithFetch([
      { ok: false, status: 404, body: { status_message: 'Not Found' } },
    ]);

    await expect(api.getTVShowDetails(99999)).rejects.toThrow();
  });

  it('caches certifications — fetch is not called a second time for the same id', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
      { ok: true, body: RAW_TV_SHOW },
      // content_ratings and watch/providers must NOT be called again
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');

    await api.getTVShowDetails(1399);
    await api.getTVShowDetails(1399);

    // 4 calls: show×2 + content_ratings×1 + watch/providers×1
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

// ---------------------------------------------------------------------------
// getTVSeasonDetails  (async — uses mock fetch)
// ---------------------------------------------------------------------------

describe('createTmdbApi — getTVSeasonDetails', () => {
  function makeApiWithFetch(responses) {
    return createTmdbApi(makeFetch(responses), FAKE_KEY, 'de-DE');
  }

  it('returns a normalized season object', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);

    expect(result.id).toBe(3624);
    expect(result.seasonNumber).toBe(1);
    expect(result.name).toBe('Season 1');
    expect(result.overview).toBe('The beginning.');
    expect(result.airDate).toBe('2011-04-17');
  });

  it('maps posterUrl correctly', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);

    expect(result.posterUrl).toBe('https://image.tmdb.org/t/p/w342/season1_poster.jpg');
  });

  it('returns the correct number of episodes', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);

    expect(result.episodes).toHaveLength(2);
  });

  it('maps episode fields correctly', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);
    const ep = result.episodes[0];

    expect(ep.id).toBe(63056);
    expect(ep.episodeNumber).toBe(1);
    expect(ep.name).toBe('Winter Is Coming');
    expect(ep.runtime).toBe(62);
    expect(ep.rating).toBe(9.1);
    expect(ep.stillUrl).toBe('https://image.tmdb.org/t/p/w300/ep1_still.jpg');
  });

  it('sets stillUrl to null when still_path is missing', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);
    const ep = result.episodes[1];

    expect(ep.stillUrl).toBeNull();
  });

  it('handles episodes with null overview and airDate gracefully', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);
    const ep = result.episodes[1];

    expect(ep.overview).toBe('');
    expect(ep.airDate).toBeNull();
    expect(ep.runtime).toBeNull();
  });

  it('returns an empty episodes array for a season with no episodes', async () => {
    const emptySeasonBody = { ...RAW_SEASON_1, episodes: [] };
    const api = makeApiWithFetch([{ ok: true, body: emptySeasonBody }]);
    const result = await api.getTVSeasonDetails(1399, 0);

    expect(result.episodes).toEqual([]);
  });

  it('throws when the API returns a non-ok response', async () => {
    const api = makeApiWithFetch([
      { ok: false, status: 404, body: { status_message: 'Season not found' } },
    ]);

    await expect(api.getTVSeasonDetails(1399, 99)).rejects.toThrow();
  });
});
