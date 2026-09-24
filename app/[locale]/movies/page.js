import { fetchMovies } from '@/lib/services/tmdb';
import CardDefault from '@/components/CardDefault';

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
            <CardDefault
              id={movie.id}
              mediaType="movie"
              title={movie.title}
              date={movie.release_date}
              rating={movie.vote_average}
              imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : ''}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
