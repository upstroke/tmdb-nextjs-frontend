/**
 * Unit tests for createTmdbApi orchestration.
 *
 * Pure mapping functions are covered directly in mappers.test.js. These tests
 * focus on genre-map loading, request-scoped caches, data enrichment, list
 * orchestration, detail assembly and error propagation.
 */
import { describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '@/lib/services/tmdb-api.js';

const FAKE_KEY = 'test-key';

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
      json: async () => entry.body
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
  seasons: [{ id: 3624, season_number: 1, name: 'Season 1', episode_count: 10 }],
  credits: { cast: [], crew: [] },
  videos: { results: [] }
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
  videos: { results: [] }
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
      still_path: '/ep1_still.jpg'
    },
    {
      id: 63057,
      episode_number: 2,
      name: 'The Kingsroad',
      overview: null,
      air_date: null,
      runtime: null,
      vote_average: 8.5,
      still_path: null
    }
  ]
};

const CONTENT_RATINGS_DE = {
  results: [{ iso_3166_1: 'DE', rating: '16' }]
};

const WATCH_PROVIDERS_EMPTY = { results: {} };

const WATCH_PROVIDERS_DE = {
  results: {
    DE: {
      link: 'https://www.justwatch.com/de',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png', display_priority: 1 }
      ]
    }
  }
};

const RELEASE_DATES_DE = {
  results: [
    {
      iso_3166_1: 'DE',
      release_dates: [{ certification: 'FSK 16', type: 3 }]
    }
  ]
};

const GENRE_MOVIE_LIST = {
  genres: [
    { id: 18, name: 'Drama' },
    { id: 28, name: 'Action' }
  ]
};
const GENRE_TV_LIST = { genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }] };

// ---------------------------------------------------------------------------
// resolveGenres
// ---------------------------------------------------------------------------

describe('createTmdbApi — resolveGenres', () => {
  it('returns an empty array when no genre IDs are provided', () => {
    const api = createTmdbApi(vi.fn(), FAKE_KEY, 'en-US');

    expect(api.resolveGenres([], 'movie')).toEqual([]);
  });

  it('returns empty results when genre maps are not loaded', () => {
    const api = createTmdbApi(vi.fn(), FAKE_KEY, 'en-US');

    expect(api.resolveGenres([28, 12], 'movie')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// language / region derivation
// ---------------------------------------------------------------------------

describe('createTmdbApi — language / region derivation', () => {
  it('creates an API instance for a hyphenated locale', () => {
    const api = createTmdbApi(vi.fn(), FAKE_KEY, 'de-DE');

    expect(api).toBeDefined();
  });

  it('creates an API instance with the default language', () => {
    const api = createTmdbApi(vi.fn(), FAKE_KEY);

    expect(api).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// getCertification
// ---------------------------------------------------------------------------

describe('createTmdbApi — getCertification', () => {
  it('returns movie certification from release_dates for DE region', async () => {
    const fetch = makeFetch([{ ok: true, body: RELEASE_DATES_DE }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');

    await expect(api.getCertification('movie', 550)).resolves.toBe('FSK 16');
  });

  it('returns an empty string when no DE release_date entry exists', async () => {
    const fetch = makeFetch([{ ok: true, body: { results: [] } }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');

    await expect(api.getCertification('movie', 550)).resolves.toBe('');
  });

  it('returns TV certification from content_ratings for DE region', async () => {
    const fetch = makeFetch([{ ok: true, body: CONTENT_RATINGS_DE }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');

    await expect(api.getCertification('tv', 1399)).resolves.toBe('16');
  });

  it('caches certification results for the same media item', async () => {
    const fetchMock = makeFetch([{ ok: true, body: CONTENT_RATINGS_DE }]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');

    await api.getCertification('tv', 1399);
    await api.getCertification('tv', 1399);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns an empty string when the request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');

    await expect(api.getCertification('movie', 1)).resolves.toBe('');
  });
});

// ---------------------------------------------------------------------------
// getWatchProviders
// ---------------------------------------------------------------------------

describe('createTmdbApi — getWatchProviders', () => {
  it('returns null when the response has no regional entry', async () => {
    const fetch = makeFetch([{ ok: true, body: WATCH_PROVIDERS_EMPTY }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');

    await expect(api.getWatchProviders('movie', 550)).resolves.toBeNull();
  });

  it('returns mapped providers when a DE entry exists', async () => {
    const fetch = makeFetch([{ ok: true, body: WATCH_PROVIDERS_DE }]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getWatchProviders('tv', 1399);

    expect(result).not.toBeNull();
    expect(result.providers).toHaveLength(1);
    expect(result.providers[0].providerName).toBe('Netflix');
    expect(result.link).toBe('https://www.justwatch.com/de');
  });

  it('caches provider results for the same media item', async () => {
    const fetchMock = makeFetch([{ ok: true, body: WATCH_PROVIDERS_EMPTY }]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');

    await api.getWatchProviders('movie', 550);
    await api.getWatchProviders('movie', 550);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns null without throwing when the request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');

    await expect(api.getWatchProviders('movie', 1)).resolves.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// enrichCardCertifications
// ---------------------------------------------------------------------------

describe('createTmdbApi — enrichCardCertifications', () => {
  it('attaches certification to each card', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: CONTENT_RATINGS_DE }
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');
    const cards = [
      { id: 550, mediaType: 'movie', title: 'Fight Club' },
      { id: 1399, mediaType: 'tv', title: 'GoT' }
    ];
    const result = await api.enrichCardCertifications(cards);

    expect(result).toHaveLength(2);
    expect(result[0].certification).toBe('FSK 16');
    expect(result[1].certification).toBe('16');
  });

  it('returns an empty array for empty input', async () => {
    const api = createTmdbApi(vi.fn(), FAKE_KEY, 'de-DE');

    await expect(api.enrichCardCertifications([])).resolves.toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// loadGenreMaps
// ---------------------------------------------------------------------------

describe('createTmdbApi — loadGenreMaps', () => {
  it('loads genre maps and makes resolveGenres work', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'en-US');

    await api.loadGenreMaps();

    expect(api.resolveGenres([18, 28], 'movie')).toEqual([
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' }
    ]);
  });

  it('does not request genre maps a second time after loading', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'en-US');

    await api.loadGenreMaps();
    await api.loadGenreMaps();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// getMovieDetails
// ---------------------------------------------------------------------------

describe('createTmdbApi — getMovieDetails', () => {
  function makeApiWithFetch(responses) {
    return createTmdbApi(makeFetch(responses), FAKE_KEY, 'de-DE');
  }

  it('returns a normalized movie detail', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
    const result = await api.getMovieDetails(550);

    expect(result.id).toBe(550);
    expect(result.mediaType).toBe('movie');
    expect(result.title).toBe('Fight Club');
    expect(result.runtime).toBe(139);
  });

  it('attaches movie certification', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
    const result = await api.getMovieDetails(550);

    expect(result.certification).toBe('FSK 16');
  });

  it('attaches providers when available', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_MOVIE },
      { ok: true, body: RELEASE_DATES_DE },
      { ok: true, body: WATCH_PROVIDERS_DE }
    ]);
    const result = await api.getMovieDetails(550);

    expect(result.providers).not.toBeNull();
    expect(result.providers.providers[0].providerName).toBe('Netflix');
  });

  it('throws when the API returns a non-ok response', async () => {
    const api = makeApiWithFetch([
      { ok: false, status: 404, body: { status_message: 'Not Found' } }
    ]);

    await expect(api.getMovieDetails(99999)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// getList and list endpoints
// ---------------------------------------------------------------------------

describe('createTmdbApi — getList and list endpoints', () => {
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
        genre_ids: []
      }
    ]
  };

  function makeListFetch(extra = []) {
    return makeFetch([
      { ok: true, body: LIST_BODY },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: RELEASE_DATES_DE },
      ...extra
    ]);
  }

  it('getList returns a normalized ListResponse with hasMore=true', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getList('/movie/popular', 1, 'movie');

    expect(result.page).toBe(1);
    expect(result.hasMore).toBe(true);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe('Inception');
  });

  it('getTrendingAll returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getTrendingAll(1);

    expect(Array.isArray(result.results)).toBe(true);
  });

  it('getTrendingMovies returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getTrendingMovies(1);

    expect(Array.isArray(result.results)).toBe(true);
  });

  it('getTrendingTVShows returns a list response', async () => {
    const tvListBody = {
      ...LIST_BODY,
      results: [{ id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] }]
    };
    const fetch = makeFetch([
      { ok: true, body: tvListBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: CONTENT_RATINGS_DE }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getTrendingTVShows(1);

    expect(Array.isArray(result.results)).toBe(true);
  });

  it('getPopularMovies returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getPopularMovies(1);

    expect(Array.isArray(result.results)).toBe(true);
  });

  it('getPopularTVShows returns a list response', async () => {
    const tvBody = {
      ...LIST_BODY,
      results: [{ id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] }]
    };
    const fetch = makeFetch([
      { ok: true, body: tvBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: CONTENT_RATINGS_DE }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getPopularTVShows(1);

    expect(Array.isArray(result.results)).toBe(true);
  });

  it('getTopRatedMovies returns a list response', async () => {
    const api = createTmdbApi(makeListFetch(), FAKE_KEY, 'de-DE');
    const result = await api.getTopRatedMovies(1);

    expect(Array.isArray(result.results)).toBe(true);
  });

  it('getTopRatedTVShows returns a list response', async () => {
    const tvBody = {
      ...LIST_BODY,
      results: [{ id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] }]
    };
    const fetch = makeFetch([
      { ok: true, body: tvBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST },
      { ok: true, body: CONTENT_RATINGS_DE }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getTopRatedTVShows(1);

    expect(Array.isArray(result.results)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// searchMedia
// ---------------------------------------------------------------------------

describe('createTmdbApi — searchMedia', () => {
  it('returns normalized search results', async () => {
    const searchBody = {
      page: 1,
      total_pages: 1,
      results: [
        { id: 42, media_type: 'movie', title: 'Inception', vote_average: 8.8, genre_ids: [] },
        { id: 7, media_type: 'tv', name: 'Breaking Bad', vote_average: 9.5, genre_ids: [] }
      ]
    };
    const fetch = makeFetch([
      { ok: true, body: searchBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.searchMedia('inception', 1);

    expect(result.page).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('filters out person results from search', async () => {
    const searchBody = {
      page: 1,
      total_pages: 1,
      results: [
        { id: 1, media_type: 'person', name: 'Some Actor' },
        { id: 42, media_type: 'movie', title: 'Inception', vote_average: 8.8, genre_ids: [] }
      ]
    };
    const fetch = makeFetch([
      { ok: true, body: searchBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.searchMedia('inception');

    expect(result.results.every((item) => item.mediaType !== 'person')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTVShowDetails
// ---------------------------------------------------------------------------

describe('createTmdbApi — getTVShowDetails', () => {
  function makeApiWithFetch(fetchResponses) {
    return createTmdbApi(makeFetch(fetchResponses), FAKE_KEY, 'de-DE');
  }

  it('returns normalized TV show detail with season metadata', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
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
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
    const result = await api.getTVShowDetails(1399);

    expect(result.numberOfSeasons).toBe(8);
    expect(result.numberOfEpisodes).toBe(73);
  });

  it('includes the seasons array from the raw response', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
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
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
    const result = await api.getTVShowDetails(1399);

    expect(result.certification).toBe('16');
  });

  it('sets providers to null when no regional entry exists', async () => {
    const api = makeApiWithFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY }
    ]);
    const result = await api.getTVShowDetails(1399);

    expect(result.providers).toBeNull();
  });

  it('throws when the API returns a non-ok response', async () => {
    const api = makeApiWithFetch([
      { ok: false, status: 404, body: { status_message: 'Not Found' } }
    ]);

    await expect(api.getTVShowDetails(99999)).rejects.toThrow();
  });

  it('caches certifications for repeated detail requests', async () => {
    const fetchMock = makeFetch([
      { ok: true, body: RAW_TV_SHOW },
      { ok: true, body: CONTENT_RATINGS_DE },
      { ok: true, body: WATCH_PROVIDERS_EMPTY },
      { ok: true, body: RAW_TV_SHOW }
    ]);
    const api = createTmdbApi(fetchMock, FAKE_KEY, 'de-DE');

    await api.getTVShowDetails(1399);
    await api.getTVShowDetails(1399);

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

// ---------------------------------------------------------------------------
// getTVSeasonDetails
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
    const episode = result.episodes[0];

    expect(episode.id).toBe(63056);
    expect(episode.episodeNumber).toBe(1);
    expect(episode.name).toBe('Winter Is Coming');
    expect(episode.runtime).toBe(62);
    expect(episode.rating).toBe(9.1);
    expect(episode.stillUrl).toBe('https://image.tmdb.org/t/p/w300/ep1_still.jpg');
  });

  it('sets stillUrl to null when still_path is missing', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);

    expect(result.episodes[1].stillUrl).toBeNull();
  });

  it('handles episodes with null overview and airDate gracefully', async () => {
    const api = makeApiWithFetch([{ ok: true, body: RAW_SEASON_1 }]);
    const result = await api.getTVSeasonDetails(1399, 1);
    const episode = result.episodes[1];

    expect(episode.overview).toBe('');
    expect(episode.airDate).toBeNull();
    expect(episode.runtime).toBeNull();
  });

  it('returns an empty episodes array for a season with no episodes', async () => {
    const emptySeasonBody = { ...RAW_SEASON_1, episodes: [] };
    const api = makeApiWithFetch([{ ok: true, body: emptySeasonBody }]);
    const result = await api.getTVSeasonDetails(1399, 0);

    expect(result.episodes).toEqual([]);
  });

  it('throws when the API returns a non-ok response', async () => {
    const api = makeApiWithFetch([
      { ok: false, status: 404, body: { status_message: 'Season not found' } }
    ]);

    await expect(api.getTVSeasonDetails(1399, 99)).rejects.toThrow();
  });
});
