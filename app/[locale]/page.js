import { fetchTrending } from '@/lib/services/tmdb';
import CardDefault from '@/components/CardDefault';
import CardFeatured from '@/components/CardFeatured';

export default async function HomePage({ params }) {
  const { locale } = params;

  const [trendingMovies, trendingTv] = await Promise.all([
    fetchTrending('movie', 1),
    fetchTrending('tv', 1),
  ]);

  const featuredMovie = trendingMovies.results[0];

  return (
    <div>
      {featuredMovie && (
        <CardFeatured
          id={featuredMovie.id}
          mediaType="movie"
          title={featuredMovie.title}
          releaseDate={featuredMovie.release_date}
          overview={featuredMovie.overview}
          genres={featuredMovie.genres ?? []}
          imageUrl={featuredMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path}` : ''}
          posterUrl={featuredMovie.poster_path ? `https://image.tmdb.org/t/p/w342${featuredMovie.poster_path}` : ''}
        />
      )}
      <section>
        <h2>Trending Movies</h2>
        <ul>
          {trendingMovies.results.map((movie) => (
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
      </section>
      <section>
        <h2>Trending TV</h2>
        <ul>
          {trendingTv.results.map((show) => (
            <li key={show.id}>
              <CardDefault
                id={show.id}
                mediaType="tv"
                title={show.name}
                date={show.first_air_date}
                rating={show.vote_average}
                imageUrl={show.poster_path ? `https://image.tmdb.org/t/p/w342${show.poster_path}` : ''}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
