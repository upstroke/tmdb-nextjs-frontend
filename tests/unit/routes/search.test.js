// tests/unit/routes/search.test.js
// Unit tests for GET /api/[locale]/search API route

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../../../../app/api/[locale]/search/route';
import { createTmdbApi } from '../../../../lib/services/tmdb-api';

// Mock createTmdbApi
vi.mock('../../../../lib/services/tmdb-api', () => ({
  createTmdbApi: vi.fn(),
}));

// Mock NextResponse
const mockJson = vi.fn();

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data) => ({ json: vi.fn(() => data) })),
    error: vi.fn((data) => ({ json: vi.fn(() => data) })),
  },
}));

describe('GET /api/[locale]/search', () => {
  let mockTmdbApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockClear();

    // Create mock TMDB API instance
    mockTmdbApi = {
      searchMedia: vi.fn(),
    };

    // Mock createTmdbApi to return our mock instance
    createTmdbApi.mockReturnValue(mockTmdbApi);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when query parameter is missing', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search',
    };

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('query'),
      })
    );
  });

  it('returns search results for valid query', async () => {
    const mockSearchResults = {
      page: 1,
      results: [
        {
          id: 1,
          mediatype: 'movie',
          title: 'Test Movie',
          vote_average: 7.5,
          poster_path: '/test.jpg',
          genre_ids: [1, 2],
        },
        {
          id: 2,
          mediatype: 'tv',
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

    await GET(mockRequest);

    expect(mockTmdbApi.searchMedia).toHaveBeenCalledWith('test', 1);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: mockSearchResults,
      })
    );
  });

  it('uses default page=1 when page parameter is missing', async () => {
    const mockSearchResults = {
      page: 1,
      results: [],
      total_pages: 0,
    };

    mockTmdbApi.searchMedia.mockResolvedValue(mockSearchResults);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=test',
    };

    await GET(mockRequest);

    expect(mockTmdbApi.searchMedia).toHaveBeenCalledWith('test', 1);
  });

  it('handles empty query string gracefully', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=',
    };

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('query'),
      })
    );
  });

  it('returns 500 error when TMDB API throws', async () => {
    const mockError = new Error('TMDB API error');
    mockTmdbApi.searchMedia.mockRejectedValue(mockError);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=test&page=1',
    };

    await GET(mockRequest);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('search'),
      })
    );
  });

  it('handles special characters in query', async () => {
    const mockSearchResults = {
      page: 1,
      results: [],
      total_pages: 0,
    };

    mockTmdbApi.searchMedia.mockResolvedValue(mockSearchResults);

    const mockRequest = {
      url: 'http://localhost:3000/api/en-US/search?q=Test%20Movie%20%26%20TV%20Show&page=1',
    };

    await GET(mockRequest);

    expect(mockTmdbApi.searchMedia).toHaveBeenCalledWith('Test Movie & TV Show', 1);
  });
});
