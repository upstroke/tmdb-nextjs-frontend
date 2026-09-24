import { NextResponse } from 'next/server';
import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';

export async function GET(request, { params }) {
  const { locale } = await params;
  const { messages } = getLocaleText(locale);
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.apiKeyMissing }, { status: 500 });
  }

  try {
    const api = createTmdbApi(fetch, apiKey, locale);
    const tvShows = await api.getTrendingTVShows(page);

    const cards = Array.from(
      new Map((tvShows.results ?? []).map((c) => [`${c.id}-${c.mediaType}`, c])).values()
    );

    return NextResponse.json({
      cards,
      page: tvShows.page ?? page,
      hasMore: tvShows.hasMore === true,
      error: null,
    });
  } catch (e) {
    console.error('Failed to load more tv shows:', e);
    return NextResponse.json({ cards: [], page, hasMore: false, error: messages.moreTvShowsLoadError }, { status: 500 });
  }
}
