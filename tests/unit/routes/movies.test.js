// tests/unit/routes/movies.test.js
// Unit tests for GET /api/[locale]/movies API route
// Coverage goal: Branch + Statement coverage for route handler

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { i18nMockDefault } from '$tests/mocks/i18n.mocks';

const locale = i18nMockDefault.locale;
const { messages } = i18nMockDefault;

const mocks = vi.hoisted(() => ({
  mockJson: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: mocks.mockJson,
  },
}));

import { GET } from '@/app/api/[locale]/movies/route';
import { createTmdbApi } from '@/lib/services/tmdb-api';

vi.mock('@/lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

const originalEnv = process.env;

describe('GET /api/[locale]/movies', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockJson.mockClear();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test-api-key' };
    mockTmdbApi = { getTrendingMovies: vi.fn() };
    createTmdbApi.mockReturnValue(mockTmdbApi);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // Branch coverage: returns 500 when the API key is missing
  it('returns 500 when TMDB_API_KEY is missing', async () => {
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;

    await GET(
      { url: `http://localhost:3000/api/${locale}/movies` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: messages.apiKeyMissing }),
      expect.objectContaining({ status: 500 })
    );
  });

  // Statement coverage: returns movies successfully
  it('returns movies successfully', async () => {
    const movies = [{ id: 1, title: 'Test Movie' }];
    mockTmdbApi.getTrendingMovies.mockResolvedValue({ page: 1, results: movies, total_pages: 1 });

    await GET(
      { url: `http://localhost:3000/api/${locale}/movies` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mockTmdbApi.getTrendingMovies).toHaveBeenCalled();
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: null, movies })
    );
  });

  // Branch coverage: returns 500 when the TMDB call fails
  it('returns 500 when TMDB call fails', async () => {
    mockTmdbApi.getTrendingMovies.mockRejectedValue(new Error('TMDB error'));

    await GET(
      { url: `http://localhost:3000/api/${locale}/movies` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: messages.moviesError }),
      expect.objectContaining({ status: 500 })
    );
  });
});
