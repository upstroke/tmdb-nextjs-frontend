'use client';

import { createContext, useContext, useMemo, useState } from 'react';

const TRENDING_PAGE_SIZE = 20;

const TrendingCacheContext = createContext(null);

/**
 * Access the shared client-side trending cache.
 *
 * @returns {import('@/lib/schemas/tmdb').TrendingCacheState & {
 *   initializeCards: (cards: import('@/lib/schemas/tmdb').CardItem[]) => void,
 *   addCards: (
 *     mediaType: 'movie' | 'tv',
 *     cards: import('@/lib/schemas/tmdb').CardItem[]
 *   ) => void,
 *   getNextFeedPage: (mediaType: 'movie' | 'tv') => number,
 *   markFeedPageLoaded: (mediaType: 'movie' | 'tv', page: number) => void
 * }} Trending cache API.
 */
export function useTrendingCache() {
  const context = useContext(TrendingCacheContext);

  if (!context) {
    throw new Error('useTrendingCache must be used within TrendingCacheProvider');
  }

  return context;
}

/**
 * Provides a locale-scoped client cache for Trending All cards. The cache
 * survives client-side navigation between Home, Movies and TV Shows.
 *
 * The cache tracks both the cards already known for each media type and the
 * last dedicated feed page that was requested. The next feed page is derived
 * from the number of cached cards: TMDB trending feeds return 20 results per
 * page, so 10 cached movie cards mean movie feed page 1 is still pending,
 * while 20 cached cards mean page 1 has been consumed and page 2 is next.
 *
 * @param {object} props
 * @param {string} props.initialLocale - Locale owning this cache.
 * @param {import('react').ReactNode} props.children - Wrapped application tree.
 * @returns {JSX.Element}
 */
export default function TrendingCacheProvider({ initialLocale, children }) {
  /** @type {import('@/lib/schemas/tmdb').TrendingCacheState} */
  const [cache, setCache] = useState({
    locale: initialLocale,
    movieCards: [],
    tvCards: [],
    movieLastRequestedPage: 0,
    tvLastRequestedPage: 0
  });

  const value = useMemo(() => {
    /**
     * Creates a stable deduplication key for a media card.
     *
     * @param {import('@/lib/schemas/tmdb').CardItem} card - Media card.
     * @returns {string|null} Deduplication key or null for invalid cards.
     */
    function getMediaKey(card) {
      return card?.mediaType && card?.id ? `${card.mediaType}-${card.id}` : null;
    }

    /**
     * Calculates the next dedicated feed page for a media type.
     *
     * @param {'movie' | 'tv'} mediaType - Media type to look up.
     * @returns {number} Next page number, never below 1.
     */
    function getNextFeedPage(mediaType) {
      const cards = mediaType === 'movie' ? cache.movieCards : cache.tvCards;
      const lastRequestedPage =
        mediaType === 'movie'
          ? cache.movieLastRequestedPage
          : cache.tvLastRequestedPage;
      const countBasedPage = Math.floor(cards.length / TRENDING_PAGE_SIZE) + 1;

      return Math.max(countBasedPage, lastRequestedPage + 1);
    }

    return {
      ...cache,
      initializeCards(cards) {
        setCache((previous) => {
          if (previous.locale !== initialLocale) {
            return {
              locale: initialLocale,
              movieCards: [],
              tvCards: [],
              movieLastRequestedPage: 0,
              tvLastRequestedPage: 0
            };
          }

          if (previous.movieCards.length > 0 || previous.tvCards.length > 0) {
            return previous;
          }

          return {
            ...previous,
            movieCards: (cards ?? []).filter((card) => card.mediaType === 'movie'),
            tvCards: (cards ?? []).filter((card) => card.mediaType === 'tv')
          };
        });
      },
      addCards(mediaType, cards) {
        setCache((previous) => {
          if (previous.locale !== initialLocale) return previous;

          const existingCards =
            mediaType === 'movie' ? previous.movieCards : previous.tvCards;
          const existingKeys = new Set(
            existingCards.map(getMediaKey).filter(Boolean)
          );
          const newCards = (cards ?? []).filter((card) => {
            const key = getMediaKey(card);
            return key && !existingKeys.has(key);
          });

          if (newCards.length === 0) return previous;

          return mediaType === 'movie'
            ? { ...previous, movieCards: [...previous.movieCards, ...newCards] }
            : { ...previous, tvCards: [...previous.tvCards, ...newCards] };
        });
      },
      getNextFeedPage,
      markFeedPageLoaded(mediaType, page) {
        setCache((previous) => {
          if (previous.locale !== initialLocale) return previous;

          const requestedPage = Number(page);
          if (!Number.isInteger(requestedPage) || requestedPage < 1) return previous;

          if (mediaType === 'movie') {
            if (requestedPage <= previous.movieLastRequestedPage) return previous;
            return { ...previous, movieLastRequestedPage: requestedPage };
          }

          if (requestedPage <= previous.tvLastRequestedPage) return previous;
          return { ...previous, tvLastRequestedPage: requestedPage };
        });
      }
    };
  }, [cache, initialLocale]);

  return (
    <TrendingCacheContext.Provider value={value}>
      {children}
    </TrendingCacheContext.Provider>
  );
}
