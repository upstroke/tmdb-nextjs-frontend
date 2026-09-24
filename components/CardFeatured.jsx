'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';
import { useI18n, useLocale } from '@/lib/stores/locale';

export default function CardFeatured({ id, mediaType, title, releaseDate = '', overview = '', homepage = '', genres = [], imageUrl = '', posterUrl = '' }) {
  const { labels, fallbacks } = useI18n();
  const locale = useLocale();

  const normalizedType = mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null;
  const detailsHref = normalizedType === 'movie' ? `/${locale}/movies/${id}` : normalizedType === 'tv' ? `/${locale}/tv-shows/${id}` : undefined;
  const notAvailableText = fallbacks.notAvailable;
  const featuredType = normalizedType === 'movie' ? labels.movie : normalizedType === 'tv' ? labels.tvShow : notAvailableText;
  const featuredImageUrl = imageUrl || '/not-available.png';
  const featuredPosterUrl = posterUrl || imageUrl || '/not-available.png';
  const featuredTitle = title?.trim() || notAvailableText;
  const featuredReleaseDate = releaseDate?.trim() ? formatDate(releaseDate, locale) : '';
  const featuredOverview = overview?.trim() || notAvailableText;
  const featuredHomepage = homepage?.trim() || '';

  return (
    <article
      aria-labelledby="featured-card-title"
      className={`ui fluid card basic featured-card`}
      style={{ '--featured-card-image': `url('${featuredImageUrl}')` }}
    >
      <div className="featured-card-overlay">
        <div className="featured-card-layout">
          <figure className="featured-card-poster">
            <img alt={`${featuredTitle} Poster`} src={featuredPosterUrl} />
          </figure>
          <div className="featured-card-content">
            <p className={`featured-card-type featured-card-type--${normalizedType ?? 'unknown'}${featuredType ? '' : ' u-not-available'}`}>{featuredType}</p>
            {(genres.length > 0 || featuredReleaseDate) && (
              <dl className="featured-card-meta">
                {genres.length > 0 && (
                  <div className="featured-card-meta-item">
                    <dt className="u-sr-only">{labels.genre}</dt>
                    <dd className="featured-card-genres">
                      <i className="layer group icon" aria-hidden="true" />
                      <ul>{genres.map((genre, index) => (<li key={genre.id ?? genre.name}>{index > 0 && <span className="featured-card-genre-separator" aria-hidden="true">/</span>}<span className={genre.name ? '' : 'u-not-available'}>{genre.name}</span></li>))}</ul>
                    </dd>
                  </div>
                )}
                {featuredReleaseDate && (
                  <div className="featured-card-meta-item">
                    <dt className="u-sr-only">{labels.releaseDate}</dt>
                    <dd className="featured-card-date">
                      <i className="calendar icon" aria-hidden="true" />
                      <span className={featuredReleaseDate ? '' : 'u-not-available'}>{featuredReleaseDate}</span>
                    </dd>
                  </div>
                )}
              </dl>
            )}
            <h2 className={`featured-card-title${featuredTitle ? '' : ' u-not-available'}`} id="featured-card-title">{featuredTitle}</h2>
            <p className={`featured-card-description${featuredOverview ? '' : ' u-not-available'}`}>{featuredOverview}</p>
            <nav aria-label={`Aktionen für ${featuredTitle}`} className="featured-card-actions">
              {detailsHref && <Link className={`ui inverted primary button${labels.moreInfo ? '' : ' u-not-available'}`} href={detailsHref}>{labels.moreInfo}</Link>}
              {featuredHomepage && <a className={`ui inverted button${labels.officialWebsite ? '' : ' u-not-available'}`} href={featuredHomepage} target="_blank" rel="noopener noreferrer">{labels.officialWebsite}</a>}
            </nav>
          </div>
        </div>
      </div>
    </article>
  );
}
