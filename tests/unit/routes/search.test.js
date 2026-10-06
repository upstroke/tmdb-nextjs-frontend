// tests/unit/routes/search.test.js
// Unit tests for GET /api/[locale]/search API route
// Coverage goal: Branch + Statement coverage for route handler

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

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

// Mock createTmdbApi
vi.mock('@/lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

// Mock process.env.TMDB_API_KEY
const originalEnv = process.env;

describe('GET /api/[locale]/search', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockJson.mockClear();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test-api-key' };

    // Create mock TMDB API instance
    mockTmdbApi = {
      searchMedia: vi.fn(),
    };

    // Mock createTmdbApi to return our mock instance
    createTmdbApi.mockReturnValue(mockTmdbApi);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // Branch coverage: returns empty results when query parameter is missing
  it('returns empty results when query parameter is missing', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: null,
        movies: [],
        tvShows: [],
        results: [],
      })
    );
  });

  // Statement coverage: returns search results for valid query with page parameter
  it('returns search results for valid query', async () => {
    const mockSearchResults = {
      page: 1,
      results: [
        {
          id: 1,
          mediatype: 'movie',
          mediaType: 'movie',
          title: 'Test Movie',
          vote_average: 7.5,
          poster_path: '/test.jpg',
          genre_ids: [1, 2],
        },
        {
          id: 2,
          mediatype: 'tv',
          mediaType: 'tv',
          name: 'Test TV Show',
          vote_average: 8.0,
          poster_path: '/test2.jpg',
          genre_ids: [3, 4],
        },
      ],
      total_pages: 5,
    };

    mockTmdbApi.searchMedia.mockResolvedValue(mockSearchResults);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=test&page=1',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.searchMedia).toHaveBeenCalledWith('test');
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: null,
        results: mockSearchResults.results,
      })
    );
  });

  // Branch coverage: handles empty query string gracefully (returns empty results)
  it('handles empty query string gracefully', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: null,
        movies: [],
        tvShows: [],
        results: [],
      })
    );
  });

  // Branch coverage: returns 500 error when TMDB_API_KEY is missing
  it('returns 500 error when TMDB_API_KEY is missing', async () => {
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=test',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('TMDB_API_KEY'),
      }),
      expect.objectContaining({
        status: 500,
      })
    );
  });

  // Branch coverage: returns 500 error when search throws
  it('returns 500 error when search throws', async () => {
    const mockError = new Error('Search failed');
    mockTmdbApi.searchMedia.mockRejectedValue(mockError);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=test',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('search'),
      }),
      expect.objectContaining({
        status: 500,
      })
    );
  });

  // Statement coverage: handles special characters in query (URL decoding)
  it('handles special characters in query', async () => {
    const mockSearchResults = {
      page: 1,
      results: [],
      total_pages: 0,
    };

    mockTmdbApi.searchMedia.mockResolvedValue(mockSearchResults);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=Test%20Movie%20%26%20TV%20Show',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.searchMedia).toHaveBeenCalledWith('Test Movie & TV Show');
  });
});
