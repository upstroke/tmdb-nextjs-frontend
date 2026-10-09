/**
 * Vitest helper for mocking the TMDB API via global fetch.
 * Usage: import { setupTmdbMocks } from '../mocks/tmdb.mock.js'
 */

import { vi } from 'vitest';
import { rawFixtures } from '../fixtures/tmdb/tmdb.fixtures.js';
import { apiResponses } from '../fixtures/tmdb/tmdb.api.fixtures.js';

/**
 * Mocks global fetch to return TMDB fixture data based on URL pattern.
 * Specific sub-paths MUST be matched before the generic /movie/{id} and /tv/{id} routes.
 */
export function setupTmdbMocks() {
  const fetchMock = vi.fn((url) => {
    const u = url.toString();

    // Search and genres
    if (u.includes('/search/multi')) return Promise.resolve(okResponse(rawFixtures.searchMulti));
    if (u.includes('/genre/movie/list')) return Promise.resolve(okResponse(rawFixtures.genresMovie));
    if (u.includes('/genre/tv/list')) return Promise.resolve(okResponse(rawFixtures.genresTv));

    // Specific sub-paths first
    if (/\/movie\/\d+\/release_dates/.test(u)) {
      return Promise.resolve(okResponse(apiResponses.movieCertification));
    }
    if (/\/movie\/\d+\/watch\/providers/.test(u)) {
      return Promise.resolve(okResponse(apiResponses.movieWatchProviders));
    }
    if (/\/tv\/\d+\/content_ratings/.test(u)) {
      return Promise.resolve(okResponse(apiResponses.tvCertification));
    }
    if (/\/tv\/\d+\/watch\/providers/.test(u)) {
      return Promise.resolve(okResponse(apiResponses.tvWatchProviders));
    }
    const seasonMatch = u.match(/\/tv\/\d+\/season\/(\d+)/);
    if (seasonMatch) {
      const seasonNumber = Number(seasonMatch[1]);
      const season = apiResponses.tvDetailFull.seasons.find((s) => s.season_number === seasonNumber);
      return Promise.resolve(
        okResponse({
          ...rawFixtures.tvSeason1,
          ...(season ?? {}),
          episodes: seasonNumber === 1 ? rawFixtures.tvSeason1.episodes : []
        })
      );
    }

    // Lists
    if (u.includes('/movie/popular')) return Promise.resolve(okResponse(rawFixtures.moviesPopular));
    if (u.includes('/tv/popular')) return Promise.resolve(okResponse(rawFixtures.tvPopular));

    // Generic detail routes last (any id)
    if (/\/movie\/\d+/.test(u)) return Promise.resolve(okResponse(apiResponses.movieDetailFull));
    if (/\/tv\/\d+/.test(u)) return Promise.resolve(okResponse(apiResponses.tvDetailFull));

    // Fallback: 404
    return Promise.resolve(errorResponse(rawFixtures.error404, 404));
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function teardownTmdbMocks() {
  vi.unstubAllGlobals();
}

function okResponse(data) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  };
}

function errorResponse(data, status = 404) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  };
}
