import {
  MovieDetailSchema,
  TvDetailSchema,
  MovieListItemSchema,
  TvListItemSchema,
  PaginatedResponseSchema,
} from '@/lib/schemas/tmdb';
import { parseResponse } from '@/lib/utils/parseResponse';
import { TMDBError } from '@/lib/utils/errors';

/** @typedef {import('@/lib/schemas/tmdb').MovieDetail} MovieDetail */
/** @typedef {import('@/lib/schemas/tmdb').TvDetail} TvDetail */
/** @typedef {import('@/lib/schemas/tmdb').MovieListItem} MovieListItem */
/** @typedef {import('@/lib/schemas/tmdb').TvListItem} TvListItem */

const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Fetch trending movies or TV shows.
 *
 * @param {'movie' | 'tv'} type
 * @param {number} [page=1]
 * @param {Object} [options={}]
 * @param {string} [options.apiKey] - TMDB API key. Defaults to TMDB_API_KEY env variable.
 * @param {Function} [options.fetchFn] - Fetch function for HTTP requests. Defaults to global fetch.
 * @returns {Promise<{ page: number, results: MovieListItem[] | TvListItem[], total_pages: number, total_results: number }>}
 */
export async function fetchTrending(type, page = 1, { apiKey, fetchFn } = {}) {
  const key = apiKey ?? process.env.TMDB_API_KEY;
  const doFetch = fetchFn ?? fetch;
  const itemSchema = type === 'movie' ? MovieListItemSchema : TvListItemSchema;
  const url = `${BASE_URL}/trending/${type}/day?api_key=${key}&page=${page}`;

  const res = await doFetch(url);
  if (!res.ok) throw new TMDBError(`Trending fetch failed: ${res.status}`, res.status);

  const data = await res.json();
  return parseResponse(data, PaginatedResponseSchema(itemSchema), 'fetchTrending');
}

/**
 * Fetch paginated movie list.
 *
 * @param {'popular' | 'top_rated' | 'upcoming' | 'now_playing'} category
 * @param {string} [locale]
 * @param {number} [page=1]
 * @param {Object} [options={}]
 * @param {string} [options.apiKey] - TMDB API key. Defaults to TMDB_API_KEY env variable.
 * @param {Function} [options.fetchFn] - Fetch function for HTTP requests. Defaults to global fetch.
 * @returns {Promise<{ page: number, results: MovieListItem[], total_pages: number, total_results: number }>}
 */
export async function fetchMovies(category, locale, page = 1, { apiKey, fetchFn } = {}) {
  const key = apiKey ?? process.env.TMDB_API_KEY;
  const doFetch = fetchFn ?? fetch;
  const lang = locale ? `&language=${locale}` : '';
  const url = `${BASE_URL}/movie/${category}?api_key=${key}&page=${page}${lang}`;

  const res = await doFetch(url);
  if (!res.ok) throw new TMDBError(`Movie list fetch failed: ${res.status}`, res.status);

  const data = await res.json();
  return parseResponse(data, PaginatedResponseSchema(MovieListItemSchema), 'fetchMovies');
}

/**
 * Fetch paginated TV show list.
 *
 * @param {'popular' | 'top_rated' | 'on_the_air' | 'airing_today'} category
 * @param {string} [locale]
 * @param {number} [page=1]
 * @param {Object} [options={}]
 * @param {string} [options.apiKey] - TMDB API key. Defaults to TMDB_API_KEY env variable.
 * @param {Function} [options.fetchFn] - Fetch function for HTTP requests. Defaults to global fetch.
 * @returns {Promise<{ page: number, results: TvListItem[], total_pages: number, total_results: number }>}
 */
export async function fetchTvShows(category, locale, page = 1, { apiKey, fetchFn } = {}) {
  const key = apiKey ?? process.env.TMDB_API_KEY;
  const doFetch = fetchFn ?? fetch;
  const lang = locale ? `&language=${locale}` : '';
  const url = `${BASE_URL}/tv/${category}?api_key=${key}&page=${page}${lang}`;

  const res = await doFetch(url);
  if (!res.ok) throw new TMDBError(`TV list fetch failed: ${res.status}`, res.status);

  const data = await res.json();
  return parseResponse(data, PaginatedResponseSchema(TvListItemSchema), 'fetchTvShows');
}

/**
 * Fetch movie details including credits and watch providers.
 *
 * @param {number} id
 * @param {string} [locale]
 * @param {Object} [options={}]
 * @param {string} [options.apiKey] - TMDB API key. Defaults to TMDB_API_KEY env variable.
 * @param {Function} [options.fetchFn] - Fetch function for HTTP requests. Defaults to global fetch.
 * @returns {Promise<MovieDetail>}
 */
export async function fetchMovieDetails(id, locale, { apiKey, fetchFn } = {}) {
  const key = apiKey ?? process.env.TMDB_API_KEY;
  const doFetch = fetchFn ?? fetch;
  const lang = locale ? `&language=${locale}` : '';
  const url = `${BASE_URL}/movie/${id}?api_key=${key}${lang}&append_to_response=credits,watch%2Fproviders`;

  const res = await doFetch(url);
  if (!res.ok) throw new TMDBError(`Movie detail fetch failed: ${res.status}`, res.status);

  const data = await res.json();
  return parseResponse(data, MovieDetailSchema, 'fetchMovieDetails');
}

/**
 * Fetch TV show details including credits and watch providers.
 *
 * @param {number} id
 * @param {string} [locale]
 * @param {Object} [options={}]
 * @param {string} [options.apiKey] - TMDB API key. Defaults to TMDB_API_KEY env variable.
 * @param {Function} [options.fetchFn] - Fetch function for HTTP requests. Defaults to global fetch.
 * @returns {Promise<TvDetail>}
 */
export async function fetchTvDetails(id, locale, { apiKey, fetchFn } = {}) {
  const key = apiKey ?? process.env.TMDB_API_KEY;
  const doFetch = fetchFn ?? fetch;
  const lang = locale ? `&language=${locale}` : '';
  const url = `${BASE_URL}/tv/${id}?api_key=${key}${lang}&append_to_response=credits,watch%2Fproviders`;

  const res = await doFetch(url);
  if (!res.ok) throw new TMDBError(`TV detail fetch failed: ${res.status}`, res.status);

  const data = await res.json();
  return parseResponse(data, TvDetailSchema, 'fetchTvDetails');
}

/**
 * Search movies and TV shows.
 *
 * @param {string} query
 * @param {'movie' | 'tv' | 'multi'} [type='multi']
 * @param {string} [locale]
 * @param {number} [page=1]
 * @param {Object} [options={}]
 * @param {string} [options.apiKey] - TMDB API key. Defaults to TMDB_API_KEY env variable.
 * @param {Function} [options.fetchFn] - Fetch function for HTTP requests. Defaults to global fetch.
 * @returns {Promise<{ page: number, results: (MovieListItem | TvListItem)[], total_pages: number, total_results: number }>}
 */
export async function searchMedia(query, type = 'multi', locale, page = 1, { apiKey, fetchFn } = {}) {
  const key = apiKey ?? process.env.TMDB_API_KEY;
  const doFetch = fetchFn ?? fetch;
  const lang = locale ? `&language=${locale}` : '';
  const url = `${BASE_URL}/search/${type}?api_key=${key}&query=${encodeURIComponent(query)}&page=${page}${lang}`;

  const res = await doFetch(url);
  if (!res.ok) throw new TMDBError(`Search failed: ${res.status}`, res.status);

  const itemSchema = type === 'tv' ? TvListItemSchema : MovieListItemSchema;
  const data = await res.json();
  return parseResponse(data, PaginatedResponseSchema(itemSchema), 'searchMedia');
}
