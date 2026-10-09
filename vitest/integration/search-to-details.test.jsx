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
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { searchToDetailsFixture } from '../fixtures/tmdb/search-to-details.browser.fixtures.js';
import { rawFixtures } from '../fixtures/tmdb/tmdb.browser.fixtures.js';
import { i18nMockDefault } from '../mocks/i18n.mocks.js';

const { movie, tv } = searchToDetailsFixture.flows;
const QUERY = 'Dark Breaking';
const OTHER_LOCALES = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

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

vi.mock('@/lib/stores/locale', async () => {
  const { DEFAULT_LOCALE: defaultLocale } = await import('@/lib/i18n/config');
  return {
    useI18n: () => i18nMockDefault,
    useLocale: () => defaultLocale
  };
});

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
    if (u.includes(`/api/${DEFAULT_LOCALE}/search`)) {
      return callSearchRoute(new URL(u, 'http://localhost').searchParams.get('q'));
    }
    return tmdb(url);
  });
}

function callSearchRoute(q, locale = DEFAULT_LOCALE) {
  const url = new URL(`http://localhost/api/${locale}/search`);
  if (q !== null && q !== undefined) url.searchParams.set('q', q);
  return searchRoute(new Request(url), { params: Promise.resolve({ locale }) });
}

const tmdbCalls = (fragment) =>
  globalThis.fetch.mock.calls.filter(([url]) => String(url).includes(fragment));

const languageOfLastSearchCall = () => {
  const calls = tmdbCalls('/search/multi');
  return new URL(String(calls[calls.length - 1][0])).searchParams.get('language');
};

const detailParams = (id, locale = DEFAULT_LOCALE) => ({
  params: Promise.resolve({ locale, id: String(id) })
});

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

    it.each(['ab', ''])('returns empty lists without calling TMDB for the query "%s"', async (q) => {
      mockFetch();

      const response = await callSearchRoute(q);

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        movies: [],
        tvShows: [],
        results: [],
        error: null
      });
      expect(tmdbCalls('/search/multi')).toHaveLength(0);
    });

    it('returns empty lists without calling TMDB when the query is missing', async () => {
      mockFetch();

      const response = await callSearchRoute(null);

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ results: [], error: null });
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

  describe('locale handling', () => {
    // LocaleParamSchema only checks the length (2-10 characters), not the supported list.
    it.each(['x', 'this-is-too-long'])('answers 400 for the locale "%s"', async (locale) => {
      mockFetch();

      const response = await callSearchRoute(QUERY, locale);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid locale.');
      expect(tmdbCalls('/search/multi')).toHaveLength(0);
    });

    it.each(SUPPORTED_LOCALES)('passes the supported locale %s to TMDB as language', async (locale) => {
      mockFetch();

      const response = await callSearchRoute(QUERY, locale);

      expect(response.status).toBe(200);
      expect(languageOfLastSearchCall()).toBe(locale);
    });

    it('uses the default UI texts but keeps the requested language for an unknown locale', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      mockFetch();
      const unknown = await (await callSearchRoute(QUERY, 'xx-XX')).json();
      const standard = await (await callSearchRoute(QUERY, DEFAULT_LOCALE)).json();
      expect(unknown.error).toBe(standard.error);

      vi.stubEnv('TMDB_API_KEY', 'test-key');
      await callSearchRoute(QUERY, 'xx-XX');
      expect(languageOfLastSearchCall()).toBe('xx-XX');
    });

    it('uses different UI texts for another supported locale', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      mockFetch();

      const standard = await (await callSearchRoute(QUERY, DEFAULT_LOCALE)).json();
      const other = await (await callSearchRoute(QUERY, OTHER_LOCALES[0])).json();

      expect(other.error).toBeTruthy();
      expect(other.error).not.toBe(standard.error);
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
  });

  describe('detail pages per locale', () => {
    // The fixture providers exist for the region of the default locale only.
    it('shows the watch providers for the region of the default locale', async () => {
      mockFetch();

      await renderMovie(movie.result.id, DEFAULT_LOCALE);

      expect(screen.getByText(movie.expected.providerName)).toBeInTheDocument();
    });

    it.each(OTHER_LOCALES)('hides the default-region watch providers for %s', async (locale) => {
      mockFetch();

      await renderMovie(movie.result.id, locale);

      expect(screen.queryByText(movie.expected.providerName)).not.toBeInTheDocument();
    });

    it.each(SUPPORTED_LOCALES)('renders movie and tv detail pages for %s', async (locale) => {
      mockFetch();

      const { unmount } = await renderMovie(movie.result.id, locale);
      expect(screen.getAllByText(movie.expected.title).length).toBeGreaterThan(0);
      unmount();

      await renderTv(tv.result.id, locale);
      expect(screen.getAllByText(tv.expected.title).length).toBeGreaterThan(0);
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
