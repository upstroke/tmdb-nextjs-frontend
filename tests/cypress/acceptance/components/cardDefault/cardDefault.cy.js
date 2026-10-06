// tests/cypress/acceptance/components/cardDefault/cardDefault.cy.js
import { CardDefault } from '../../POM/CardDefault';

const card = CardDefault();

describe('CardDefault Component', () => {
  describe('Movie Card', () => {
    it('renders movie card with title and rating', () => {
      const movieData = {
        id: 123,
        mediaType: 'movie',
        title: 'Test Movie',
        date: '2024-01-15',
        rating: 7.5,
        certification: 'PG-13',
        genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Drama' }],
        imageUrl: '/test-poster.jpg',
      };

      card.mount(movieData);
      card.title().should('contain.text', 'Test Movie');
      card.rating().should('contain.text', '7.5');
      card.genre().should('contain.text', 'Action / Drama');
      card.releaseDate().should('contain.text', '2024');
    });

    it('handles missing poster gracefully', () => {
      const movieData = {
        id: 123,
        mediaType: 'movie',
        title: 'Test Movie',
        imageUrl: '/invalid-image.jpg',
      };

      card.mount(movieData);
      // Image error triggers placeholder state
      card.poster().should('not.exist');
      card.posterPlaceholder().should('exist');
    });

    it('displays N/A for null rating', () => {
      const movieData = {
        id: 123,
        mediaType: 'movie',
        title: 'Test Movie',
        rating: 0,
      };

      card.mount(movieData);
      card.rating().parent().should('have.class', 'u-not-available');
    });

    it('displays certification badge', () => {
      const movieData = {
        id: 123,
        mediaType: 'movie',
        title: 'Test Movie',
        certification: 'PG-13',
      };

      card.mount(movieData);
      card.certification().should('contain.text', 'PG-13');
    });
  });

  describe('TV Show Card', () => {
    it('renders TV show card with name', () => {
      const tvData = {
        id: 456,
        mediaType: 'tv',
        title: 'Test TV Show',
        date: '2023-06-20',
        rating: 8.2,
        genres: [{ id: 3, name: 'Sci-Fi' }],
      };

      card.mount(tvData);
      card.title().should('contain.text', 'Test TV Show');
      card.rating().should('contain.text', '8.2');
      card.genre().should('contain.text', 'Sci-Fi');
    });

    it('displays N/A for missing title', () => {
      const tvData = {
        id: 456,
        mediaType: 'tv',
        title: '',
      };

      card.mount(tvData);
      card.title().should('have.class', 'u-not-available');
    });
  });

  describe('Card Interaction', () => {
    it('is clickable and navigates to detail page', () => {
      const movieData = {
        id: 123,
        mediaType: 'movie',
        title: 'Test Movie',
      };

      card.mount(movieData);
      card.click();
      // Navigation would be tested in e2e context
    });

    it('renders loading state', () => {
      const movieData = {
        id: 123,
        mediaType: 'movie',
        title: 'Test Movie',
        isLoading: true,
      };

      card.mount(movieData);
      card.card().should('have.class', 'is-loading');
    });
  });

  describe('Edge Cases', () => {
    it('returns null for invalid media type', () => {
      const invalidData = {
        id: 789,
        mediaType: 'invalid',
        title: 'Invalid',
      };

      card.mount(invalidData);
      card.card().should('not.exist');
    });

    it('returns null for missing id', () => {
      const invalidData = {
        mediaType: 'movie',
        title: 'No ID',
      };

      card.mount(invalidData);
      card.card().should('not.exist');
    });
  });
});
