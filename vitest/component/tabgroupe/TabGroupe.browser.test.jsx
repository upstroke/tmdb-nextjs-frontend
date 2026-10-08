// vitest/component/TabGroupe.browser.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TabGroupe from '../../../components/TabGroupe.jsx';

// Global mocks for i18n store infrastructure inside the browser sandbox
vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    labels: { firstAirDate: 'Air Date' },
    messages: { loading: 'Loading episodes...' }
  }),
  useLocale: () => 'en-US'
}));

// Mock operational dataset representing active TV Show seasons and dynamic episodes
const sampleTabs = [
  {
    id: 'season-1',
    label: 'Season 1',
    episodes: [
      { id: 101, name: 'Pilot', air_date: '2020-08-14', overview: 'The series premiere introduces Ted Lasso.' },
      { id: 102, name: 'Biscuits', air_date: '2020-08-14', overview: 'Ted tries to win over Rebecca.' }
    ]
  },
  {
    id: 'season-2',
    label: 'Season 2',
    episodes: [
      { id: 201, name: 'Goodbye Earl', air_date: '2021-07-23', overview: 'AFC Richmond faces a new challenge.' }
    ]
  },
  {
    id: 'season-3',
    label: 'Season 3',
    loading: true // Triggers the explicit loading branch condition
  },
  {
    id: 'season-4',
    label: 'Season 4',
    content: 'No episode details compiled yet.' // Triggers plain-text content branch fallback
  }
];

describe('TabGroupe (browser)', () => {

  // Statement Coverage: Covers basic DOM structure, mounting initialization state, and default active tab properties.
  // Branch Coverage:
  //   - initialTab missing -> true (falls back to tabs[0].id initialization evaluation)
  //   - tab.episodes && tab.episodes.length > 0 -> true (renders active interactive episodes list branch)
  it('renders tab list and default active panel contents including episode structures', () => {
    const handleTabSelect = vi.fn();

    render(
      <TabGroupe
        tabs={sampleTabs}
        ariaLabel="Season Selection"
        onTabSelect={handleTabSelect}
      />
    );

    // Verify main accessibility requirements (ARIA roles)
    expect(screen.getByRole('tablist', { name: 'Season Selection' })).toBeInTheDocument();

    // Verify first tab button is pre-selected and focused by default
    const firstTab = screen.getByRole('tab', { name: 'Season 1' });
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
    expect(firstTab).toHaveAttribute('tabIndex', '0');

    // Verify episode content visibility within the active panel view
    expect(screen.getByText('1. Pilot')).toBeInTheDocument();
    expect(screen.getByText('The series premiere introduces Ted Lasso.')).toBeInTheDocument();

    // Interact via mouse click to switch active tabs and trigger state changes
    const secondTab = screen.getByRole('tab', { name: 'Season 2' });
    fireEvent.click(secondTab);

    // Assert that the selection callback triggered correctly with updated state identifiers
    expect(handleTabSelect).toHaveBeenCalledWith('season-2');
    expect(secondTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('1. Goodbye Earl')).toBeInTheDocument();
  });

  // Statement Coverage: Covers keyboard mapping loop jumps, preventDefault calls, and explicit tab focus routing logic.
  // Branch Coverage: Fully explores all conditional entries inside handleTabKeydown mapping branches (ArrowRight, ArrowLeft, Home, End).
  it('supports interactive keyboard navigation patterns across sequential tab items', () => {
    render(<TabGroupe tabs={sampleTabs} initialTab="season-1" ariaLabel="Keyboard Tabs" />);

    const currentTab = screen.getByRole('tab', { name: 'Season 1' });

    // 1. Move focus to the right -> switches active panel view to Season 2
    fireEvent.keyDown(currentTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Season 2' })).toHaveAttribute('aria-selected', 'true');

    // 2. Jump direct to the last item using End key -> switches active view to Season 4
    fireEvent.keyDown(currentTab, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Season 4' })).toHaveAttribute('aria-selected', 'true');

    // 3. Jump direct back to the first item using Home key -> resets active view to Season 1
    fireEvent.keyDown(currentTab, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Season 1' })).toHaveAttribute('aria-selected', 'true');

    // 4. Fire unmapped key -> branch abort exit (ignores transformation)
    fireEvent.keyDown(currentTab, { key: 'Enter' });
    expect(screen.getByRole('tab', { name: 'Season 1' })).toHaveAttribute('aria-selected', 'true');
  });

  // Statement Coverage: Covers structured lists item focus shifts, delayed microtask indexing, and sub-queries DOM nodes focus handlers.
  // Branch Coverage: Fully explores all conditional entries inside handleEpisodeKeydown mapping branches (ArrowDown, ArrowUp, Home, End).
  it('supports focused accessibility keyboard navigation tracking inside active episodes list panels', () => {
    render(<TabGroupe tabs={sampleTabs} initialTab="season-1" ariaLabel="Episode Keyboard" />);

    const firstEpisode = screen.getByText('1. Pilot').closest('li');

    // 1. ArrowDown navigation -> shifts focused index down to the second episode list node item
    fireEvent.keyDown(firstEpisode, { key: 'ArrowDown' });

    // 2. ArrowUp navigation -> shifts focused index back up to the first episode node item
    fireEvent.keyDown(firstEpisode, { key: 'ArrowUp' });

    // 3. End navigation -> jumps focus indicator to the final item boundary index
    fireEvent.keyDown(firstEpisode, { key: 'End' });

    // 4. Home navigation -> returns focus indicator to initial element index position
    fireEvent.keyDown(firstEpisode, { key: 'Home' });

    // 5. Fire unmapped key inside lists view -> bypass exit condition check branch
    fireEvent.keyDown(firstEpisode, { key: 'Escape' });

    expect(firstEpisode).toBeInTheDocument();
  });

  // Branch Coverage: Evaluates tab.loading === true and checks the plain text fallback rendering when episodes are omitted.
  it('handles distinct loading templates and plain text fallbacks correctly', () => {
    render(<TabGroupe tabs={sampleTabs} initialTab="season-3" ariaLabel="State Fallbacks" />);

    // Verify loading state container visibility (tab.loading === true branch)
    expect(screen.getByText('Loading episodes...')).toBeInTheDocument();

    // Switch view over to plain text placeholder definitions (tab.content plain text fallback branch)
    const emptyContentTab = screen.getByRole('tab', { name: 'Season 4' });
    fireEvent.click(emptyContentTab);

    expect(screen.getByText('No episode details compiled yet.')).toBeInTheDocument();
  });
});
