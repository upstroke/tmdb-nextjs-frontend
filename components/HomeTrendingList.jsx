'use client';

import { useTrendingCache } from '@/components/TrendingCacheProvider';
import PagedList from '@/components/PagedList';

/**
 * Client boundary for the Home trending list.
 *
 * Forwards newly loaded Trending All cards to the shared locale cache,
 * separated by media type. This keeps movie and TV cards loaded through Home
 * "Load more" available to the Movies and TV Shows pages.
 *
 * @param {object} props
 * @param {object} props.initialData - Server-rendered Home data.
 * @param {object} [props.rest] - Remaining PagedList props.
 * @returns {JSX.Element}
 */
export default function HomeTrendingList({ initialData, ...pagedListProps }) {
  const { addCards } = useTrendingCache();

  return (
    <PagedList
      {...pagedListProps}
      initialData={initialData}
      onCardsAppended={(newCards) => {
        addCards(
          'movie',
          newCards.filter((card) => card.mediaType === 'movie')
        );
        addCards(
          'tv',
          newCards.filter((card) => card.mediaType === 'tv')
        );
      }}
    />
  );
}
