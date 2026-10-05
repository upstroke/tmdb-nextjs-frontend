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

describe('GET /api/[locale]/movies', () => {
  const createRequest = (locale = 'en-US', page = '1') => {
    const url = page 
      ? `http://localhost:3000/api/${locale}/movies?page=${page}`
      : `http://localhost:3000/api/${locale}/movies`;
    return new Request(url);
  };

  let mockGetTrending;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createTmdbApi } = await import('@/lib/services/tmdb');
    const api = createTmdbApi();
    mockGetTrending = api.getTrending;
  });

  // Statement coverage executes the successful response path.
  it('returns trending movies for a valid locale and page', async () => {
    mockGetTrending.mockResolvedValue({
      results: [
        { id: 1, title: 'Movie 1', media_type: 'movie' },
        { id: 2, title: 'Movie 2', media_type: 'movie' },
      ],
      page: 1,
      total_pages: 10,
    });

    const response = await GET(createRequest('en-US', '1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(2);
    expect(mockGetTrending).toHaveBeenCalledWith('en-US', 'movie', 1);
  });

  // Statement coverage executes the default-page path.
  it('uses page 1 when the page parameter is omitted', async () => {
    mockGetTrending.mockResolvedValue({ results: [], page: 1 });

    const response = await GET(createRequest('en-US'));

    expect(response.status).toBe(200);
    expect(mockGetTrending).toHaveBeenCalledWith('en-US', 'movie', 1);
  });

  // Branch coverage covers the invalid-locale branch.
  it('returns a 400 response when the locale is unsupported', async () => {
    const response = await GET(createRequest('invalid-locale'));

    expect(response.status).toBe(400);
  });

  // Branch coverage covers the invalid-page branch.
  it('returns a 400 response when the page parameter is not numeric', async () => {
    const response = await GET(createRequest('en-US', 'abc'));

    expect(response.status).toBe(400);
  });

  // Branch coverage covers the error-handling branch.
  it('returns a 500 response when the TMDB request fails', async () => {
    mockGetTrending.mockRejectedValue(new Error('TMDB API error'));

    const response = await GET(createRequest('en-US'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to fetch');
  });

  // Statement coverage executes the pagination path with a non-default page.
  it('requests the selected page when page 2 is provided', async () => {
    mockGetTrending.mockResolvedValue({
      results: [{ id: 3, title: 'Movie 3', media_type: 'movie' }],
      page: 2,
      total_pages: 10,
    });

    const response = await GET(createRequest('en-US', '2'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(mockGetTrending).toHaveBeenCalledWith('en-US', 'movie', 2);
  });
});
