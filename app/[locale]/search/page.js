import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import CardDefault from '@/components/CardDefault';

export default async function SearchPage({ params, searchParams }) {
  const locale = params.locale;
  const { messages } = getLocaleText(locale);
  const query = searchParams?.q?.trim() ?? '';
  const apiKey = process.env.TMDB_API_KEY;

  if (!query || query.length < 4) {
    return (
      <main className="ui container search-page">
        <h1 className="ui dividing header">{messages.search}</h1>
        <p>{messages.searchHint}</p>
      </main>
    );
  }

  if (!apiKey) {
    return (
      <main className="ui container search-page">
        <p>{messages.apiKeyMissing}</p>
      </main>
    );
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  let movies = [];
  let tvShows = [];
  let error = null;

  try {
    const searchResult = await api.searchMedia(query);
    const results = searchResult.results ?? [];
    movies = results.filter((item) => item.mediaType === 'movie');
    tvShows = results.filter((item) => item.mediaType === 'tv');
  } catch (e) {
    console.error('Search failed:', e);
    error = messages.searchError;
  }

  return (
    <main className="ui container search-page">
      <h1 className="ui dividing header">
        {messages.searchResultsFor} &ldquo;{query}&rdquo;
      </h1>

      {error && <p className="ui error message">{error}</p>}

      {!error && movies.length === 0 && tvShows.length === 0 && (
        <p>{messages.noResultsFound}</p>
      )}

      {movies.length > 0 && (
        <section>
          <h2 className="ui dividing header">{messages.movies}</h2>
          <ul className="ui four doubling cards media-card-list">
            {movies.map((item, index) => (
              <li key={`search-movie-${item.id}`} style={{ '--stagger-delay': `${index * 90}ms` }}>
                <CardDefault {...item} scrollId={`search-movie-${index + 1}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {tvShows.length > 0 && (
        <section>
          <h2 className="ui dividing header">{messages.tvShows}</h2>
          <ul className="ui four doubling cards media-card-list">
            {tvShows.map((item, index) => (
              <li key={`search-tv-${item.id}`} style={{ '--stagger-delay': `${index * 90}ms` }}>
                <CardDefault {...item} scrollId={`search-tv-${index + 1}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
