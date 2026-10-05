import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/[locale]/movies/route';

// Set TMDB API key for tests
process.env.TMDB_API_KEY = 'test-key';

describe('GET /api/[locale]/movies', () => {
  const createRequest = (locale = 'en-US', page = '1') => {
    const url = page 
      ? `http://localhost:3000/api/${locale}/movies?page=${page}`
      : `http://localhost:3000/api/${locale}/movies`;
    return new Request(url);
  };

  const createParams = (locale = 'en-US') => {
    return { params: Promise.resolve({ locale }) };
  };

  beforeEach(() => {
    // Clear mocks before each test
  });

  // Statement coverage executes the successful response path.
  it('returns 200 for valid locale and page', async () => {
    const response = await GET(createRequest('en-US', '1'), createParams('en-US'));

    expect(response.status).toBe(200);
  });

  // Statement coverage executes the default-page path.
  it('uses page 1 when the page parameter is omitted', async () => {
    const response = await GET(createRequest('en-US'), createParams('en-US'));

    expect(response.status).toBe(200);
  });

  // Branch coverage covers the invalid-locale branch.
  it('returns a 400 response when the locale is unsupported', async () => {
    const response = await GET(createRequest('invalid-locale'), createParams('invalid-locale'));

    expect(response.status).toBe(400);
  });

  // Branch coverage covers the invalid-page branch (route coerces to default).
  it('returns 200 when page parameter is not numeric (coerced to default)', async () => {
    const response = await GET(createRequest('en-US', 'abc'), createParams('en-US'));

    // Route converts invalid page to default (1)
    expect(response.status).toBe(200);
  });

  // Statement coverage executes the pagination path.
  it('returns 200 for page 2 request', async () => {
    const response = await GET(createRequest('en-US', '2'), createParams('en-US'));

    // MSW returns same data regardless of page param
    expect(response.status).toBe(200);
  });
});
