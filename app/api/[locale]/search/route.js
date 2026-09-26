import { NextResponse } from 'next/server';
import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import { LocaleParamSchema, SearchQuerySchema } from '@/lib/schemas/tmdb';

/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */
/** @typedef {import('@/lib/schemas/tmdb').SearchResponse} SearchResponse */

/**
 * Searches movies and TV shows by query string.
 *
 * @param {Request} request
 * @param {{ params: Promise<{ locale: string }> }} context
 * @returns {Promise<NextResponse<SearchResponse>>}
 */
export async function GET(request, { params }) {
  const localeParsed = LocaleParamSchema.safeParse(await params);
  if (!localeParsed.success) {
    return NextResponse.json({ movies: [], tvShows: [], results: [], error: 'Invalid locale.' }, { status: 400 });
  }
  const { locale } = localeParsed.data;

  const { messages } = getLocaleText(locale);
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.TMDB_API_KEY;

  const queryParsed = SearchQuerySchema.safeParse({ q: searchParams.get('q') });
  if (!queryParsed.success) {
    return NextResponse.json({ movies: [], tvShows: [], results: [], error: null });
  }
  const { q: query } = queryParsed.data;

  if (!apiKey) {
    return NextResponse.json({ movies: [], tvShows: [], results: [], error: messages.apiKeyMissing }, { status: 500 });
  }

  try {
    const api = createTmdbApi(fetch, apiKey, locale);
    const searchResult = await api.searchMedia(query);

    /** @type {CardItem[]} */
    const results = searchResult.results ?? [];

    return NextResponse.json({
      movies: results.filter((item) => item.mediaType === 'movie'),
      tvShows: results.filter((item) => item.mediaType === 'tv'),
      results,
      error: null,
    });
  } catch (e) {
    console.error('Search failed:', e);
    return NextResponse.json({ movies: [], tvShows: [], results: [], error: messages.searchError }, { status: 500 });
  }
}
