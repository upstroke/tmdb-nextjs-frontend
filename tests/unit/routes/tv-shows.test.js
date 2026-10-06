// tests/unit/routes/tv-shows.test.js
// Unit tests for GET /api/[locale]/tv-shows API route
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

import { GET } from '@/app/api/[locale]/tv-shows/route';
import { createTmdbApi } from '@/lib/services/tmdb-api';

// Mock createTmdbApi
vi.mock('@/lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

// Mock process.env.TMDB_API_KEY
const originalEnv = process.env;

describe('GET /api/[locale]/tv-shows', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockJson.mockClear();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test-api-key' };

    // Create mock TMDB API instance
    mockTmdbApi = {
      getTrendingTVShows: vi.fn(),
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
      url: 'http://localhost:3000/api/invalid/tv-shows',
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

  // Statement coverage: returns trending TV shows for valid request
  it('returns trending TV shows for valid request', async () => {
    const mockTVShowsResponse = {
      page: 1,
      hasMore: true,
      results: [
        {
          id: 1399,
          mediaType: 'tv',
          name: 'Game of Thrones',
          vote_average: 9.2,
          poster_path: '/got.jpg',
          genre_ids: [10765],
        },
        {
          id: 66732,
          mediaType: 'tv',
          name: 'Stranger Things',
          vote_average: 8.7,
          poster_path: '/st.jpg',
          genre_ids: [18, 10765],
        },
      ],
    };

    mockTmdbApi.getTrendingTVShows.mockResolvedValue(mockTVShowsResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/tv-shows',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingTVShows).toHaveBeenCalledWith(1);
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        cards: mockTVShowsResponse.results,
        page: 1,
        hasMore: true,
        error: null,
      })
    );
  });

  // Branch coverage: uses page from query parameter
  it('uses page from query parameter', async () => {
    const mockTVShowsResponse = {
      page: 2,
      hasMore: false,
      results: [],
    };

    mockTmdbApi.getTrendingTVShows.mockResolvedValue(mockTVShowsResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/tv-shows?page=2',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingTVShows).toHaveBeenCalledWith(2);
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        hasMore: false,
      })
    );
  });

  // Branch coverage: uses default page=1 when page is invalid
  it('uses default page=1 when page is invalid', async () => {
    const mockTVShowsResponse = {
      page: 1,
      hasMore: false,
      results: [],
    };

    mockTmdbApi.getTrendingTVShows.mockResolvedValue(mockTVShowsResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/tv-shows?page=invalid',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingTVShows).toHaveBeenCalledWith(1);
  });

  // Branch coverage: returns 500 error when TMDB_API_KEY is missing
  it('returns 500 error when TMDB_API_KEY is missing', async () => {
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/tv-shows',
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

  // Branch coverage: returns 500 error when getTrendingTVShows throws
  it('returns 500 error when getTrendingTVShows throws', async () => {
    const mockError = new Error('API error');
    mockTmdbApi.getTrendingTVShows.mockRejectedValue(mockError);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/tv-shows',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'More TV shows could not be loaded.',
      }),
      expect.objectContaining({
        status: 500,
      })
    );
  });

  // Statement coverage: deduplicates TV shows by id-mediaType
  it('deduplicates TV shows by id-mediaType', async () => {
    const mockTVShowsResponse = {
      page: 1,
      hasMore: false,
      results: [
        {
          id: 1399,
          mediaType: 'tv',
          name: 'Game of Thrones',
          vote_average: 9.2,
          poster_path: '/got.jpg',
          genre_ids: [10765],
        },
        {
          id: 1399,
          mediaType: 'tv',
          name: 'Game of Thrones Duplicate',
          vote_average: 9.2,
          poster_path: '/got.jpg',
          genre_ids: [10765],
        },
      ],
    };

    mockTmdbApi.getTrendingTVShows.mockResolvedValue(mockTVShowsResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/tv-shows',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    // Last duplicate wins (Map uses id-mediaType as key)
    const callArg = mocks.mockJson.mock.calls[0][0];
    expect(callArg.cards).toHaveLength(1);
    expect(callArg.cards[0]).toEqual(
      expect.objectContaining({
        id: 1399,
        name: 'Game of Thrones Duplicate',
      })
    );
  });
});
