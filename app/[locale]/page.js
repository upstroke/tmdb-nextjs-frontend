import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import CardFeatured from '@/components/CardFeatured';
import CardDefault from '@/components/CardDefault';

export default async function HomePage({ params, searchParams }) {
  const locale = params.locale;
  const { messages } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;
  const lastPage = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  if (!apiKey) {
    return <main className="ui container fluid home-page"><p>{messages.apiKeyMissing}</p></main>;
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  let featured = null;
  let cards = [];
  let error = null;

  try {
    const pages = await Promise.all(
      Array.from({ length: lastPage }, (_, i) => api.getTrendingAll(i + 1))
    );

    const firstPage = pages[0];
    const source = firstPage?.results?.[0] ?? firstPage?.results?.[1] ?? null;

    if (source) {
      try {
        const details =
          source.mediaType === 'tv'
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

    cards = pages.flatMap((result) => result.results ?? []);
  } catch (e) {
    console.error('Failed to load homepage:', e);
    error = messages.contentLoadError;
  }

  return (
    <main className="ui container fluid home-page">
      {error && <p className="ui error message">{error}</p>}

      {featured && (
        <>
          <h2 className="ui dividing header">{messages.featuredToday}</h2>
          <CardFeatured {...featured} />
        </>
      )}

      <h2 className="ui dividing header">{messages.trendingToday}</h2>

      {cards.length > 0 ? (
        <ul className="ui four doubling cards media-card-list">
          {cards.map((item, index) => (
            <li key={`home-${item.mediaType}-${item.id}`} style={{ '--stagger-delay': `${index * 90}ms` }}>
              <CardDefault {...item} scrollId={`home-card-${index + 1}`} />
            </li>
          ))}
        </ul>
      ) : !error ? (
        <p>{messages.noContent}</p>
      ) : null}
    </main>
  );
}
