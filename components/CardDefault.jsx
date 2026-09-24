'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import MediaTypeLabel from './MediaTypeLabel';
import { getCertificationMeta } from '@/lib/utils/certificationMeta';
import { formatDate } from '@/lib/utils/formatDate';
import { useI18n } from '@/lib/stores/i18n';
import { useLocale } from '@/lib/stores/locale';

/**
 * @param {{ id: number|string, mediaType: 'movie'|'tv', title: string, date?: string, rating?: number, certification?: string|number, genres?: {name:string}[], imageUrl?: string, scrollId?: string, isLoading?: boolean }} props
 */
export default function CardDefault({
  id,
  mediaType,
  title,
  date = '',
  rating = 0,
  certification = '',
  genres = [],
  imageUrl = '',
  scrollId = '',
  isLoading = false,
}) {
  const { labels, formats, fallbacks } = useI18n();
  const locale = useLocale();
  const activeRegion = locale.split('-')[1] ?? 'US';

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);
  const cardImageUrl = imageUrl || '/not-available.png';

  useEffect(() => {
    setImageLoaded(false);
    setImageErrored(false);
  }, [cardImageUrl]);

  const normalizedType =
    mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null;
  const hasValidCard = Boolean(id) && Boolean(normalizedType);

  if (!hasValidCard) return null;

  const detailsHref =
    normalizedType === 'movie'
      ? `/movies/${id}?locale=${locale}`
      : `/tv-shows/${id}?locale=${locale}`;

  const genreText = (genres ?? []).map((g) => g.name).join(' / ');
  const notAvailableText = fallbacks.notAvailable;
  const cardTitle = title?.trim() || notAvailableText;
  const cardDate = date?.trim() ? formatDate(date, locale) : '';
  const cardRating = typeof rating === 'number' && rating > 0 ? rating.toFixed(1) : null;
  const certificationMeta = getCertificationMeta(String(certification), activeRegion);
  const hasGenres = Boolean(genreText);

  const certStyle = certificationMeta
    ? {
        '--certification-icon-color':
          certificationMeta.color === '#ffffff' ? 'transparent' : certificationMeta.color,
        '--certification-icon-border-color':
          certificationMeta.color === '#ffffff' ? '#999' : certificationMeta.color,
      }
    : {
        '--certification-icon-color': '#dedede',
        '--certification-icon-border-color': '#dedede',
      };

  return (
    <Link
      id={scrollId || undefined}
      className={`ui card default-card${
        isLoading ? ' is-loading' : ''
      }${imageLoaded ? ' image-loaded' : ''}${imageErrored ? ' image-error' : ''}`}
      href={detailsHref}
    >
      <figure className="image">
        <div
          className={`image-stage${
            (!imageLoaded || isLoading) && !imageErrored ? ' is-loading' : ''
          }${imageLoaded && !imageErrored ? ' is-ready' : ''}`}
          style={{ '--image-delay': 'var(--stagger-delay, 0ms)' }}
        >
          {!imageErrored && (
            <img
              src={cardImageUrl}
              alt={`Poster von ${cardTitle}`}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.complete && img.naturalWidth > 0) {
                  requestAnimationFrame(() => setImageLoaded(true));
                } else {
                  setImageLoaded(true);
                }
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                setImageErrored(true);
                setImageLoaded(false);
              }}
            />
          )}
        </div>
        <MediaTypeLabel mediaType={normalizedType} className="top right attached" />
      </figure>

      <div className="content">
        <h3 className={`header${cardTitle ? '' : ' u-not-available'}`}>{cardTitle}</h3>
        <div className="u-spacer" aria-hidden="true" />
        <dl className="card-meta">
          <div className="card-meta-item">
            <dt className="u-sr-only">{labels.certification}</dt>
            <dd className="meta certification" style={certStyle}>
              <span className="certification-content">
                <span className="certification-icon" aria-hidden="true" />
                <span
                  className={`certification-text${certificationMeta?.label ? '' : ' u-not-available'}`}
                >
                  {certificationMeta?.label ?? notAvailableText}
                </span>
              </span>
            </dd>
          </div>
          <div className="card-meta-item">
            <dt className="u-sr-only">{labels.genre}</dt>
            <dd className="meta genres">
              <i className="layer group icon" aria-hidden="true" />
              <span className={hasGenres ? '' : 'u-not-available'}>
                {hasGenres ? genreText : notAvailableText}
              </span>
            </dd>
          </div>
          <div className="card-meta-item">
            <dt className="u-sr-only">{labels.releaseDate}</dt>
            <dd className="meta date">
              <i className="calendar icon" aria-hidden="true" />
              {date ? (
                <time className={cardDate ? '' : 'u-not-available'} dateTime={date}>
                  {cardDate}
                </time>
              ) : (
                <span className="u-not-available">{notAvailableText}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <footer className="extra content">
        <span>
          <i className="yellow star icon" aria-hidden="true" />
          <span className="u-sr-only">{labels.rating}</span>
          {cardRating !== null ? (
            <>
              <b className="rating-value">{cardRating}</b>
              <span className={formats.outOfTen ? '' : 'u-not-available'}>
                {formats.outOfTen}
              </span>
            </>
          ) : (
            <span className="u-not-available">{notAvailableText}</span>
          )}
        </span>
      </footer>
    </Link>
  );
}
