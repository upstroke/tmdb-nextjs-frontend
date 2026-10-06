// tests/unit/routes/movies.test.js
// Unit tests for GET /api/[locale]/movies API route
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

import { GET } from '@/app/api/[locale]/movies/route';
import { createTmdbApi } from '@/lib/services/tmdb-api';

// Mock createTmdbApi
vi.mock('@/lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

// Mock process.env.TMDB_API_KEY
const originalEnv = process.env;

describe('GET /api/[locale]/movies', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockJson.mockClear();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test-api-key' };

    // Create mock TMDB API instance
    mockTmdbApi = {
      getTrendingMovies: vi.fn(),
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
      url: 'http://localhost:3000/api/invalid/movies',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'invalid' }),
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

  // Statement coverage: returns trending movies for valid request
  it('returns trending movies for valid request', async () => {
    const mockMoviesResponse = {
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
          id: 13,
          mediaType: 'movie',
          title: 'Forrest Gump',
          vote_average: 8.5,
          poster_path: '/fg.jpg',
          genre_ids: [18, 10749],
        },
      ],
    };

    mockTmdbApi.getTrendingMovies.mockResolvedValue(mockMoviesResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/movies',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingMovies).toHaveBeenCalledWith(1);
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        cards: mockMoviesResponse.results,
        page: 1,
        hasMore: true,
        error: null,
      })
    );
  });

  // Branch coverage: uses page from query parameter
  it('uses page from query parameter', async () => {
    const mockMoviesResponse = {
      page: 2,
      hasMore: false,
      results: [],
    };

    mockTmdbApi.getTrendingMovies.mockResolvedValue(mockMoviesResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/movies?page=2',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingMovies).toHaveBeenCalledWith(2);
    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        hasMore: false,
      })
    );
  });

  // Branch coverage: uses default page=1 when page is invalid
  it('uses default page=1 when page is invalid', async () => {
    const mockMoviesResponse = {
      page: 1,
      hasMore: false,
      results: [],
    };

    mockTmdbApi.getTrendingMovies.mockResolvedValue(mockMoviesResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/movies?page=invalid',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mockTmdbApi.getTrendingMovies).toHaveBeenCalledWith(1);
  });

  // Branch coverage: returns 500 error when TMDB_API_KEY is missing
  it('returns 500 error when TMDB_API_KEY is missing', async () => {
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/movies',
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

  // Branch coverage: returns 500 error when getTrendingMovies throws
  it('returns 500 error when getTrendingMovies throws', async () => {
    const mockError = new Error('API error');
    mockTmdbApi.getTrendingMovies.mockRejectedValue(mockError);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/movies',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('more movies'),
      }),
      expect.objectContaining({
        status: 500,
      })
    );
  });

  // Statement coverage: deduplicates movies by id-mediaType
  it('deduplicates movies by id-mediaType', async () => {
    const mockMoviesResponse = {
      page: 1,
      hasMore: false,
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
          id: 550,
          mediaType: 'movie',
          title: 'Fight Club Duplicate',
          vote_average: 8.8,
          poster_path: '/fc.jpg',
          genre_ids: [18],
        },
      ],
    };

    mockTmdbApi.getTrendingMovies.mockResolvedValue(mockMoviesResponse);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/movies',
    };
    const mockParams = {
      params: Promise.resolve({ locale: 'en-US' }),
    };

    await GET(mockRequest, mockParams);

    expect(mocks.mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            id: 550,
            title: 'Fight Club',
          }),
        ]),
      })
    );
    // Should only have 1 card, not 2 duplicates
    const callArg = mocks.mockJson.mock.calls[0][0];
    expect(callArg.cards).toHaveLength(1);
  });
});
