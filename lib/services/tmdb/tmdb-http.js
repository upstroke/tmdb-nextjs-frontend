import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { createTMDBError, createTMDBNetworkError } from '@/lib/utils/errors';

const BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 10000;
const RETRY_DELAYS_MS = [100, 200];
const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);

/**
 * Waits for the configured delay before a retry.
 *
 * @param {number} milliseconds - Delay duration.
 * @returns {Promise<void>} Resolves after the delay.
 */
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Creates a configured HTTP client for the TMDB API.
 *
 * The client owns URL construction, authentication, localization, timeouts,
 * retries and error normalization. It does not know about TMDB domain
 * operations, caching, genre maps or response mapping.
 *
 * @param {Function} fetchFn - Fetch function for HTTP requests.
 * @param {string} apiKey - TMDB API key.
 * @param {string} [language=DEFAULT_LOCALE] - Language code for API responses.
 * @returns {{request: (path: string, params?: object) => Promise<object>}} HTTP client.
 */
export function createTmdbHttpClient(fetchFn, apiKey, language = DEFAULT_LOCALE) {
  /**
   * Executes a standardized request to the TMDB API.
   *
   * Transient network, timeout, and 5xx failures are retried up to two times
   * with exponential backoff. Client errors are never retried.
   *
   * @param {string} path - API path relative to the base URL.
   * @param {object} [params={}] - Additional query parameters.
   * @returns {Promise<object>} JSON response from the API.
   * @throws {TMDBError} If TMDB returns a non-retryable HTTP error.
   * @throws {TMDBNetworkError} If the request times out or TMDB is unreachable.
   */
  async function request(path, params = {}) {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('language', language);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const maxAttempts = RETRY_DELAYS_MS.length + 1;
    let lastError = null;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let shouldRetry = false;

      try {
        const response = await fetchFn(url.toString(), {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });

        if (!response.ok) {
          const error = createTMDBError(
            `TMDB request failed: ${response.status} ${response.statusText}`,
            response.status
          );

          if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxAttempts - 1) {
            lastError = error;
            shouldRetry = true;
          } else {
            throw error;
          }
        } else {
          try {
            return await response.json();
          } catch (error) {
            throw createTMDBNetworkError('TMDB returned an invalid JSON response.', {
              cause: error
            });
          }
        }
      } catch (error) {
        if (error.name === 'TMDBError') {
          throw error;
        }

        const networkError =
          error.name === 'TMDBNetworkError'
            ? error
            : createTMDBNetworkError(`TMDB request could not be completed: ${error.message}`, {
                cause: error
              });

        if (attempt === maxAttempts - 1) {
          throw networkError;
        }

        lastError = networkError;
        shouldRetry = true;
      }

      if (!shouldRetry) {
        throw lastError;
      }

      await delay(RETRY_DELAYS_MS[attempt]);
    }

    throw lastError ?? createTMDBNetworkError('TMDB request could not be completed.');
  }

  return {
    request
  };
}
