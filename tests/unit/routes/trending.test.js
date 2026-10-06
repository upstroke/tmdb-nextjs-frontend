// tests/unit/routes/trending.test.js
// Unit tests for GET /api/[locale]/trending API route
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

import { GET } from '@/app/api/[locale]/trending/route';
import { createTmdbApi } from '@/lib/services/tmdb-api';

// Mock createTmdbApi
vi.mock('@/lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

// Mock process.env.TMDB_API_KEY
const originalEnv = process.env;

describe('GET /api/[locale]/trending', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockJson.mockClear();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test-api-key' };

    // Create mock TMDB API instance
    mockTmdbApi = {
      getTrendingAll: vi.fn(),
    };

    // Mock createTmdbApi to return our mock instance
    createTmdbApi.mockReturnValue(mockTmdbApi);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // Branch coverage: returns 400 when locale is invalid
  it('returns 400 when locale is invalid', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/invalid/trending',
    };
    const mockParams = {
      params: Promise.resolve({ locale: '' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid locale.',
      }),
      expect.objectContaining({
        status: 400,
      })
    );
  });

  // Statement coverage: returns trending items for valid request
  it('returns trending items for valid request', async () => {
    const mockTrendingResponse = {
      page: 1,
      hasMore: true,
      results: [
        {
          id: 550,
          mediaType: 'movie',
          title: 'Fight Club',
          vote_average: 8.8,
          poster_path: '/fc.jpg',
          genre_ids: [18],
        },
        {
          id: 1399,
          mediaType: 'tv',
          name: 'Game of Thrones',
          vote_average: 9.2,
          poster_path: '/got.jpg',
          genre_ids: [10765],
        },
      ],
    };

    mockTmdbApi.getTrendingAll.mockResolvedValue(mockTrendingResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/trending',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingAll).toHaveBeenCalledWith(1);
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        cards: mockTrendingResponse.results,
        page: 1,
        hasMore: true,
        error: null,
      })
    );
  });

  // Branch coverage: uses page from query parameter
  it('uses page from query parameter', async () => {
    const mockTrendingResponse = {
      page: 2,
      hasMore: false,
      results: [],
    };

    mockTmdbApi.getTrendingAll.mockResolvedValue(mockTrendingResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/trending?page=2',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingAll).toHaveBeenCalledWith(2);
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        hasMore: false,
      })
    );
  });

  // Branch coverage: uses default page=1 when page is invalid
  it('uses default page=1 when page is invalid', async () => {
    const mockTrendingResponse = {
      page: 1,
      hasMore: false,
      results: [],
    };

    mockTmdbApi.getTrendingAll.mockResolvedValue(mockTrendingResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/trending?page=invalid',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingAll).toHaveBeenCalledWith(1);
  });

  // Branch coverage: returns 500 error when TMDB_API_KEY is missing
  it('returns 500 error when TMDB_API_KEY is missing', async () => {
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/trending',
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

  // Branch coverage: returns 500 error when getTrendingAll throws
  it('returns 500 error when getTrendingAll throws', async () => {
    const mockError = new Error('API error');
    mockTmdbApi.getTrendingAll.mockRejectedValue(mockError);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/trending',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'More content could not be loaded.',
      }),
      expect.objectContaining({
        status: 500,
      })
    );
  });
});
