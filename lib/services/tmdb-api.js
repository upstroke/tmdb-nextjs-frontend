/**
 * TMDB API service.
 *
 * Creates a configured API client with request-scoped caches for
 * certifications, watch providers and genre maps.
 */
import {
  createTmdbHttpClient,
  buildImageUrl
} from '@/lib/services/tmdb-http.js';
import {
  mapCardItem,
  mapDetails,
  mapFeaturedItem,
  mapWatchProviderList
} from '@/lib/services/mappers.js';

/**
 * Creates a TMDB API client.
 *
 * @param {typeof fetch} fetchImpl - Fetch implementation for dependency injection.
 * @param {string} apiKey - TMDB API key.
 * @param {string} [language='en-US'] - TMDB language tag.
 * @returns {object} Public TMDB API operations.
 */
export function createTmdbApi(fetchImpl, apiKey, language = 'en-US') {
  const http = createTmdbHttpClient(fetchImpl, apiKey, language);

  const region = language.includes('-') ? language.split('-')[1] : 'US';

  const certificationCache = new Map();
  const watchProviderCache = new Map();
  let genreMaps = null;
  let genreMapsPromise = null;

  /**
   * Resolves genre IDs to genre objects using the loaded genre maps.
   *
   * @param {number[]} genreIds - TMDB genre IDs.
   * @param {'movie'|'tv'} mediaType - Media type for genre-map lookup.
   * @returns {Array<{id: number, name: string}>} Resolved genres.
   */
  function resolveGenres(genreIds, mediaType) {
    if (!genreMaps || !Array.isArray(genreIds)) return [];
    const map = mediaType === 'tv' ? genreMaps.tv : genreMaps.movie;
    return genreIds.map((id) => map[id]).filter(Boolean);
  }

  /**
   * Returns the certification for a movie or TV show in the current region.
   *
   * @param {'movie'|'tv'} mediaType - Media type.
   * @param {number} id - TMDB media ID.
   * @returns {Promise<string>} Certification or empty string.
   */
  async function getCertification(mediaType, id) {
    const cacheKey = `${mediaType}-${id}`;
    if (certificationCache.has(cacheKey)) {
      return certificationCache.get(cacheKey);
    }

    try {
      const endpoint =
        mediaType === 'movie'
          ? `/movie/${id}/release_dates`
          : `/tv/${id}/content_ratings`;
      const data = await http.request(endpoint);

      let certification = '';
      if (mediaType === 'movie') {
        const entry = data.results?.find(
          (item) => item.iso_3166_1 === region
        );
        certification = entry?.release_dates?.[0]?.certification || '';
      } else {
        const entry = data.results?.find(
          (item) => item.iso_3166_1 === region
        );
        certification = entry?.rating || '';
      }

      certificationCache.set(cacheKey, certification);
      return certification;
    } catch {
      return '';
    }
  }

  /**
   * Returns watch providers for a movie or TV show in the current region.
   *
   * @param {'movie'|'tv'} mediaType - Media type.
   * @param {number} id - TMDB media ID.
   * @returns {Promise<object|null>} Watch-provider data or null.
   */
  async function getWatchProviders(mediaType, id) {
    const cacheKey = `${mediaType}-${id}`;
    if (watchProviderCache.has(cacheKey)) {
      return watchProviderCache.get(cacheKey);
    }

    try {
      const data = await http.request(
        `/${mediaType}/${id}/watch/providers`
      );
      const entry = data.results?.[region];
      if (!entry) {
        watchProviderCache.set(cacheKey, null);
        return null;
      }

      const result = mapWatchProviderList(entry);
      watchProviderCache.set(cacheKey, result);
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Attaches certifications to a list of media cards.
   *
   * @param {Array<object>} cards - Normalized media cards.
   * @returns {Promise<Array<object>>} Cards with certification attached.
   */
  async function enrichCardCertifications(cards) {
    return Promise.all(
      cards.map(async (card) => ({
        ...card,
        certification: await getCertification(card.mediaType, card.id)
      }))
    );
  }

  /**
   * Loads movie and TV genre maps once per API instance.
   *
   * @returns {Promise<void>}
   */
  async function loadGenreMaps() {
    if (genreMaps) return;
    if (!genreMapsPromise) {
      genreMapsPromise = (async () => {
        const [movieData, tvData] = await Promise.all([
          http.request('/genre/movie/list'),
          http.request('/genre/tv/list')
        ]);

        const movieMap = {};
        const tvMap = {};

        (movieData.genres || []).forEach((genre) => {
          movieMap[genre.id] = genre;
        });
        (tvData.genres || []).forEach((genre) => {
          tvMap[genre.id] = genre;
        });

        genreMaps = { movie: movieMap, tv: tvMap };
      })();
    }

    await genreMapsPromise;
  }

  /**
   * Returns normalized movie details with certification and providers.
   *
   * @param {number} id - TMDB movie ID.
   * @returns {Promise<object>} Normalized movie details.
   */
  async function getMovieDetails(id) {
    const raw = await http.request(`/movie/${id}`);
    const details = mapDetails(raw, 'movie');
    const [certification, providers] = await Promise.all([
      getCertification('movie', id),
      getWatchProviders('movie', id)
    ]);

    return { ...details, certification, providers };
  }

  /**
   * Returns a normalized and enriched list response.
   *
   * @param {string} endpoint - TMDB list endpoint.
   * @param {number} [page=1] - Page number.
   * @param {'movie'|'tv'} [mediaType='movie'] - Media type.
   * @returns {Promise<object>} Normalized list response.
   */
  async function getList(endpoint, page = 1, mediaType = 'movie') {
    const data = await http.request(endpoint, { page });
    await loadGenreMaps();

    const results = (data.results || []).map((item) =>
      mapCardItem(item, mediaType, resolveGenres)
    );

    return {
      page: data.page || page,
      results,
      totalPages: data.total_pages || 0,
      totalResults: data.total_results || 0,
      hasMore: page < (data.total_pages || 0)
    };
  }

  return {
    getTrendingAll: (page = 1) =>
      getList('/trending/all/day', page, 'movie'),
    getTrendingMovies: (page = 1) =>
      getList('/trending/movie/week', page, 'movie'),
    getTrendingTVShows: (page = 1) =>
      getList('/trending/tv/week', page, 'tv'),
    getPopularMovies: (page = 1) =>
      getList('/movie/popular', page, 'movie'),
    getPopularTVShows: (page = 1) =>
      getList('/tv/popular', page, 'tv'),
    getTopRatedMovies: (page = 1) =>
      getList('/movie/top_rated', page, 'movie'),
    getTopRatedTVShows: (page = 1) =>
      getList('/tv/top_rated', page, 'tv'),
    getFeaturedToday: async () => {
      const data = await http.request('/trending/all/day');
      await loadGenreMaps();
      return (data.results || [])
        .filter((item) => item.media_type !== 'person')
        .slice(0, 5)
        .map((item) =>
          mapFeaturedItem(
            item,
            item.media_type === 'tv' ? 'tv' : 'movie',
            resolveGenres
          )
        );
    },
    getMovieDetails,
    getTVShowDetails: async (id) => {
      const raw = await http.request(`/tv/${id}`);
      const details = mapDetails(raw, 'tv');
      const [certification, providers] = await Promise.all([
        getCertification('tv', id),
        getWatchProviders('tv', id)
      ]);

      return { ...details, certification, providers };
    },
    getTVSeasonDetails: async (tvId, seasonNumber) => {
      const raw = await http.request(`/tv/${tvId}/season/${seasonNumber}`);
      return {
        id: raw.id,
        seasonNumber: raw.season_number,
        name: raw.name,
        overview: raw.overview || '',
        airDate: raw.air_date || null,
        posterUrl: raw.poster_path
          ? buildImageUrl(raw.poster_path, 'w342')
          : null,
        episodes: (raw.episodes || []).map((episode) => ({
          id: episode.id,
          episodeNumber: episode.episode_number,
          name: episode.name,
          overview: episode.overview || '',
          airDate: episode.air_date || null,
          runtime: episode.runtime ?? null,
          rating: episode.vote_average ?? null,
          stillUrl: episode.still_path
            ? buildImageUrl(episode.still_path, 'w300')
            : null
        }))
      };
    },
    searchMedia: async (query, page = 1) => {
      const data = await http.request('/search/multi', {
        query,
        page,
        include_adult: false
      });
      await loadGenreMaps();

      const results = (data.results || [])
        .filter((item) => item.media_type !== 'person')
        .map((item) =>
          mapCardItem(
            item,
            item.media_type === 'tv' ? 'tv' : 'movie',
            resolveGenres
          )
        );

      return {
        page: data.page || page,
        results,
        totalPages: data.total_pages || 0,
        totalResults: data.total_results || 0,
        hasMore: page < (data.total_pages || 0)
      };
    }
  };
}
