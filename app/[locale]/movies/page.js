import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/helpers';
import PagedList from '@/components/PagedList';

/**
 * Movies page (`/[locale]/movies`). Server component that loads trending movies
 * from TMDB and renders them as a paged list.
 *
 * The featured movie is the second trending entry, with the third and then the
 * first as fallbacks. When its details fail to load, the page still renders
 * without it. Duplicate cards are removed by id and media type. Errors while
 * loading the list are passed to `PagedList` through `initialData.error`. A
 * missing `TMDB_API_KEY` renders a short message instead of the list.
 *
 * @param {object} props
 * @param {Promise<{ locale: string }>} props.params - Route params (async in Next.js 15+).
 * @returns {Promise<JSX.Element>}
 */
export default async function MoviesPage({ params }) {
  const { locale } = await params;
  const { messages, titles } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return (
      <main className="ui container fluid movies-page">
        <p>{messages.apiKeyMissing}</p>
      </main>
    );
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  let featured = null;
  let cards = [];
  let hasMore = false;
  let error = null;

  try {
    const result = await api.getTrendingMovies(1);
    const source = result?.results?.[1] ?? result?.results?.[2] ?? result?.results?.[0] ?? null;

    if (source) {
      try {
        const details = await api.getMovieDetails(source.id);
        featured = {
          id: details.id,
          mediaType: details.mediaType,
          title: details.title,
          releaseDate: details.releaseDate,
          overview: details.overview,
          homepage: details.homepage,
          genres: details.genres ?? [],
          imageUrl: details.imageUrl,
          posterUrl: details.posterUrl
        };
      } catch (e) {
        console.error('Featured movie details could not be loaded:', e);
      }
    }

    cards = Array.from(
      new Map((result.results ?? []).map((c) => [`${c.id}-${c.mediaType}`, c])).values()
    );
    hasMore = result.hasMore === true;
  } catch (e) {
    console.error('Failed to load movies:', e);
    error = messages.moviesLoadError;
  }

  const initialData = { featured, cards, page: 1, hasMore, error };

  return (
    <main className="ui container fluid movies-page">
      <PagedList
        initialData={initialData}
        apiPath="movies"
        storageKey="movies-page"
        cardIdPrefix="movie-card"
        listKeyPrefix="page-movies"
        emptyMessageKey="noMoviesFound"
        heading={titles.movies}
      />
    </main>
  );
}
