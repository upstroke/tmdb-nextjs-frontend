/**
 * MSW request handlers for Vitest unit and integration tests.
 *
 * These handlers intercept internal Next.js API routes (/api/[locale]/...)
 * and return fixture data. They replace the previous vi.stubGlobal('fetch') approach
 * in tmdb.mock.js and should be used via the MSW server in tests/mocks/msw.server.js.
 *
 * URL patterns match the routes defined in app/api/:
 *   /api/:locale/movies          → movies list (popular, top_rated, trending)
 *   /api/:locale/movies/:id      → movie detail
 *   /api/:locale/tv              → TV list
 *   /api/:locale/tv/:id          → TV detail
 *   /api/:locale/tv/:id/season   → TV season
 *   /api/:locale/search          → search (multi)
 *   /api/:locale/genres/movie    → movie genres
 *   /api/:locale/genres/tv       → TV genres
 */

import { http, HttpResponse } from 'msw';
import { rawFixtures } from '../fixtures/tmdb/tmdb.fixtures.js';

export const handlers = [
  // ── Movies ───────────────────────────────────────────────

  /** GET /api/:locale/movies — popular / top_rated / trending list */
  http.get('/api/:locale/movies', () => {
    return HttpResponse.json(rawFixtures.moviesPopular);
  }),

  /** GET /api/:locale/movies/:id — movie detail */
  http.get('/api/:locale/movies/:id', () => {
    return HttpResponse.json(rawFixtures.movieDetail);
  }),

  // ── TV Shows ─────────────────────────────────────────────

  /** GET /api/:locale/tv — TV list */
  http.get('/api/:locale/tv', () => {
    return HttpResponse.json(rawFixtures.tvPopular);
  }),

  /** GET /api/:locale/tv/:id/season — TV season (must come before :id detail) */
  http.get('/api/:locale/tv/:id/season', () => {
    return HttpResponse.json(rawFixtures.tvSeason1);
  }),

  /** GET /api/:locale/tv/:id — TV detail */
  http.get('/api/:locale/tv/:id', () => {
    return HttpResponse.json(rawFixtures.tvDetail);
  }),

  // ── Search ───────────────────────────────────────────────

  /** GET /api/:locale/search?q=... */
  http.get('/api/:locale/search', () => {
    return HttpResponse.json(rawFixtures.searchMulti);
  }),

  // ── Genres ───────────────────────────────────────────────

  /** GET /api/:locale/genres/movie */
  http.get('/api/:locale/genres/movie', () => {
    return HttpResponse.json(rawFixtures.genresMovie);
  }),

  /** GET /api/:locale/genres/tv */
  http.get('/api/:locale/genres/tv', () => {
    return HttpResponse.json(rawFixtures.genresTv);
  })
];

/**
 * Creates a one-off error handler that overrides a specific route for a single test.
 *
 * Usage:
 *   server.use(tmdbErrorHandler('/api/en-US/movies', 503));
 *
 * @param {string} urlPattern - The route path to override (e.g. '/api/en-US/movies')
 * @param {number} [status=500] - HTTP status code to respond with
 * @returns {import('msw').RequestHandler}
 */
export function tmdbErrorHandler(urlPattern, status = 500) {
  return http.get(urlPattern, () => {
    return HttpResponse.json(
      { success: false, status_code: status, status_message: 'Simulated error' },
      { status }
    );
  });
}
