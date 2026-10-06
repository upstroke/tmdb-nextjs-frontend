// vitest/component/CardDefault.browser.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CardDefault from '@/app/components/CardDefault';
import { i18nMockDefault } from '@/vitest/mocks/i18n';
import { mappedFixtures } from '@/vitest/mocks/fixtures';

vi.mock('next-intl', () => ({
  useTranslations: () => i18nMockDefault,
}));

const movie = mappedFixtures.movies[0];
const genres = mappedFixtures.genres;

describe('CardDefault (browser)', () => {
  it('renders movie card with correct route, title, genres, date, rating and certification', () => {
    render(<CardDefault item={movie} type="movie" genres={genres} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/en-US/movies/${movie.id}`);

    expect(screen.getByText(movie.title)).toBeInTheDocument();

    const genreNames = movie.genre_ids
      .slice(0, 2)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean);
    genreNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    expect(screen.getByText(movie.release_date)).toBeInTheDocument();

    expect(screen.getByText(`${movie.vote_average.toFixed(1)}/10`)).toBeInTheDocument();

    expect(screen.getByText(movie.certification || 'NR')).toBeInTheDocument();
  });

  it('renders fallback certification when missing', () => {
    const movieWithoutCert = { ...movie, certification: '' };
    render(<CardDefault item={movieWithoutCert} type="movie" genres={genres} />);

    expect(screen.getByText('NR')).toBeInTheDocument();
  });
});
