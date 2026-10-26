/**
 * Integration test (jsdom): Movie detail page remains usable when TMDB returns
 * partial data, and shows the error dialog when the core object is unusable.
 *
 * Chain under test:
 *   MovieDetailPage (server) -> createTmdbApi -> Zod schemas -> DialogMessage / details view
 *
 * Only the TMDB network (globalThis.fetch) is mocked.
 *
 * Test plan: movie-detail-integration-test-plan.md (TC-MD-02, TC-MD-03).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
const MOVIE_TITLE = 'Data Validation Movie';

const baseMovieDetails = {
  id: MOVIE_ID,
  title: MOVIE_TITLE,
  original_title: MOVIE_TITLE,
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2026-01-01',
  genres: [{ id: 28, name: 'Action' }],
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
 * Mocks TMDB movie details, release dates and watch providers.
 *
 * @param {object} details - Movie details returned for the detail endpoint.
 * @returns {void}
 */
function mockFetch(details) {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
    const requestUrl = String(url);

    if (requestUrl.includes(`/movie/${MOVIE_ID}?`)) {
      return Promise.resolve(okResponse(details));
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

async function renderMoviePage() {
  const ui = await MovieDetailPage({
    params: Promise.resolve({ locale: DEFAULT_LOCALE, id: String(MOVIE_ID) })
  });

  render(<AppLocaleProvider>{ui}</AppLocaleProvider>);
}

describe('Movie detail page — TD-004 data validation', () => {
  beforeEach(setupEnvironment);
  afterEach(teardownEnvironment);

  // TC-MD-02
  it('renders partial movie details with not-available fallbacks and no error dialog', async () => {
    mockFetch(baseMovieDetails);

    await renderMoviePage();

    expect(screen.getAllByText(MOVIE_TITLE).length).toBeGreaterThan(0);
    expect(screen.getByText(fallbacks.notAvailable)).toBeInTheDocument();
    expect(screen.queryByText('Film konnte nicht geladen werden')).not.toBeInTheDocument();
  });

  // TC-MD-03
  it('shows the movie load error dialog when the core movie object is unusable', async () => {
    mockFetch({ title: MOVIE_TITLE });

    await renderMoviePage();

    expect(screen.getByText('Film konnte nicht geladen werden')).toBeInTheDocument();
  });
});
