import { useI18n } from '@/lib/stores/locale';

export default function MediaTypeLabel({ mediaType, className = '' }) {
  const { labels } = useI18n();

  if (!mediaType) return null;

  const label = mediaType === 'movie' ? labels.movie : mediaType === 'tv' ? labels.tvShow : null;
  if (!label) return null;

  return (
    <span className={`ui label media-type-label media-type-label--${mediaType}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
}
