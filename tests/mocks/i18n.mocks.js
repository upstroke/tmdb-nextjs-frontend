/**
 * Default i18n mock for en-US.
 * Matches the shape returned by getLocaleText() / useI18n().
 *
 * @type {import('@/lib/i18n/resolver.js').LocaleText}
 */
export const i18nMockDefault = {
  locale: 'en-US',
  labels: {
    firstAirDate: 'First air date',
    rating: 'Rating',
    genre: 'Genre',
    genres: 'Genres',
    releaseDate: 'Release date',
    overview: 'Overview',
    cast: 'Cast',
    crew: 'Crew',
    movie: 'Movie',
    tvShow: 'TV',
    searchInput: 'Search movies & TV',
    languageSelect: 'Select language',
  },
  messages: {
    loading: 'Loading\u2026',
    noResults: 'No results found.',
    errorGeneric: 'Something went wrong.',
  },
  titles: {},
  buttons: {},
  formats: {},
  fallbacks: {
    notAvailable: 'N/A',
    dateFallback: '- -',
  },
};
