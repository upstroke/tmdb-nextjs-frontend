/**
 * Custom error class for TMDB API errors.
 */
export class TMDBError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode) {
    super(message);
    this.name = 'TMDBError';
    this.statusCode = statusCode;
  }
}
