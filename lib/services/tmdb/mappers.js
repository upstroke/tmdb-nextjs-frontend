import { getDate, getImageUrl, getMediaType, getTitle } from '@/lib/services/tmdb/helpers';
import {
  CardItemSchema,
  FeaturedItemSchema,
  MediaDetailSchema,
  WatchProviderResultSchema
} from '@/lib/schemas/tmdb';
import {
  NOT_AVAILABLE_IMAGE,
  toNumberOrNull,
  toProductionCompanies,
  toRating,
  toArray,
  toStringValue
} from '@/lib/services/tmdb/normalizers';

/**
 * Converts genre IDs into readable genre objects.
 *
 * @param {number[]} [genreIds=[]] - List of genre IDs.
 * @param {string} mediaType - Media type.
 * @param {{movie: Record<string, string>, tv: Record<string, string>}} genreMaps - Resolved genre maps.
 * @returns {{id: number, name: string}[]} Resolved genres.
 */
export function resolveGenres(genreIds = [], mediaType, genreMaps) {
  const map = mediaType === 'tv' ? genreMaps.tv : genreMaps.movie;

  return genreIds.map((id) => (map?.[id] ? { id, name: map[id] } : null)).filter(Boolean);
}

/**
 * Converts a TMDB entry into a normalized card object.
 *
 * @param {object} item - Raw data of a movie or TV show.
 * @param {{movie: Record<string, string>, tv: Record<string, string>}} genreMaps - Resolved genre maps.
 * @param {string|null} [fallbackMediaType=null] - Alternative media type.
 * @returns {import('@/lib/schemas/tmdb').CardItem|null} Normalized card object or null.
 */
export function mapCardItem(item, genreMaps, fallbackMediaType = null) {
  const mediaType = getMediaType(item, fallbackMediaType);

  if (!item?.id || !['movie', 'tv'].includes(mediaType)) return null;

  const genres = toArray(item.genres).length
    ? toArray(item.genres)
    : resolveGenres(toArray(item.genre_ids), mediaType, genreMaps);
  const posterPath = item.poster_path ?? item.backdrop_path ?? '';

  const raw = {
    id: item.id,
    mediaType,
    title: toStringValue(getTitle(item), 'N/A'),
    date: toStringValue(getDate(item)),
    rating: toRating(item.vote_average),
    genres: genres.length ? genres : [{ id: 'na', name: 'N/A' }],
    imageUrl: getImageUrl(posterPath, 'w500') || NOT_AVAILABLE_IMAGE,
    posterUrl: getImageUrl(posterPath, 'w342') || NOT_AVAILABLE_IMAGE
  };

  const parsed = CardItemSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('[tmdb-api] mapCardItem validation failed:', parsed.error.flatten());
    return null;
  }

  return parsed.data;
}

/**
 * Converts a watch provider into a normalized UI object.
 *
 * @param {object} provider - TMDB provider data.
 * @param {'flatrate'|'rent'|'buy'} type - Provider type.
 * @param {string|null} baseLink - Link to the provider list.
 * @returns {import('@/lib/schemas/tmdb').WatchProvider|null} Normalized provider or null.
 */
export function mapWatchProvider(provider, type, baseLink) {
  if (!provider?.provider_id || !provider?.provider_name) return null;

  return {
    providerId: provider.provider_id,
    providerName: provider.provider_name,
    type,
    link: baseLink ?? null,
    logoPath: provider.logo_path ?? null,
    displayPriority: provider.display_priority ?? null
  };
}

/**
 * Converts a list of watch providers into normalized UI objects.
 *
 * @param {object[]} [providers=[]] - Provider list from TMDB.
 * @param {'flatrate'|'rent'|'buy'} type - Provider type.
 * @param {string|null} baseLink - Link to the provider list.
 * @returns {import('@/lib/schemas/tmdb').WatchProvider[]} Normalized providers.
 */
export function mapWatchProviderList(providers = [], type, baseLink) {
  return providers.map((provider) => mapWatchProvider(provider, type, baseLink)).filter(Boolean);
}

/**
 * Retrieves all available trailer URLs from video data.
 *
 * @param {object} details - TMDB detail data.
 * @returns {string[]} List of YouTube URLs.
 */
export function getTrailerUrls(details) {
  const videos = toArray(details.videos?.results);

  return videos
    .filter((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.key)
    .map((video) => `https://www.youtube.com/watch?v=${video.key}`);
}

/**
 * Converts a cast list into normalized UI objects.
 *
 * @param {object[]} [cast=[]] - Cast list from TMDB.
 * @returns {import('@/lib/schemas/tmdb').Cast[]} Normalized cast.
 */
export function mapCast(cast = []) {
  return toArray(cast)
    .slice(0, 20)
    .map((person) => ({
      id: person.id,
      creditId: person.credit_id,
      name: person.name,
      character: toStringValue(person.character),
      order: toNumberOrNull(person.order),
      profilePath: toStringValue(person.profile_path),
      imageUrl: getImageUrl(person.profile_path ?? '', 'w185') || NOT_AVAILABLE_IMAGE
    }));
}

/**
 * Converts a crew list into normalized UI objects.
 *
 * @param {object[]} [crew=[]] - Crew list from TMDB.
 * @returns {import('@/lib/schemas/tmdb').Crew[]} Normalized crew.
 */
export function mapCrew(crew = []) {
  return toArray(crew)
    .slice(0, 20)
    .map((person) => ({
      id: person.id,
      creditId: person.credit_id,
      name: person.name,
      character: toStringValue(person.character),
      order: toNumberOrNull(person.order),
      profilePath: toStringValue(person.profile_path),
      imageUrl: getImageUrl(person.profile_path ?? '', 'w185') || NOT_AVAILABLE_IMAGE,
      job: toStringValue(person.job),
      department: toStringValue(person.department)
    }));
}

/**
 * Converts complete detail data into a normalized UI object.
 *
 * @param {object} details - TMDB detail data.
 * @param {string} fallbackMediaType - Optional media type.
 * @returns {import('@/lib/schemas/tmdb').MediaDetail|null} Normalized detail object or null.
 */
export function mapDetails(details, fallbackMediaType) {
  const mediaType = getMediaType(details, fallbackMediaType);

  const raw = {
    id: details.id,
    mediaType,
    title: toStringValue(getTitle(details)),
    releaseDate: toStringValue(getDate(details)),
    overview: toStringValue(details.overview),
    homepage: toStringValue(details.homepage),
    trailerUrls: toArray(getTrailerUrls(details)).filter((url) => typeof url === 'string'),
    genres: toArray(details.genres),
    rating: toRating(details.vote_average),
    runtime: toNumberOrNull(details.runtime),
    episodeRunTime: toArray(details.episode_run_time).filter(
      (value) => typeof value === 'number' && Number.isFinite(value)
    ),
    productionCompanies: toProductionCompanies(details.production_companies),
    imageUrl:
      getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w1280') ||
      NOT_AVAILABLE_IMAGE,
    posterUrl: getImageUrl(details.poster_path ?? '', 'w342') || NOT_AVAILABLE_IMAGE,
    cast: mapCast(toArray(details.credits?.cast)),
    crew: mapCrew(toArray(details.credits?.crew)),
    certification: toStringValue(details.certification),
    providers: details.providers ?? null
  };

  const parsed = MediaDetailSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('[tmdb-api] mapDetails validation failed:', parsed.error.flatten());
    return null;
  }

  return parsed.data;
}

/**
 * Converts a featured detail object into the UI format.
 *
 * @param {object} details - TMDB detail data.
 * @param {string|null} [fallbackMediaType=null] - Alternative media type.
 * @returns {import('@/lib/schemas/tmdb').FeaturedItem} Normalized featured object.
 */
export function mapFeaturedItem(details, fallbackMediaType = null) {
  const mediaType = getMediaType(details, fallbackMediaType);

  return {
    id: details.id,
    mediaType,
    title: getTitle(details),
    releaseDate: getDate(details),
    overview: details.overview ?? '',
    homepage: details.homepage ?? '',
    genres: details.genres ?? [],
    imageUrl: getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w780'),
    posterUrl: getImageUrl(details.poster_path ?? '', 'w342')
  };
}

/**
 * Validates and normalizes a featured item.
 *
 * @param {object} raw - Raw featured item.
 * @returns {import('@/lib/schemas/tmdb').FeaturedItem|null} Validated featured item or null.
 */
export function parseFeaturedItem(raw) {
  const parsed = FeaturedItemSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('[tmdb-api] getFeaturedToday validation failed:', parsed.error.flatten());
    return null;
  }

  return parsed.data;
}

/**
 * Validates and normalizes a watch-provider result.
 *
 * @param {object} raw - Raw watch-provider result.
 * @returns {import('@/lib/schemas/tmdb').WatchProviderResult|null} Validated result or null.
 */
export function parseWatchProviderResult(raw) {
  const parsed = WatchProviderResultSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('[tmdb-api] getWatchProviders validation failed:', parsed.error.flatten());
    return null;
  }

  return parsed.data;
}
