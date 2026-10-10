// vitest/component/TypeHeadSearch.browser.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TypeHeadSearch from '../../../components/TypeHeadSearch.jsx';

// ============================================================================
// STABLE SYSTEM & CORE MODULE MOCKS
// ============================================================================
const { mockReplace, mockPush } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockPush: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    prefetch: vi.fn()
  })
}));

vi.mock('@/lib/stores/locale', () => ({
  useLocale: () => 'en-US',
  useI18n: () => ({
    labels: {
      searchHint: 'Type at least 4 characters to search',
      searchInputLabel: 'Search movies and TV shows',
      searchClear: 'Clear search query',
      movieSection: 'Movies',
      tvSection: 'TV Shows',
      ratingLabel: 'Rating:',
      releaseDate: 'Release date',
      firstAirDate: 'First air date'
    },
    messages: {
      searchLoading: 'Searching for suggestions...',
      searchNoResults: 'No results found',
      searchError: 'Search request failed.'
    },
    formats: { outOfTen: 'out of 10' },
    titles: {},
    fallbacks: { notAvailable: 'N/A' }
  })
}));

// Synchronized mock result containing both API and rendering keys
const mockSearchResults = {
  movies: [
    {
      id: 101,
      title: 'Spider-Man',
      mediaType: 'movie',
      vote_average: 8.45,
      release_date: '2026-07-29',
      date: '2026-07-29',
      rating: 8.45
    }
  ],
  tvShows: [
    {
      id: 72705,
      title: "Marvel's Spider-Man",
      mediaType: 'tv',
      vote_average: 7.2,
      release_date: '2017-08-19',
      date: '2017-08-19',
      rating: 7.2
    }
  ]
};

describe('TypeHeadSearch (browser)', () => {
  let fetchSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    Element.prototype.scrollIntoView = function () {};

    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchResults)
      })
    );
  });

  // TC-THS-01
  // Statement Coverage: Covers mounting state restoration, inputs bindings, and layouts generation.
  // Branch Coverage: hasSearchTerm && hasResults -> true (renders combobox lists grid layers)
  it('mounts, restores data from sessionStorage, and opens suggestions grid layer upon entering query keys', async () => {
    window.top.sessionStorage.clear();
    window.top.sessionStorage.setItem('search-query', 'Spid');
    window.top.sessionStorage.setItem('search-movies', JSON.stringify(mockSearchResults.movies));
    window.top.sessionStorage.setItem('search-tv', JSON.stringify([]));
    window.top.sessionStorage.setItem('search-results-closed', 'false');

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const container = await screen.findByRole('option', { name: /Spider-Man/i });
    expect(container).toBeInTheDocument();

    expect(container.textContent).toContain('2026');
    expect(container.textContent).toContain('8.4');
  });

  // TC-THS-02
  // Statement Coverage: Covers input debouncing timers setup and abort controllers allocations.
  // Branch Coverage: query.trim().length >= 4 -> true (invokes backend API fetch hooks)
  it('debounces input queries, triggers backend API requests, and lists suggestions successfully', async () => {
    vi.useFakeTimers();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Batm' } });

    await vi.advanceTimersByTimeAsync(350);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/en-US/search?q=Batm'),
      expect.any(Object)
    );

    vi.useRealTimers();
  });

  // TC-THS-03
  // Statement Coverage: Covers resetResults cleanup statements and sessionStorage clear invocations.
  // Branch Coverage: query.trim().length < 4 -> true (triggers immediate state purges code path)
  it('collapses the dropdown layer instantly when input falls below 4 characters', async () => {
    window.top.sessionStorage.setItem('search-query', 'Spiderman');
    window.top.sessionStorage.setItem('search-movies', JSON.stringify(mockSearchResults.movies));
    window.top.sessionStorage.setItem('search-results-closed', 'false');

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Spiderman' } });

    expect(await screen.findByText(/^Spider-Man$/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'S' } });

    await waitFor(() => {
      expect(screen.queryByText(/^Spider-Man$/i)).not.toBeInTheDocument();
    });
  });

  // TC-THS-04
  // Statement Coverage: Covers debounced cache invalidation logic and sessionStorage cleanup paths.
  // Branch Coverage: query.trim().length < 4 -> true after previously populated results (purges persisted search state)
  it('purges the sessionStorage cache when character thresholds are under-run', async () => {
    window.top.sessionStorage.setItem('search-query', 'Spiderman');
    window.top.sessionStorage.setItem('search-movies', JSON.stringify(mockSearchResults.movies));
    window.top.sessionStorage.setItem('search-results-closed', 'false');

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Spiderman' } });

    expect(await screen.findByText(/^Spider-Man$/i)).toBeInTheDocument();

    vi.useFakeTimers();
    fireEvent.change(input, { target: { value: 'S' } });
    vi.advanceTimersByTime(350);
    vi.useRealTimers();

    await waitFor(() => {
      expect(window.top.sessionStorage.getItem('search-query')).toBeNull();
    });
  });

  // TC-THS-05
  // Branch Coverage: res.ok -> false & empty results sets
  it('handles backend server network crashes and empty results sets elegantly', async () => {
    vi.useFakeTimers();
    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ movies: [], tvShows: [] })
    });

    fireEvent.change(input, { target: { value: 'UnknownQuery' } });
    vi.advanceTimersByTime(350);
    vi.useRealTimers();

    expect(await screen.findByText('No results found')).toBeInTheDocument();

    fetchSpy.mockResolvedValueOnce({ ok: false });

    fireEvent.change(input, { target: { value: 'CrashQuery' } });
    vi.useFakeTimers();
    vi.advanceTimersByTime(350);
    vi.useRealTimers();

    expect(await screen.findByText('Search request failed.')).toBeInTheDocument();
  });

  // TC-THS-06
  // Statement Coverage: Covers keyboard-only focus entry, result activation updates, and directional navigation state changes.
  // Branch Coverage: activeResultIndex moves forward on ArrowDown and backward on ArrowUp while results remain open
  it('navigates through search results using keyboard only', async () => {
    const user = userEvent.setup();

    render(<TypeHeadSearch />);

    await user.tab();

    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();

    await user.keyboard('Spid');
    expect(input).toHaveValue('Spid');

    const firstTitle = await screen.findByText(/^Spider-Man$/i);
    const secondTitle = await screen.findByText(/^Marvel's Spider-Man$/i);

    const firstOption = firstTitle.closest('a[role="option"]');
    const secondOption = secondTitle.closest('a[role="option"]');

    expect(firstOption).toBeInTheDocument();
    expect(secondOption).toBeInTheDocument();
    expect(input).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
      expect(secondOption).toHaveAttribute('aria-selected', 'false');
    });

    expect(input).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      expect(firstOption).toHaveAttribute('aria-selected', 'false');
      expect(secondOption).toHaveAttribute('aria-selected', 'true');
    });

    expect(input).toHaveFocus();

    await user.keyboard('{ArrowUp}');

    await waitFor(() => {
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
      expect(secondOption).toHaveAttribute('aria-selected', 'false');
    });

    expect(input).toHaveFocus();
  });

  // TC-THS-07
  // Statement Coverage: Covers Home/End keyboard navigation handlers and result selection updates.
  // Branch Coverage: Home -> selects first result; End -> selects last result once a result is focused
  it('navigates to first and last search results using Home/End keys once a result is focused', async () => {
    const user = userEvent.setup();

    render(<TypeHeadSearch />);

    await user.tab();

    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();

    await user.keyboard('Spid');
    expect(input).toHaveValue('Spid');

    const firstTitle = await screen.findByText(/^Spider-Man$/i);
    const lastTitle = await screen.findByText(/^Marvel's Spider-Man$/i);

    const firstOption = firstTitle.closest('a[role="option"]');
    const lastOption = lastTitle.closest('a[role="option"]');

    expect(firstOption).toBeInTheDocument();
    expect(lastOption).toBeInTheDocument();

    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });

    await user.keyboard('{End}');

    await waitFor(() => {
      expect(firstOption).toHaveAttribute('aria-selected', 'false');
      expect(lastOption).toHaveAttribute('aria-selected', 'true');
    });

    expect(input).toHaveFocus();

    await user.keyboard('{Home}');

    await waitFor(() => {
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
      expect(lastOption).toHaveAttribute('aria-selected', 'false');
    });

    expect(input).toHaveFocus();
  });

  // TC-THS-08
  // Statement Coverage: Covers Escape key handler and dropdown closing state update.
  // Branch Coverage: results open -> Escape closes suggestions layer without clearing input value
  it('closes search results using Escape key', async () => {
    const user = userEvent.setup();

    render(<TypeHeadSearch />);

    await user.tab();

    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();

    await user.keyboard('Spid');
    expect(input).toHaveValue('Spid');

    expect(await screen.findByText(/^Spider-Man$/i)).toBeInTheDocument();

    const resultsDropdown = document.querySelector('.results-dropdown');
    expect(resultsDropdown).not.toHaveAttribute('hidden');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(resultsDropdown).toHaveAttribute('hidden');
    });

    expect(input).toHaveValue('Spid');
    expect(input).toHaveFocus();
  });

  // TC-THS-09
  // Branch Coverage: Covers the Escape key path when results exist and the listbox remains rendered but hidden after closing.
  it('closes the results panel on Escape by hiding the rendered listbox', async () => {
    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Spider' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const listboxBeforeClose = await screen.findByRole('listbox');
    expect(listboxBeforeClose).not.toHaveAttribute('hidden');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(input, { key: 'Escape' });

    const listboxAfterClose = document.getElementById('typeahead-search-results');

    await waitFor(() => {
      expect(listboxAfterClose).toHaveAttribute('hidden');
    });
  });

  // TC-THS-10
  // Statement Coverage: Covers the fallback rendering path for missing poster, title, date, and rating values.
  it('renders fallback values for incomplete movie search results', async () => {
    sessionStorage.clear();
    fetchSpy.mockReset();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        movies: [
          {
            id: 101,
            mediaType: 'movie',
            title: '',
            date: '',
            rating: null,
            posterUrl: '',
            imageUrl: ''
          }
        ],
        tvShows: []
      })
    });

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Spider' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const option = await screen.findByRole('option');
    const image = option.querySelector('img');
    const title = option.querySelector('.title');
    const time = option.querySelector('time');

    expect(image).toHaveAttribute('src', '/not-available.png');
    expect(title).toHaveClass('u-not-available');
    expect(time).toHaveClass('u-not-available');
    expect(time).toHaveTextContent('N/A');
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  // TC-THS-11
  // Statement Coverage: Covers invalid date formatting and the rating=0 render path.
  it('renders N/A for invalid dates and marks a zero rating as not available styled', async () => {
    sessionStorage.clear();
    fetchSpy.mockReset();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        movies: [
          {
            id: 202,
            mediaType: 'movie',
            title: 'Broken Metadata',
            date: 'invalid-date',
            rating: 0,
            posterUrl: '',
            imageUrl: ''
          }
        ],
        tvShows: []
      })
    });

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Broken' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const option = await screen.findByRole('option');
    const time = option.querySelector('time');
    const ratingValue = option.querySelector('.rating-value');
    const image = option.querySelector('img');

    expect(time).toBeInTheDocument();
    expect(time).toHaveTextContent('N/A');
    expect(time).toHaveAttribute('datetime', 'invalid-date');

    expect(ratingValue).toBeInTheDocument();
    expect(ratingValue).toHaveTextContent('0.0');
    expect(ratingValue).toHaveClass('u-not-available');

    expect(image).toHaveAttribute('src', '/not-available.png');
  });

  // TC-THS-12
  // Statement Coverage: Covers the Enter key activation path for a focused result and triggers router navigation.
  it('navigates to the focused result when Enter is pressed', async () => {
    sessionStorage.clear();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');

    fireEvent.change(input, {
      target: { value: 'Spider' }
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    await screen.findByText(/^Spider-Man$/i);

    fireEvent.keyDown(input, {
      key: 'ArrowDown',
      code: 'ArrowDown'
    });

    const firstOption = document.getElementById('movie-101');

    await waitFor(() => {
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });

    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en-US/movies/101');
    });
  });

  // TC-THS-13
  // Statement Coverage: Covers result click handling and the TV-show navigation href branch.
  it('navigates to a TV show when its result is clicked', async () => {
    sessionStorage.clear();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');

    fireEvent.change(input, {
      target: { value: 'Spider' }
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const tvTitle = await screen.findByText(/^Marvel's Spider-Man$/i);
    const tvOption = tvTitle.closest('a[role="option"]');

    expect(tvOption).toBeInTheDocument();
    expect(tvOption).toHaveAttribute('href', '/en-US/tv-shows/72705');

    fireEvent.click(tvOption);

    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });

    expect(mockPush).toHaveBeenCalledWith('/en-US/tv-shows/72705');
  });

  // TC-THS-14
  // Statement Coverage: Covers the outside-click closeResults path when the results list is open.
  it('closes the results when clicking outside', async () => {
    sessionStorage.clear();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');

    fireEvent.change(input, {
      target: { value: 'Spider' }
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const listbox = await screen.findByRole('listbox');
    expect(listbox.hidden).toBe(false);

    fireEvent.click(document.body);

    await waitFor(() => {
      expect(listbox.hidden).toBe(true);
    });
  });

  // TC-THS-15
  // Statement Coverage: Covers the Escape handler when no visible results are available and restores input focus.
  it('restores focus to the input when Escape is pressed without visible results', async () => {
    sessionStorage.clear();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    input.focus();

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  // TC-THS-16
  // Statement Coverage: Covers the visually hidden date labels for movies and TV shows.
  it('announces the date type with a visually hidden label for movies and TV shows', async () => {
    sessionStorage.clear();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Spider' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const movieOption = document.getElementById('movie-101');
    const tvOption = await waitFor(() => {
      const el = document.getElementById('tv-72705');
      expect(el).toBeInTheDocument();
      return el;
    });

    const movieLabel = movieOption.querySelector('.description > .u-sr-only');
    const tvLabel = tvOption.querySelector('.description > .u-sr-only');

    expect(movieLabel).toHaveTextContent('Release date');
    expect(tvLabel).toHaveTextContent('First air date');
    expect(movieLabel.nextElementSibling.tagName).toBe('TIME');
    expect(tvLabel.nextElementSibling.tagName).toBe('TIME');
  });

  // TC-THS-17
  // Branch Coverage: Home/End without a focused result keep their default text-cursor behaviour.
  it('does not select a result with Home/End while no result is focused', async () => {
    sessionStorage.clear();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Spider' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const movieOption = document.getElementById('movie-101');
    const tvOption = await waitFor(() => {
      const el = document.getElementById('tv-72705');
      expect(el).toBeInTheDocument();
      return el;
    });

    const homeAllowed = fireEvent.keyDown(input, { key: 'Home' });
    const endAllowed = fireEvent.keyDown(input, { key: 'End' });

    expect(homeAllowed).toBe(true);
    expect(endAllowed).toBe(true);
    expect(movieOption).toHaveAttribute('aria-selected', 'false');
    expect(tvOption).toHaveAttribute('aria-selected', 'false');
  });

  // TC-THS-18
  // Branch Coverage: Key events outside the search form no longer control the typeahead.
  it('ignores keyboard events that are dispatched on the window', async () => {
    sessionStorage.clear();

    render(<TypeHeadSearch />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Spider' } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const listbox = await screen.findByRole('listbox');
    const movieOption = document.getElementById('movie-101');

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(listbox).not.toHaveAttribute('hidden');
    expect(movieOption).toHaveAttribute('aria-selected', 'false');
  });
});
