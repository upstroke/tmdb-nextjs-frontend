import ratings from '@/lib/i18n/ratings.json';

const DEFAULT_RATING_SYSTEM = 'US';

/**
 * Normalizes a rating system and uses the default configured system
 * for missing or invalid values.
 *
 * @param {string|number|null|undefined} value - Raw value of the rating system.
 * @returns {string} Normalized rating system code.
 */
function normalizeRatingSystem(value) {
  const normalized = String(value ?? '').trim().toUpperCase();
  return normalized || DEFAULT_RATING_SYSTEM;
}

/**
 * Returns display information for a country-specific age rating.
 *
 * @param {string|number|null|undefined} value - Raw value from TMDB or IMDb.
 * @param {string} [country] - Rating system, e.g. `DE` or `US`.
 * @returns {{ value: string, label: string, color: string, textColor: string, description?: string } | null}
 */
export function getCertificationMeta(value, country = DEFAULT_RATING_SYSTEM) {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) return null;

  const ratingSystem = ratings.ratingSystems?.[normalizeRatingSystem(country)];
  const rating = ratingSystem?.ratings?.[normalizedValue];

  if (!rating) {
    return {
      value: normalizedValue,
      label: normalizedValue,
      color: 'transparent',
      textColor: 'inherit',
    };
  }

  return {
    value: normalizedValue,
    ...rating,
  };
}
