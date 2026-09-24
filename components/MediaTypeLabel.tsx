import { useI18n } from '@/lib/stores/i18n';

interface MediaTypeLabelProps {
  mediaType: 'movie' | 'tv' | string | null | undefined;
  className?: string;
}

/**
 * Renders a compact label for the media type.
 * Movies are displayed as a blue label and TV shows as a teal label.
 */
export default function MediaTypeLabel({ mediaType, className = '' }: MediaTypeLabelProps) {
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
