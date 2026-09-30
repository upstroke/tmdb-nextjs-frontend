/**
 * Vitest MSW / vi.mock helper for TMDB API
 * Usage: import { setupTmdbMocks } from '../mocks/tmdb.mock.js'
 */

import { vi } from 'vitest';
import { rawFixtures } from '../fixtures/tmdb/tmdb.fixtures.js';

/**
 * Mocks global fetch to return TMDB fixture data based on URL pattern.
 * Call in beforeEach / describe block.
 */
export function setupTmdbMocks() {
  const fetchMock = vi.fn((url) => {
    const u = url.toString();

    // Search
    if (u.includes('/search/multi')) {
      return Promise.resolve(okResponse(rawFixtures.searchMulti));
    }
    // Genres
    if (u.includes('/genre/movie/list')) {
      return Promise.resolve(okResponse(rawFixtures.genresMovie));
    }
    if (u.includes('/genre/tv/list')) {
      return Promise.resolve(okResponse(rawFixtures.genresTv));
    }
    // Movie popular
    if (u.includes('/movie/popular')) {
      return Promise.resolve(okResponse(rawFixtures.moviesPopular));
    }
    // Movie detail (any id)
    if (/\/movie\/\d+/.test(u) && !u.includes('/popular') && !u.includes('/search')) {
      return Promise.resolve(okResponse(rawFixtures.movieDetail));
    }
    // TV popular
    if (u.includes('/tv/popular')) {
      return Promise.resolve(okResponse(rawFixtures.tvPopular));
    }
    // TV Season
    if (/\/tv\/\d+\/season\/\d+/.test(u)) {
      return Promise.resolve(okResponse(rawFixtures.tvSeason1));
    }
    // TV detail (any id)
    if (/\/tv\/\d+/.test(u) && !u.includes('/popular') && !u.includes('/season')) {
      return Promise.resolve(okResponse(rawFixtures.tvDetail));
    }
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
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function errorResponse(data, status = 404) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}
