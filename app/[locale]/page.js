import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import { LocaleParamSchema } from '@/lib/schemas/tmdb';
import PagedList from '@/components/PagedList';

/** @typedef {import('@/lib/schemas/tmdb').FeaturedItem} FeaturedItem */
/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */

export default async function HomePage({ params, searchParams }) {
  const paramsParsed = LocaleParamSchema.safeParse(await params);
  if (!paramsParsed.success) {
    return <main className="ui container fluid home-page"><p>Invalid URL parameters.</p></main>;
  }
  const { locale } = paramsParsed.data;

  const { messages, titles } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return <main className="ui container fluid home-page"><p>{messages.apiKeyMissing}</p></main>;
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  /** @type {FeaturedItem|null} */
  let featured = null;
  /** @type {CardItem[]} */
  let cards = [];
  let hasMore = false;
  /** @type {string|null} */
  let error = null;

  try {
    const result = await api.getTrendingAll(1);
    const source = result?.results?.[0] ?? result?.results?.[1] ?? null;

    if (source) {
      try {
        const details = source.mediaType === 'tv'
          ? await api.getTVShowDetails(source.id)
          : await api.getMovieDetails(source.id);
        featured = {
          id: details.id,
          mediaType: details.mediaType,
          title: details.title,
          releaseDate: details.releaseDate,
          overview: details.overview,
          homepage: details.homepage,
          genres: details.genres ?? [],
          imageUrl: details.imageUrl,
          posterUrl: details.posterUrl,
        };
      } catch (e) {
        console.error('Featured details could not be loaded:', e);
      }
    }

    cards = result.results ?? [];
    hasMore = result.hasMore === true;
  } catch (e) {
    console.error('Failed to load homepage:', e);
    error = messages.contentLoadError;
  }

  const initialData = { featured, cards, page: 1, hasMore, error };

  return (
    <main className="ui container fluid home-page">
      <PagedList
        initialData={initialData}
        apiPath="trending"
        storageKey="home-page"
        cardIdPrefix="home-card"
        listKeyPrefix="page-home"
        heading={titles.trendingToday}
      />
    </main>
  );
}
