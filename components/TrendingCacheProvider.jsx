'use client';

import { createContext, useContext, useMemo, useState } from 'react';

const TrendingCacheContext = createContext(null);

/**
 * Access the shared client-side trending cache.
 *
 * @returns {{
 *   locale: string,
 *   movieCards: Array<object>,
 *   tvCards: Array<object>,
 *   initializeCards: (cards: Array<object>) => void,
 *   addCards: (mediaType: 'movie' | 'tv', cards: Array<object>) => void
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
 * @param {object} props
 * @param {string} props.initialLocale - Locale owning this cache.
 * @param {import('react').ReactNode} props.children - Wrapped application tree.
 * @returns {JSX.Element}
 */
export default function TrendingCacheProvider({ initialLocale, children }) {
  const [cache, setCache] = useState({
    locale: initialLocale,
    movieCards: [],
    tvCards: []
  });

  const value = useMemo(() => {
    function getMediaKey(card) {
      return card?.mediaType && card?.id ? `${card.mediaType}-${card.id}` : null;
    }

    return {
      ...cache,
      initializeCards(cards) {
        setCache((previous) => {
          if (previous.locale !== initialLocale) {
            return {
              locale: initialLocale,
              movieCards: [],
              tvCards: []
            };
          }

          if (previous.movieCards.length > 0 || previous.tvCards.length > 0) {
            return previous;
          }

          return {
            locale: initialLocale,
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
      }
    };
  }, [cache, initialLocale]);

  return (
    <TrendingCacheContext.Provider value={value}>
      {children}
    </TrendingCacheContext.Provider>
  );
}
