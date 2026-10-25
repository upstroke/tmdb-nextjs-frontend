'use client';

import { useState } from 'react';
import { useTrendingCache } from '@/components/TrendingCacheProvider';
import PagedList from '@/components/PagedList';

/**
 * TV list using either the cache present on mount or the server fallback.
 *
 * Keep the source stable for this mount: populating the cache after load more
 * must not disable sessionStorage writes on a server-backed list. Cached data
 * uses the last loaded feed page; PagedList increments it once when loading.
 * Full displayed cards are cached after an append, including server/restored
 * cards, so a later mount does not lose the first page.
 *
 * @param {object} props - Component props.
 * @param {object} props.initialData - Server fallback data.
 * @returns {JSX.Element} Paged TV list.
 */
export default function TvTrendingList({ initialData, ...pagedListProps }) {
  const { tvCards, addCards, getNextFeedPage, markFeedPageLoaded } = useTrendingCache();
  const [useCache] = useState(() => tvCards.length > 0);

  const listInitialData = useCache
    ? {
        ...initialData,
        cards: tvCards,
        page: getNextFeedPage('tv') - 1,
        hasMore: true
      }
    : initialData;

  return (
    <PagedList
      {...pagedListProps}
      initialData={listInitialData}
      cacheInitialData={useCache}
      onCardsAppended={(newCards, loadedPage, allCards) => {
        addCards('tv', allCards ?? newCards);
        markFeedPageLoaded('tv', loadedPage);
      }}
    />
  );
}
