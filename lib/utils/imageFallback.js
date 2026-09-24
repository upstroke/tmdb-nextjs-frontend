const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Get poster URL with fallback.
 * @param {string|null} path
 * @param {'w92'|'w154'|'w185'|'w342'|'w500'|'w780'|'original'} [size='w342']
 * @returns {string}
 */
export function getPosterUrl(path, size = 'w342') {
  if (!path) return '/fallback-poster.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Get backdrop URL with fallback.
 * @param {string|null} path
 * @param {'w300'|'w780'|'w1280'|'original'} [size='w1280']
 * @returns {string}
 */
export function getBackdropUrl(path, size = 'w1280') {
  if (!path) return '/fallback-backdrop.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Get profile image URL with fallback.
 * @param {string|null} path
 * @param {'w45'|'w185'|'h632'|'original'} [size='w185']
 * @returns {string}
 */
export function getProfileUrl(path, size = 'w185') {
  if (!path) return '/fallback-profile.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
