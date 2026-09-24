import { useI18n } from '@/lib/stores/i18n';

/**
 * @param {{ mediaType: 'movie'|'tv'|string|null|undefined, className?: string }} props
 */
export default function MediaTypeLabel({ mediaType, className = '' }) {
  const { labels } = useI18n();

  const normalizedType =
    mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null;

  if (!normalizedType) return null;

  const labelClass = normalizedType === 'movie' ? 'blue' : 'teal';
  const labelText = normalizedType === 'movie' ? labels.movie : labels.tvShow;

  return (
    <span className={`ui label ${labelClass} ${className}`}>
      {labelText}
    </span>
  );
}
