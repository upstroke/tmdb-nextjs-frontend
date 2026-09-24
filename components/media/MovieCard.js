import Link from 'next/link';

/**
 * @param {{ movie: { id: number, title: string, poster_path: string|null, vote_average: number, release_date: string }, locale: string }} props
 */
export function MovieCard({ movie, locale }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : '/fallback-poster.png';

  return (
    <Link href={`/${locale}/movies/${movie.id}`} className="default-card">
      <div className="ui card">
        <div className="image">
          <img src={posterUrl} alt={movie.title} />
        </div>
        <div className="content">
          <div className="header">{movie.title}</div>
          <div className="meta date">{movie.release_date}</div>
        </div>
        <div className="extra content">
          <span className="rating-value">&#9733; {movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
