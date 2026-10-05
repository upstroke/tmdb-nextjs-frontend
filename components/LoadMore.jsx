'use client';

import { useI18n } from '@/lib/stores/locale';

/**
 * Button control for loading additional pages in a paginated list.
 *
 * Renders a disabled, aria-busy loading state while a fetch is in progress
 * and disables itself when no further pages are available.
 *
 * @param {object} props
 * @param {boolean} [props.hasMore=false] - Whether additional pages can be loaded.
 * @param {boolean} [props.loading=false] - Whether a page fetch is currently in progress.
 * @param {Function|null} [props.onLoad=null] - Callback invoked when the button is clicked.
 * @returns {JSX.Element}
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
