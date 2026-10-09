// vitest/component/PagedList.missing-scroll-target.browser.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PagedList from '../../../components/PagedList.jsx';

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

// Intentionally ignore scrollId so the target element never exists in the DOM.
vi.mock('@/components/CardDefault', () => ({
  default: ({ title }) => React.createElement('div', { 'data-testid': 'mock-card' }, title)
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

vi.mock('@/lib/utils/pageStateRestore', () => ({
  restorePagedList: vi.fn(({ initialData }) =>
    Promise.resolve({
      featured: initialData.featured ?? null,
      cards: initialData.cards ?? [],
      page: 1,
      hasMore: true
    })
  ),
  storeCurrentPage: vi.fn()
}));

describe('PagedList missing scroll target (browser)', () => {
  const sampleInitialData = {
    featured: null,
    cards: [
      { id: 10, title: 'Movie Ten', mediaType: 'movie' },
      { id: 20, title: 'Show Twenty', mediaType: 'tv' }
    ]
  };

  let fetchSpy;
  let getElementByIdSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          page: 2,
          hasMore: true,
          cards: [{ id: 30, title: 'Movie Thirty', mediaType: 'movie' }]
        })
    });

    getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(null);

    globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }));
  });

  // TC-PL-MST-01
  // Statement Coverage: Covers the scroll restoration branch where the computed target id does not exist in the DOM.
  it('clears the pending scroll target when the loaded card id cannot be found', async () => {
    render(
      <PagedList
        initialData={sampleInitialData}
        apiPath="trending"
        storageKey="missing-target-key"
        cardIdPrefix="missing-target"
        listKeyPrefix="list"
      />
    );

    expect(await screen.findAllByTestId('mock-card')).toHaveLength(2);

    fireEvent.click(screen.getByTestId('load-more-btn'));

    await waitFor(() => {
      expect(screen.getAllByTestId('mock-card')).toHaveLength(3);
    });

    await waitFor(() => {
      expect(getElementByIdSpy).toHaveBeenCalledWith('missing-target-3');
    });
  });
});
