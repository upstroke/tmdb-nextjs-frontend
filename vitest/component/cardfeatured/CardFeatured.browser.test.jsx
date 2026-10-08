// vitest/component/CardFeatured.browser.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CardFeatured from '../../../components/CardFeatured.jsx';
import { rawFixtures } from '../../fixtures/tmdb/tmdb.browser.fixtures.js';

// Global mocks for i18n store and Next.js internal components inside the browser sandbox
vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    labels: { genre: 'Genre', releaseDate: 'Release date', movie: 'Movie', tvShow: 'TV Show', moreInfo: 'More Info', officialWebsite: 'Official Website' },
    fallbacks: { notAvailable: 'N/A' }
  }),
  useLocale: () => 'en-US'
}));

// Safe data extraction from raw popular movie fixtures
const rawMovie = rawFixtures.moviesPopular.results[0];
const sampleGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' }
];

describe('CardFeatured (browser)', () => {

  // Statement Coverage: Covers regular layout rendering, description parsing, and dynamic CSS variable styles.
  it('renders a featured movie card with correct route, title, genres, and homepage links', () => {
    render(
      <CardFeatured
        id={rawMovie.id}
        mediaType="movie"
        title={rawMovie.title}
        releaseDate={rawMovie.release_date}
        overview={rawMovie.overview}
        homepage="https://spiderman-movie.com"
        genres={sampleGenres}
        imageUrl={rawMovie.backdrop_path}
        posterUrl={rawMovie.poster_path}
      />
    );

    // Verify correct movie routing and title
    expect(screen.getByRole('heading', { name: new RegExp(rawMovie.title, 'i') })).toBeInTheDocument();

    // Verify specific movie label matching (mediaType === 'movie' -> labels.movie)
    expect(screen.getByText('Movie')).toBeInTheDocument();

    // Verify description and genres format ("Action / Adventure")
    expect(screen.getByText(new RegExp(rawMovie.overview, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Adventure')).toBeInTheDocument();

    // Verify action buttons links
    const moreInfoLink = screen.getByRole('link', { name: 'More Info' });
    expect(moreInfoLink).toHaveAttribute('href', `/en-US/movies/${rawMovie.id}`);

    const externalLink = screen.getByRole('link', { name: 'Official Website' });
    expect(externalLink).toHaveAttribute('href', 'https://spiderman-movie.com');
  });

  // Branch Coverage: mediaType === 'tv' evaluates to true, verifying alternative detail routes.
  it('renders a featured tv show card with alternative routing format', () => {
    render(
      <CardFeatured
        id={142}
        mediaType="tv"
        title="Sample TV Show"
        releaseDate="2026-08-14"
        genres={[{ id: 18, name: 'Drama' }]}
      />
    );

    // Verify specific TV Show label matching (mediaType === 'tv' -> labels.tvShow)
    expect(screen.getByText('TV Show')).toBeInTheDocument();

    // Verify correct tv routing structure
    const moreInfoLink = screen.getByRole('link', { name: 'More Info' });
    expect(moreInfoLink).toHaveAttribute('href', '/en-US/tv-shows/142');
  });

  // Branch Coverage: mediaType evaluation falls back to null, detailsHref becomes undefined, and missing values fall back to "N/A".
  it('renders fallback placeholders and omits structural actions when fields are missing or unknown', () => {
    render(
      <CardFeatured
        id={99}
        mediaType="unknown" // Triggers normalizedType === null branch
        title="" // Triggers empty title trim fallback
        overview="" // Triggers empty overview trim fallback
        homepage="" // Triggers omitted action button branch
        genres={[]} // Omits metadata block for genres
        releaseDate="" // Omits metadata block for date
      />
    );

    // Verify that missing essential strings render the default 'N/A' fallback
    const fallbacks = screen.getAllByText('N/A');
    expect(fallbacks.length).toBeGreaterThan(0);

    // Verify that links that rely on conditional evaluation (detailsHref, homepage) are completely hidden
    expect(screen.queryByRole('link', { name: 'More Info' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Official Website' })).not.toBeInTheDocument();
  });
});
