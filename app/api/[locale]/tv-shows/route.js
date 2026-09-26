import { NextResponse } from 'next/server';
import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import { LocaleParamSchema, ListQuerySchema } from '@/lib/schemas/tmdb';

/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */
/** @typedef {import('@/lib/schemas/tmdb').ListResponse} ListResponse */

/**
 * Returns a paginated list of trending TV shows.
 *
 * @param {Request} request
 * @param {{ params: Promise<{ locale: string }> }} context
 * @returns {Promise<NextResponse>}
 */
export async function GET(request, { params }) {
  const localeParsed = LocaleParamSchema.safeParse(await params);
  if (!localeParsed.success) {
    return NextResponse.json({ cards: [], page: 1, hasMore: false, error: 'Invalid locale.' }, { status: 400 });
  }
  const { locale } = localeParsed.data;

  const { messages } = getLocaleText(locale);
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.TMDB_API_KEY;

  const queryParsed = ListQuerySchema.safeParse(Object.fromEntries(searchParams));
  const page = queryParsed.success ? queryParsed.data.page : 1;

  if (!apiKey) {
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.apiKeyMissing }, { status: 500 });
  }

  try {
    const api = createTmdbApi(fetch, apiKey, locale);
    const tvShows = await api.getTrendingTVShows(page);

    /** @type {CardItem[]} */
    const cards = Array.from(
      new Map((tvShows.results ?? []).map((c) => [`${c.id}-${c.mediaType}`, c])).values()
    );

    return NextResponse.json({ cards, page: tvShows.page ?? page, hasMore: tvShows.hasMore === true, error: null });
  } catch (e) {
    console.error('Failed to load more tv shows:', e);
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.moreTvShowsLoadError }, { status: 500 });
  }
}
