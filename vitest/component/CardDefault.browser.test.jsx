// vitest/component/CardDefault.browser.test.jsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CardDefault from '../../components/CardDefault';
import { rawFixtures } from '../fixtures/tmdb/tmdb.browser.fixtures.js';

const rawMovie = rawFixtures.moviesPopular.results[0];

const movie = {
  id: rawMovie.id,
  mediaType: rawMovie.media_type,
  title: rawMovie.title,
  releaseDate: rawMovie.release_date,
  voteAverage: rawMovie.vote_average,
  certification: rawMovie.certification || 'PG-13',
  posterUrl: rawMovie.poster_path,
  genreIds: rawMovie.genre_ids,
};

const genres = rawFixtures.genresMovie.genres;

describe('CardDefault (browser)', () => {
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

    const genreNames = movie.genreIds
      .slice(0, 2)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean);

    genreNames.forEach((name) => {
      expect(screen.getByText(new RegExp(name, 'i'))).toBeInTheDocument();
    });

    const timeElement = document.querySelector(`time[datetime="${movie.releaseDate}"]`);
    expect(timeElement).toBeInTheDocument();

    const expectedRating = movie.voteAverage.toFixed(1);
    expect(screen.getByText(expectedRating)).toBeInTheDocument();
    expect(screen.getByText('out of 10')).toBeInTheDocument();

    expect(screen.getByText(movie.certification || 'N/A')).toBeInTheDocument();
  });

  it('renders fallback certification when missing', () => {
    render(
      <CardDefault
        id={movie.id}
        mediaType="movie"
        title={movie.title}
        date={movie.releaseDate}
        rating={movie.voteAverage}
        certification=""
        genres={genres}
        imageUrl={movie.posterUrl}
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
