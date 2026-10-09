/**
 * Integration (jsdom): search -> search results -> redirect to movie detail page.
 * All flow data (query, API responses, link, expected values) comes from
 * searchToDetailsFixture.flows.movie.
 * Real: TypeHeadSearch, MovieDetailPage, createTmdbApi.
 * Mocked: fetch (search API + TMDB API), next/navigation, next/link, next/image, locale store.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TypeHeadSearch from '../../components/TypeHeadSearch.jsx';
import MovieDetailPage from '../../app/[locale]/movies/[id]/page.js';
import { searchToDetailsFixture } from '../fixtures/tmdb/search-to-details.browser.fixtures.js';
import { i18nMockDefault } from '../mocks/i18n.mocks.js';

const flow = searchToDetailsFixture.flows.movie;

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

// Routes every fetch: internal search API and the TMDB endpoints used by the detail page.
function routeFetch(url) {
  const u = String(url);
  const json = (body) =>
    Promise.resolve({ ok: true, status: 200, statusText: 'OK', json: async () => body });

  if (u.includes('/api/en-US/search')) return json(flow.search.apiResponse);
  if (u.includes('/release_dates')) return json(flow.tmdb.certification);
  if (u.includes('/watch/providers')) return json(flow.tmdb.providers);
  if (new RegExp(`/movie/${flow.result.id}(\\?|$)`).test(u)) return json(flow.tmdb.details);
  return Promise.resolve({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: async () => ({})
  });
}

describe('Search -> results -> movie detail page (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    Element.prototype.scrollIntoView = function () {};
    vi.stubEnv('TMDB_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockImplementation(routeFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('follows a movie search result to its detail page and shows the movie data', async () => {
    // 1. Search
    const { unmount } = render(<TypeHeadSearch />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: flow.search.query } });

    // 2. Search results: pick the movie and follow its link
    const movieTitle = await screen.findByText(new RegExp(`^${flow.result.title}$`, 'i'));
    const movieOption = movieTitle.closest('a[role="option"]');
    expect(movieOption).toHaveAttribute('href', flow.result.href);

    fireEvent.click(movieOption);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(flow.result.href);
    });
    unmount();

    // 3. Redirect: render the page the link points to
    const [, locale, , id] = mockPush.mock.calls[0][0].split('/');
    const ui = await MovieDetailPage({ params: Promise.resolve({ locale, id }) });
    render(ui);

    // 4. Detail page shows the expected data
    expect(screen.getAllByText(flow.expected.title).length).toBeGreaterThan(0);
    expect(screen.getByText(flow.expected.runtime)).toBeInTheDocument();
    flow.expected.castNames.forEach((name) => {
      expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
    });
  });
});
