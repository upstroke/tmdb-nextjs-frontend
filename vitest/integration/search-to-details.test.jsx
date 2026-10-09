/**
 * Integration tests (jsdom): real modules wired together, only the TMDB network is mocked.
 * Named after its fixture (vitest/fixtures/tmdb/search-to-details.browser.fixtures.js).
 *
 * Chain under test:
 *   search route handler (GET) -> createTmdbApi -> zod schemas -> result ids
 *   -> detail pages (MovieDetailPage / TvShowDetailPage) -> createTmdbApi -> schemas -> rendered output
 *
 * No clicking and no routing: user journeys belong to Cypress (cypress/e2e).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TypeHeadSearch from '../../components/TypeHeadSearch.jsx';
import { GET as searchRoute } from '../../app/api/[locale]/search/route.js';
import MovieDetailPage from '../../app/[locale]/movies/[id]/page.js';
import TvShowDetailPage from '../../app/[locale]/tv-shows/[id]/page.js';
import { searchToDetailsFixture } from '../fixtures/tmdb/search-to-details.browser.fixtures.js';
import { rawFixtures } from '../fixtures/tmdb/tmdb.browser.fixtures.js';
import { i18nMockDefault } from '../mocks/i18n.mocks.js';

const { movie, tv } = searchToDetailsFixture.flows;
const QUERY = 'Dark Breaking';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })
}));

vi.mock('next/link', async () => {
  const { MockLink } = await import('../mocks/next-components.js');
  return { default: MockLink };
});

vi.mock('next/image', async () => {
  const { MockImage } = await import('../mocks/next-components.js');
  return { default: MockImage };
});

vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => i18nMockDefault,
  useLocale: () => 'en-US'
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const okResponse = (body) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body });
const failResponse = (status = 500) => ({
  ok: false,
  status,
  statusText: 'Error',
  json: async () => ({})
});

/**
 * Builds a fetch mock for the TMDB endpoints.
 * overrides: key -> 'fail' | custom body. Keys: search, movie, movieCertification,
 * movieProviders, tv, tvCertification, tvProviders, tvSeason.
 */
function tmdbFetch(overrides = {}) {
  const answer = (key, body) => {
    const override = overrides[key];
    if (override === 'fail') return Promise.resolve(failResponse());
    return Promise.resolve(okResponse(override ?? body));
  };

  return (url) => {
    const u = String(url);

    if (u.includes('/genre/movie/list')) return Promise.resolve(okResponse(rawFixtures.genresMovie));
    if (u.includes('/genre/tv/list')) return Promise.resolve(okResponse(rawFixtures.genresTv));
    if (u.includes('/search/multi')) return answer('search', searchToDetailsFixture.searchResponse);

    if (u.includes(`/movie/${movie.result.id}`)) {
      if (u.includes('/release_dates')) return answer('movieCertification', movie.tmdb.certification);
      if (u.includes('/watch/providers')) return answer('movieProviders', movie.tmdb.providers);
      return answer('movie', movie.tmdb.details);
    }

    if (u.includes(`/tv/${tv.result.id}`)) {
      if (u.includes('/content_ratings')) return answer('tvCertification', tv.tmdb.certification);
      if (u.includes('/watch/providers')) return answer('tvProviders', tv.tmdb.providers);
      if (/\/season\/1(\?|$)/.test(u)) return answer('tvSeason', tv.tmdb.season);
      if (/\/season\/\d+/.test(u)) return Promise.resolve(failResponse(404));
      return answer('tv', tv.tmdb.details);
    }

    return Promise.resolve(failResponse(404));
  };
}

// Routes the internal search API to the real handler, everything else to the TMDB mock.
function mockFetch(overrides) {
  const tmdb = tmdbFetch(overrides);
  vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
    const u = String(url);
    if (u.includes('/api/en-US/search')) {
      return callSearchRoute(new URL(u, 'http://localhost').searchParams.get('q'));
    }
    return tmdb(url);
  });
}

function callSearchRoute(q, locale = 'en-US') {
  const url = new URL(`http://localhost/api/${locale}/search`);
  if (q !== null && q !== undefined) url.searchParams.set('q', q);
  return searchRoute(new Request(url), { params: Promise.resolve({ locale }) });
}

const tmdbCalls = (fragment) =>
  globalThis.fetch.mock.calls.filter(([url]) => String(url).includes(fragment));

const detailParams = (id, locale = 'en-US') => ({ params: Promise.resolve({ locale, id: String(id) }) });

async function renderMovie(id = movie.result.id, locale) {
  return render(await MovieDetailPage(detailParams(id, locale)));
}

async function renderTv(id = tv.result.id, locale) {
  return render(await TvShowDetailPage(detailParams(id, locale)));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Search to details (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    Element.prototype.scrollIntoView = function () {};
    vi.stubEnv('TMDB_API_KEY', 'test-key');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('search route + TMDB service + schemas', () => {
    it('maps one search/multi response to movies, tvShows and results', async () => {
      mockFetch();

      const response = await callSearchRoute(QUERY);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.error).toBeNull();
      expect(body.movies.map((item) => item.id)).toEqual([movie.result.id]);
      expect(body.tvShows.map((item) => item.id)).toEqual([tv.result.id]);
      expect(body.results).toHaveLength(2);
      expect(body.movies[0]).toMatchObject({ mediaType: 'movie', title: movie.expected.title });
      expect(body.tvShows[0]).toMatchObject({ mediaType: 'tv', title: tv.expected.title });

      const searchCall = new URL(String(tmdbCalls('/search/multi')[0][0]));
      expect(searchCall.searchParams.get('query')).toBe(QUERY);
    });

    it('returns empty lists without calling TMDB when the query is missing', async () => {
      mockFetch();

      const response = await callSearchRoute(null);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ movies: [], tvShows: [], results: [], error: null });
      expect(tmdbCalls('/search/multi')).toHaveLength(0);
    });

    it('answers 400 for an invalid locale', async () => {
      mockFetch();

      const response = await callSearchRoute(QUERY, 'xx-XX');

      expect(response.status).toBe(400);
      expect(tmdbCalls('/search/multi')).toHaveLength(0);
    });

    it('answers 500 with an error message when the API key is missing', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      mockFetch();

      const response = await callSearchRoute(QUERY);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBeTruthy();
      expect(body.results).toEqual([]);
      expect(tmdbCalls('/search/multi')).toHaveLength(0);
    });

    it('answers 500 with an error message when TMDB fails', async () => {
      mockFetch({ search: 'fail' });

      const response = await callSearchRoute(QUERY);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBeTruthy();
      expect(body.movies).toEqual([]);
    });
  });

  describe('search results feed the detail pages', () => {
    it('uses the id of a movie search result to render the movie detail page', async () => {
      mockFetch();
      const { movies } = await (await callSearchRoute(QUERY)).json();

      await renderMovie(movies[0].id);

      expect(screen.getAllByText(movie.expected.title).length).toBeGreaterThan(0);
      expect(screen.getByText(movie.expected.runtime)).toBeInTheDocument();
      movie.expected.castNames.forEach((name) => {
        expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
      });
      expect(screen.getByText(movie.expected.providerName)).toBeInTheDocument();
    });

    it('uses the id of a tv search result to render the tv show detail page', async () => {
      mockFetch();
      const { tvShows } = await (await callSearchRoute(QUERY)).json();

      await renderTv(tvShows[0].id);

      expect(screen.getAllByText(tv.expected.title).length).toBeGreaterThan(0);
      tv.expected.castNames.forEach((name) => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
      expect(screen.getByText(tv.expected.providerName)).toBeInTheDocument();
      expect(screen.getAllByText(tv.expected.seasonLabel).length).toBeGreaterThan(0);
    });
  });

  describe('detail pages with partial or missing TMDB data', () => {
    it('renders the movie page when watch providers fail', async () => {
      mockFetch({ movieProviders: 'fail' });

      await renderMovie();

      expect(screen.getAllByText(movie.expected.title).length).toBeGreaterThan(0);
      expect(screen.queryByText(movie.expected.providerName)).not.toBeInTheDocument();
    });

    it('renders the movie page when the certification fails', async () => {
      mockFetch({ movieCertification: 'fail' });

      await renderMovie();

      expect(screen.getAllByText(movie.expected.title).length).toBeGreaterThan(0);
    });

    it('renders the movie page without credits', async () => {
      mockFetch({ movie: { ...movie.tmdb.details, credits: undefined } });

      await renderMovie();

      expect(screen.getAllByText(movie.expected.title).length).toBeGreaterThan(0);
      expect(screen.queryByText(new RegExp(movie.expected.castNames[0]))).not.toBeInTheDocument();
    });

    it('renders the movie page without a runtime', async () => {
      mockFetch({ movie: { ...movie.tmdb.details, runtime: null } });

      await renderMovie();

      expect(screen.getAllByText(movie.expected.title).length).toBeGreaterThan(0);
      expect(screen.queryByText(movie.expected.runtime)).not.toBeInTheDocument();
    });

    it('renders the tv page when the season request fails', async () => {
      mockFetch({ tvSeason: 'fail' });

      await renderTv();

      expect(screen.getAllByText(tv.expected.title).length).toBeGreaterThan(0);
    });

    it('shows watch providers only for the region of the locale', async () => {
      mockFetch();

      await renderMovie(movie.result.id, 'en-US');
      expect(screen.getByText(movie.expected.providerName)).toBeInTheDocument();
    });

    it('hides US-only watch providers for a German locale', async () => {
      mockFetch();

      await renderMovie(movie.result.id, 'de-DE');

      expect(screen.queryByText(movie.expected.providerName)).not.toBeInTheDocument();
    });
  });

  describe('typeahead + real search route', () => {
    it('lists movie and tv results with links to their detail pages', async () => {
      mockFetch();

      render(<TypeHeadSearch />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: QUERY } });

      const movieTitle = await screen.findByText(new RegExp(`^${movie.result.title}$`, 'i'));
      const tvTitle = await screen.findByText(new RegExp(`^${tv.result.title}$`, 'i'));

      expect(movieTitle.closest('a[role="option"]')).toHaveAttribute('href', movie.result.href);
      expect(tvTitle.closest('a[role="option"]')).toHaveAttribute('href', tv.result.href);
    });

    it('shows an error message when TMDB fails', async () => {
      mockFetch({ search: 'fail' });

      render(<TypeHeadSearch />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: QUERY } });

      expect((await screen.findAllByText(/could not be loaded/i)).length).toBeGreaterThan(0);
      expect(screen.queryByText(new RegExp(`^${movie.result.title}$`, 'i'))).not.toBeInTheDocument();
    });
  });
});
