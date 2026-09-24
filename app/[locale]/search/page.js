import { searchMedia } from '@/lib/services/tmdb';
import { MovieCard } from '@/components/media/MovieCard';
import { TvShowCard } from '@/components/media/TvShowCard';

export default async function SearchPage({ params, searchParams }) {
  const { locale } = params;
  const query = searchParams?.q ?? '';
  const page = Number(searchParams?.page ?? 1);

  if (!query) {
    return <div><h1>Search</h1><p>Enter a search term.</p></div>;
  }

  const data = await searchMedia(query, 'multi', locale, page);

  return (
    <div>
      <h1>Search: {query}</h1>
      <ul>
        {data.results.map((item) => (
          <li key={item.id}>
            {item.media_type === 'tv'
              ? <TvShowCard show={item} locale={locale} />
              : <MovieCard movie={item} locale={locale} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
