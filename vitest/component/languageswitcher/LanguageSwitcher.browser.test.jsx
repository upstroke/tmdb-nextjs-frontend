// vitest/component/LanguageSwitcher.browser.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LanguageSwitcher from '../../../components/LanguageSwitcher.jsx';

// ============================================================================
// STABLE SYSTEM & PROJECT HOOK MOCKS
// ============================================================================
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockUsePathname = vi.fn(() => '/en-US/movies');
const mockSetLocale = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn()
  }),
  usePathname: () => mockUsePathname()
}));

vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    labels: { languageSelect: 'Select Language' }
  }),
  useLocale: () => 'en-US',
  setLocale: (loc) => mockSetLocale(loc)
}));

// Mock localized helper configurations to ensure precise evaluation branches control
vi.mock('@/lib/i18n/helpers', () => ({
  getSupportedLocales: () => ['en-US', 'de-DE', 'fr-FR']
}));

vi.mock('@/lib/i18n/resolver', () => ({
  resolveLocale: (val) => val // Direct pass-through mapping for simplistic evaluation
}));

vi.mock('@/lib/i18n/config', () => ({
  SUPPORTED_LOCALES: ['en-US', 'de-DE', 'fr-FR']
}));

describe('LanguageSwitcher (browser)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/en-US/movies');
  });

  // TC-LS-001
  // Statement Coverage: Covers DOM mount initialization loops, option node mapping, and store state syncs.
  // Branch Coverage:
  //   - currentSegment evaluated -> true (successfully replaces active matching path segments)
  it('renders dropdown options and replaces the locale segment in the path during switch actions', () => {
    render(<LanguageSwitcher />);

    // Verify option node markup mappings conversion ("en-US" -> "EN")
    const selectEl = screen.getByRole('combobox', { name: 'Select Language' });
    expect(selectEl).toBeInTheDocument();
    expect(selectEl.value).toBe('en-US');
    expect(screen.getByRole('option', { name: 'EN' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'DE' })).toBeInTheDocument();

    // Trigger value conversion change sequence to German locale
    fireEvent.change(selectEl, { target: { value: 'de-DE' } });

    // Assert store modifications syncs and browser history router changes invocation paths
    expect(mockSetLocale).toHaveBeenCalledWith('de-DE');
    expect(mockReplace).toHaveBeenCalledWith('/de-DE/movies', { scroll: false });
  });

  // TC-LS-002
  // Branch Coverage:
  //   - currentSegment evaluated -> false (appends the locale prefix when matching patterns fail)
  it('prepends the new locale configuration when the current pathname lacks matching structural prefixes', () => {
    // Inject a bare pathname layout string without locales markers
    mockUsePathname.mockReturnValue('/unmapped-deep-route/details');

    render(<LanguageSwitcher />);

    const selectEl = screen.getByRole('combobox', { name: 'Select Language' });

    // Switch value to French locale
    fireEvent.change(selectEl, { target: { value: 'fr-FR' } });

    expect(mockSetLocale).toHaveBeenCalledWith('fr-FR');
    // Confirm it prepended the locale structure dynamically to the path
    expect(mockReplace).toHaveBeenCalledWith('/fr-FR/unmapped-deep-route/details', { scroll: false });
  });

  // TC-LS-003
  // Branch Coverage: Enforces absolute exact text match condition loops checking
  it('handles switching states perfectly when path precisely equals the base locale string structure', () => {
    mockUsePathname.mockReturnValue('/en-US');

    render(<LanguageSwitcher />);

    const selectEl = screen.getByRole('combobox', { name: 'Select Language' });
    fireEvent.change(selectEl, { target: { value: 'de-DE' } });

    expect(mockReplace).toHaveBeenCalledWith('/de-DE', { scroll: false });
  });
});
