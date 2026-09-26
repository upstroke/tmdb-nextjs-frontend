import { getDate, getImageUrl, getMediaType, getTitle } from '@/lib/services/tmdb/helpers';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { TMDBError } from '@/lib/utils/errors';
import {
  CardItemSchema,
  MediaDetailSchema,
  FeaturedItemSchema,
  ListResponseSchema,
  WatchProviderResultSchema,
  SeasonSchema,
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

/**
 * Creates a TMDB API instance as a plain object.
 *
 * The factory encapsulates request-specific dependencies and maintains internal
 * state via closures instead of a class.
 *
 * @param {Function} fetchFn - Fetch function for HTTP requests.
 * @param {string} apiKey - TMDB API key.
 * @param {string} [language=DEFAULT_LOCALE] - Language code for API responses.
 * @returns {Object} TMDB API with methods for requests, mapping, and caches.
 */
export function createTmdbApi(fetchFn, apiKey, language = DEFAULT_LOCALE) {
  const region = language.split('-')[1] ?? language.split('_')[1] ?? 'DE';
  let movieGenreMap = null;
  let tvGenreMap = null;
  const certificationCache = new Map();
  const watchProvidersCache = new Map();

  /**
   * Executes a standardized request to the TMDB API.
   *
   * @param {string} path - API path relative to the base URL.
   * @param {Object} [params={}] - Additional query parameters.
   * @returns {Promise<Object>} JSON response from the API.
   * @throws {TMDBError} If the request fails.
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

    const response = await fetchFn(url.toString());

    if (!response.ok) {
      throw new TMDBError(
        `TMDB request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return response.json();
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
      request('/genre/tv/list'),
    ]);

    movieGenreMap = Object.fromEntries(
      (movieData.genres || []).map((genre) => [genre.id, genre.name])
    );
    tvGenreMap = Object.fromEntries(
      (tvData.genres || []).map((genre) => [genre.id, genre.name])
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
   * @param {Object} item - Raw data of a movie or TV show.
   * @param {string|null} [fallbackMediaType=null] - Alternative media type.
   * @returns {CardItem|null} Normalized card object or null.
   */
  function mapCardItem(item, fallbackMediaType = null) {
    const mediaType = getMediaType(item, fallbackMediaType);
    if (!item?.id || !['movie', 'tv'].includes(mediaType)) return null;

    const genres = item.genres?.length
      ? item.genres
      : resolveGenres(item.genre_ids ?? [], mediaType);
    const posterPath = item.poster_path ?? item.backdrop_path ?? '';

    const raw = {
      id: item.id,
      mediaType,
      title: getTitle(item) || 'N/A',
      date: getDate(item) || '',
      rating: item.vote_average ?? 0,
      genres: genres.length ? genres : [{ id: 'na', name: 'N/A' }],
      imageUrl: getImageUrl(posterPath, 'w500') || NOT_AVAILABLE_IMAGE,
      posterUrl: getImageUrl(posterPath, 'w342') || NOT_AVAILABLE_IMAGE,
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
   * @param {Object} provider - TMDB provider data.
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
      displayPriority: provider.display_priority ?? null,
    };
  }

  /**
   * Converts a list of watch providers into normalized UI objects.
   *
   * @param {Object[]} [providers=[]] - Provider list from TMDB.
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
          ...mapWatchProviderList(regionData.flatrate, 'flatrate', regionData.link),
          ...mapWatchProviderList(regionData.rent, 'rent', regionData.link),
          ...mapWatchProviderList(regionData.buy, 'buy', regionData.link),
        ];

        if (mappedProviders.length) {
          const raw = { link: regionData.link ?? '', providers: mappedProviders };
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
        const country = data.results?.find((entry) => entry.iso_3166_1 === region);
        certification =
          country?.release_dates?.find((release) => release.certification)?.certification ?? '';
      } else if (mediaType === 'tv') {
        const data = await request(`/tv/${id}/content_ratings`);
        certification = data.results?.find((entry) => entry.iso_3166_1 === region)?.rating ?? '';
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
        certification: await getCertification(card.mediaType, card.id),
      }))
    );
  }

  /**
   * Converts a featured detail object into the UI format.
   *
   * @param {Object} details - TMDB detail data.
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
      posterUrl: getImageUrl(details.poster_path ?? '', 'w342'),
    };
  }

  /**
   * Retrieves all available trailer URLs from video data.
   *
   * @param {Object} details - TMDB detail data.
   * @returns {string[]} List of YouTube URLs.
   */
  function getTrailerUrls(details) {
    const videos = details.videos?.results ?? [];
    return videos
      .filter((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.key)
      .map((video) => `https://www.youtube.com/watch?v=${video.key}`);
  }

  /**
   * Converts a cast list into normalized UI objects.
   *
   * @param {Object[]} [cast=[]] - Cast list from TMDB.
   * @returns {Cast[]} Normalized cast list.
   */
  function mapCast(cast = []) {
    return cast.slice(0, 20).map((person) => ({
      id: person.id,
      creditId: person.credit_id,
      name: person.name,
      character: person.character ?? '',
      order: person.order ?? null,
      profilePath: person.profile_path ?? '',
      imageUrl: getImageUrl(person.profile_path ?? '', 'w185') || NOT_AVAILABLE_IMAGE,
    }));
  }

  /**
   * Converts a crew list into normalized UI objects.
   *
   * @param {Object[]} [crew=[]] - Crew list from TMDB.
   * @returns {Crew[]} Normalized crew list.
   */
  function mapCrew(crew = []) {
    return crew.slice(0, 20).map((person) => ({
      id: person.id,
      creditId: person.credit_id,
      name: person.name,
      job: person.job ?? '',
      department: person.department ?? '',
      profilePath: person.profile_path ?? '',
      imageUrl: getImageUrl(person.profile_path ?? '', 'w185') || NOT_AVAILABLE_IMAGE,
    }));
  }

  /**
   * Converts complete detail data into a normalized UI object.
   *
   * @param {Object} details - TMDB detail data.
   * @param {string} fallbackMediaType - Optional media type.
   * @returns {MediaDetail} Normalized detail object.
   */
  function mapDetails(details, fallbackMediaType) {
    const mediaType = getMediaType(details, fallbackMediaType);

    const raw = {
      id: details.id,
      mediaType,
      title: getTitle(details),
      releaseDate: getDate(details),
      overview: details.overview ?? '',
      homepage: details.homepage ?? '',
      trailerUrls: getTrailerUrls(details),
      genres: details.genres ?? [],
      rating: details.vote_average ?? 0,
      runtime: details.runtime ?? null,
      episodeRunTime: details.episode_run_time ?? [],
      productionCompanies: details.production_companies ?? [],
      imageUrl: getImageUrl(details.backdrop_path ?? details.poster_path ?? '', 'w1280'),
      posterUrl: getImageUrl(details.poster_path ?? '', 'w342'),
      cast: mapCast(details.credits?.cast ?? []),
      crew: mapCrew(details.credits?.crew ?? []),
      certification: details.certification ?? '',
      providers: details.providers ?? null,
    };

    const parsed = MediaDetailSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] mapDetails validation failed:', parsed.error.flatten());
      // Return the raw object so the page can still render with partial data.
      return /** @type {MediaDetail} */ (raw);
    }
    return parsed.data;
  }

  /**
   * Fetches a list of movies or TV shows.
   *
   * @param {string} endpoint - TMDB endpoint.
   * @param {number} page - Page number.
   * @param {string|null} [fallbackMediaType=null] - Optional media type.
   * @returns {Promise<ListResponse>} Normalized list response.
   */
  async function getList(endpoint, page, fallbackMediaType = null) {
    const data = await request(endpoint, { page });
    const items = data.results ?? [];
    await loadGenreMaps();
    const results = items.map((item) => mapCardItem(item, fallbackMediaType)).filter(Boolean);
    const enrichedResults = await enrichCardCertifications(results);

    const raw = {
      page: data.page ?? page,
      results: enrichedResults,
      hasMore: (data.page ?? page) < (data.total_pages ?? data.page ?? page),
    };

    const parsed = ListResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] getList validation failed:', parsed.error.flatten());
      return /** @type {ListResponse} */ (raw);
    }
    return parsed.data;
  }

  /**
   * Returns trending movies and TV shows of the day.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>}
   */
  async function getTrendingAll(page = 1) {
    return getList('/trending/all/day', page);
  }

  /**
   * Returns trending movies of the day.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>}
   */
  async function getTrendingMovies(page = 1) {
    return getList('/trending/movie/day', page, 'movie');
  }

  /**
   * Returns trending TV shows of the day.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>}
   */
  async function getTrendingTVShows(page = 1) {
    return getList('/trending/tv/day', page, 'tv');
  }

  /**
   * Returns the most popular movies.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>}
   */
  async function getPopularMovies(page = 1) {
    return getList('/movie/popular', page, 'movie');
  }

  /**
   * Returns the most popular TV shows.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>}
   */
  async function getPopularTVShows(page = 1) {
    return getList('/tv/popular', page, 'tv');
  }

  /**
   * Returns the top-rated movies.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>}
   */
  async function getTopRatedMovies(page = 1) {
    return getList('/movie/top_rated', page, 'movie');
  }

  /**
   * Returns the top-rated TV shows.
   *
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>}
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
    const items = data.results ?? [];
    const featured =
      items.find((item) => item.media_type === 'movie' && item.backdrop_path) ??
      items.find((item) => item.media_type === 'tv' && item.backdrop_path) ??
      items[0] ??
      null;

    if (!featured) return null;

    const mediaType = getMediaType(featured, featured.media_type);
    const details = await request(`/${mediaType}/${featured.id}`, {
      append_to_response: 'videos,credits',
    });
    const mapFn = mediaType === 'movie' ? mapDetails : mapFeaturedItem;
    const mapped = mapFn({ ...featured, ...details }, mediaType);
    const productionCompanies = details.production_companies ?? [];
    const certification = await getCertification(mediaType, featured.id);
    const providers = await getWatchProviders(mediaType, featured.id);

    const raw = {
      ...mapped,
      productionCompanies,
      certification,
      providers,
      trailerUrls: mapped.trailerUrls ?? getTrailerUrls({ ...featured, ...details }),
    };

    const parsed = FeaturedItemSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] getFeaturedToday validation failed:', parsed.error.flatten());
      return /** @type {FeaturedItem} */ (raw);
    }
    return parsed.data;
  }

  /**
   * Returns the detail data of a movie.
   *
   * @param {number|string} id - TMDB ID of the movie.
   * @returns {Promise<MediaDetail>} Normalized movie detail object.
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
   * @returns {Promise<MediaDetail>} Normalized TV show detail object including season metadata.
   */
  async function getTVShowDetails(id) {
    const details = await request(`/tv/${id}`, { append_to_response: 'videos,credits' });
    const certification = await getCertification('tv', id);
    const providers = await getWatchProviders('tv', id);
    const mapped = mapDetails({ ...details, certification, providers }, 'tv');

    return {
      ...mapped,
      numberOfSeasons: details.number_of_seasons ?? null,
      numberOfEpisodes: details.number_of_episodes ?? null,
      seasons: details.seasons ?? [],
    };
  }

  /**
   * Returns the episodes of a specific TV show season.
   *
   * @param {number|string} showId - TMDB ID of the TV show.
   * @param {number} seasonNumber - Season number (0 = specials).
   * @returns {Promise<Season>} Normalized season object with episode list.
   */
  async function getTVSeasonDetails(showId, seasonNumber) {
    const data = await request(`/tv/${showId}/season/${seasonNumber}`);

    /** @type {Episode[]} */
    const episodes = (data.episodes ?? []).map((ep) => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      name: ep.name ?? '',
      overview: ep.overview ?? '',
      airDate: ep.air_date ?? null,
      runtime: ep.runtime ?? null,
      rating: ep.vote_average ?? 0,
      stillUrl: getImageUrl(ep.still_path ?? '', 'w300') || null,
    }));

    const raw = {
      id: data.id,
      seasonNumber: data.season_number,
      name: data.name ?? '',
      overview: data.overview ?? '',
      airDate: data.air_date ?? null,
      posterUrl: getImageUrl(data.poster_path ?? '', 'w342') || null,
      episodes,
    };

    const parsed = SeasonSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] getTVSeasonDetails validation failed:', parsed.error.flatten());
      return /** @type {Season} */ (raw);
    }
    return parsed.data;
  }

  /**
   * Searches movies and TV shows by query string.
   *
   * @param {string} query - Search query.
   * @param {number} [page=1]
   * @returns {Promise<ListResponse>} Normalized search response.
   */
  async function searchMedia(query, page = 1) {
    const data = await request('/search/multi', { query, page, include_adult: false });
    const items = data.results ?? [];
    await loadGenreMaps();
    const results = items
      .map((item) => mapCardItem(item, item.media_type))
      .filter(Boolean)
      .map((item) => ({ ...item, mediaType: item.mediaType === 'movie' ? 'movie' : 'tv' }));

    const raw = {
      page: data.page ?? page,
      results,
      hasMore: (data.page ?? page) < (data.total_pages ?? data.page ?? page),
    };

    const parsed = ListResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[tmdb-api] searchMedia validation failed:', parsed.error.flatten());
      return /** @type {ListResponse} */ (raw);
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
    searchMedia,
  };
}
