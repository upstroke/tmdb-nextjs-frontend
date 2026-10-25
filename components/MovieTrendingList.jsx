'use client';

import { useTrendingCache } from '@/components/TrendingCacheProvider';
import PagedList from '@/components/PagedList';
import { deduplicateMedia } from '@/lib/utils/deduplicateMedia';

/**
 * Client wrapper for the Movies trending list.
 *
 * Combines the server-rendered first page with any movie cards already stored
 * in the shared trending cache. Cached cards preserve previously loaded cards
 * during client-side navigation; deduplication prevents a card from appearing
 * twice.
 *
 * The next dedicated Movies feed page is the page after the last successfully
 * requested page. Cached card counts are not used to infer API pagination.
 *
 * @param {object} props
 * @param {object} props.initialData - Server-rendered Movies fallback data.
 * @param {object} [props.rest] - Remaining PagedList props.
 * @returns {JSX.Element}
 */
export default function MovieTrendingList({ initialData, ...pagedListProps }) {
  const { movieCards, addCards, getNextFeedPage, markFeedPageLoaded } = useTrendingCache();

  const serverCards = initialData?.cards ?? [];
  const mergedCards = deduplicateMedia([...serverCards, ...movieCards]);
  const useCache = mergedCards.length > 0;
  const nextPage = getNextFeedPage('movie');

  const listInitialData = useCache
    ? {
        ...initialData,
        cards: mergedCards,
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
