/**
 * Integration (jsdom): search -> search results (movie AND tv) -> redirect to detail page.
 * One test file for the whole flow, named after its fixture
 * (vitest/fixtures/tmdb/search-to-details.browser.fixtures.js).
 *
 * Real: TypeHeadSearch, search route handler (GET), createTmdbApi, MovieDetailPage, TvShowDetailPage.
 * Mocked: fetch (only the TMDB endpoints), next/navigation, next/link, next/image, locale store.
 * The raw TMDB /search/multi response is searchToDetailsFixture.searchResponse
 * (contains one movie and one tv show); flow data comes from searchToDetailsFixture.flows.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TypeHeadSearch from '../../components/TypeHeadSearch.jsx';
import { GET as searchRoute } from '../../app/api/[locale]/search/route.js';
import MovieDetailPage from '../../app/[locale]/movies/[id]/page.js';
import TvShowDetailPage from '../../app/[locale]/tv-shows/[id]/page.js';
import { searchToDetailsFixture } from '../fixtures/tmdb/search-to-details.browser.fixtures.js';
import { rawFixtures } from '../fixtures/tmdb/tmdb.browser.fixtures.js';
import { i18nMockDefault } from '../mocks/i18n.mocks.js';

const { movie, tv } = searchToDetailsFixture.flows;
const MULTI_QUERY = 'Dark Breaking';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() })
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

// The internal search API is the real route handler; only TMDB endpoints are mocked.
function routeFetch(url) {
  const u = String(url);
  const json = (body) =>
    Promise.resolve({ ok: true, status: 200, statusText: 'OK', json: async () => body });
  const notFound = () =>
    Promise.resolve({ ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) });

  if (u.includes('/api/en-US/search')) {
    return searchRoute(new Request(new URL(u, 'http://localhost')), {
      params: Promise.resolve({ locale: 'en-US' })
    });
  }

  // searchMedia loads both genre lists before mapping the results.
  if (u.includes('/genre/movie/list')) return json(rawFixtures.genresMovie);
  if (u.includes('/genre/tv/list')) return json(rawFixtures.genresTv);

  if (u.includes('/search/multi')) return json(searchToDetailsFixture.searchResponse);

  if (u.includes(`/movie/${movie.result.id}`)) {
    if (u.includes('/release_dates')) return json(movie.tmdb.certification);
    if (u.includes('/watch/providers')) return json(movie.tmdb.providers);
    return json(movie.tmdb.details);
  }

  if (u.includes(`/tv/${tv.result.id}`)) {
    if (u.includes('/content_ratings')) return json(tv.tmdb.certification);
    if (u.includes('/watch/providers')) return json(tv.tmdb.providers);
    if (/\/season\/1(\?|$)/.test(u)) return json(tv.tmdb.season);
    if (/\/season\/\d+/.test(u)) return notFound();
    return json(tv.tmdb.details);
  }

  return notFound();
}

async function searchAndFindOption(flow) {
  render(<TypeHeadSearch />);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: MULTI_QUERY } });
  const title = await screen.findByText(new RegExp(`^${flow.result.title}$`, 'i'));
  return title.closest('a[role="option"]');
}

function pageParamsFrom(href) {
  const [, locale, , id] = href.split('/');
  return { params: Promise.resolve({ locale, id }) };
}

describe('Search -> results -> detail pages (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    Element.prototype.scrollIntoView = function () {};
    vi.stubEnv('TMDB_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockImplementation(routeFetch);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('lists movie and tv results from a single search/multi response with correct links', async () => {
    const movieOption = await searchAndFindOption(movie);
    const tvOption = await searchAndFindOption(tv);

    expect(movieOption).toHaveAttribute('href', movie.result.href);
    expect(tvOption).toHaveAttribute('href', tv.result.href);

    const tmdbSearchCalls = globalThis.fetch.mock.calls.filter(([url]) =>
      String(url).includes('/search/multi')
    );
    expect(tmdbSearchCalls.length).toBeGreaterThan(0);
  });

  it('follows the movie result to the movie detail page', async () => {
    const option = await searchAndFindOption(movie);
    expect(option).toHaveAttribute('href', movie.result.href);

    fireEvent.click(option);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(movie.result.href));

    document.body.innerHTML = '';
    const ui = await MovieDetailPage(pageParamsFrom(mockPush.mock.calls[0][0]));
    render(ui);

    expect(screen.getAllByText(movie.expected.title).length).toBeGreaterThan(0);
    expect(screen.getByText(movie.expected.runtime)).toBeInTheDocument();
    movie.expected.castNames.forEach((name) => {
      expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
    });
  });

  it('follows the tv result to the tv show detail page', async () => {
    const option = await searchAndFindOption(tv);
    expect(option).toHaveAttribute('href', tv.result.href);

    fireEvent.click(option);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(tv.result.href));

    document.body.innerHTML = '';
    const ui = await TvShowDetailPage(pageParamsFrom(mockPush.mock.calls[0][0]));
    render(ui);

    expect(screen.getAllByText(tv.expected.title).length).toBeGreaterThan(0);
    tv.expected.castNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
    expect(screen.getByText(tv.expected.providerName)).toBeInTheDocument();
    expect(screen.getAllByText(tv.expected.seasonLabel).length).toBeGreaterThan(0);
  });
});
