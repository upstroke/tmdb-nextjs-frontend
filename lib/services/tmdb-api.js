import { getDate, getImageUrl, getMediaType, getTitle } from '@/lib/services/tmdb/helpers';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { createTMDBError, createTMDBNetworkError } from '@/lib/utils/errors';
import {
  CardItemSchema,
  MediaDetailSchema,
  FeaturedItemSchema,
  ListResponseSchema,
  WatchProviderResultSchema,
  SeasonSchema
} from '@/lib/schemas/tmdb';

/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */
/** @typedef {import('@/lib/schemas/tmdb').Cast} Cast */
/** @typedef {import('@/lib/schemas/tmdb').Crew} Crew */
/** @typedef {import('@/lib/schemas/tmdb').WatchProvider} WatchProvider */
/** @typedef {import('@/lib/schemas/tmdb').WatchProviderResult} WatchProviderResult */
/** @typedef {import('@/lib/schemas/tmdb').Episode} Episode */
/** @typedef {import('@/lib/schemas/tmdb').Season} Season */
/** @typedef {import('@/lib/schemas/tmdb').MediaDetail} MediaDetail */
/** @typedef {import('@/lib/schemas/tmdb').FeaturedItem} FeaturedItem */
/** @typedef {import('@/lib/schemas/tmdb').ListResponse} ListResponse */

// Images in /public are referenced by path string directly.
const NOT_AVAILABLE_IMAGE = '/not-available.png';

const BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 10000;
const RETRY_DELAYS_MS = [100, 200];
const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);

/**
 * Returns a string value or a safe fallback.
 *
 * @param {unknown} value - Value to normalize.
 * @param {string} [fallback=''] - Value used for missing or invalid input.
 * @returns {string} Normalized string.
 */
function toStringValue(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Returns a finite number or null.
 *
 * @param {unknown} value - Value to normalize.
 * @returns {number|null} Normalized number or null.
 */
function toNumberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Returns a finite rating number or zero.
 *
 * @param {unknown} value - Value to normalize.
 * @returns {number} Normalized rating.
 */
function toRating(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * Returns an array or a safe empty array.
 *
 * @param {unknown} value - Value to normalize.
 * @returns {unknown[]} Normalized array.
 */
function toArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Normalizes TMDB production companies so optional image fields become null.
 *
 * @param {unknown} value - Raw production company list.
 * @returns {Array<{id: number, name: string, logo_path: string|null}>} Normalized companies.
 */
function toProductionCompanies(value) {
  return toArray(value).map((company) => ({
    id: company.id,
    name: company.name,
    logo_path: company.logo_path ?? null
  }));
}

/**
 * Waits for the configured delay before a retry.
 *
 * @param {number} milliseconds - Delay duration.
 * @returns {Promise<void>} Resolves after the delay.
 */
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Creates a TMDB API instance as a plain object.
 *
 * The factory encapsulates request-specific dependencies and maintains internal
 * state via closures instead of a class.
 *
 * @param {Function} fetchFn - Fetch function for HTTP requests.
 * @param {string} apiKey - TMDB API key.
 * @param {string} [language=DEFAULT_LOCALE] - Language code for API responses.
 * @returns {object} TMDB API with methods for requests, mapping, and caches.
 */
export function createTmdbApi(fetchFn, apiKey, language = DEFAULT_LOCALE) {
  const region = language.split('-')[1] ?? language.split('_')[1] ?? 'DE';
  let movieGenreMap = null;
  let tvGenreMap = null;

  // Request-scoped caches: each createTmdbApi() instance serves one request or
  // render. They prevent duplicate TMDB calls for the same media item within
  // that request, but do not retain data across requests or server processes.
  const certificationCache = new Map();
  const watchProvidersCache = new Map();

  /**
   * Executes a standardized request to the TMDB API.
   *
   * Transient network, timeout, and 5xx failures are retried up to two times
   * with exponential backoff. Client errors are never retried.
   *
   * @param {string} path - API path relative to the base URL.
   * @param {object} [params={}] - Additional query parameters.
   * @returns {Promise<object>} JSON response from the API.
   * @throws {TMDBError} If TMDB returns a non-retryable HTTP error.
   * @throws {TMDBNetworkError} If the request times out or TMDB is unreachable.
   */
  async function request(path, params = {}) {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('language', language);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const maxAttempts = RETRY_DELAYS_MS.length + 1;
    let lastError = null;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let shouldRetry = false;

      try {
        const response = await fetchFn(url.toString(), {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });

        if (!response.ok) {
          const error = createTMDBError(
            `TMDB request failed: ${response.status} ${response.statusText}`,
            response.status
          );

          if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxAttempts - 1) {
            lastError = error;
            shouldRetry = true;
          } else {
            throw error;
          }
        } else {
          try {
            return await response.json();
          } catch (error) {
            throw createTMDBNetworkError('TMDB returned an invalid JSON response.', {
              cause: error
            });
          }
        }
      } catch (error) {
        if (error.name === 'TMDBError') {
          throw error;
        }

        const networkError =
          error.name === 'TMDBNetworkError'
            ? error
            : createTMDBNetworkError(`TMDB request could not be completed: ${error.message}`, {
                cause: error
              });

        if (attempt === maxAttempts - 1) {
          throw networkError;
        }

        lastError = networkError;
        shouldRetry = true;
      }

      if (!shouldRetry) {
        throw lastError;
      }

      await delay(RETRY_DELAYS_MS[attempt]);
    }

    throw lastError ?? createTMDBNetworkError('TMDB request could not be completed.');
  }

  /**
   * Loads the genre maps for movies and TV shows.
   *
   * The data is kept in memory and loaded only once per instance.
   *
   * @returns {Promise<void>}
   */
  async function loadGenreMaps() {
    if (movieGenreMap && tvGenreMap) return;

    const [movieData, tvData] = await Promise.all([
      request('/genre/movie/list'),
      request('/genre/tv/list')
    ]);

    movieGenreMap = Object.fromEntries(
      toArray(movieData.genres)
        .filter((genre) => genre && genre.id != null && typeof genre.name === 'string')
        .map((genre) => [genre.id, genre.name])
    );
    tvGenreMap = Object.fromEntries(
      toArray(tvData.genres)
        .filter((genre) => genre && genre.id != null && typeof genre.name === 'string')
        .map((genre) => [genre.id, genre.name])
    );
  }

  /**
   * Converts genre IDs into readable genre objects.
   *
   * @param {number[]} [genreIds=[]] - List of genre IDs.
   * @param {string} mediaType - Media type.
   * @returns {{id: number, name: string}[]} Resolved genres.
   */
  function resolveGenres(genreIds = [], mediaType) {
    const map = mediaType === 'tv' ? tvGenreMap : movieGenreMap;
    return genreIds.map((id) => (map?.[id] ? { id, name: map[id] } : null)).filter(Boolean);
  }

  /**
   * Converts a TMDB entry into a normalized card object.
   *
   * @param {object} item - Raw data of a movie or TV show.
   * @param {string|null} [fallbackMediaType=null] - Alternative media type.
   * @returns {CardItem|null} Normalized card object or null.
   */
  function mapCardItem(item, fallbackMediaType = null) {
    const mediaType = getMediaType(item, fallbackMediaType);
    if (!item?.id || !['movie', 'tv'].includes(mediaType)) return null;

    const genres = toArray(item.genres).length
      ? toArray(item.genres)
      : resolveGenres(toArray(item.genre_ids), mediaType);
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
   * @returns {WatchProvider|null} Normalized provider or null.
   */
  function mapWatchProvider(provider, type, baseLink) {
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
   * @returns {WatchProvider[]} Normalized provider list.
   */
  function mapWatchProviderList(providers = [], type, baseLink) {
    return providers.map((provider) => mapWatchProvider(provider, type, baseLink)).filter(Boolean);
  }

  /**
   * Retrieves local streaming providers for a media item.
   *
   * @param {'movie'|'tv'} mediaType
   * @param {number|string} id - TMDB ID.
   * @returns {Promise<WatchProviderResult|null>} Watch provider data or null.
   */
  async function getWatchProviders(mediaType, id) {
    const cacheKey = `${mediaType}-${id}`;
    if (watchProvidersCache.has(cacheKey)) return watchProvidersCache.get(cacheKey);

    let providers = null;

    try {
      const data = await request(`/${mediaType}/${id}/watch/providers`);
      const regionData = data.results?.[region];

      if (regionData) {
        const mappedProviders = [
          ...mapWatchProviderList(toArray(regionData.flatrate), 'flatrate', regionData.link),
          ...mapWatchProviderList(toArray(regionData.rent), 'rent', regionData.link),
          ...mapWatchProviderList(toArray(regionData.buy), 'buy', regionData.link)
        ];

        if (mappedProviders.length) {
          const raw = { link: toStringValue(regionData.link), providers: mappedProviders };
          const parsed = WatchProviderResultSchema.safeParse(raw);
          if (parsed.success) {
            providers = parsed.data;
          } else {
            console.warn('[tmdb-api] getWatchProviders validation failed:', parsed.error.flatten());
          }
        }
      }
    } catch (error) {
      console.warn(`Watch providers could not be loaded (${mediaType}/${id}):`, error);
    }

    watchProvidersCache.set(cacheKey, providers);
    return providers;
  }

  /**
   * Retrieves the local age rating for a media item.
   *
   * @param {'movie'|'tv'} mediaType
   * @param {number|string} id - TMDB ID.
   * @returns {Promise<string>} Age rating or empty string.
   */
  async function getCertification(mediaType, id) {
    const cacheKey = `${mediaType}-${id}`;
    if (certificationCache.has(cacheKey)) return certificationCache.get(cacheKey);

    let certification = '';

    try {
      if (mediaType === 'movie') {
        const data = await request(`/movie/${id}/release_dates`);
        const country = toArray(data.results).find((entry) => entry.iso_3166_1 === region);
        certification = toStringValue(
          country?.release_dates?.find((release) => release.certification)?.certification
        );
      } else if (mediaType === 'tv') {
        const data = await request(`/tv/${id}/content_ratings`);
        certification = toStringValue(
          toArray(data.results).find((entry) => entry.iso_3166_1 === region)?.rating
        );
      }
    } catch (error) {
      console.warn(`Certification could not be loaded (${mediaType}/${id}):`, error);
    }

    certificationCache.set(cacheKey, certification);
    return certification;
  }

  /**
   * Enriches page cards with local age ratings.
   *
   * @param {CardItem[]} cards - Normalized cards.
   * @returns {Promise<CardItem[]>} Cards with `certification`.
   */
  async function enrichCardCertifications(cards = []) {
    return Promise.all(
      cards.map(async (card) => ({
        ...card,
        certification: await getCertification(card.mediaType, card.id)
      }))
    );
  }

  /**
   * Converts a featured detail object into the UI format.
   *
   * @param {object} details - TMDB detail data.
   * @param {string|null} [fallbackMediaType=null] - Alternative media type.
   * @returns {FeaturedItem} Normalized featured object.
   */
  function mapFeaturedItem(details, fallbackMediaType = null) {
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
   * Retrieves all available trailer URLs from video data.
   *
   * @param {object} details - TMDB detail data.
   * @returns {string[]} List of YouTube URLs.
   */
  function getTrailerUrls(details) {
    const videos = toArray(details.videos?.results);
    return videos
      .filter((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.key)
      .map((video) => `https://www.youtube.com/watch?v=${video.key}`);
  }

  /**
   * Converts a cast list into normalized UI objects.
   *
   * @param {object[]} [cast=[]] - Cast list from TMDB.
   * @returns {Cast[]} Normalized cast list.
   */
  function mapCast(cast = []) {
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
   * @returns {Crew[]} Normalized crew list.
   */
  function mapCrew(crew = []) {
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
   * Missing or invalid optional fields are normalized so the UI can continue
   * using its existing N/A and placeholder fallbacks. Returns null only when
   * the resulting object does not satisfy the required media detail contract.
   *
   * @param {object} details - TMDB detail data.
   * @param {string} fallbackMediaType - Optional media type.
   * @returns {MediaDetail|null} Normalized detail object or null.
   */
  function mapDetails(details, fallbackMediaType) {
    const mediaType = getMediaType(details, fallbackMediaType);

    const raw = {
      id: details.id,
      mediaType,
      title: toStringValue(getTitle(details)),
      releaseDate: toStringValue(getDate(details)),
      overview: toStringValue(details.overview),
      homepage: toStringValue(details.homepage),
      trailerUrls: toArray(getTrailerUrls(details)).filter(
        (url) => typeof url === 'string'
      ),
      genres: toArray(details.genres),
      rating: toRating(details.vote_average),
      runtime: toNumberOrNull(details.runtime),
      episodeRunTime: toArray(details.episode_run_time).filter(
        (value) => typeof value === 'number' && Number.isFinite(value)
      ),
      productionCompanies: toProductionCompanies(details.production_companies),
      imageUrl: getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w1280') || NOT_AVAILABLE_IMAGE,
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
   * Fetches a list of movies or TV shows.
   *
   * @param {string} endpoint - TMDB endpoint.
   * @param {number} page - Page number.
   * @param {string|null} [fallbackMediaType=null] - Optional media type.
   * @returns {Promise<ListResponse|null>} Normalized list response or null.
   */
  async function getList(endpoint, page, fallbackMediaType = null) {
    const data = await request(endpoint, { page });
    const items = toArray(data.results);
    await loadGenreMaps();
    const results = items.map((item) => mapCardItem(item, fallbackMediaType)).filter(Boolean);
    const enrichedResults = await enrichCardCertifications(results);

    const raw = {
      page: toNumberOrNull(data.page) ?? page,
      results: enrichedResults,
      hasMore:
        (toNumberOrNull(data.page) ?? page) < (toNumberOrNull(data.total_pages) ?? toNumberOrNull(data.page) ?? page)
    };

    const parsed = ListResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] getList validation failed:', parsed.error.flatten());
      return null;
    }
    return parsed.data;
  }

  /**
   * Returns trending movies and TV shows of the day.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>}
   */
  async function getTrendingAll(page = 1) {
    return getList('/trending/all/day', page);
  }

  /**
   * Returns trending movies of the day.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>}
   */
  async function getTrendingMovies(page = 1) {
    return getList('/trending/movie/day', page, 'movie');
  }

  /**
   * Returns trending TV shows of the day.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>}
   */
  async function getTrendingTVShows(page = 1) {
    return getList('/trending/tv/day', page, 'tv');
  }

  /**
   * Returns the most popular movies.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>}
   */
  async function getPopularMovies(page = 1) {
    return getList('/movie/popular', page, 'movie');
  }

  /**
   * Returns the most popular TV shows.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>}
   */
  async function getPopularTVShows(page = 1) {
    return getList('/tv/popular', page, 'tv');
  }

  /**
   * Returns the top-rated movies.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>}
   */
  async function getTopRatedMovies(page = 1) {
    return getList('/movie/top_rated', page, 'movie');
  }

  /**
   * Returns the top-rated TV shows.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>}
   */
  async function getTopRatedTVShows(page = 1) {
    return getList('/tv/top_rated', page, 'tv');
  }

  /**
   * Returns the featured item of the day.
   *
   * @returns {Promise<FeaturedItem|null>}
   */
  async function getFeaturedToday() {
    const data = await request('/trending/all/day');
    const items = toArray(data.results);
    const featured =
      items.find((item) => item.media_type === 'movie' && item.backdrop_path) ??
      items.find((item) => item.media_type === 'tv' && item.backdrop_path) ??
      items[0] ??
      null;

    if (!featured) return null;

    const mediaType = getMediaType(featured, featured.media_type);
    const details = await request(`/${mediaType}/${featured.id}`, {
      append_to_response: 'videos,credits'
    });
    const mapFn = mediaType === 'movie' ? mapDetails : mapFeaturedItem;
    const mapped = mapFn({ ...featured, ...details }, mediaType);
    if (!mapped) return null;

    const certification = await getCertification(mediaType, featured.id);
    const providers = await getWatchProviders(mediaType, featured.id);

    const raw = {
      id: mapped.id,
      mediaType: mapped.mediaType,
      title: toStringValue(mapped.title),
      releaseDate: toStringValue(mapped.releaseDate),
      overview: toStringValue(mapped.overview),
      homepage: toStringValue(mapped.homepage),
      genres: toArray(mapped.genres),
      imageUrl: mapped.imageUrl || NOT_AVAILABLE_IMAGE,
      posterUrl: mapped.posterUrl || NOT_AVAILABLE_IMAGE,
      productionCompanies: toProductionCompanies(
        mapped.productionCompanies ?? details.production_companies
      ),
      certification: toStringValue(certification),
      providers,
      trailerUrls: toArray(mapped.trailerUrls ?? getTrailerUrls({ ...featured, ...details })).filter(
        (url) => typeof url === 'string'
      )
    };

    const parsed = FeaturedItemSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] getFeaturedToday validation failed:', parsed.error.flatten());
      return null;
    }
    return parsed.data;
  }

  /**
   * Returns the detail data of a movie.
   *
   * @param {number|string} id - TMDB ID of the movie.
   * @returns {Promise<MediaDetail|null>} Normalized movie detail object or null.
   */
  async function getMovieDetails(id) {
    const details = await request(`/movie/${id}`, { append_to_response: 'videos,credits' });
    const certification = await getCertification('movie', id);
    const providers = await getWatchProviders('movie', id);
    return mapDetails({ ...details, certification, providers }, 'movie');
  }

  /**
   * Returns the detail data of a TV show.
   *
   * @param {number|string} id - TMDB ID of the TV show.
   * @returns {Promise<MediaDetail|null>} Normalized TV show detail object or null.
   */
  async function getTVShowDetails(id) {
    const details = await request(`/tv/${id}`, { append_to_response: 'videos,credits' });
    const certification = await getCertification('tv', id);
    const providers = await getWatchProviders('tv', id);
    const mapped = mapDetails({ ...details, certification, providers }, 'tv');
    if (!mapped) return null;

    return {
      ...mapped,
      numberOfSeasons: toNumberOrNull(details.number_of_seasons),
      numberOfEpisodes: toNumberOrNull(details.number_of_episodes),
      seasons: toArray(details.seasons)
    };
  }

  /**
   * Returns the episodes of a specific TV show season.
   *
   * @param {number|string} showId - TMDB ID of the show.
   * @param {number} seasonNumber - Season number (0 = specials).
   * @returns {Promise<Season|null>} Normalized season object or null.
   */
  async function getTVSeasonDetails(showId, seasonNumber) {
    const data = await request(`/tv/${showId}/season/${seasonNumber}`);

    /** @type {Episode[]} */
    const episodes = toArray(data.episodes).map((ep) => ({
      id: ep.id,
      episodeNumber: toNumberOrNull(ep.episode_number) ?? 0,
      name: toStringValue(ep.name),
      overview: toStringValue(ep.overview),
      airDate: typeof ep.air_date === 'string' ? ep.air_date : null,
      runtime: toNumberOrNull(ep.runtime),
      rating: toRating(ep.vote_average),
      stillUrl: getImageUrl(ep.still_path ?? '', 'w300') || null
    }));

    const raw = {
      id: data.id,
      seasonNumber: data.season_number,
      name: toStringValue(data.name),
      overview: toStringValue(data.overview),
      airDate: typeof data.air_date === 'string' ? data.air_date : null,
      posterUrl: getImageUrl(data.poster_path ?? '', 'w342') || null,
      episodes
    };

    const parsed = SeasonSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] getTVSeasonDetails validation failed:', parsed.error.flatten());
      return null;
    }
    return parsed.data;
  }

  /**
   * Searches movies and TV shows by query string.
   *
   * @param {string} query - Search query.
   * @param {number} [page=1]
   * @returns {Promise<ListResponse|null>} Normalized search response or null.
   */
  async function searchMedia(query, page = 1) {
    const data = await request('/search/multi', { query, page, include_adult: false });
    const items = toArray(data.results);
    await loadGenreMaps();
    const results = items
      .map((item) => mapCardItem(item, item.media_type))
      .filter(Boolean)
      .map((item) => ({ ...item, mediaType: item.mediaType === 'movie' ? 'movie' : 'tv' }));

    const raw = {
      page: toNumberOrNull(data.page) ?? page,
      results,
      hasMore:
        (toNumberOrNull(data.page) ?? page) < (toNumberOrNull(data.total_pages) ?? toNumberOrNull(data.page) ?? page)
    };

    const parsed = ListResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] searchMedia validation failed:', parsed.error.flatten());
      return null;
    }
    return parsed.data;
  }

  return {
    request,
    loadGenreMaps,
    resolveGenres,
    mapCardItem,
    mapWatchProvider,
    mapWatchProviderList,
    getCertification,
    getWatchProviders,
    enrichCardCertifications,
    mapFeaturedItem,
    getTrailerUrls,
    mapDetails,
    mapCast,
    mapCrew,
    getList,
    getTrendingAll,
    getTrendingMovies,
    getTrendingTVShows,
    getPopularMovies,
    getPopularTVShows,
    getTopRatedMovies,
    getTopRatedTVShows,
    getFeaturedToday,
    getMovieDetails,
    getTVShowDetails,
    getTVSeasonDetails,
    searchMedia
  };
}
