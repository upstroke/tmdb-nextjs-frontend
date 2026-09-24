'use client';

import styles from './LoadMore.module.scss';
import { useI18n } from '@/lib/stores/locale';

export default function LoadMore({ hasMore = false, loading = false, onLoad = null }) {
  const { messages: texts } = useI18n();

  return (
    <div className={styles['load-more']} aria-live="polite">
      {loading ? (
        <button className="ui primary button loading" type="button" onClick={() => onLoad?.()} disabled aria-busy>{texts.loadMoreLoading}</button>
      ) : (
        <button className="ui primary button" type="button" onClick={() => onLoad?.()} disabled={!hasMore} aria-busy={false}>{texts.loadMore}</button>
      )}
    </div>
  );
}
