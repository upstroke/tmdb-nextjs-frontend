/**
 * Creates a custom error object for TMDB API failures.
 *
 * @param {string} message - Error message.
 * @param {number} [status] - HTTP status code.
 * @returns {Error} Error object with name and status properties.
 */
export function createTMDBError(message, status) {
  const error = new Error(message);
  error.name = 'TMDBError';
  /** @type {number|undefined} */
  error.status = status;
  return error;
}

/**
 * Creates an error for network, timeout, or malformed-response failures where
 * TMDB did not return a usable HTTP response.
 *
 * @param {string} message - Error message.
 * @param {{cause?: unknown}} [options] - Optional underlying error.
 * @returns {Error} Error object with the TMDBNetworkError name.
 */
export function createTMDBNetworkError(message, options = {}) {
  const error = new Error(message);
  error.name = 'TMDBNetworkError';
  if (options.cause !== undefined) {
    error.cause = options.cause;
  }
  return error;
}
