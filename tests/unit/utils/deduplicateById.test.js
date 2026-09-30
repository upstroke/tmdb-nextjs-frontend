import { describe, expect, it } from 'vitest';
import { deduplicateById } from '@/lib/utils/deduplicateById.js';

describe('deduplicateById', () => {
  it('returns an empty array for an empty input', () => {
    expect(deduplicateById([])).toEqual([]);
  });

  it('returns an empty array when called with no arguments', () => {
    expect(deduplicateById()).toEqual([]);
  });

  it('keeps a single unique item', () => {
    expect(deduplicateById([{ id: 1, name: 'a' }])).toEqual([{ id: 1, name: 'a' }]);
  });

  it('removes duplicate IDs, keeping the first occurrence', () => {
    const input = [
      { id: 1, name: 'first' },
      { id: 2, name: 'second' },
      { id: 1, name: 'duplicate' },
    ];
    const result = deduplicateById(input);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('first');
  });

  it('removes items without an id', () => {
    const input = [{ id: 1 }, { name: 'no-id' }, { id: null }, { id: undefined }];
    expect(deduplicateById(input)).toEqual([{ id: 1 }]);
  });

  it('preserves the original order of unique items', () => {
    const input = [{ id: 3 }, { id: 1 }, { id: 2 }, { id: 1 }];
    expect(deduplicateById(input).map((i) => i.id)).toEqual([3, 1, 2]);
  });

  it('handles string IDs', () => {
    const input = [{ id: 'a' }, { id: 'b' }, { id: 'a' }];
    expect(deduplicateById(input)).toHaveLength(2);
  });
});
