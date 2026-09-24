import { fetchTrending } from '@/lib/services/tmdb';
import { MovieCard } from '@/components/media/MovieCard';
import { TvShowCard } from '@/components/media/TvShowCard';

export default async function HomePage({ params }) {
  const { locale } = params;

  const [trendingMovies, trendingTv] = await Promise.all([
    fetchTrending('movie', 1),
    fetchTrending('tv', 1),
  ]);

  return (
    <div>
      <section>
        <h2>Trending Movies</h2>
        <ul>
          {trendingMovies.results.map((movie) => (
            <li key={movie.id}>
              <MovieCard movie={movie} locale={locale} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Trending TV</h2>
        <ul>
          {trendingTv.results.map((show) => (
            <li key={show.id}>
              <TvShowCard show={show} locale={locale} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
