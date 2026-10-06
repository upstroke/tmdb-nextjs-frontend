/**
 * The tests cover empty input, items without IDs, items with duplicate IDs,
 * and the preserved order guarantee of deduplicateById.
 */
import { describe, expect, it } from 'vitest';
import { deduplicateById } from '@/lib/utils/deduplicateById.js';

describe('deduplicateById', () => {
  // Statement coverage: no argument uses the default empty array and returns an empty array.
  it('returns an empty array when called without arguments', () => {
    expect(deduplicateById()).toEqual([]);
  });

  // Statement coverage: empty array input returns an empty array.
  it('returns an empty array for an empty array', () => {
    expect(deduplicateById([])).toEqual([]);
  });

  // Branch coverage: item without an id property is removed.
  it('removes an item that has no id property', () => {
    expect(deduplicateById([{ title: 'no id' }])).toEqual([]);
  });

  // Branch coverage: item with id null is removed.
  it('removes an item with a null id', () => {
    expect(deduplicateById([{ id: null }])).toEqual([]);
  });

  // Branch coverage: item with id undefined is removed.
  it('removes an item with an undefined id', () => {
    expect(deduplicateById([{ id: undefined }])).toEqual([]);
  });

  // Statement coverage: list with unique IDs is returned unchanged.
  it('returns all items when all IDs are unique', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(deduplicateById(items)).toEqual(items);
  });

  // Branch coverage: second occurrence of a duplicate ID is removed.
  it('removes the second occurrence of a duplicate ID', () => {
    const items = [
      { id: 1, name: 'first' },
      { id: 1, name: 'second' }
    ];
    expect(deduplicateById(items)).toEqual([{ id: 1, name: 'first' }]);
  });

  // Branch coverage: only the first occurrence is kept when there are multiple duplicates.
  it('keeps only the first occurrence when multiple duplicates exist', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }, { id: 2 }];
    expect(deduplicateById(items)).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  // Branch coverage: string IDs are deduplicated the same way as numeric IDs.
  it('deduplicates items with string IDs', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'a' }];
    expect(deduplicateById(items)).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  // Statement coverage: original order is maintained after deduplication.
  it('preserves the original order of items', () => {
    const items = [{ id: 3 }, { id: 1 }, { id: 2 }];
    expect(deduplicateById(items)).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
  });

  // Branch coverage: mixed valid and invalid items result in only valid unique items.
  it('filters out invalid items and deduplicates in one pass', () => {
    const items = [{ id: 1 }, { title: 'no id' }, { id: 1 }, { id: 2 }];
    expect(deduplicateById(items)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
