// tests/unit/routes/trending.test.js
// Unit tests for GET /api/[locale]/trending API route
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

import { GET } from '@/app/api/[locale]/trending/route';
import { createTmdbApi } from '@/lib/services/tmdb-api';

vi.mock('@/lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

const originalEnv = process.env;

describe('GET /api/[locale]/trending', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockJson.mockClear();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test-api-key' };
    mockTmdbApi = { getTrendingAll: vi.fn() };
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
      { url: `http://localhost:3000/api/${locale}/trending` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: messages.apiKeyMissing }),
      expect.objectContaining({ status: 500 })
    );
  });

  // Statement coverage: returns trending media successfully
  it('returns trending media successfully', async () => {
    const results = [{ id: 1, media_type: 'movie', title: 'Trending Movie' }];
    mockTmdbApi.getTrendingAll.mockResolvedValue({ page: 1, results, total_pages: 1 });

    await GET(
      { url: `http://localhost:3000/api/${locale}/trending` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mockTmdbApi.getTrendingAll).toHaveBeenCalled();
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: null, results })
    );
  });

  // Branch coverage: returns 500 when the TMDB call fails
  it('returns 500 when TMDB call fails', async () => {
    mockTmdbApi.getTrendingAll.mockRejectedValue(new Error('TMDB error'));

    await GET(
      { url: `http://localhost:3000/api/${locale}/trending` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: messages.trendingError }),
      expect.objectContaining({ status: 500 })
    );
  });
});
