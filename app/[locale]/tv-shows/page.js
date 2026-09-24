import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import CardFeatured from '@/components/CardFeatured';
import CardDefault from '@/components/CardDefault';

export default async function TvShowsPage({ params, searchParams }) {
  const locale = params.locale;
  const { messages } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;
  const lastPage = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  if (!apiKey) {
    return <main className="ui container fluid tv-shows-page"><p>{messages.apiKeyMissing}</p></main>;
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  let featured = null;
  let cards = [];
  let error = null;

  try {
    const pages = await Promise.all(
      Array.from({ length: lastPage }, (_, i) => api.getTrendingTVShows(i + 1))
    );

    const firstPage = pages[0];
    const source =
      firstPage?.results?.[1] ?? firstPage?.results?.[2] ?? firstPage?.results?.[0] ?? null;

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
        console.error('Featured TV show details could not be loaded:', e);
      }
    }

    cards = Array.from(
      new Map(
        pages.flatMap((r) => r.results ?? []).map((c) => [`${c.id}-${c.mediaType}`, c])
      ).values()
    );
  } catch (e) {
    console.error('Failed to load tv shows:', e);
    error = messages.tvShowsLoadError;
  }

  return (
    <main className="ui container fluid tv-shows-page">
      {error && <p className="ui error message">{error}</p>}

      <h2 className="ui dividing header">{messages.tvShows}</h2>

      {featured && <CardFeatured {...featured} />}

      <h2 className="ui dividing header">{messages.topRatedProductions}</h2>

      {cards.length > 0 ? (
        <ul className="ui four doubling cards media-card-list">
          {cards.map((item, index) => (
            <li key={`tv-${item.mediaType}-${item.id}`} style={{ '--stagger-delay': `${index * 90}ms` }}>
              <CardDefault {...item} scrollId={`tv-card-${index + 1}`} />
            </li>
          ))}
        </ul>
      ) : !error ? (
        <p>{messages.noTvShowsFound}</p>
      ) : null}
    </main>
  );
}
