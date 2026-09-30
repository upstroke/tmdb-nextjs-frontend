import ratings from '@/lib/i18n/ratings.json';

/**
 * Default ratings mock for en-US / US region.
 * Matches the shape expected by rating-related helpers and components.
 * Values are imported directly from lib/i18n/ratings.json — no duplication.
 */
export const ratingsMockDefault = {
  locale: 'en-US',
  region: 'US',
  fallbacks: ratings.locales['en-US'].fallbacks,
  ratingSystem: ratings.ratingSystems['US'],
};

/**
 * Ratings mock for de-DE / DE region (FSK).
 */
export const ratingsMockDE = {
  locale: 'de-DE',
  region: 'DE',
  fallbacks: ratings.locales['de-DE'].fallbacks,
  ratingSystem: ratings.ratingSystems['DE'],
};

/**
 * Ratings mock for es-ES / ES region (ICAA).
 */
export const ratingsMockES = {
  locale: 'es-ES',
  region: 'ES',
  fallbacks: ratings.locales['es-ES'].fallbacks,
  ratingSystem: ratings.ratingSystems['ES'],
};

/**
 * Ratings mock for fr-FR / FR region (CNC).
 */
export const ratingsMockFR = {
  locale: 'fr-FR',
  region: 'FR',
  fallbacks: ratings.locales['fr-FR'].fallbacks,
  ratingSystem: ratings.ratingSystems['FR'],
};

/**
 * Ratings mock for ru-RU / RU region (RARS).
 */
export const ratingsMockRU = {
  locale: 'ru-RU',
  region: 'RU',
  fallbacks: ratings.locales['ru-RU'].fallbacks,
  ratingSystem: ratings.ratingSystems['RU'],
};

/**
 * Ratings mock for vi-VN / VN region (Vietnam Cinema Department).
 */
export const ratingsMockVN = {
  locale: 'vi-VN',
  region: 'VN',
  fallbacks: ratings.locales['vi-VN'].fallbacks,
  ratingSystem: ratings.ratingSystems['VN'],
};

/**
 * Full ratingSystems map — for tests that need to look up by region code.
 */
export const ratingSystemsMock = ratings.ratingSystems;
