import { fetchMovieDetails } from '@/lib/services/tmdb';

export default async function MovieDetailPage({ params }) {
  const { locale, id } = params;

  const movie = await fetchMovieDetails(Number(id), locale);

  return (
    <div>
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>
    </div>
  );
}
