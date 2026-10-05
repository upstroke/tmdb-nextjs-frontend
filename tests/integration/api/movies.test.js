import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/[locale]/movies/route';

/**
 * Integration Tests for Movies API Route
 * 
 * Coverage Strategy (ISTQB):
 * - Statement Coverage: Each statement in the route is executed at least once
 * - Branch Coverage: Each decision branch (if/else, try/catch) is tested
 * 
 * Test Documentation:
 * - Each it-block describes the test scenario in English
 * - Format: "should [expected behavior] when [condition]"
 */

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

  /**
   * STATEMENT COVERAGE
   * Ensures all statements in the happy path are executed
   */
  
  it('should return 200 with trending movies when locale is valid and page is provided', async () => {
    // Arrange
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

    // Act
    const response = await GET(mockRequest('en-US', '1'));
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(2);
    expect(data.page).toBe(1);
    expect(tmdbApi.getTrending).toHaveBeenCalledWith('en-US', 'movie', 1);
  });

  it('should return 200 with default page 1 when page parameter is omitted', async () => {
    // Arrange
    const noPageRequest = new Request(
      'http://localhost:3000/api/en-US/movies'
    );

    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const tmdbApi = createTmdbApi();
    tmdbApi.getTrending.mockResolvedValue({ results: [], page: 1 });

    // Act
    await GET(noPageRequest);

    // Assert
    expect(tmdbApi.getTrending).toHaveBeenCalledWith('en-US', 'movie', 1);
  });

  /**
   * BRANCH COVERAGE
   * Tests each decision branch in the route handler
   */

  it('should return 400 when locale is not supported', async () => {
    // Arrange - Invalid locale branch
    const response = await GET(mockRequest('invalid-locale'));

    // Act & Assert
    expect(response.status).toBe(400);
  });

  it('should return 400 when page parameter is not a valid number', async () => {
    // Arrange - Invalid page parameter branch
    const invalidRequest = new Request(
      'http://localhost:3000/api/en-US/movies?page=abc'
    );

    // Act
    const response = await GET(invalidRequest);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 500 when TMDB API throws an error', async () => {
    // Arrange - Error handling branch (try/catch)
    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const tmdbApi = createTmdbApi();
    tmdbApi.getTrending.mockRejectedValue(new Error('TMDB API error'));

    // Act
    const response = await GET(mockRequest('en-US'));
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to fetch');
  });

  /**
   * ADDITIONAL SCENARIOS
   * Edge cases and business logic validation
   */

  it('should return 200 with correct pagination when page 2 is requested', async () => {
    // Arrange
    const mockTrendingMovies = {
      results: [{ id: 3, title: 'Movie 3', media_type: 'movie' }],
      page: 2,
      total_pages: 10,
    };

    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const tmdbApi = createTmdbApi();
    tmdbApi.getTrending.mockResolvedValue(mockTrendingMovies);

    // Act
    const response = await GET(mockRequest('en-US', '2'));
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(tmdbApi.getTrending).toHaveBeenCalledWith('en-US', 'movie', 2);
  });
});
