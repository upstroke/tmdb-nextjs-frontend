/**
 * Custom error class for TMDB API failures.
 *
 * @extends {Error}
 */
export class TMDBError extends Error {
  /**
   * @param {string} message - Error message.
   * @param {number} [status] - HTTP status code.
   */
  constructor(message, status) {
    super(message);
    this.name = 'TMDBError';
    /** @type {number|undefined} */
    this.status = status;
  }
}
