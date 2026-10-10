const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Determines the media type of a TMDB item.
 *
 * Uses the explicit `media_type` field if available. Falls back to inferring the
 * type from the presence of `title` (movie) or `name` (TV show). If neither can
 * be inferred, the provided fallback is returned.
 *
 * @param {object} item - Raw TMDB item.
 * @param {string|null} [fallback=null] - Fallback media type if the type cannot be inferred.
 * @returns {string|null} Media type (`'movie'` or `'tv'`) or `null`.
 */
export function getMediaType(item, fallback = null) {
  return fallback ?? item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : null);
}

/**
 * Returns the display title of a movie or TV show.
 *
 * Movies use the `title` field; TV shows use `name`. Returns an empty string
 * if neither field is present.
 *
 * @param {object} item - Raw TMDB item.
 * @returns {string} Title or empty string.
 */
export function getTitle(item) {
  return item.title ?? item.name ?? '';
}

/**
 * Returns the release or first air date of a movie or TV show.
 *
 * Movies use `release_date`; TV shows use `first_air_date`. Returns an empty
 * string if neither field is present.
 *
 * @param {object} item - Raw TMDB item.
 * @returns {string} ISO date string (e.g. `'2024-07-19'`) or empty string.
 */
export function getDate(item) {
  return item.release_date ?? item.first_air_date ?? '';
}

/**
 * Builds a full TMDB image URL from a path and a size token.
 *
 * Returns an empty string if `path` is falsy, so callers can safely use
 * the result as an `<img src>` without further null checks.
 *
 * @param {string} path - Image path from the TMDB API (e.g. `'/abc123.jpg'`).
 * @param {string} [size='w500'] - TMDB image size token (e.g. `'w185'`, `'w342'`, `'w780'`, `'original'`).
 * @returns {string} Absolute image URL or empty string if `path` is missing.
 */
export function getImageUrl(path, size = 'w500') {
  if (!path) return '';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
