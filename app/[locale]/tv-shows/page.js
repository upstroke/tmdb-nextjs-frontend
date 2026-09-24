import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import PagedList from '@/components/PagedList';

export default async function TvShowsPage({ params }) {
  const { locale } = await params;
  const { messages, titles } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return <main className="ui container fluid tv-shows-page"><p>{messages.apiKeyMissing}</p></main>;
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  let featured = null;
  let cards = [];
  let hasMore = false;
  let error = null;

  try {
    const result = await api.getTrendingTVShows(1);
    const source = result?.results?.[1] ?? result?.results?.[2] ?? result?.results?.[0] ?? null;

    if (source) {
      try {
        const details = await api.getTVShowDetails(source.id);
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
        console.error('Featured tv show details could not be loaded:', e);
      }
    }

    cards = Array.from(
      new Map((result.results ?? []).map((c) => [`${c.id}-${c.mediaType}`, c])).values()
    );
    hasMore = result.hasMore === true;
  } catch (e) {
    console.error('Failed to load tv shows:', e);
    error = messages.tvShowsLoadError;
  }

  const initialData = { featured, cards, page: 1, hasMore, error };

  return (
    <main className="ui container fluid tv-shows-page">
      <PagedList
        initialData={initialData}
        apiPath={`api/${locale}/tv-shows`}
        storageKey="tv-shows-page"
        cardIdPrefix="tv-card"
        listKeyPrefix="page-tv"
        emptyMessageKey="noTvShows"
        headingSlot={
          <>
            <h2 className={`ui dividing header${titles.tvShows ? '' : ' u-not-available'}`}>
              {titles.tvShows}
            </h2>
            <h2 className={`ui dividing header${titles.topRatedProductions ? '' : ' u-not-available'}`}>
              {titles.topRatedProductions}
            </h2>
          </>
        }
      />
    </main>
  );
}
