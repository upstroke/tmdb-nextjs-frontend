import { describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '@/lib/services/tmdb-api.js';

const FAKE_KEY = 'test-key';

// ---------------------------------------------------------------------------
// Helpers (same pattern as main test file)
// ---------------------------------------------------------------------------

function makeFetch(responses) {
  let index = 0;
  return vi.fn(async () => {
    const entry = responses[index++];
    return {
      ok: entry.ok ?? true,
      status: entry.status ?? 200,
      statusText: entry.ok === false ? 'Not Found' : 'OK',
      json: async () => entry.body
    };
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const GENRE_MOVIE_LIST = { genres: [{ id: 18, name: 'Drama' }] };
const GENRE_TV_LIST = { genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }] };
const RELEASE_DATES_DE = {
  results: [{ iso_3166_1: 'DE', release_dates: [{ certification: 'FSK 16', type: 3 }] }]
};
const CONTENT_RATINGS_DE = { results: [{ iso_3166_1: 'DE', rating: '16' }] };
const WATCH_PROVIDERS_EMPTY = { results: {} };
const WATCH_PROVIDERS_RENT_BUY = {
  results: {
    DE: {
      link: 'https://www.justwatch.com/de',
      rent: [
        { provider_id: 2, provider_name: 'Amazon', logo_path: '/amz.png', display_priority: 2 }
      ],
      buy: [
        { provider_id: 3, provider_name: 'Apple TV', logo_path: '/apple.png', display_priority: 3 }
      ]
    }
  }
};

const RAW_MOVIE = {
  id: 550,
  title: 'Fight Club',
  overview: 'Rules.',
  homepage: 'https://example.com',
  backdrop_path: '/fc_backdrop.jpg',
  poster_path: '/fc_poster.jpg',
  release_date: '1999-10-15',
  vote_average: 8.8,
  genres: [{ id: 18, name: 'Drama' }],
  runtime: 139,
  episode_run_time: [],
  production_companies: [],
  credits: { cast: [], crew: [] },
  videos: { results: [{ site: 'YouTube', type: 'Trailer', key: 'abc' }] },
  media_type: 'movie'
};

const RAW_TV_SHOW = {
  id: 1399,
  name: 'Game of Thrones',
  overview: 'Dragons.',
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
  seasons: [],
  credits: { cast: [], crew: [] },
  videos: { results: [] },
  media_type: 'tv'
};

describe('createTmdbApi — request() error branch', () => {
  // Branch coverage: `if (!response.ok)` guard constructs and throws TMDBError when the response is not ok.
  it('throws TMDBError when response.ok is false', async () => {
    const fetch = makeFetch([{ ok: false, status: 401, body: { status_message: 'Unauthorized' } }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'en-US');
    await expect(api.request('/movie/1')).rejects.toThrow('401');
  });

  // Branch coverage: `if (value == null || value === '')` continue skips null/undefined/'' query params without throwing.
  it('skips undefined/null/empty query params', async () => {
    const fetch = makeFetch([{ ok: true, body: { results: [] } }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'en-US');
    // Should not throw — params with null/undefined/'' are silently skipped
    await api.request('/search/multi', { query: '', page: null, include_adult: undefined });
    expect(fetch).toHaveBeenCalledTimes(1);
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).not.toContain('query=');
  });
});

describe('createTmdbApi — underscore locale format', () => {
  // Branch coverage: `locale.split('-')[1] ?? locale.split('_')[1]` — left side is undefined for '_' separator, so right side provides the region.
  it('derives region from locale with underscore (de_DE)', async () => {
    const fetch = makeFetch([{ ok: true, body: CONTENT_RATINGS_DE }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de_DE');
    // DE region is derived from underscore split → content_ratings returns '16'
    const cert = await api.getCertification('tv', 1399);
    expect(cert).toBe('16');
  });
});

describe('createTmdbApi — loadGenreMaps with missing genres field', () => {
  // Branch coverage: `(data.genres ?? []).forEach(...)` — nullish coalescing falls back to [] when the API omits the `genres` key, preventing a crash.
  it('handles missing genres array gracefully (no throw)', async () => {
    const fetch = makeFetch([
      { ok: true, body: {} }, // /genre/movie/list  — no genres key
      { ok: true, body: {} } // /genre/tv/list     — no genres key
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'en-US');
    await expect(api.loadGenreMaps()).resolves.toBeUndefined();
    // resolveGenres should return [] — map lookup yields nothing
    expect(api.resolveGenres([18], 'movie')).toEqual([]);
  });
});

describe('createTmdbApi — mapCardItem with inline genres', () => {
  // Branch coverage: `item.genres?.length ? item.genres : resolveGenres(...)` — truthy branch uses genres as-is and skips resolveGenres.
  it('uses genres from item directly when present', () => {
    const api = createTmdbApi(vi.fn(), FAKE_KEY, 'en-US');
    const item = {
      id: 99,
      media_type: 'movie',
      title: 'Dune',
      vote_average: 7.8,
      genres: [{ id: 878, name: 'Science Fiction' }]
    };
    const result = api.mapCardItem(item);
    expect(result.genres).toEqual([{ id: 878, name: 'Science Fiction' }]);
  });
});

describe('createTmdbApi — getWatchProviders rent and buy types', () => {
  // Branch coverage: `if (regional.rent)` and `if (regional.buy)` are taken; `if (regional.flatrate)` is NOT taken (key absent).
  it('maps rent and buy providers when flatrate is absent', async () => {
    const fetch = makeFetch([{ ok: true, body: WATCH_PROVIDERS_RENT_BUY }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getWatchProviders('movie', 550);
    expect(result).not.toBeNull();
    const types = result.providers.map((p) => p.type);
    expect(types).toContain('rent');
    expect(types).toContain('buy');
    expect(types).not.toContain('flatrate');
  });
});

describe('createTmdbApi — getList hasMore:false', () => {
  // Branch coverage: `hasMore: page < total_pages` evaluates to false when page === total_pages.
  it('sets hasMore to false when page equals total_pages', async () => {
    const body = {
      page: 3,
      total_pages: 3,
      results: [{ id: 1, media_type: 'movie', title: 'Last', vote_average: 6, genre_ids: [] }]
    };
    const fetch = makeFetch([
      { ok: true, body },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: RELEASE_DATES_DE }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getList('/movie/popular', 3, 'movie');
    expect(result.hasMore).toBe(false);
  });
});

describe('createTmdbApi — searchMedia hasMore:true', () => {
  // Branch coverage: `hasMore: page < total_pages` evaluates to true when more pages exist.
  it('sets hasMore to true when more pages exist', async () => {
    const body = {
      page: 1,
      total_pages: 5,
      results: [
        { id: 42, media_type: 'movie', title: 'Inception', vote_average: 8.8, genre_ids: [] }
      ]
    };
    const fetch = makeFetch([
      { ok: true, body },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.searchMedia('inception', 1);
    expect(result.hasMore).toBe(true);
  });
});

describe('createTmdbApi — getFeaturedToday', () => {
  // Call order for getFeaturedToday when featured item is a movie:
  //   1. GET /trending/all/day                        → trendingBody
  //   2. GET /movie/:id?append_to_response=...        → RAW_MOVIE (details)
  //   3. GET /movie/:id/release_dates                 → RELEASE_DATES_DE
  //   4. GET /movie/:id/watch/providers               → WATCH_PROVIDERS_EMPTY
  function makeMovieFeaturedFetch(overrides = {}) {
    const trendingBody = {
      results: [{ ...RAW_MOVIE, ...overrides }]
    };
    return makeFetch([
      { ok: true, body: trendingBody },
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
  }

  // Statement coverage: happy path — trending returns a movie, details + certification + providers are fetched.
  it('returns a featured item for a trending movie', async () => {
    const api = createTmdbApi(makeMovieFeaturedFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    expect(result).not.toBeNull();
    expect(result.id).toBe(550);
    expect(result.mediaType).toBe('movie');
    expect(result.title).toBe('Fight Club');
  });

  // Statement coverage: release_dates are mapped to a FSK certification label.
  it('attaches certification to the featured item', async () => {
    const api = createTmdbApi(makeMovieFeaturedFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    expect(result.certification).toBe('FSK 16');
  });

  // Branch coverage: watch/providers has no regional entry → providers is null.
  it('attaches providers (null when no regional entry)', async () => {
    const api = createTmdbApi(makeMovieFeaturedFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    expect(result.providers).toBeNull();
  });

  // Branch coverage: no movie with backdrop_path in trending results → first TV item is used as featured.
  it('returns a featured TV show when no movie with backdrop exists', async () => {
    const trendingBody = {
      results: [
        { ...RAW_TV_SHOW } // tv item with backdrop
      ]
    };
    const fetch = makeFetch([
      { ok: true, body: trendingBody },
      { ok: true, body: RAW_TV_SHOW }, // /tv/:id details
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    expect(result).not.toBeNull();
    expect(result.mediaType).toBe('tv');
  });

  // Branch coverage: trending returns an empty results array → null is returned immediately.
  it('returns null when trending results are empty', async () => {
    const fetch = makeFetch([{ ok: true, body: { results: [] } }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    expect(result).toBeNull();
  });

  // Statement coverage: videos.results is mapped to an array of YouTube embed URLs.
  it('includes trailerUrls in the featured item', async () => {
    const api = createTmdbApi(makeMovieFeaturedFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    // RAW_MOVIE.videos.results has one YouTube trailer with key 'abc'
    expect(Array.isArray(result.trailerUrls)).toBe(true);
  });

  // Branch coverage: watch/providers has a DE entry → providers object is attached to the result.
  it('attaches watch providers when a DE entry exists', async () => {
    const trendingBody = { results: [{ ...RAW_MOVIE }] };
    const fetch = makeFetch([
      { ok: true, body: trendingBody },
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_RENT_BUY }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    expect(result.providers).not.toBeNull();
  });

  // Branch coverage: no item has a backdrop_path → first item is used as fallback regardless of media type.
  it('falls back to first item when no movie/tv with backdrop exists', async () => {
    const trendingBody = {
      results: [
        { id: 1, media_type: 'movie', title: 'No Backdrop', vote_average: 5, backdrop_path: null }
      ]
    };
    const movieDetails = { ...RAW_MOVIE, id: 1, title: 'No Backdrop', backdrop_path: null };
    const fetch = makeFetch([
      { ok: true, body: trendingBody },
      { ok: true, body: movieDetails },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();
    // Should still return something (first item fallback)
    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
  });
});
