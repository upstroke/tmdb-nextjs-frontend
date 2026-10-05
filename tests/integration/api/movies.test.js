import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/[locale]/movies/route';

// Mock TMDB API helper
vi.mock('@/lib/services/tmdb', () => ({
  createTmdbApi: () => ({
    getTrending: vi.fn(),
    getMovieDetails: vi.fn(),
    getTvShowDetails: vi.fn(),
    getCertification: vi.fn(),
    getWatchProviders: vi.fn(),
  }),
}));

describe('Movies API Route', () => {
  const mockRequest = (locale = 'en-US', page = '1') => {
    return new Request(`http://localhost:3000/api/${locale}/movies?page=${page}`);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with trending movies for valid locale', async () => {
    const mockTrendingMovies = {
      results: [
        { id: 1, title: 'Movie 1', media_type: 'movie' },
        { id: 2, title: 'Movie 2', media_type: 'movie' },
      ],
      page: 1,
      total_pages: 10,
    };

    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const tmdbApi = createTmdbApi();
    tmdbApi.getTrending.mockResolvedValue(mockTrendingMovies);

    const response = await GET(mockRequest('en-US'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(2);
    expect(data.page).toBe(1);
    expect(tmdbApi.getTrending).toHaveBeenCalledWith('en-US', 'movie', 1);
  });

  it('returns 400 for unsupported locale', async () => {
    const response = await GET(mockRequest('invalid-locale'));

    expect(response.status).toBe(400);
  });

  it('returns 400 when page is not a number', async () => {
    const invalidRequest = new Request(
      'http://localhost:3000/api/en-US/movies?page=abc'
    );
    const response = await GET(invalidRequest);

    expect(response.status).toBe(400);
  });

  it('returns 500 when TMDB API throws error', async () => {
    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const tmdbApi = createTmdbApi();
    tmdbApi.getTrending.mockRejectedValue(new Error('TMDB API error'));

    const response = await GET(mockRequest('en-US'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to fetch');
  });

  it('supports pagination with page parameter', async () => {
    const mockTrendingMovies = {
      results: [{ id: 3, title: 'Movie 3', media_type: 'movie' }],
      page: 2,
      total_pages: 10,
    };

    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const tmdbApi = createTmdbApi();
    tmdbApi.getTrending.mockResolvedValue(mockTrendingMovies);

    const response = await GET(mockRequest('en-US', '2'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(tmdbApi.getTrending).toHaveBeenCalledWith('en-US', 'movie', 2);
  });

  it('defaults to page 1 when no page parameter provided', async () => {
    const noPageRequest = new Request(
      'http://localhost:3000/api/en-US/movies'
    );

    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const tmdbApi = createTmdbApi();
    tmdbApi.getTrending.mockResolvedValue({ results: [], page: 1 });

    await GET(noPageRequest);

    expect(tmdbApi.getTrending).toHaveBeenCalledWith('en-US', 'movie', 1);
  });
});
