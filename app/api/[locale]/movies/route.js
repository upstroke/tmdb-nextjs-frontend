import { NextResponse } from 'next/server';
import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import { ListQuerySchema } from '@/lib/schemas/tmdb';

/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */
/** @typedef {import('@/lib/schemas/tmdb').ListResponse} ListResponse */

/**
 * Returns a paginated list of trending movies.
 *
 * @param {Request} request
 * @param {{ params: Promise<{ locale: string }> }} context
 * @returns {Promise<NextResponse>}
 */
export async function GET(request, { params }) {
  const { locale } = await params;
  const { messages } = getLocaleText(locale);
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.TMDB_API_KEY;

  const queryParsed = ListQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );
  const page = queryParsed.success ? queryParsed.data.page : 1;

  if (!apiKey) {
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.apiKeyMissing }, { status: 500 });
  }

  try {
    const api = createTmdbApi(fetch, apiKey, locale);
    const movies = await api.getTrendingMovies(page);

    /** @type {CardItem[]} */
    const cards = Array.from(
      new Map((movies.results ?? []).map((c) => [`${c.id}-${c.mediaType}`, c])).values()
    );

    return NextResponse.json({
      cards,
      page: movies.page ?? page,
      hasMore: movies.hasMore === true,
      error: null,
    });
  } catch (e) {
    console.error('Failed to load more movies:', e);
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.moreMoviesLoadError }, { status: 500 });
  }
}
