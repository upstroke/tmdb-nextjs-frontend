import Link from 'next/link';

/**
 * @param {{ show: { id: number, name: string, poster_path: string|null, vote_average: number, first_air_date: string }, locale: string }} props
 */
export function TvShowCard({ show, locale }) {
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
    : '/fallback-poster.png';

  return (
    <Link href={`/${locale}/tv/${show.id}`} className="default-card">
      <div className="ui card">
        <div className="image">
          <img src={posterUrl} alt={show.name} />
        </div>
        <div className="content">
          <div className="header">{show.name}</div>
          <div className="meta date">{show.first_air_date}</div>
        </div>
        <div className="extra content">
          <span className="rating-value">&#9733; {show.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}

export default TvShowCard;
