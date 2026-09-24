'use client';

import { useI18n } from '@/lib/stores/i18n';

/**
 * @param {{ hasMore?: boolean, loading?: boolean, onLoad?: (() => void) | null }} props
 */
export default function LoadMore({ hasMore = false, loading = false, onLoad = null }) {
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
