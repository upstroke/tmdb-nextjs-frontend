'use client';

import { useTrendingCache } from '@/components/TrendingCacheProvider';
import PagedList from '@/components/PagedList';

/**
 * Client wrapper for the TV Shows trending list.
 *
 * Uses cached Trending All TV cards when available. The next dedicated TV
 * Shows feed page is derived from the number of cached TV cards: TMDB trending
 * feeds return 20 results per page. For example, 10 cached cards mean page 1
 * is next, while 20 cached cards mean page 2 is next.
 *
 * @param {object} props
 * @param {object} props.initialData - Server-rendered TV Shows fallback data.
 * @param {object} [props.rest] - Remaining PagedList props.
 * @returns {JSX.Element}
 */
export default function TvTrendingList({ initialData, ...pagedListProps }) {
  const { tvCards, addCards, getNextFeedPage, markFeedPageLoaded } =
    useTrendingCache();
  const useCache = tvCards.length > 0;
  const nextPage = getNextFeedPage('tv');

  const listInitialData = useCache
    ? {
        ...initialData,
        cards: tvCards,
        page: nextPage,
        hasMore: true
      }
    : initialData;

  return (
    <PagedList
      {...pagedListProps}
      initialData={listInitialData}
      cacheInitialData={useCache}
      onCardsAppended={(newCards, loadedPage) => {
        addCards('tv', newCards);
        markFeedPageLoaded('tv', loadedPage);
      }}
    />
  );
}
