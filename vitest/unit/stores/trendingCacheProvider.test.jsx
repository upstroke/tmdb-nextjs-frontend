import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import TrendingCacheProvider, {
  useTrendingCache
} from '@/components/TrendingCacheProvider.jsx';

const movieCard = (id, certification = 'PG-13') => ({
  id,
  mediaType: 'movie',
  title: `Movie ${id}`,
  date: '2026-01-01',
  rating: 7,
  genres: [],
  imageUrl: `/movie-${id}.jpg`,
  posterUrl: `/movie-${id}-poster.jpg`,
  certification
});

const tvCard = (id, certification = 'TV-14') => ({
  id,
  mediaType: 'tv',
  title: `TV Show ${id}`,
  date: '2026-01-01',
  rating: 8,
  genres: [],
  imageUrl: `/tv-${id}.jpg`,
  posterUrl: `/tv-${id}-poster.jpg`,
  certification
});

const createWrapper = (initialLocale = 'en-US') =>
  function Wrapper({ children }) {
    return (
      <TrendingCacheProvider initialLocale={initialLocale}>
        {children}
      </TrendingCacheProvider>
    );
  };

/**
 * Asserts that a cache operation does not change the current cache state.
 *
 * @param {object} result - RenderHook result.
 * @param {() => void} operation - Cache operation under test.
 * @returns {void}
 */
function expectUnchangedCache(result, operation) {
  const before = {
    movieCards: result.current.movieCards,
    tvCards: result.current.tvCards,
    movieLastRequestedPage: result.current.movieLastRequestedPage,
    tvLastRequestedPage: result.current.tvLastRequestedPage
  };

  act(operation);

  expect(result.current.movieCards).toBe(before.movieCards);
  expect(result.current.tvCards).toBe(before.tvCards);
  expect(result.current.movieLastRequestedPage).toBe(
    before.movieLastRequestedPage
  );
  expect(result.current.tvLastRequestedPage).toBe(
    before.tvLastRequestedPage
  );
}

describe('TrendingCacheProvider', () => {
  it('throws when useTrendingCache is used outside the provider', () => {
    expect(() => renderHook(() => useTrendingCache())).toThrow(
      'useTrendingCache must be used within TrendingCacheProvider'
    );
  });

  describe('initializeCards', () => {
    it('seeds movie and TV cards separately', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() =>
        result.current.initializeCards([
          movieCard(1),
          tvCard(2),
          movieCard(3)
        ])
      );

      expect(result.current.movieCards).toEqual([movieCard(1), movieCard(3)]);
      expect(result.current.tvCards).toEqual([tvCard(2)]);
    });

    it('does not update the cache for empty trending results', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      expectUnchangedCache(result, () => result.current.initializeCards([]));
      expectUnchangedCache(result, () => result.current.initializeCards());
    });

    it('does not overwrite cards that are already cached', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() => result.current.initializeCards([movieCard(1), tvCard(2)]));

      expectUnchangedCache(result, () =>
        result.current.initializeCards([movieCard(4), tvCard(5)])
      );
      expect(result.current.movieCards).toEqual([movieCard(1)]);
      expect(result.current.tvCards).toEqual([tvCard(2)]);
    });

    it('keeps caches isolated between locales', () => {
      const english = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper('en-US')
      });
      const german = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper('de-DE')
      });

      act(() => english.result.current.initializeCards([movieCard(1)]));
      act(() => german.result.current.initializeCards([movieCard(2)]));

      expect(english.result.current.locale).toBe('en-US');
      expect(english.result.current.movieCards).toEqual([movieCard(1)]);
      expect(german.result.current.locale).toBe('de-DE');
      expect(german.result.current.movieCards).toEqual([movieCard(2)]);
    });
  });

  describe('addCards', () => {
    it('appends only new movie cards and preserves certifications', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() => result.current.initializeCards([movieCard(1, 'PG')]));
      act(() =>
        result.current.addCards('movie', [
          movieCard(1, 'PG-13'),
          movieCard(2, 'R')
        ])
      );

      expect(result.current.movieCards).toEqual([
        movieCard(1, 'PG'),
        movieCard(2, 'R')
      ]);
    });

    it('appends only new TV cards and preserves certifications', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() => result.current.initializeCards([tvCard(1, 'TV-PG')]));
      act(() =>
        result.current.addCards('tv', [tvCard(1, 'TV-14'), tvCard(2, 'TV-MA')])
      );

      expect(result.current.tvCards).toEqual([
        tvCard(1, 'TV-PG'),
        tvCard(2, 'TV-MA')
      ]);
    });

    it('does not update the cache when all cards are duplicates', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() => result.current.initializeCards([movieCard(1)]));

      expectUnchangedCache(result, () =>
        result.current.addCards('movie', [movieCard(1)])
      );
    });

    it('ignores cards without an id or media type', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() => result.current.initializeCards([movieCard(1)]));
      act(() =>
        result.current.addCards('movie', [
          { mediaType: 'movie' },
          { id: 3 },
          null
        ])
      );

      expect(result.current.movieCards).toEqual([movieCard(1)]);
    });

    it('does not update another locale cache when adding cards', () => {
      const english = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper('en-US')
      });
      const german = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper('de-DE')
      });

      act(() => english.result.current.initializeCards([movieCard(1)]));
      act(() => german.result.current.addCards('movie', [movieCard(2)]));

      expect(english.result.current.movieCards).toEqual([movieCard(1)]);
      expect(german.result.current.movieCards).toEqual([movieCard(2)]);
    });
  });

  describe('getNextFeedPage', () => {
    it.each([
      [1, 0, 0],
      [1, 7, 0],
      [1, 13, 0],
      [1, 19, 0],
      [2, 20, 1],
      [2, 27, 1],
      [3, 40, 2],
      [2, 0, 1],
      [2, 20, 0]
    ])(
      'returns page %i for %i cached cards and last requested page %i',
      (expectedPage, cardCount, lastRequestedPage) => {
        const { result } = renderHook(() => useTrendingCache(), {
          wrapper: createWrapper()
        });

        const cards = Array.from({ length: cardCount }, (_, index) =>
          movieCard(index + 1)
        );

        act(() => result.current.initializeCards(cards));

        if (lastRequestedPage > 0) {
          act(() =>
            result.current.markFeedPageLoaded('movie', lastRequestedPage)
          );
        }

        expect(result.current.getNextFeedPage('movie')).toBe(expectedPage);
      }
    );

    it('calculates movie and TV pages independently', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() =>
        result.current.initializeCards([
          movieCard(1),
          movieCard(2),
          tvCard(3)
        ])
      );
      act(() => result.current.markFeedPageLoaded('movie', 1));

      expect(result.current.getNextFeedPage('movie')).toBe(2);
      expect(result.current.getNextFeedPage('tv')).toBe(1);
    });
  });

  describe('markFeedPageLoaded', () => {
    it('stores the last requested page per media type', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() => result.current.markFeedPageLoaded('movie', 2));
      act(() => result.current.markFeedPageLoaded('tv', 3));

      expect(result.current.movieLastRequestedPage).toBe(2);
      expect(result.current.tvLastRequestedPage).toBe(3);
    });

    it('ignores invalid or already loaded pages', () => {
      const { result } = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper()
      });

      act(() => result.current.markFeedPageLoaded('movie', 2));

      expectUnchangedCache(result, () =>
        result.current.markFeedPageLoaded('movie', 0)
      );
      expectUnchangedCache(result, () =>
        result.current.markFeedPageLoaded('movie', Number.NaN)
      );
      expectUnchangedCache(result, () =>
        result.current.markFeedPageLoaded('movie', 1)
      );
      expectUnchangedCache(result, () =>
        result.current.markFeedPageLoaded('movie', 2)
      );

      expect(result.current.movieLastRequestedPage).toBe(2);
    });

    it('does not update another locale cache when marking a page loaded', () => {
      const english = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper('en-US')
      });
      const german = renderHook(() => useTrendingCache(), {
        wrapper: createWrapper('de-DE')
      });

      act(() => english.result.current.markFeedPageLoaded('movie', 2));
      act(() => german.result.current.markFeedPageLoaded('movie', 3));

      expect(english.result.current.movieLastRequestedPage).toBe(2);
      expect(german.result.current.movieLastRequestedPage).toBe(3);
    });
  });
});
