import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getStoredPage,
  storeCurrentPage,
  restorePagedList,
} from '@/lib/utils/pageStateRestore';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeSessionStorage() {
  const store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
  };
}

// ─── getStoredPage ───────────────────────────────────────────────────────────

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

  it('returns 1 during SSR (no window)', () => {
    delete global.window;
    expect(getStoredPage('key')).toBe(1);
  });

  it('returns stored page number', () => {
    storageMock.setItem('key', '5');
    expect(getStoredPage('key')).toBe(5);
  });

  it('returns 1 when nothing is stored', () => {
    expect(getStoredPage('key')).toBe(1);
  });

  it('returns 1 when stored value is 0', () => {
    storageMock.setItem('key', '0');
    expect(getStoredPage('key')).toBe(1);
  });

  it('returns 1 when stored value is NaN', () => {
    storageMock.setItem('key', 'not-a-number');
    expect(getStoredPage('key')).toBe(1);
  });

  it('returns 1 when sessionStorage throws', () => {
    global.sessionStorage = {
      getItem: () => { throw new Error('blocked'); },
    };
    expect(getStoredPage('key')).toBe(1);
  });
});

// ─── storeCurrentPage ────────────────────────────────────────────────────────

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

  it('saves the page number as a string', () => {
    storeCurrentPage('key', 3);
    expect(storageMock.getItem('key')).toBe('3');
  });

  it('does nothing during SSR (no window)', () => {
    delete global.window;
    storeCurrentPage('key', 3);
    expect(storageMock.getItem('key')).toBeNull();
  });

  it('silently ignores storage errors', () => {
    global.sessionStorage = {
      setItem: () => { throw new Error('quota exceeded'); },
    };
    expect(() => storeCurrentPage('key', 3)).not.toThrow();
  });
});

// ─── restorePagedList ────────────────────────────────────────────────────────

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

  it('deduplicates cards that already exist', async () => {
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

  it('does not append new cards when all incoming cards are duplicates', async () => {
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

  it('uses fallbacks when initialData fields are missing', async () => {
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
