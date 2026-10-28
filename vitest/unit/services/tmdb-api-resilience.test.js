/**
 * Focused tests for TMDB request timeout, retry, and error classification.
 */
import { describe, expect, it, vi } from 'vitest';
import { createTmdbHttpClient } from '@/lib/services/tmdb/tmdb-http';

const FAKE_KEY = 'test-key';

/**
 * Creates a fetch mock that returns the supplied results in order.
 * @param {Array<object>} results - Response or rejection entries.
 * @returns {Function} Ordered fetch mock.
 */
function makeSequentialFetch(results) {
  let index = 0;
  return vi.fn(async () => {
    const result = results[index++];
    if (result.rejects) throw result.rejects;
    return result;
  });
}

/**
 * Creates a successful TMDB-style response.
 * @param {object} body - JSON body.
 * @returns {object} Fetch response mock.
 */
function okResponse(body) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body
  };
}

/**
 * Creates a failed TMDB-style response.
 * @param {number} status - HTTP status.
 * @returns {object} Fetch response mock.
 */
function errorResponse(status) {
  return {
    ok: false,
    status,
    statusText: 'Error',
    json: async () => ({})
  };
}

describe('createTmdbHttpClient — request resilience', () => {
  it('retries transient 503 responses and succeeds on a later attempt', async () => {
    const fetchMock = makeSequentialFetch([
      errorResponse(503),
      errorResponse(503),
      okResponse({ results: [] })
    ]);
    const http = createTmdbHttpClient(fetchMock, FAKE_KEY, 'en-US');

    await expect(http.request('/movie/550')).resolves.toEqual({ results: [] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry a 404 response', async () => {
    const fetchMock = makeSequentialFetch([errorResponse(404)]);
    const http = createTmdbHttpClient(fetchMock, FAKE_KEY, 'en-US');

    await expect(http.request('/movie/999999')).rejects.toMatchObject({
      name: 'TMDBError',
      status: 404
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries network failures and succeeds on a later attempt', async () => {
    const networkError = new Error('Connection failed');
    const fetchMock = makeSequentialFetch([
      { rejects: networkError },
      { rejects: networkError },
      okResponse({ results: [] })
    ]);
    const http = createTmdbHttpClient(fetchMock, FAKE_KEY, 'en-US');

    await expect(http.request('/movie/550')).resolves.toEqual({ results: [] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('wraps repeated timeout failures in TMDBNetworkError', async () => {
    const timeoutError = new DOMException('The operation was aborted.', 'TimeoutError');
    const fetchMock = makeSequentialFetch([
      { rejects: timeoutError },
      { rejects: timeoutError },
      { rejects: timeoutError }
    ]);
    const http = createTmdbHttpClient(fetchMock, FAKE_KEY, 'en-US');

    await expect(http.request('/movie/550')).rejects.toMatchObject({
      name: 'TMDBNetworkError'
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry a successful response', async () => {
    const fetchMock = makeSequentialFetch([okResponse({ results: [] })]);
    const http = createTmdbHttpClient(fetchMock, FAKE_KEY, 'en-US');

    await expect(http.request('/movie/550')).resolves.toEqual({ results: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes a timeout signal to fetch', async () => {
    const fetchMock = makeSequentialFetch([okResponse({ results: [] })]);
    const http = createTmdbHttpClient(fetchMock, FAKE_KEY, 'en-US');

    await http.request('/movie/550');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/movie/550'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});
