'use client';

import { useI18n } from '@/lib/stores/locale';

/**
 * Small coloured label badge indicating whether an item is a movie or a TV show.
 *
 * Movies render in blue, TV shows in teal. Returns null for unrecognised media types.
 *
 * @param {object} props
 * @param {'movie'|'tv'} props.mediaType - Media type determining label text and colour.
 * @param {string} [props.className=''] - Additional CSS class names appended to the label element.
 * @returns {JSX.Element|null}
 */
export default function MediaTypeLabel({ mediaType, className = '' }) {
  const { labels } = useI18n();
  const normalizedType = mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null;
  if (!normalizedType) return null;
  const labelColor = normalizedType === 'movie' ? 'blue' : 'teal';
  const labelText = normalizedType === 'movie' ? labels.movie : labels.tvShow;

  return <span className={`ui label label ${labelColor} ${className}`}>{labelText}</span>;
}
