'use client';

import { useTrendingCache } from '@/components/TrendingCacheProvider';
import PagedList from '@/components/PagedList';

/**
 * Client wrapper for the Movies trending list.
 *
 * Uses cached Trending All movie cards when available. The next dedicated
 * Movies feed page is derived from the number of cached movie cards: TMDB
 * trending feeds return 20 results per page. For example, 10 cached cards mean
 * page 1 is next, while 20 cached cards mean page 2 is next.
 *
 * @param {object} props
 * @param {object} props.initialData - Server-rendered Movies fallback data.
 * @param {object} [props.rest] - Remaining PagedList props.
 * @returns {JSX.Element}
 */
export default function MovieTrendingList({ initialData, ...pagedListProps }) {
  const { movieCards, addCards, getNextFeedPage, markFeedPageLoaded } =
    useTrendingCache();
  const useCache = movieCards.length > 0;
  const nextPage = getNextFeedPage('movie');

  const listInitialData = useCache
    ? {
        ...initialData,
        cards: movieCards,
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
        addCards('movie', newCards);
        markFeedPageLoaded('movie', loadedPage);
      }}
    />
  );
}
