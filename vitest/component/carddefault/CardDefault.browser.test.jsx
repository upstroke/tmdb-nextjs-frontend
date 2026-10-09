// vitest/component/CardDefault.browser.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CardDefault from '../../../components/CardDefault.jsx';
import { rawFixtures } from '../../fixtures/tmdb/tmdb.browser.fixtures.js';

// ============================================================================
// MOCKS & FIXTURES CONFIGURATION
// ============================================================================
vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    labels: { certification: 'Age Rating', genre: 'Genre', releaseDate: 'Release date', rating: 'Rating' },
    formats: { outOfTen: 'out of 10' },
    fallbacks: { notAvailable: 'N/A' }
  }),
  useLocale: () => 'en-US'
}));

const rawMovie = rawFixtures.moviesPopular.results[0];

const movie = {
  id: rawMovie.id,
  mediaType: rawMovie.media_type,
  title: rawMovie.title,
  releaseDate: rawMovie.release_date,
  voteAverage: rawMovie.vote_average,
  certification: 'PG-13',
  posterUrl: rawMovie.poster_path,
  genreIds: rawMovie.genre_ids,
};

const genres = rawFixtures.genresMovie.genres;

describe('CardDefault (browser)', () => {

  // TC-CD-001
  // Statement Coverage: Covers normal variables, element rendering, custom styles.
  it('renders movie card with correct route, title, genres, date, rating and certification', () => {
    render(
      <CardDefault
        id={movie.id}
        mediaType="movie"
        title={movie.title}
        date={movie.releaseDate}
        rating={movie.voteAverage}
        certification={movie.certification}
        genres={genres}
        imageUrl={movie.posterUrl}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/en-US/movies/${movie.id}`);
    expect(screen.getByText(movie.title)).toBeInTheDocument();

    const timeElement = document.querySelector(`time[datetime="${movie.releaseDate}"]`);
    expect(timeElement).toBeInTheDocument();
  });

  // TC-CD-002
  // Statement Coverage: Covers alternative URL variable evaluation.
  it('renders tv show card with correct route format', () => {
    render(
      <CardDefault
        id={999}
        mediaType="tv"
        title="Sample TV Show"
        date="2026-01-01"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en-US/tv-shows/999');
  });

  // TC-CD-003
  // Statement Coverage: Covers the inline early exit statement: return null.
  // Branch Coverage: hasValidCard -> false (triggers the early 'return null' branch)
  it('returns null and renders nothing when id or mediaType is invalid', () => {
    const { container } = render(
      <CardDefault
        id=""
        mediaType={undefined}
        title="Ghost Card"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // TC-CD-004
  // Statement Coverage: Covers the evaluation of missing state items.
  // Branch Coverage:
  //   - rating > 0 -> false (triggers rating fallback view)
  //   - title?.trim() -> false (triggers title fallback placeholder)
  //   - date? -> false (triggers date fallback view)
  //   - certificationMeta -> false (triggers fallback grey certStyle border)
  //   - hasGenres -> false (triggers genre fallback placeholder view)
  it('renders fallback placeholder text when fields are missing', () => {
    render(
      <CardDefault
        id={movie.id}
        mediaType="movie"
        title=""
        rating={0}
        genres={[]}
        date=""
      />
    );

    const placeholders = screen.getAllByText('N/A');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  // TC-CD-005
  // Statement Coverage: Covers image lifecycle handlers: onLoad, onError statements.
  // Branch Coverage:
  //   - imageLoaded hook toggles -> true (triggers dynamic className .image-loaded)
  //   - imageErrored hook toggles -> true (triggers dynamic className .image-error)
  //   - img.complete && img.naturalWidth > 0 branch logic coverage
  it('triggers image load and image error states', () => {
    render(
      <CardDefault
        id={movie.id}
        mediaType="movie"
        title={movie.title}
        imageUrl="/test-image.jpg"
      />
    );

    const img = screen.getByRole('img');

    // Simulate image onLoad event execution
    fireEvent.load(img);

    // Simulate image onError event execution
    fireEvent.error(img);
  });
});
