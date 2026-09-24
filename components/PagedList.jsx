'use client';

import { useState, useRef, useCallback } from 'react';
import CardDefault from './CardDefault';
import LoadMore from './LoadMore';
import { useI18n } from '@/lib/stores/locale';

export default function PagedList({ initialItems = [], totalPages = 1, fetchMore }) {
  const { fallbacks } = useI18n();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);

  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newItems = await fetchMore(nextPage);
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, fetchMore]);

  if (!items.length) {
    return <p className="u-not-available">{fallbacks.notAvailable}</p>;
  }

  return (
    <div className="paged-list">
      <ul className="ui cards four doubling media-card-list">
        {items.map((item, i) => (
          <li key={`${item.id}-${item.mediaType}`}>
            <CardDefault {...item} scrollId={i === 0 ? 'first-result' : undefined} />
          </li>
        ))}
      </ul>
      <LoadMore onClick={loadMore} isLoading={isLoading} hasMore={hasMore} />
    </div>
  );
}
