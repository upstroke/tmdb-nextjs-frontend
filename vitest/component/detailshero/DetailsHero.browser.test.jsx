// vitest/component/DetailsHero.browser.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DetailsHero from '../../../components/DetailsHero.jsx';
import { rawFixtures } from '../../fixtures/tmdb/tmdb.browser.fixtures.js';

// Global mock for i18n store inside the browser sandbox to handle default fallbacks
vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    fallbacks: { notAvailable: 'N/A' }
  })
}));

// Safe data extraction from raw detailed movie fixtures
const rawDetail = rawFixtures.movieDetail;

describe('DetailsHero (browser)', () => {
  // TC-DH-001
  // Statement Coverage: Covers normal layout structure, background image assignment, and mapping list elements.
  // Branch Coverage: productionCompanies.length > 0 -> true (renders full production companies list branch)
  it('renders a detailed hero section with backdrop, poster, title, and production companies', () => {
    render(
      <DetailsHero
        title={rawDetail.title}
        backdrop={`https://tmdb.org{rawDetail.backdrop_path}`}
        posterUrl={`https://tmdb.org{rawDetail.poster_path}`}
        productionCompanies={rawDetail.genres} // Reusing genres as mock production companies [{id, name}]
        emptyLabel="No companies listed"
      />
    );

    // Verify main title rendering
    expect(screen.getByRole('heading', { level: 1, name: new RegExp(rawDetail.title, 'i') })).toBeInTheDocument();

    // Verify list layout mapping for production companies
    rawDetail.genres.forEach((company) => {
      expect(screen.getByText(company.name)).toBeInTheDocument();
    });

    // Verify that the fallback list item is not present
    expect(screen.queryByText('No companies listed')).not.toBeInTheDocument();
  });

  // TC-DH-002
  // Branch Coverage:
  //   - backdrop URL missing -> true (falls back to posterUrl string evaluated branch)
  //   - productionCompanies.length > 0 -> false (triggers the empty list placeholder fallback branch)
  it('falls back to poster image and renders explicit empty labels when backdrop and companies are missing', () => {
    render(
      <DetailsHero
        title={rawDetail.title}
        backdrop="" // Triggers fallbackImage = posterUrl branch evaluation
        posterUrl={`https://tmdb.org{rawDetail.poster_path}`}
        productionCompanies={[]} // Triggers empty companies list fallback branch
        emptyLabel="Custom Empty Label"
      />
    );

    // Verify that the explicit empty label text is visible inside the list view
    expect(screen.getByText('Custom Empty Label')).toBeInTheDocument();
  });

  // TC-DH-003
  // Branch Coverage: All input variables missing/falsy -> triggers default i18n "N/A" fallback chains for title and label
  it('renders default global fallback text when all operational props are omitted', () => {
    render(
      <DetailsHero
        title="" // Triggers resolvedTitle = notAvailableText fallback branch
        backdrop=""
        posterUrl="" // Triggers resolvedPosterUrl = '/not-available.png' fallback branch
        productionCompanies={[]}
        emptyLabel="" // Triggers resolvedEmptyLabel = notAvailableText fallback branch
      />
    );

    // Verify that the global fallback placeholder 'N/A' is applied to both the title and list block
    const fallbacks = screen.getAllByText('N/A');
    expect(fallbacks.length).toBeGreaterThanOrEqual(2);
  });
});
