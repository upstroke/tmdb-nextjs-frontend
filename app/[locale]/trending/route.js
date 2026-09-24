import { NextResponse } from 'next/server';
import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';

export async function GET(request, { params }) {
  const locale = params.locale;
  const { messages } = getLocaleText(locale);
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.apiKeyMissing }, { status: 500 });
  }

  try {
    const api = createTmdbApi(fetch, apiKey, locale);
    const trending = await api.getTrendingAll(page);

    return NextResponse.json({
      cards: trending.results ?? [],
      page: trending.page ?? page,
      hasMore: trending.hasMore === true,
      error: null,
    });
  } catch (e) {
    console.error('Failed to load trending:', e);
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.loadMoreError }, { status: 500 });
  }
}
