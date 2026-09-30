import { describe, expect, it } from 'vitest';
import { deduplicateMedia, getMediaKey } from '@/lib/utils/deduplicateMedia.js';

describe('getMediaKey', () => {
  it('returns a combined key for a valid item', () => {
    expect(getMediaKey({ id: 1, mediaType: 'movie' })).toBe('movie-1');
  });

  it('returns null when id is missing', () => {
    expect(getMediaKey({ mediaType: 'movie' })).toBeNull();
  });

  it('returns null when mediaType is missing', () => {
    expect(getMediaKey({ id: 1 })).toBeNull();
  });

  it('returns null for null input', () => {
    expect(getMediaKey(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(getMediaKey(undefined)).toBeNull();
  });
});

describe('deduplicateMedia', () => {
  it('returns an empty array for empty input', () => {
    expect(deduplicateMedia([])).toEqual([]);
  });

  it('returns an empty array when called with no arguments', () => {
    expect(deduplicateMedia()).toEqual([]);
  });

  it('keeps a single unique item', () => {
    const input = [{ id: 1, mediaType: 'movie' }];
    expect(deduplicateMedia(input)).toEqual(input);
  });

  it('removes duplicate mediaType+id combinations', () => {
    const input = [
      { id: 1, mediaType: 'movie' },
      { id: 1, mediaType: 'movie' },
    ];
    expect(deduplicateMedia(input)).toHaveLength(1);
  });

  it('keeps items with the same id but different mediaType', () => {
    const input = [
      { id: 1, mediaType: 'movie' },
      { id: 1, mediaType: 'tv' },
    ];
    expect(deduplicateMedia(input)).toHaveLength(2);
  });

  it('skips items without a valid key', () => {
    const input = [
      { id: 1, mediaType: 'movie' },
      { mediaType: 'tv' },
      { id: 2 },
    ];
    expect(deduplicateMedia(input)).toHaveLength(1);
  });

  it('preserves the original order', () => {
    const input = [
      { id: 3, mediaType: 'tv' },
      { id: 1, mediaType: 'movie' },
      { id: 3, mediaType: 'tv' },
    ];
    const result = deduplicateMedia(input);
    expect(result.map((i) => i.id)).toEqual([3, 1]);
  });
});
