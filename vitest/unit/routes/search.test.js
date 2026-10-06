// tests/unit/routes/search.test.js
// Unit tests for GET /api/[locale]/search API route
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

import { GET } from '@/app/api/[locale]/search/route';
import { createTmdbApi } from '@/lib/services/tmdb-api';

vi.mock('@/lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

const originalEnv = process.env;

describe('GET /api/[locale]/search', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockJson.mockClear();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test-api-key' };
    mockTmdbApi = { searchMedia: vi.fn() };
    createTmdbApi.mockReturnValue(mockTmdbApi);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // Branch coverage: returns empty results when query parameter is missing
  it('returns empty results when query parameter is missing', async () => {
    await GET(
      { url: `http://localhost:3000/api/${locale}/search` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: null, movies: [], tvShows: [], results: [] })
    );
  });

  // Statement coverage: returns search results for valid query
  it('returns search results for valid query', async () => {
    const results = [{ id: 1, mediaType: 'movie', title: 'Test Movie' }];
    mockTmdbApi.searchMedia.mockResolvedValue({ page: 1, results, total_pages: 1 });

    await GET(
      { url: `http://localhost:3000/api/${locale}/search?q=test` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mockTmdbApi.searchMedia).toHaveBeenCalledWith('test');
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: null, results })
    );
  });

  // Branch coverage: handles empty query string gracefully
  it('handles an empty query string gracefully', async () => {
    await GET(
      { url: `http://localhost:3000/api/${locale}/search?q=` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: null, movies: [], tvShows: [], results: [] })
    );
  });

  // Branch coverage: returns 500 when the API key is missing
  it('returns 500 when TMDB_API_KEY is missing', async () => {
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;

    await GET(
      { url: `http://localhost:3000/api/${locale}/search?q=test` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: messages.apiKeyMissing }),
      expect.objectContaining({ status: 500 })
    );
  });

  // Branch coverage: returns 500 when the TMDB search fails
  it('returns 500 when search throws', async () => {
    mockTmdbApi.searchMedia.mockRejectedValue(new Error('Search failed'));

    await GET(
      { url: `http://localhost:3000/api/${locale}/search?q=test` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: messages.searchError }),
      expect.objectContaining({ status: 500 })
    );
  });

  // Statement coverage: decodes special characters in query strings
  it('decodes special characters in query strings', async () => {
    mockTmdbApi.searchMedia.mockResolvedValue({ page: 1, results: [], total_pages: 0 });

    await GET(
      { url: `http://localhost:3000/api/${locale}/search?q=Test%20Movie%20%26%20TV%20Show` },
      { params: Promise.resolve({ locale }) }
    );

    expect(mockTmdbApi.searchMedia).toHaveBeenCalledWith('Test Movie & TV Show');
  });
});
