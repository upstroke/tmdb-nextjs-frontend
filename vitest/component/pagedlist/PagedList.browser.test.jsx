// vitest/component/PagedList.browser.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PagedList from '../../../components/PagedList.jsx';

// ============================================================================
// SYSTEM & UTILITY MOCKS
// ============================================================================
vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    messages: {
      loadMoreError: 'Failed to fetch more content.',
      unknownError: 'An unexpected error occurred.',
      loadTimeout: 'The request timed out.',
      noContent: 'No items available at the moment.'
    }
  }),
  useLocale: () => 'en-US'
}));

// Mock sub-components to bypass complex child layouts and keep metrics focused
vi.mock('@/components/CardDefault', () => ({
  default: ({ title, scrollId }) =>
    React.createElement('div', { 'data-testid': 'mock-card', id: scrollId }, title)
}));

vi.mock('@/components/CardFeatured', () => ({
  default: ({ title }) => React.createElement('div', { 'data-testid': 'mock-featured' }, title)
}));

vi.mock('@/components/LoadMore', () => ({
  default: ({ hasMore, loading, onLoad }) =>
    hasMore
      ? React.createElement(
          'button',
          { onClick: onLoad, disabled: loading, 'data-testid': 'load-more-btn' },
          loading ? 'Loading...' : 'Load More'
        )
      : null
}));

vi.mock('@/components/DialogMessage', () => ({
  default: ({ message }) => React.createElement('div', { 'data-testid': 'mock-dialog' }, message)
}));

// Mock helper core utilities to isolate state behavior
vi.mock('@/lib/utils/pageStateRestore', () => ({
  restorePagedList: vi.fn(({ initialData }) =>
    Promise.resolve({
      featured: initialData.featured,
      cards: initialData.cards,
      page: 1,
      hasMore: true
    })
  ),
  storeCurrentPage: vi.fn()
}));

describe('PagedList (browser)', () => {
  const sampleInitialData = {
    featured: { id: 1, title: 'Featured Blockbuster', mediaType: 'movie' },
    cards: [
      { id: 10, title: 'Movie Ten', mediaType: 'movie' },
      { id: 20, title: 'Show Twenty', mediaType: 'tv' }
    ]
  };

  let fetchSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    // Wraps the native fetch API inside Chromium safely
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ cards: [], page: 2, hasMore: false })
      })
    );

    // Stub IntersectionObserver interface for scroll-into-view triggers
    globalThis.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(() => {
        // Automatically mock item visibility detection to trigger code paths
        callback([{ isIntersecting: true }], { disconnect: vi.fn() });
      }),
      disconnect: vi.fn()
    }));
  });

  // TC-PL-01
  // Statement Coverage: Covers list grid layout loops, staggering calculations, and child mapping.
  it('mounts, restores data, renders list grid layout, and processes smooth scroll observations', async () => {
    const elementMock = document.createElement('div');
    elementMock.id = 'prefix-card-3';
    elementMock.scrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue(elementMock);

    // Mock successful lazy load API responses using the spy instance
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          page: 2,
          hasMore: false,
          cards: [{ id: 30, title: 'Movie Thirty', mediaType: 'movie' }]
        })
    });

    render(
      <PagedList
        initialData={sampleInitialData}
        apiPath="trending"
        storageKey="trending-list-key"
        cardIdPrefix="prefix-card"
        listKeyPrefix="key-prefix"
        heading="Trending Highlights"
      />
    );

    // Await asynchronously until the state mapping renders structural layouts inside the DOM
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Trending Highlights' })
    ).toBeInTheDocument();
    expect(await screen.findByTestId('mock-featured')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-card')).toHaveLength(2);

    // Fire interactive pagination load action
    const btn = await screen.findByTestId('load-more-btn');
    fireEvent.click(btn);

    // Await async items insertions and verify observer triggers smooth scrolls
    await waitFor(() => {
      expect(screen.getAllByTestId('mock-card')).toHaveLength(3);
      expect(elementMock.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  // TC-PL-02
  // Branch Coverage: Enters the layout view when empty fallback labels require structural mapping evaluations.
  it('renders default empty container status view when no items are supplied', async () => {
    const { restorePagedList } = await import('@/lib/utils/pageStateRestore.js');
    restorePagedList.mockResolvedValueOnce({ featured: null, cards: [], page: 1, hasMore: false });

    render(
      <PagedList
        initialData={{ cards: [] }}
        apiPath="movies"
        storageKey="empty-key"
        cardIdPrefix="c"
        listKeyPrefix="l"
      />
    );

    // Verifies that default i18n text fallback gets resolved and printed
    expect(await screen.findByText('No items available at the moment.')).toBeInTheDocument();
  });

  // TC-PL-03
  // Statement Coverage: Covers catch exception assignment logic for fetch failures.
  it('displays dialog message overlays upon encountering unexpected network API faults', async () => {
    const { restorePagedList } = await import('@/lib/utils/pageStateRestore.js');
    restorePagedList.mockResolvedValueOnce({
      featured: null,
      cards: sampleInitialData.cards,
      page: 1,
      hasMore: true
    });

    // Inject network fault failure response using the fetch spy
    fetchSpy.mockResolvedValueOnce({ ok: false });

    render(
      <PagedList
        initialData={sampleInitialData}
        apiPath="tv"
        storageKey="error-key"
        cardIdPrefix="c"
        listKeyPrefix="l"
      />
    );

    const btn = await screen.findByTestId('load-more-btn');
    fireEvent.click(btn);

    // Verify alert message rendering
    expect(await screen.findByTestId('mock-dialog')).toHaveTextContent(
      'Failed to fetch more content.'
    );
  });

  // TC-PL-04
  // Branch Coverage: Verifies that AbortError exceptions seamlessly map into unique visibility warning layouts.
  it('handles pagination loading request timeouts properly', async () => {
    const { restorePagedList } = await import('@/lib/utils/pageStateRestore.js');
    restorePagedList.mockResolvedValueOnce({
      featured: null,
      cards: sampleInitialData.cards,
      page: 1,
      hasMore: true
    });

    // Inject explicit structural AbortError throw event mimic via the spy
    fetchSpy.mockRejectedValueOnce({ name: 'AbortError' });

    render(
      <PagedList
        initialData={sampleInitialData}
        apiPath="tv"
        storageKey="timeout-key"
        cardIdPrefix="c"
        listKeyPrefix="l"
      />
    );

    const btn = await screen.findByTestId('load-more-btn');
    fireEvent.click(btn);

    expect(await screen.findByTestId('mock-dialog')).toHaveTextContent('The request timed out.');
  });

  // TC-PL-05
  // Statement Coverage: Covers the duplicate-only pagination path that stops further loading and stores the unchanged current page.
  it('stops pagination when the next page only contains duplicate media items', async () => {
    const { restorePagedList, storeCurrentPage } = await import('@/lib/utils/pageStateRestore.js');

    restorePagedList.mockResolvedValueOnce({
      featured: null,
      cards: sampleInitialData.cards,
      page: 1,
      hasMore: true
    });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          page: 2,
          hasMore: true,
          cards: [
            { id: 10, title: 'Movie Ten', mediaType: 'movie' },
            { id: 20, title: 'Show Twenty', mediaType: 'tv' }
          ]
        })
    });

    render(
      <PagedList
        initialData={sampleInitialData}
        apiPath="trending"
        storageKey="duplicate-key"
        cardIdPrefix="prefix-card"
        listKeyPrefix="key-prefix"
      />
    );

    const btn = await screen.findByTestId('load-more-btn');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(storeCurrentPage).toHaveBeenCalledWith('duplicate-key', 1);
    });

    expect(screen.getAllByTestId('mock-card')).toHaveLength(2);
    expect(screen.queryByTestId('load-more-btn')).not.toBeInTheDocument();
  });

  // TC-PL-06
  // Statement Coverage: Covers the initial restore failure path and renders the recovered error message.
  it('shows an error dialog when restoring the paged list fails on mount', async () => {
    const { restorePagedList } = await import('@/lib/utils/pageStateRestore.js');

    restorePagedList.mockRejectedValueOnce(new Error('Restore failed.'));

    render(
      <PagedList
        initialData={{ cards: [] }}
        apiPath="movies"
        storageKey="restore-error-key"
        cardIdPrefix="c"
        listKeyPrefix="l"
      />
    );

    expect(await screen.findByTestId('mock-dialog')).toHaveTextContent('Restore failed.');
  });

  // TC-PL-07
  // Statement Coverage: Covers the initial restore mapping for featured item, cards, current page, and hasMore.
  it('restores featured content, cards, page, and hasMore state on mount', async () => {
    const { restorePagedList } = await import('@/lib/utils/pageStateRestore.js');

    restorePagedList.mockResolvedValueOnce({
      featured: { id: 99, title: 'Restored Featured', mediaType: 'movie' },
      cards: [
        { id: 1, title: 'Restored One', mediaType: 'movie' },
        { id: 2, title: 'Restored Two', mediaType: 'tv' }
      ],
      page: 3,
      hasMore: true
    });

    render(
      <PagedList
        initialData={{ cards: [] }}
        apiPath="trending"
        storageKey="restore-key"
        cardIdPrefix="card"
        listKeyPrefix="list"
        heading="Restored Heading"
      />
    );

    expect(await screen.findByTestId('mock-featured')).toHaveTextContent('Restored Featured');
    expect(screen.getAllByTestId('mock-card')).toHaveLength(2);
    expect(screen.getByTestId('load-more-btn')).toBeInTheDocument();
  });
});
