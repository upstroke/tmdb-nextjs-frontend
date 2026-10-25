'use client';

import { useTrendingCache } from '@/components/TrendingCacheProvider';
import PagedList from '@/components/PagedList';

/**
 * Client wrapper for the Movies trending list.
 *
 * Uses cached Trending All movie cards when available. Otherwise renders the
 * server-provided fallback data. The cached list starts at page 0 so the first
 * Load more request loads page 1 of the dedicated Movies trending feed.
 *
 * @param {object} props
 * @param {object} props.initialData - Server-rendered Movies fallback data.
 * @param {object} [props.rest] - Remaining PagedList props.
 * @returns {JSX.Element}
 */
export default function MovieTrendingList({ initialData, ...pagedListProps }) {
  const { movieCards, addCards } = useTrendingCache();
  const useCache = movieCards.length > 0;

  const listInitialData = useCache
    ? {
        ...initialData,
        cards: movieCards,
        page: 0,
        hasMore: true
      }
    : initialData;

  return (
    <PagedList
      {...pagedListProps}
      initialData={listInitialData}
      cacheInitialData={useCache}
      onCardsAppended={(newCards) => addCards('movie', newCards)}
    />
  );
}
