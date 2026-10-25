'use client';

import { useEffect } from 'react';
import { useTrendingCache } from '@/components/TrendingCacheProvider';

/**
 * Seeds the shared trending cache with the server-loaded Trending All cards.
 *
 * The cache is intentionally left untouched when it already contains cards for
 * the active locale. This prevents returning to Home from discarding cards that
 * were appended through Load more on Movies or TV Shows.
 *
 * @param {object} props
 * @param {Array<object>} [props.cards=[]] - Certification-enriched Trending All cards.
 * @returns {null}
 */
export default function TrendingCacheInitializer({ cards = [] }) {
  const { initializeCards } = useTrendingCache();

  useEffect(() => {
    initializeCards(cards);
  }, [cards, initializeCards]);

  return null;
}
