import { NextResponse } from 'next/server';
import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import { LocaleParamSchema, ListQuerySchema } from '@/lib/schemas/tmdb';

/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */
/** @typedef {import('@/lib/schemas/tmdb').ListResponse} ListResponse */

/**
 * Returns a paginated list of trending movies and TV shows.
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
    const trending = await api.getTrendingAll(page);

    return NextResponse.json({ cards: trending.results ?? [], page: trending.page ?? page, hasMore: trending.hasMore === true, error: null });
  } catch (e) {
    console.error('Failed to load trending:', e);
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.loadMoreError }, { status: 500 });
  }
}
