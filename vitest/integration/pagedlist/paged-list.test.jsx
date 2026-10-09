/**
 * Integration tests (jsdom): PagedList on the movies and tv shows pages with the real
 * list pages, API routes, TMDB service, schemas, locale store, cards and dialog.
 * Only the TMDB network (globalThis.fetch) is mocked.
 * Test plan: TP-PL-001 (test case IDs TC-PL-xx are noted above each it block).
 *
 * Chain under test:
 *   list page (server) -> createTmdbApi -> initialData -> PagedList
 *   -> "load more" -> fetch /api/{locale}/{apiPath}?page=n -> real route handler
 *   -> createTmdbApi -> schemas -> cards, restore from sessionStorage, error dialog
 *
 * No real navigation: user journeys belong to Cypress (cypress/e2e).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import React from 'react';
import MoviesPage from '../../../app/[locale]/movies/page.js';
import TvShowsPage from '../../../app/[locale]/tv-shows/page.js';
import { GET as moviesRoute } from '../../../app/api/[locale]/movies/route.js';
import { GET as tvShowsRoute } from '../../../app/api/[locale]/tv-shows/route.js';
import { AppLocaleProvider } from '@/components/providers/LocaleProvider.jsx';
import { DEFAULT_LOCALE } from '@/lib/i18n/config.js';
import { getLocaleText } from '@/lib/i18n/helpers.js';
import { rawFixtures } from '../../fixtures/tmdb/tmdb.browser.fixtures.js';
import { pagedListFixture } from '../../fixtures/tmdb/paged-list.browser.fixtures.js';

const { messages, titles } = getLocaleText(DEFAULT_LOCALE);

const io = vi.hoisted(() => ({ callback: null, observed: [] }));

vi.mock('next/link', async () => {
  const { MockLink } = await import('../../mocks/next-components.js');
  return { default: MockLink };
});

vi.mock('next/image', async () => {
  const { MockImage } = await import('../../mocks/next-components.js');
  return { default: MockImage };
});

const LISTS = [
  {
    name: 'movies',
    Page: MoviesPage,
    route: moviesRoute,
    apiPath: 'movies',
    storageKey: 'movies-page',
    cardIdPrefix: 'movie-card',
    emptyKey: 'noMoviesFound',
    heading: titles.movies,
    trendingPath: '/trending/movie/day',
    detailsPath: '/movie/',
    fixture: pagedListFixture.movies
  },
  {
    name: 'tv-shows',
    Page: TvShowsPage,
    route: tvShowsRoute,
    apiPath: 'tv-shows',
    storageKey: 'tv-shows-page',
    cardIdPrefix: 'tv-card',
    emptyKey: 'noTvShows',
    heading: titles.tvShows,
    trendingPath: '/trending/tv/day',
    detailsPath: '/tv/',
    fixture: pagedListFixture.tv
  }
];

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

const hang = (signal) =>
  new Promise((_, reject) => {
    signal?.addEventListener('abort', () => {
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    });
  });

/**
 * overrides.pages: page number -> 'fail' | custom TMDB body (trending endpoint)
 * overrides.hangFrom: internal API requests from this page on never answer (until aborted)
 */
function mockFetch(list, overrides = {}) {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url, init) => {
    const s = String(url);

    if (s.startsWith('/api/')) {
      const u = new URL(s, 'http://localhost');
      if (overrides.hangFrom && Number(u.searchParams.get('page')) >= overrides.hangFrom) {
        return hang(init?.signal);
      }
      return list.route(new Request(u), { params: Promise.resolve({ locale: DEFAULT_LOCALE }) });
    }

    if (s.includes('/genre/movie/list')) return Promise.resolve(okResponse(rawFixtures.genresMovie));
    if (s.includes('/genre/tv/list')) return Promise.resolve(okResponse(rawFixtures.genresTv));
    if (s.includes('/release_dates') || s.includes('/content_ratings')) {
      return Promise.resolve(okResponse({ results: [] }));
    }
    if (s.includes('/watch/providers')) return Promise.resolve(okResponse({ results: {} }));

    if (s.includes(list.trendingPath)) {
      const pageNumber = Number(new URL(s).searchParams.get('page') ?? '1');
      const override = overrides.pages?.[pageNumber];
      if (override === 'fail') return Promise.resolve(failResponse());
      return Promise.resolve(okResponse(override ?? list.fixture.pages[pageNumber]));
    }

    if (s.includes(`${list.detailsPath}${list.fixture.featured.id}`)) {
      return Promise.resolve(okResponse(list.fixture.featured));
    }

    return Promise.resolve(failResponse(404));
  });
}

const internalCalls = () =>
  globalThis.fetch.mock.calls.map(([url]) => String(url)).filter((url) => url.startsWith('/api/'));

const tmdbCalls = (fragment) =>
  globalThis.fetch.mock.calls.map(([url]) => String(url)).filter((url) => url.includes(fragment));

async function renderList(list) {
  const ui = await list.Page({ params: Promise.resolve({ locale: DEFAULT_LOCALE }) });
  return render(<AppLocaleProvider>{ui}</AppLocaleProvider>);
}

const cardTitles = (container) =>
  [...container.querySelectorAll('.default-card h3')].map((node) => node.textContent);

const waitForTitles = (container, expected) =>
  waitFor(() => expect(cardTitles(container)).toEqual(expected));

const getLoadMore = () => screen.getByRole('button', { name: messages.loadMore });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe.each(LISTS)('PagedList on the $name page (integration)', (list) => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    io.callback = null;
    io.observed = [];
    vi.stubEnv('TMDB_API_KEY', 'test-key');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    class FakeIntersectionObserver {
      constructor(callback) {
        io.callback = callback;
      }
      observe(element) {
        io.observed.push(element);
      }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

    Element.prototype.scrollIntoView = vi.fn();
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
      this.open = true;
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  // TC-PL-01
  it('renders heading, featured item and the cards of the first trending page', async () => {
    mockFetch(list);

    const { container } = await renderList(list);

    await waitForTitles(container, list.fixture.titles.initial);
    expect(screen.getByRole('heading', { name: list.heading })).toBeInTheDocument();
    expect(tmdbCalls(`${list.detailsPath}${list.fixture.featured.id}`).length).toBeGreaterThan(0);
    expect(getLoadMore()).toBeEnabled();
    expect(internalCalls()).toHaveLength(0);
  });

  // TC-PL-02
  it('loads the next page through the real API route and appends the cards', async () => {
    mockFetch(list);
    const { container } = await renderList(list);
    await waitForTitles(container, list.fixture.titles.initial);

    fireEvent.click(getLoadMore());

    await waitForTitles(container, list.fixture.titles.afterPage2);
    expect(internalCalls()).toEqual([`/api/${DEFAULT_LOCALE}/${list.apiPath}?page=2`]);
    await waitFor(() => expect(getLoadMore()).toBeEnabled());
    expect(sessionStorage.getItem(list.storageKey)).toBe('2');
  });

  // TC-PL-03
  it('does not show a card twice when the next page repeats it', async () => {
    mockFetch(list);
    const { container } = await renderList(list);
    await waitForTitles(container, list.fixture.titles.initial);

    fireEvent.click(getLoadMore());

    await waitForTitles(container, list.fixture.titles.afterPage2);
    const shown = cardTitles(container);
    expect(new Set(shown).size).toBe(shown.length);
  });

  // TC-PL-04
  it('disables load more and keeps the stored page when the next page has no new cards', async () => {
    const duplicateOnly = {
      ...list.fixture.pages[2],
      results: [list.fixture.pages[2].results[0]]
    };
    mockFetch(list, { pages: { 2: duplicateOnly } });
    const { container } = await renderList(list);
    await waitForTitles(container, list.fixture.titles.initial);

    fireEvent.click(getLoadMore());

    await waitFor(() => expect(getLoadMore()).toBeDisabled());
    expect(cardTitles(container)).toEqual(list.fixture.titles.initial);
    expect(sessionStorage.getItem(list.storageKey)).toBe('1');
  });

  // TC-PL-05
  it('restores all pages up to the stored page', async () => {
    sessionStorage.setItem(list.storageKey, '3');
    mockFetch(list);

    const { container } = await renderList(list);

    await waitForTitles(container, list.fixture.titles.all);
    expect(internalCalls()).toEqual([
      `/api/${DEFAULT_LOCALE}/${list.apiPath}?page=2`,
      `/api/${DEFAULT_LOCALE}/${list.apiPath}?page=3`
    ]);
    expect(getLoadMore()).toBeDisabled();
  });

  // TC-PL-06
  it('shows the error dialog and keeps the cards when the next page fails', async () => {
    mockFetch(list, { pages: { 2: 'fail' } });
    const { container } = await renderList(list);
    await waitForTitles(container, list.fixture.titles.initial);

    fireEvent.click(getLoadMore());

    expect((await screen.findAllByText(messages.loadMoreError)).length).toBeGreaterThan(0);
    expect(cardTitles(container)).toEqual(list.fixture.titles.initial);
    await waitFor(() => expect(getLoadMore()).toBeEnabled());
  });

  // TC-PL-07
  it('shows the timeout message when the next page does not answer within 15 seconds', async () => {
    mockFetch(list, { hangFrom: 2 });
    const { container } = await renderList(list);
    await waitForTitles(container, list.fixture.titles.initial);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    fireEvent.click(getLoadMore());
    await act(async () => {
      vi.advanceTimersByTime(15000);
    });
    await act(async () => {});

    expect(screen.getAllByText(messages.loadTimeout).length).toBeGreaterThan(0);
    expect(cardTitles(container)).toEqual(list.fixture.titles.initial);
  });

  // TC-PL-08
  it('shows the missing API key message without any request', async () => {
    vi.stubEnv('TMDB_API_KEY', '');
    mockFetch(list);

    const { container } = await renderList(list);

    expect(screen.getByText(messages.apiKeyMissing)).toBeInTheDocument();
    expect(container.querySelectorAll('.default-card')).toHaveLength(0);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  // TC-PL-09
  it('shows the empty message when the first page has no results', async () => {
    mockFetch(list, { pages: { 1: { ...list.fixture.pages[1], results: [] } } });

    const { container } = await renderList(list);

    const expected = messages[list.emptyKey] ?? messages.noContent;
    expect(await screen.findByText(expected)).toBeInTheDocument();
    expect(container.querySelectorAll('.default-card')).toHaveLength(0);
  });

  // TC-PL-10
  it('scrolls to the first new card after loading the next page', async () => {
    mockFetch(list);
    const { container } = await renderList(list);
    await waitForTitles(container, list.fixture.titles.initial);

    fireEvent.click(getLoadMore());
    await waitForTitles(container, list.fixture.titles.afterPage2);

    await waitFor(() => expect(io.observed.length).toBeGreaterThan(0));
    const target = io.observed[io.observed.length - 1];
    expect(target.id).toBe(`${list.cardIdPrefix}-${list.fixture.titles.initial.length + 1}`);

    act(() => io.callback([{ isIntersecting: true }], { disconnect: vi.fn() }));

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });
});
