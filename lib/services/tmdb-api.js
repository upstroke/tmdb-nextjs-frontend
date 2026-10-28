import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { ListResponseSchema, SeasonSchema } from '@/lib/schemas/tmdb';
import {
  getTrailerUrls as getTrailerUrlsRaw,
  mapCardItem as mapCardItemRaw,
  mapCast as mapCastRaw,
  mapCrew as mapCrewRaw,
  mapDetails as mapDetailsRaw,
  mapFeaturedItem as mapFeaturedItemRaw,
  mapWatchProvider as mapWatchProviderRaw,
  mapWatchProviderList as mapWatchProviderListRaw,
  parseFeaturedItem,
  parseWatchProviderResult,
  resolveGenres as resolveGenresRaw
} from '@/lib/services/tmdb/mappers';
import { createTmdbHttpClient } from '@/lib/services/tmdb/tmdb-http';
import { toNumberOrNull, toArray, toStringValue } from '@/lib/services/tmdb/normalizers';

/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */
/** @typedef {import('@/lib/schemas/tmdb').ListResponse} ListResponse */
/** @typedef {import('@/lib/schemas/tmdb').MediaDetail} MediaDetail */
/** @typedef {import('@/lib/schemas/tmdb').FeaturedItem} FeaturedItem */
/** @typedef {import('@/lib/schemas/tmdb').Season} Season */

/**
 * Creates a TMDB API client.
 *
 * The factory orchestrates TMDB domain operations. HTTP transport, retries and
 * error normalization are delegated to the TMDB HTTP client.
 *
 * @param {Function} fetchFn - Fetch function for HTTP requests.
 * @param {string} apiKey - TMDB API key.
 * @param {string} [language=DEFAULT_LOCALE] - Language code for API responses.
 * @returns {object} TMDB API operations.
 */
export function createTmdbApi(fetchFn, apiKey, language = DEFAULT_LOCALE) {
  const http = createTmdbHttpClient(fetchFn, apiKey, language);
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
   * @param {string} path - API path relative to the base URL.
   * @param {object} [params={}] - Additional query parameters.
   * @returns {Promise<object>} JSON response from the API.
   */
  async function request(path, params = {}) {
    return http.request(path, params);
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
   * Returns the current genre maps.
   *
   * @returns {{movie: Record<string, string>, tv: Record<string, string>}} Genre maps.
   */
  function getGenreMaps() {
    return {
      movie: movieGenreMap ?? {},
      tv: tvGenreMap ?? {}
    };
  }

  /**
   * Converts genre IDs into readable genre objects.
   *
   * @param {number[]} [genreIds=[]] - List of genre IDs.
   * @param {string} mediaType - Media type.
   * @returns {{id: number, name: string}[]} Resolved genres.
   */
  function resolveGenres(genreIds = [], mediaType) {
    return resolveGenresRaw(genreIds, mediaType, getGenreMaps());
  }

  /**
   * Converts a TMDB entry into a normalized card object.
   *
   * @param {object} item - Raw data of a movie or TV show.
   * @param {string|null} [fallbackMediaType=null] - Alternative media type.
   * @returns {CardItem|null} Normalized card object or null.
   */
  function mapCardItem(item, fallbackMediaType = null) {
    return mapCardItemRaw(item, getGenreMaps(), fallbackMediaType);
  }

  /**
   * Converts a watch provider into a normalized UI object.
   *
   * @param {object} provider - TMDB provider data.
   * @param {'flatrate'|'rent'|'buy'} type - Provider type.
   * @param {string|null} baseLink - Link to the provider list.
   * @returns {import('@/lib/schemas/tmdb').WatchProvider|null} Normalized provider or null.
   */
  function mapWatchProvider(provider, type, baseLink) {
    return mapWatchProviderRaw(provider, type, baseLink);
  }

  /**
   * Converts a list of watch providers into normalized UI objects.
   *
   * @param {object[]} [providers=[]] - Provider list from TMDB.
   * @param {'flatrate'|'rent'|'buy'} type - Provider type.
   * @param {string|null} baseLink - Link to the provider list.
   * @returns {import('@/lib/schemas/tmdb').WatchProvider[]} Normalized providers.
   */
  function mapWatchProviderList(providers = [], type, baseLink) {
    return mapWatchProviderListRaw(providers, type, baseLink);
  }

  /**
   * Retrieves all available trailer URLs from video data.
   *
   * @param {object} details - TMDB detail data.
   * @returns {string[]} List of YouTube URLs.
   */
  function getTrailerUrls(details) {
    return getTrailerUrlsRaw(details);
  }

  /**
   * Converts a cast list into normalized UI objects.
   *
   * @param {object[]} [cast=[]] - Cast list from TMDB.
   * @returns {import('@/lib/schemas/tmdb').Cast[]} Normalized cast.
   */
  function mapCast(cast = []) {
    return mapCastRaw(cast);
  }

  /**
   * Converts a crew list into normalized UI objects.
   *
   * @param {object[]} [crew=[]] - Crew list from TMDB.
   * @returns {import('@/lib/schemas/tmdb').Crew[]} Normalized crew.
   */
  function mapCrew(crew = []) {
    return mapCrewRaw(crew);
  }

  /**
   * Converts complete detail data into a normalized UI object.
   *
   * @param {object} details - TMDB detail data.
   * @param {string} fallbackMediaType - Optional media type.
   * @returns {MediaDetail|null} Normalized detail object or null.
   */
  function mapDetails(details, fallbackMediaType) {
    return mapDetailsRaw(details, fallbackMediaType);
  }

  /**
   * Converts a featured detail object into the UI format.
   *
   * @param {object} details - TMDB detail data.
   * @param {string|null} [fallbackMediaType=null] - Alternative media type.
   * @returns {FeaturedItem} Normalized featured object.
   */
  function mapFeaturedItem(details, fallbackMediaType = null) {
    return mapFeaturedItemRaw(details, fallbackMediaType);
  }

  /**
   * Retrieves local streaming providers for a media item.
   *
   * @param {'movie'|'tv'} mediaType - Media type.
   * @param {number|string} id - TMDB ID.
   * @returns {Promise<import('@/lib/schemas/tmdb').WatchProviderResult|null>} Watch providers or null.
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
          providers = parseWatchProviderResult({
            link: toStringValue(regionData.link),
            providers: mappedProviders
          });
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
   * @param {'movie'|'tv'} mediaType - Media type.
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
   * @returns {Promise<CardItem[]>} Cards with certification.
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

    const currentPage = toNumberOrNull(data.page) ?? page;
    const totalPages = toNumberOrNull(data.total_pages) ?? currentPage;

    const raw = {
      page: currentPage,
      results: enrichedResults,
      hasMore: currentPage < totalPages
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
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized list response.
   */
  async function getTrendingAll(page = 1) {
    return getList('/trending/all/day', page);
  }

  /**
   * Returns trending movies of the day.
   *
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized list response.
   */
  async function getTrendingMovies(page = 1) {
    return getList('/trending/movie/day', page, 'movie');
  }

  /**
   * Returns trending TV shows of the day.
   *
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized list response.
   */
  async function getTrendingTVShows(page = 1) {
    return getList('/trending/tv/day', page, 'tv');
  }

  /**
   * Returns the most popular movies.
   *
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized list response.
   */
  async function getPopularMovies(page = 1) {
    return getList('/movie/popular', page, 'movie');
  }

  /**
   * Returns the most popular TV shows.
   *
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized list response.
   */
  async function getPopularTVShows(page = 1) {
    return getList('/tv/popular', page, 'tv');
  }

  /**
   * Returns the top-rated movies.
   *
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized list response.
   */
  async function getTopRatedMovies(page = 1) {
    return getList('/movie/top_rated', page, 'movie');
  }

  /**
   * Returns the top-rated TV shows.
   *
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized list response.
   */
  async function getTopRatedTVShows(page = 1) {
    return getList('/tv/top_rated', page, 'tv');
  }

  /**
   * Returns the featured item of the day.
   *
   * @returns {Promise<FeaturedItem|null>} Normalized featured item or null.
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

    const mediaType = featured.media_type ?? (featured.title ? 'movie' : 'tv');
    const details = await request(`/${mediaType}/${featured.id}`, {
      append_to_response: 'videos,credits'
    });
    const mapFn = mediaType === 'movie' ? mapDetails : mapFeaturedItem;
    const mapped = mapFn({ ...featured, ...details }, mediaType);

    if (!mapped) return null;

    const certification = await getCertification(mediaType, featured.id);
    const providers = await getWatchProviders(mediaType, featured.id);

    return parseFeaturedItem({
      id: mapped.id,
      mediaType: mapped.mediaType,
      title: toStringValue(mapped.title),
      releaseDate: toStringValue(mapped.releaseDate),
      overview: toStringValue(mapped.overview),
      homepage: toStringValue(mapped.homepage),
      genres: toArray(mapped.genres),
      imageUrl: mapped.imageUrl || '/not-available.png',
      posterUrl: mapped.posterUrl || '/not-available.png',
      productionCompanies: toArray(mapped.productionCompanies),
      certification: toStringValue(certification),
      providers,
      trailerUrls: toArray(
        mapped.trailerUrls ?? getTrailerUrls({ ...featured, ...details })
      ).filter((url) => typeof url === 'string')
    });
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

    const episodes = toArray(data.episodes).map((episode) => ({
      id: episode.id,
      episodeNumber: toNumberOrNull(episode.episode_number) ?? 0,
      name: toStringValue(episode.name),
      overview: toStringValue(episode.overview),
      airDate: typeof episode.air_date === 'string' ? episode.air_date : null,
      runtime: toNumberOrNull(episode.runtime),
      rating:
        typeof episode.vote_average === 'number' && Number.isFinite(episode.vote_average)
          ? episode.vote_average
          : 0,
      stillUrl: episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : null
    }));

    const raw = {
      id: data.id,
      seasonNumber: data.season_number,
      name: toStringValue(data.name),
      overview: toStringValue(data.overview),
      airDate: typeof data.air_date === 'string' ? data.air_date : null,
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : null,
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
   * @param {number} [page=1] - Page number.
   * @returns {Promise<ListResponse|null>} Normalized search response or null.
   */
  async function searchMedia(query, page = 1) {
    const data = await request('/search/multi', { query, page, include_adult: false });
    const items = toArray(data.results);
    await loadGenreMaps();

    const results = items
      .map((item) => mapCardItem(item, item.media_type))
      .filter(Boolean)
      .map((item) => ({
        ...item,
        mediaType: item.mediaType === 'movie' ? 'movie' : 'tv'
      }));

    const currentPage = toNumberOrNull(data.page) ?? page;
    const totalPages = toNumberOrNull(data.total_pages) ?? currentPage;

    const raw = {
      page: currentPage,
      results,
      hasMore: currentPage < totalPages
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
    getTrailerUrls,
    mapCast,
    mapCrew,
    mapDetails,
    mapFeaturedItem,
    getCertification,
    getWatchProviders,
    enrichCardCertifications,
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
