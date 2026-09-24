const FALLBACK_TEXT = '—';

/**
 * Returns text or a fallback if not available.
 * @param {string|null|undefined} text
 * @param {string} [fallback]
 * @returns {string}
 */
export function withFallback(text, fallback = FALLBACK_TEXT) {
  return text || fallback;
}

/**
 * Returns overview or a fallback.
 * @param {string|null|undefined} overview
 * @returns {string}
 */
export function getOverview(overview) {
  return overview || 'No overview available.';
}
