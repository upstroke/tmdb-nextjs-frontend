/**
 * Integration test (jsdom): Movie detail page remains usable when TMDB returns
 * 404 for the movie's watch providers.
 *
 * Chain under test:
 *   MovieDetailPage (server) -> createTmdbApi -> Zod schemas -> DialogMessage / details view
 *
 * Only the TMDB network (globalThis.fetch) is mocked.
 *
 * Test plan: TP-MD-001 (test case ID TC-MD-01 is noted above the it block).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import MovieDetailPage from '../../../app/[locale]/movies/[id]/page.js';
import { AppLocaleProvider } from '@/components/providers/LocaleProvider.jsx';
import { DEFAULT_LOCALE } from '@/lib/i18n/config.js';
import { getLocaleText } from '@/lib/i18n/helpers.js';

const { fallbacks } = getLocaleText(DEFAULT_LOCALE);

vi.mock('next/image', async () => {
  const { MockImage } = await import('../../mocks/next-components.js');
  return { default: MockImage };
});

const MOVIE_ID = 123;
const MOVIE_TITLE = 'Provider Fallback Movie';

const movieDetails = {
  id: MOVIE_ID,
  title: MOVIE_TITLE,
  original_title: MOVIE_TITLE,
  overview: 'A movie whose watch-provider request fails.',
  homepage: '',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2026-01-01',
  genres: [{ id: 28, name: 'Action' }],
  runtime: 100,
  vote_average: 7.3,
  credits: { cast: [], crew: [] },
  videos: { results: [] }
};

const okResponse = (body) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => body
});

const notFoundResponse = () => ({
  ok: false,
  status: 404,
  statusText: 'Not Found',
  json: async () => ({})
});

/**
 * Mocks TMDB so that movie details succeed while watch providers return 404.
 *
 * @returns {void}
 */
function mockFetch() {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
    const requestUrl = String(url);

    if (requestUrl.includes(`/movie/${MOVIE_ID}?`)) {
      return Promise.resolve(okResponse(movieDetails));
    }

    if (requestUrl.includes(`/movie/${MOVIE_ID}/release_dates`)) {
      return Promise.resolve(okResponse({ results: [] }));
    }

    if (requestUrl.includes(`/movie/${MOVIE_ID}/watch/providers`)) {
      return Promise.resolve(notFoundResponse());
    }

    return Promise.resolve(notFoundResponse());
  });
}

function setupEnvironment() {
  vi.clearAllMocks();
  vi.stubEnv('TMDB_API_KEY', 'test-key');
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
    this.open = true;
  });
}

function teardownEnvironment() {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
}

describe('Movie detail page (integration)', () => {
  beforeEach(setupEnvironment);
  afterEach(teardownEnvironment);

  // TC-MD-01
  it('renders the movie without streaming providers when the provider request returns 404', async () => {
    mockFetch();

    const ui = await MovieDetailPage({
      params: Promise.resolve({ locale: DEFAULT_LOCALE, id: String(MOVIE_ID) })
    });

    render(<AppLocaleProvider>{ui}</AppLocaleProvider>);

    expect(screen.getAllByText(MOVIE_TITLE).length).toBeGreaterThan(0);
    expect(screen.getByText(movieDetails.overview)).toBeInTheDocument();
    const providersSection = document.querySelector(
      'section[aria-labelledby="watch-providers-heading"]'
    );
    expect(providersSection).not.toBeNull();
    expect(within(providersSection).getByText(fallbacks.notAvailable)).toBeInTheDocument();
    expect(screen.queryByText('TMDB request failed: 404')).not.toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/movie/${MOVIE_ID}/watch/providers`),
      expect.anything()
    );
  });
});
