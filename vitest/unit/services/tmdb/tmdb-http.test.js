import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTmdbHttpClient } from '@/lib/services/tmdb/tmdb-http';

const API_KEY = 'test-api-key';

function createJsonResponse(body, { ok = true, status = 200, statusText = 'OK' } = {}) {
  return {
    ok,
    status,
    statusText: ok ? statusText : statusText,
    json: vi.fn(() => Promise.resolve(body))
  };
}

function createFailingJsonResponse() {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: vi.fn(() => Promise.reject(new SyntaxError('Unexpected token')))
  };
}

function createNetworkErrorResponse() {
  return new TypeError('Failed to fetch');
}

async function runWithRetries(assertion) {
  vi.useFakeTimers();

  try {
    const promise = assertion();
    await vi.runAllTimersAsync();
    return await promise;
  } finally {
    vi.useRealTimers();
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createTmdbHttpClient', () => {
  describe('request URL and query parameters', () => {
    it('adds the API key, language and custom query parameters', async () => {
      const fetchFn = vi.fn(() => Promise.resolve(createJsonResponse({ results: [] })));
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'de-DE');

      await client.request('/search/movie', {
        query: 'Fight Club',
        page: 2,
        include_adult: false
      });

      expect(fetchFn).toHaveBeenCalledTimes(1);

      const [url, options] = fetchFn.mock.calls[0];
      const parsedUrl = new URL(url);

      expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://api.themoviedb.org/3/search/movie');
      expect(parsedUrl.searchParams.get('api_key')).toBe(API_KEY);
      expect(parsedUrl.searchParams.get('language')).toBe('de-DE');
      expect(parsedUrl.searchParams.get('query')).toBe('Fight Club');
      expect(parsedUrl.searchParams.get('page')).toBe('2');
      expect(parsedUrl.searchParams.get('include_adult')).toBe('false');
      expect(options.signal).toBeInstanceOf(AbortSignal);
    });

    it('skips undefined, null and empty query parameters', async () => {
      const fetchFn = vi.fn(() => Promise.resolve(createJsonResponse({ results: [] })));
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await client.request('/search/movie', {
        query: undefined,
        page: null,
        include_adult: ''
      });

      const parsedUrl = new URL(fetchFn.mock.calls[0][0]);

      expect(parsedUrl.searchParams.has('query')).toBe(false);
      expect(parsedUrl.searchParams.has('page')).toBe(false);
      expect(parsedUrl.searchParams.has('include_adult')).toBe(false);
    });

    it('uses the default language when none is provided', async () => {
      const fetchFn = vi.fn(() => Promise.resolve(createJsonResponse({ results: [] })));
      const client = createTmdbHttpClient(fetchFn, API_KEY);

      await client.request('/movie/popular');

      const parsedUrl = new URL(fetchFn.mock.calls[0][0]);

      expect(parsedUrl.searchParams.get('language')).toBe('en-US');
    });
  });

  describe('successful responses', () => {
    it('returns the parsed JSON body', async () => {
      const body = { page: 1, results: [{ id: 550 }] };
      const fetchFn = vi.fn(() => Promise.resolve(createJsonResponse(body)));
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await expect(client.request('/movie/popular')).resolves.toEqual(body);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('non-retryable HTTP errors', () => {
    it.each([400, 401, 403, 404])('throws TMDBError immediately for status %i', async (status) => {
      const fetchFn = vi.fn(() =>
        Promise.resolve(
          createJsonResponse(
            { status_message: 'Error' },
            { ok: false, status, statusText: 'Error' }
          )
        )
      );
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await expect(client.request('/movie/1')).rejects.toMatchObject({
        name: 'TMDBError',
        status
      });
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryable HTTP errors', () => {
    it('retries a 500 response twice and then throws TMDBError', async () => {
      const fetchFn = vi.fn(() =>
        Promise.resolve(
          createJsonResponse(
            { status_message: 'Internal Server Error' },
            { ok: false, status: 500, statusText: 'Internal Server Error' }
          )
        )
      );
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await runWithRetries(() =>
        expect(client.request('/movie/popular')).rejects.toMatchObject({
          name: 'TMDBError',
          status: 500
        })
      );

      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it.each([502, 503, 504])('retries a %i response before failing', async (status) => {
      const fetchFn = vi.fn(() =>
        Promise.resolve(
          createJsonResponse(
            { status_message: 'Server Error' },
            { ok: false, status, statusText: 'Server Error' }
          )
        )
      );
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await runWithRetries(() =>
        expect(client.request('/movie/popular')).rejects.toMatchObject({
          name: 'TMDBError',
          status
        })
      );

      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('recovers when a retryable response is followed by a successful response', async () => {
      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce(
          createJsonResponse({}, { ok: false, status: 502, statusText: 'Bad Gateway' })
        )
        .mockResolvedValueOnce(createJsonResponse({ results: [] }));
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await runWithRetries(() =>
        expect(client.request('/movie/popular')).resolves.toEqual({ results: [] })
      );

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('network and JSON errors', () => {
    it('retries network failures and then throws TMDBNetworkError', async () => {
      const fetchFn = vi.fn(() => Promise.reject(createNetworkErrorResponse()));
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await runWithRetries(() =>
        expect(client.request('/movie/popular')).rejects.toMatchObject({
          name: 'TMDBNetworkError'
        })
      );

      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('retries invalid JSON responses and then throws TMDBNetworkError', async () => {
      const fetchFn = vi.fn(() => Promise.resolve(createFailingJsonResponse()));
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await runWithRetries(() =>
        expect(client.request('/movie/popular')).rejects.toMatchObject({
          name: 'TMDBNetworkError'
        })
      );

      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('recovers when a network failure is followed by a successful response', async () => {
      const fetchFn = vi
        .fn()
        .mockRejectedValueOnce(createNetworkErrorResponse())
        .mockResolvedValueOnce(createJsonResponse({ results: [] }));
      const client = createTmdbHttpClient(fetchFn, API_KEY, 'en-US');

      await runWithRetries(() =>
        expect(client.request('/movie/popular')).resolves.toEqual({ results: [] })
      );

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });
});
