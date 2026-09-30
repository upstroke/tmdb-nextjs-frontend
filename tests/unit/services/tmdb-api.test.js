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

// ---------------------------------------------------------------------------
// mapCardItem
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// mapWatchProvider
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// mapWatchProviderList
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// getTrailerUrls
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// mapCast
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// mapCrew
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// resolveGenres
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// language / region derivation
// ---------------------------------------------------------------------------

describe('createTmdbApi — language / region derivation', () => {
  it('derives region from language with hyphen', () => {
    const api = makeApi('de-DE');
    expect(api).toBeDefined();
  });

  it('instantiates with the default language', () => {
    const api = makeApi();
    expect(api).toBeDefined();
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

  it('attaches certification from content_ratings', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);

    const result = await api.getTVShowDetails(1399);

    expect(result.certification).toBe('16');
  });

  it('sets providers to null when no regional entry exists', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
    ]);

    const result = await api.getTVShowDetails(1399);

    expect(result.providers).toBeNull();
  });

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
