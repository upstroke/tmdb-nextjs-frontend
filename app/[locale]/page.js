import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import PagedList from '@/components/PagedList';

export default async function HomePage({ params, searchParams }) {
  const { locale } = await params;
  const { messages, titles } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return <main className="ui container fluid home-page"><p>{messages.apiKeyMissing}</p></main>;
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  let featured = null;
  let cards = [];
  let hasMore = false;
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
