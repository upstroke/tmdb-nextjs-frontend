// vitest/component/HeaderMain.browser.test.jsx

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
    labels: { navigationToggle: 'Toggle menu', mainNavigation: 'Main navigation' },
    titles: { home: 'Home Title', movies: 'Movies Title' }
  }),
  useLocale: () => 'en-US',
  setLocale: () => vi.fn()
}));

// ignore LanguageSwitcher for now - test with integration test
vi.mock('../../components/LanguageSwitcher', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-language-switcher' }, 'Language')
}));

// ignore TypeHeadSearch for now - test with integration test
vi.mock('@/components/TypeHeadSearch', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-typeahead-search' }, 'Search')
}));

describe('HeaderMain (browser)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUsePathname.mockReturnValue('/en-US');
  });

  // Statement Coverage: Covers list navigation loops, standard layouts, and pointer interactive bindings.
  it('mounts, processes navigation item configurations, and toggles mobile responsive overlays on pointer interaction', () => {
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

    fireEvent.pointerDown(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.pointerDown(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

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

  // Branch Coverage: Safely intercepts storage failures inside the try/catch runtime block
  it('safely handles internal sessionStorage exceptions and falls back to baseline values', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });

    render(<HeaderMain />);

    const moviesLink = screen.getByRole('link', { name: /Movies Title/i });
    expect(moviesLink).toHaveAttribute('href', '/en-US/movies');
  });
});
