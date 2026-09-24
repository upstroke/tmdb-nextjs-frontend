'use client';

import styles from './MediaTypeLabel.module.scss';
import { useI18n } from '@/lib/stores/locale';

export default function MediaTypeLabel({ mediaType, className = '' }) {
  const { labels } = useI18n();
  const normalizedType = mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : null;
  if (!normalizedType) return null;
  const labelColor = normalizedType === 'movie' ? 'blue' : 'teal';
  const labelText = normalizedType === 'movie' ? labels.movie : labels.tvShow;

  return (
    <span className={`ui label ${styles['label']} ${labelColor} ${className}`}>
      {labelText}
    </span>
  );
}
