'use client';

import { useI18n } from '@/lib/stores/i18n';

interface LoadMoreProps {
  hasMore?: boolean;
  loading?: boolean;
  onLoad?: (() => void | Promise<void>) | null;
}

/**
 * Renders a button for loading more entries.
 * The button is disabled when loading or when no more results are available.
 */
export default function LoadMore({ hasMore = false, loading = false, onLoad = null }: LoadMoreProps) {
  const { messages: texts } = useI18n();

  return (
    <div className="load-more" aria-live="polite">
      {loading ? (
        <button
          className="ui primary button loading"
          type="button"
          onClick={() => onLoad?.()}
          disabled
          aria-busy
        >
          {texts.loadMoreLoading}
        </button>
      ) : (
        <button
          className="ui primary button"
          type="button"
          onClick={() => onLoad?.()}
          disabled={!hasMore}
          aria-busy={false}
        >
          {texts.loadMore}
        </button>
      )}
    </div>
  );
}
