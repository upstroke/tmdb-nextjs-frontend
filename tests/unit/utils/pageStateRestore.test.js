/**
 * Unit tests for lib/utils/pageStateRestore.js.
 *
 * The three exported functions are tested in isolation:
 *
 * - getStoredPage   – reads and normalises a page number from sessionStorage.
 * - storeCurrentPage – persists the current page number to sessionStorage.
 * - restorePagedList – orchestrates page restoration by fetching missing pages
 *                      and deduplicating the resulting card list.
 *
 * sessionStorage is replaced with a plain in-memory stub so the tests run
 * in Node/jsdom without any real storage side-effects.
 * The SSR path (typeof window === 'undefined') is tested by temporarily
 * deleting global.window.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getStoredPage,
  storeCurrentPage,
  restorePagedList,
} from '@/lib/utils/pageStateRestore';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeSessionStorage() {
  const store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
  };
}

// ─── getStoredPage ────────────────────────────────────────────────────────────

describe('getStoredPage', () => {
  let originalWindow;
  let storageMock;

  beforeEach(() => {
    originalWindow = global.window;
    storageMock = makeSessionStorage();
    global.window = {};
    global.sessionStorage = storageMock;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  // Statement coverage: typeof window === 'undefined' branch returns 1 immediately.
  it('returns 1 during SSR (no window)', () => {
    delete global.window;
    expect(getStoredPage('key')).toBe(1);
  });

  // Statement coverage: happy path – stored numeric string is parsed and returned.
  it('returns the stored page number', () => {
    storageMock.setItem('key', '5');
    expect(getStoredPage('key')).toBe(5);
  });

  // Branch coverage: getItem returns null → nullish coalescing falls back to '1'.
  it('returns 1 when nothing is stored', () => {
    expect(getStoredPage('key')).toBe(1);
  });

  // Branch coverage: Number('0') is 0 → Math.max(1, 0) clamps to 1.
  it('returns 1 when the stored value is 0', () => {
    storageMock.setItem('key', '0');
    expect(getStoredPage('key')).toBe(1);
  });

  // Branch coverage: Number('not-a-number') is NaN → || 1 fallback produces 1.
  it('returns 1 when the stored value is not a number', () => {
    storageMock.setItem('key', 'not-a-number');
    expect(getStoredPage('key')).toBe(1);
  });

  // Branch coverage: sessionStorage.getItem throws → catch block returns 1.
  it('returns 1 when sessionStorage throws', () => {
    global.sessionStorage = {
      getItem: () => { throw new Error('blocked'); },
    };
    expect(getStoredPage('key')).toBe(1);
  });
});

// ─── storeCurrentPage ─────────────────────────────────────────────────────────

describe('storeCurrentPage', () => {
  let originalWindow;
  let storageMock;

  beforeEach(() => {
    originalWindow = global.window;
    storageMock = makeSessionStorage();
    global.window = {};
    global.sessionStorage = storageMock;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  // Statement coverage: happy path – page number is converted to string and stored.
  it('saves the page number as a string', () => {
    storeCurrentPage('key', 3);
    expect(storageMock.getItem('key')).toBe('3');
  });

  // Statement coverage: typeof window === 'undefined' branch returns early without writing.
  it('does nothing during SSR (no window)', () => {
    delete global.window;
    storeCurrentPage('key', 3);
    expect(storageMock.getItem('key')).toBeNull();
  });

  // Branch coverage: sessionStorage.setItem throws → catch block suppresses the error.
  it('silently ignores storage errors', () => {
    global.sessionStorage = {
      setItem: () => { throw new Error('quota exceeded'); },
    };
    expect(() => storeCurrentPage('key', 3)).not.toThrow();
  });
});

// ─── restorePagedList ─────────────────────────────────────────────────────────

describe('restorePagedList', () => {
  let originalWindow;
  let storageMock;

  beforeEach(() => {
    originalWindow = global.window;
    storageMock = makeSessionStorage();
    global.window = {};
    global.sessionStorage = storageMock;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  const card = (id) => ({ id, media_type: 'movie' });

  // Statement coverage: storedPage (1) <= currentPage (1) → early return with initialData.
  it('returns initialData as-is when storedPage <= currentPage', async () => {
    storageMock.setItem('key', '1');
    const initialData = {
      featured: { id: 99 },
      cards: [card(1), card(2)],
      page: 1,
      hasMore: true,
    };

    const result = await restorePagedList({
      storageKey: 'key',
      initialData,
      fetchPageData: vi.fn(),
    });

    expect(result.page).toBe(1);
    expect(result.cards).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.featured).toEqual({ id: 99 });
  });

  // Statement coverage: typeof window === 'undefined' branch → early return with initialData.
  it('returns initialData during SSR (no window)', async () => {
    delete global.window;
    const initialData = { cards: [card(1)], page: 1, hasMore: false };

    const result = await restorePagedList({
      storageKey: 'key',
      initialData,
      fetchPageData: vi.fn(),
    });

    expect(result.page).toBe(1);
  });

  // Statement coverage: storedPage > currentPage → for-loop fetches all missing pages.
  it('fetches and appends missing pages up to storedPage', async () => {
    storageMock.setItem('key', '3');
    const initialData = { cards: [card(1)], page: 1, hasMore: true };

    const fetchPageData = vi.fn()
      .mockResolvedValueOnce({ cards: [card(2)], page: 2, hasMore: true })
      .mockResolvedValueOnce({ cards: [card(3)], page: 3, hasMore: false });

    const result = await restorePagedList({ storageKey: 'key', initialData, fetchPageData });

    expect(fetchPageData).toHaveBeenCalledTimes(2);
    expect(result.page).toBe(3);
    expect(result.hasMore).toBe(false);
    expect(result.cards).toHaveLength(3);
  });

  // Branch coverage: incoming card already in existingKeys → filtered out by the Set check.
  it('deduplicates cards that already exist in the list', async () => {
    storageMock.setItem('key', '2');
    const initialData = { cards: [card(1), card(2)], page: 1, hasMore: true };

    const fetchPageData = vi.fn().mockResolvedValueOnce({
      cards: [card(2), card(3)],
      page: 2,
      hasMore: false,
    });

    const result = await restorePagedList({ storageKey: 'key', initialData, fetchPageData });

    expect(result.cards).toHaveLength(3);
    expect(result.cards.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  // Branch coverage: newCards.length === 0 → currentCards spread is skipped.
  it('does not append cards when all incoming cards are duplicates', async () => {
    storageMock.setItem('key', '2');
    const initialData = { cards: [card(1), card(2)], page: 1, hasMore: true };

    const fetchPageData = vi.fn().mockResolvedValueOnce({
      cards: [card(1), card(2)],
      page: 2,
      hasMore: false,
    });

    const result = await restorePagedList({ storageKey: 'key', initialData, fetchPageData });

    expect(result.cards).toHaveLength(2);
  });

  // Branch coverage: missing initialData fields → nullish coalescing fallbacks are applied.
  it('uses fallback values when initialData fields are missing', async () => {
    storageMock.setItem('key', '1');
    const result = await restorePagedList({
      storageKey: 'key',
      initialData: {},
      fetchPageData: vi.fn(),
    });

    expect(result.cards).toEqual([]);
    expect(result.featured).toBeNull();
    expect(result.page).toBe(1);
    expect(result.hasMore).toBe(false);
  });

  // Statement coverage: currentFeatured is preserved via ?? across all fetched pages.
  it('retains featured from initialData across fetched pages', async () => {
    storageMock.setItem('key', '2');
    const initialData = { featured: { id: 42 }, cards: [card(1)], page: 1, hasMore: true };

    const fetchPageData = vi.fn().mockResolvedValueOnce({
      cards: [card(2)],
      page: 2,
      hasMore: false,
    });

    const result = await restorePagedList({ storageKey: 'key', initialData, fetchPageData });

    expect(result.featured).toEqual({ id: 42 });
  });
});
