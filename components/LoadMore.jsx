'use client';

import { useI18n } from '@/lib/stores/locale';

export default function LoadMore({ onClick, isLoading = false, hasMore = true }) {
  const { labels } = useI18n();

  if (!hasMore) return null;

  return (
    <div className="load-more">
      <button
        className={`ui button load-more-button${isLoading ? ' loading' : ''}`}
        onClick={onClick}
        disabled={isLoading}
      >
        {labels.loadMore}
      </button>
    </div>
  );
}
