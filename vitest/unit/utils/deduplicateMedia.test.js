/**
 * The tests cover empty input, items with missing mediaType or id,
 * items with duplicate media keys, and the order guarantee of
 * deduplicateMedia. The getMediaKey helper is verified indirectly
 * through the deduplicateMedia cases.
 */
import { describe, expect, it } from 'vitest';
import { deduplicateMedia, getMediaKey } from '@/lib/utils/deduplicateMedia.js';

describe('getMediaKey', () => {
  // Statement coverage: null input returns null.
  it('returns null for a null item', () => {
    expect(getMediaKey(null)).toBeNull();
  });

  // Branch coverage: item without an id returns null.
  it('returns null when id is missing', () => {
    expect(getMediaKey({ mediaType: 'movie' })).toBeNull();
  });

  // Branch coverage: item without a mediaType returns null.
  it('returns null when mediaType is missing', () => {
    expect(getMediaKey({ id: 1 })).toBeNull();
  });

  // Statement coverage: valid item returns the combined key.
  it('returns a combined mediaType-id key for a valid item', () => {
    expect(getMediaKey({ id: 42, mediaType: 'movie' })).toBe('movie-42');
  });

  // Branch coverage: tv mediaType produces a different key from movie.
  it('distinguishes between movie and tv media types', () => {
    expect(getMediaKey({ id: 42, mediaType: 'tv' })).toBe('tv-42');
  });
});

describe('deduplicateMedia', () => {
  // Statement coverage: no argument uses the default empty array and returns an empty array.
  it('returns an empty array when called without arguments', () => {
    expect(deduplicateMedia()).toEqual([]);
  });

  // Statement coverage: empty array input returns an empty array.
  it('returns an empty array for an empty array', () => {
    expect(deduplicateMedia([])).toEqual([]);
  });

  // Branch coverage: item without a mediaType is skipped.
  it('removes an item without a mediaType', () => {
    expect(deduplicateMedia([{ id: 1 }])).toEqual([]);
  });

  // Branch coverage: item with a null id is skipped.
  it('removes an item with a null id', () => {
    expect(deduplicateMedia([{ id: null, mediaType: 'movie' }])).toEqual([]);
  });

  // Statement coverage: list with unique media keys is returned unchanged.
  it('returns all items when all media keys are unique', () => {
    const items = [
      { id: 1, mediaType: 'movie' },
      { id: 2, mediaType: 'movie' },
      { id: 1, mediaType: 'tv' }
    ];
    expect(deduplicateMedia(items)).toEqual(items);
  });

  // Branch coverage: second occurrence of the same mediaType-id combination is removed.
  it('removes the second occurrence of a duplicate media item', () => {
    const items = [
      { id: 1, mediaType: 'movie', title: 'first' },
      { id: 1, mediaType: 'movie', title: 'second' }
    ];
    expect(deduplicateMedia(items)).toEqual([{ id: 1, mediaType: 'movie', title: 'first' }]);
  });

  // Branch coverage: same id with different mediaType is treated as a distinct item.
  it('keeps items with the same id but different mediaType', () => {
    const items = [
      { id: 5, mediaType: 'movie' },
      { id: 5, mediaType: 'tv' }
    ];
    expect(deduplicateMedia(items)).toEqual(items);
  });

  // Statement coverage: original order is maintained after deduplication.
  it('preserves the original order of items', () => {
    const items = [
      { id: 3, mediaType: 'movie' },
      { id: 1, mediaType: 'tv' },
      { id: 2, mediaType: 'movie' }
    ];
    expect(deduplicateMedia(items)).toEqual(items);
  });

  // Branch coverage: mixed valid, invalid, and duplicate items are handled in one pass.
  it('filters out invalid items and deduplicates in one pass', () => {
    const items = [
      { id: 1, mediaType: 'movie' },
      { id: null, mediaType: 'movie' },
      { id: 1, mediaType: 'movie' },
      { id: 2, mediaType: 'tv' }
    ];
    expect(deduplicateMedia(items)).toEqual([
      { id: 1, mediaType: 'movie' },
      { id: 2, mediaType: 'tv' }
    ]);
  });
});
