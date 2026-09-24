'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/stores/localeStore';

/**
 * @typedef {Object} MovieCardProps
 * @property {{ id: number, title: string, poster_path: string|null, vote_average: number, release_date: string }} movie
 */

/**
 * @param {MovieCardProps} props
 */
export default function MovieCard({ movie }) {
  const { locale } = useLocale();

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : '/fallback-poster.png';

  return (
    <li>
      <Link href={`/movie/${movie.id}?locale=${locale}`} className="default-card">
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
    </li>
  );
}
