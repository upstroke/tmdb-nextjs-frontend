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
