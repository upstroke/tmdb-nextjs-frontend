'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/stores/localeStore';

/**
 * @typedef {Object} TvShowCardProps
 * @property {{ id: number, name: string, poster_path: string|null, vote_average: number, first_air_date: string }} show
 */

/**
 * @param {TvShowCardProps} props
 */
export default function TvShowCard({ show }) {
  const { locale } = useLocale();

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
    : '/fallback-poster.png';

  return (
    <li>
      <Link href={`/tv/${show.id}?locale=${locale}`} className="default-card">
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
    </li>
  );
}
