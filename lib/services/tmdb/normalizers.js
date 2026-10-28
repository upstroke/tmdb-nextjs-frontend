/** Fallback image used when TMDB provides no usable image path. */
export const NOT_AVAILABLE_IMAGE = '/not-available.png';

/**
 * Returns a string value or a safe fallback.
 *
 * @param {unknown} value - Value to normalize.
 * @param {string} [fallback=''] - Value used for missing or invalid input.
 * @returns {string} Normalized string.
 */
export function toStringValue(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Returns a finite number or null.
 *
 * @param {unknown} value - Value to normalize.
 * @returns {number|null} Normalized number.
 */
export function toNumberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Returns a finite rating number or zero.
 *
 * @param {unknown} value - Value to normalize.
 * @returns {number} Normalized rating.
 */
export function toRating(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * Returns an array or a safe empty array.
 *
 * @param {unknown} value - Value to normalize.
 * @returns {unknown[]} Normalized array.
 */
export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Normalizes TMDB production companies so optional image fields become null.
 *
 * @param {unknown} value - Raw production company list.
 * @returns {Array<{id: number, name: string, logo_path: string|null}>} Normalized companies.
 */
export function toProductionCompanies(value) {
  return toArray(value).map((company) => ({
    id: company.id,
    name: company.name,
    logo_path: company.logo_path ?? null
  }));
}
