/**
 * Regression integration tests for wrapper -> cache -> PagedList -> real API
 * route -> TMDB service. Only external fetch and browser platform gaps are
 * stubbed. No Next.js navigation is simulated beyond unmount/remount.
 * Plan: trending-cache-restore-test-plan.md (TC-PL-15 through TC-PL-18).
 */
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import MovieTrendingList from '@/components/MovieTrendingList';
import TvTrendingList from '@/components/TvTrendingList';
import TrendingCacheProvider, { useTrendingCache } from '@/components/TrendingCacheProvider';
import { AppLocaleProvider } from '@/components/providers/LocaleProvider.jsx';
import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/helpers';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { GET as moviesRoute } from '../../../app/api/[locale]/movies/route.js';
import { GET as tvRoute } from '../../../app/api/[locale]/tv-shows/route.js';
import { rawFixtures } from '../../fixtures/tmdb/tmdb.browser.fixtures.js';
import { pagedListFixture } from '../../fixtures/tmdb/paged-list.browser.fixtures.js';

vi.mock('next/link', async () => {
  const { MockLink } = await import('../../mocks/next-components.js');
  return { default: MockLink };
});
vi.mock('next/image', async () => {
  const { MockImage } = await import('../../mocks/next-components.js');
  return { default: MockImage };
});

let originalShowModal;

const cases = [
  { type: 'movie', path: 'movies', List: MovieTrendingList, route: moviesRoute, fixture: pagedListFixture.movies },
  { type: 'tv', path: 'tv-shows', List: TvTrendingList, route: tvRoute, fixture: pagedListFixture.tv }
];
const { messages } = getLocaleText(DEFAULT_LOCALE);
const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const calls = () => globalThis.fetch.mock.calls.map(([url]) => String(url)).filter((url) => url.startsWith('/api/'));
const titles = (container) => [...container.querySelectorAll('.default-card h3')].map((node) => node.textContent);
const more = () => screen.getByRole('button', { name: messages.loadMore });
const expectTitles = (container, expected) => waitFor(() => expect(titles(container)).toEqual(expected));

/**
 * Retains the real provider while mounting and unmounting the list.
 * @param {object} props - Harness configuration.
 * @returns {JSX.Element} Interactive test harness.
 */
function Harness({ config, initialData, seeded }) {
  const cache = useTrendingCache();
  const [visible, setVisible] = useState(!seeded);
  const List = config.List;
  return (
    <>
      <button onClick={() => {
        cache.addCards(config.type, initialData.cards.slice(0, 1));
        setVisible(true);
      }}>Seed and open</button>
      <button onClick={() => setVisible(false)}>Leave list</button>
      <button onClick={() => setVisible(true)}>Return to list</button>
      {visible && (
        <List
          initialData={initialData}
          apiPath={config.path}
          storageKey={`${config.path}-page`}
          cardIdPrefix={`${config.type}-card`}
          listKeyPrefix={config.path}
        />
      )}
    </>
  );
}

/**
 * Builds initial data through the real TMDB service and renders real modules.
 * @param {object} config - Media-specific configuration.
 * @param {object} options - Test options.
 * @returns {Promise<object>} Render result and normalized initial cards.
 */
async function setupList(config, { seeded = false, duplicates = false } = {}) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const value = String(url);
    if (value.startsWith('/api/')) {
      return config.route(new Request(new URL(value, 'http://localhost')), {
        params: Promise.resolve({ locale: DEFAULT_LOCALE })
      });
    }
    if (value.includes('/genre/movie/list')) return ok(rawFixtures.genresMovie);
    if (value.includes('/genre/tv/list')) return ok(rawFixtures.genresTv);
    if (value.includes('/release_dates') || value.includes('/content_ratings')) return ok({ results: [] });
    if (value.includes(`/trending/${config.type}/day`)) {
      const number = Number(new URL(value).searchParams.get('page') ?? 1);
      const body = config.fixture.pages[number];
      if (!body) throw new Error(`Unexpected trending page: ${number}`);
      return ok(duplicates && number === 2 ? { ...body, results: [config.fixture.items[2]] } : body);
    }
    throw new Error(`Unexpected fetch: ${value}`);
  });
  const api = createTmdbApi(fetch, 'test-key', DEFAULT_LOCALE);
  const result = config.type === 'movie' ? await api.getTrendingMovies(1) : await api.getTrendingTVShows(1);
  const initialData = { cards: result.results, page: 1, hasMore: result.hasMore };
  const view = render(
    <AppLocaleProvider>
      <TrendingCacheProvider initialLocale={DEFAULT_LOCALE}>
        <Harness config={config} initialData={initialData} seeded={seeded} />
      </TrendingCacheProvider>
    </AppLocaleProvider>
  );
  return view;
}

beforeEach(() => {
  originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
  sessionStorage.clear();
  vi.stubEnv('TMDB_API_KEY', 'test-key');
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('IntersectionObserver', vi.fn(function () {
    return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
  }));
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    writable: true,
    value: vi.fn(function showModal() {
      this.open = true;
    })
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalShowModal) {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShowModal);
  } else {
    delete HTMLDialogElement.prototype.showModal;
  }
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  sessionStorage.clear();
});

describe.each(cases)('Trending cache restoration: $path', (config) => {
  // TC-PL-15
  it('keeps session writes after populating the cache and retains all cards on remount', async () => {
    const { container } = await setupList(config);
    await expectTitles(container, config.fixture.titles.initial);
    expect(calls()).toEqual([]);
    fireEvent.click(more());
    await expectTitles(container, config.fixture.titles.afterPage2);
    expect(sessionStorage.getItem(`${config.path}-page`)).toBe('2');
    fireEvent.click(more());
    await expectTitles(container, config.fixture.titles.all);
    expect(sessionStorage.getItem(`${config.path}-page`)).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: 'Leave list' }));
    fireEvent.click(screen.getByRole('button', { name: 'Return to list' }));
    await expectTitles(container, config.fixture.titles.all);
    expect(calls()).toEqual([`/api/${DEFAULT_LOCALE}/${config.path}?page=2`, `/api/${DEFAULT_LOCALE}/${config.path}?page=3`]);
  });

  // TC-PL-16
  it('requests page 1 then page 2 from a Home-style cache without merging server cards prematurely', async () => {
    sessionStorage.setItem(`${config.path}-page`, '3');
    const { container } = await setupList(config, { seeded: true });
    fireEvent.click(screen.getByRole('button', { name: 'Seed and open' }));
    await expectTitles(container, config.fixture.titles.initial.slice(0, 1));
    expect(calls()).toEqual([]);
    fireEvent.click(more());
    await expectTitles(container, config.fixture.titles.initial);
    fireEvent.click(more());
    await expectTitles(container, config.fixture.titles.afterPage2);
    expect(calls()).toEqual([`/api/${DEFAULT_LOCALE}/${config.path}?page=1`, `/api/${DEFAULT_LOCALE}/${config.path}?page=2`]);
    expect(sessionStorage.getItem(`${config.path}-page`)).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: 'Leave list' }));
    fireEvent.click(screen.getByRole('button', { name: 'Return to list' }));
    await expectTitles(container, config.fixture.titles.afterPage2);
    fireEvent.click(more());
    await expectTitles(container, config.fixture.titles.all);
    expect(calls().at(-1)).toBe(`/api/${DEFAULT_LOCALE}/${config.path}?page=3`);
  });

  // TC-PL-17
  it('restores server-backed pages and caches restored cards when appending', async () => {
    sessionStorage.setItem(`${config.path}-page`, '2');
    const { container } = await setupList(config);
    await expectTitles(container, config.fixture.titles.afterPage2);
    fireEvent.click(more());
    await expectTitles(container, config.fixture.titles.all);
    expect(sessionStorage.getItem(`${config.path}-page`)).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: 'Leave list' }));
    fireEvent.click(screen.getByRole('button', { name: 'Return to list' }));
    await expectTitles(container, config.fixture.titles.all);
    expect(calls()).toEqual([`/api/${DEFAULT_LOCALE}/${config.path}?page=2`, `/api/${DEFAULT_LOCALE}/${config.path}?page=3`]);
  });

  // TC-PL-18
  it('keeps page 1 in session storage when the next server-backed page has no new cards', async () => {
    const { container } = await setupList(config, { duplicates: true });
    await expectTitles(container, config.fixture.titles.initial);
    fireEvent.click(more());
    await waitFor(() => expect(more()).toBeDisabled());
    expect(titles(container)).toEqual(config.fixture.titles.initial);
    expect(sessionStorage.getItem(`${config.path}-page`)).toBe('1');
  });
});
