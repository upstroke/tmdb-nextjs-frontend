'use client';

import { useTrendingCache } from '@/components/TrendingCacheProvider';
import PagedList from '@/components/PagedList';

/**
 * Client wrapper for the TV Shows trending list.
 *
 * Uses cached Trending All TV cards when available. Otherwise renders the
 * server-provided fallback data. The cached list starts at page 0 so the first
 * Load more request loads page 1 of the dedicated TV Shows trending feed.
 *
 * @param {object} props
 * @param {object} props.initialData - Server-rendered TV Shows fallback data.
 * @param {object} [props.rest] - Remaining PagedList props.
 * @returns {JSX.Element}
 */
export default function TvTrendingList({ initialData, ...pagedListProps }) {
  const { tvCards, addCards } = useTrendingCache();
  const useCache = tvCards.length > 0;

  const listInitialData = useCache
    ? {
        ...initialData,
        cards: tvCards,
        page: 0,
        hasMore: true
      }
    : initialData;

  return (
    <PagedList
      {...pagedListProps}
      initialData={listInitialData}
      cacheInitialData={useCache}
      onCardsAppended={(newCards) => addCards('tv', newCards)}
    />
  );
}
