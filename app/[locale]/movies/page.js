import { fetchMovies } from '@/lib/services/tmdb';
import { MovieCard } from '@/components/media/MovieCard';

export default async function MoviesPage({ params, searchParams }) {
  const { locale } = params;
  const page = Number(searchParams?.page ?? 1);

  const data = await fetchMovies('popular', locale, page);

  return (
    <div>
      <h1>Movies</h1>
      <ul>
        {data.results.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} locale={locale} />
          </li>
        ))}
      </ul>
    </div>
  );
}
