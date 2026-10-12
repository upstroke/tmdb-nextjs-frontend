// vitest/component/headermain/HeaderMain.browser.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HeaderMain from '../../../components/HeaderMain.jsx';

// ============================================================================
// STABLE SYSTEM & CORE MODULE MOCKS
// ============================================================================
const mockUsePathname = vi.fn(() => '/en-US');

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  })
}));

// Provide stable store values including dummy functions for deep child component safety
vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    labels: {
      navigationToggle: 'Toggle menu',
      mainNavigation: 'Main navigation',
      skipToContent: 'Skip to main content'
    },
    titles: { home: 'Home Title', movies: 'Movies Title' }
  }),
  useLocale: () => 'en-US',
  setLocale: () => vi.fn()
}));

// ignore LanguageSwitcher for now - test with integration test
vi.mock('@/components/LanguageSwitcher', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-language-switcher' }, 'Language')
}));

// ignore TypeHeadSearch for now - test with integration test
vi.mock('@/components/TypeHeadSearch', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-typeahead-search' }, 'Search')
}));

describe('HeaderMain (browser)', () => {
  beforeEach(() => {
    // Restore spies first: the getItem spy of TC-HM-003 must not leak into later tests.
    vi.restoreAllMocks();
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUsePathname.mockReturnValue('/en-US');
  });

  // TC-HM-001
  // Statement Coverage: Covers list navigation loops, standard layouts, and click interactive bindings.
  // The burger button toggles on click (not pointerdown), so Enter and Space work too (WCAG 2.1.1).
  it('mounts, processes navigation item configurations, and toggles mobile responsive overlays on click', () => {
    render(<HeaderMain />);

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-typeahead-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-language-switcher')).toBeInTheDocument();

    expect(screen.getByText('Home Title')).toBeInTheDocument();
    expect(screen.getByText('Movies Title')).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Home Title/i });
    expect(homeLink).toHaveClass('link-active');
    expect(homeLink).toHaveAttribute('aria-current', 'page');

    const toggleButton = screen.getByRole('button', { name: 'Toggle menu' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  // TC-HM-002
  // Statement Coverage: Covers custom sessionStorage extraction steps and dynamic arithmetic calculations.
  it('reads state from sessionStorage and modifies navigation routing targets dynamically based on state restoration histories', () => {
    sessionStorage.setItem('movies-page', '5');
    mockUsePathname.mockReturnValue('/en-US/movies');

    render(<HeaderMain />);

    expect(screen.getByText('tvShows')).toBeInTheDocument();

    const moviesLink = screen.getByRole('link', { name: /Movies Title/i });
    expect(moviesLink).toHaveClass('link-active');
    expect(moviesLink).toHaveAttribute('href', '/en-US/movies?page=5');
  });

  // TC-HM-003
  // Branch Coverage: Safely intercepts storage failures inside the try/catch runtime block
  it('safely handles internal sessionStorage exceptions and falls back to baseline values', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });

    render(<HeaderMain />);

    const moviesLink = screen.getByRole('link', { name: /Movies Title/i });
    expect(moviesLink).toHaveAttribute('href', '/en-US/movies');
  });

  // TC-HM-004
  // Statement Coverage: Covers the skip link rendered as the first focusable element before burger button and navigation.
  it('renders a skip link to the main content before the burger button and the navigation', () => {
    render(<HeaderMain />);

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const toggleButton = screen.getByRole('button', { name: 'Toggle menu' });
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });

    expect(skipLink.compareDocumentPosition(toggleButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(skipLink.compareDocumentPosition(navigation) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  // TC-HM-005
  // Statement Coverage: Covers the onClick handler of the navigation links that closes the mobile menu.
  // HeaderMain stays mounted when the route changes, so the link has to reset the menu state itself.
  it('closes the open mobile menu when a navigation link is clicked', () => {
    render(<HeaderMain />);

    const toggleButton = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    const moviesLink = screen.getByRole('link', { name: /Movies Title/i });
    // Block the browser default: a real navigation would unload the test iframe and hang the run.
    moviesLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(moviesLink);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  // TC-HM-006
  // Equivalence Partitioning: Home link (no storage key), TV shows link without and with a stored page.
  // The i18n mock has no title for tvShows, so the link text is the raw key.
  it('points the Home and TV shows links to their routes and restores the stored TV page', () => {
    const { rerender } = render(<HeaderMain />);

    expect(screen.getByRole('link', { name: /Home Title/i })).toHaveAttribute('href', '/en-US');
    expect(screen.getByRole('link', { name: /tvShows/i })).toHaveAttribute(
      'href',
      '/en-US/tv-shows'
    );

    sessionStorage.setItem('tv-shows-page', '3');
    rerender(<HeaderMain />);

    expect(screen.getByRole('link', { name: /tvShows/i })).toHaveAttribute(
      'href',
      '/en-US/tv-shows?page=3'
    );
    expect(screen.getByRole('link', { name: /Home Title/i })).toHaveAttribute('href', '/en-US');
  });
});
