// tests/cypress/POM/HomePage.js

const selectors = {
  main: 'main.home-page',
  title: 'main.home-page h2.ui.dividing.header',
  movieCards: 'main.home-page a[id^="home-card-"]',
  firstMovieCard: '#home-card-1',
  searchInput: '#typeahead-search-input'
};

export function HomePage() {
  return {
    get main() {
      return cy.get(selectors.main);
    },

    get title() {
      return cy.get(selectors.title);
    },

    get movieCards() {
      return cy.get(selectors.movieCards);
    },

    get firstMovieCard() {
      return cy.get(selectors.firstMovieCard);
    },

    get searchInput() {
      return cy.get(selectors.searchInput);
    },

    assertTitleVisible() {
      this.title.should('be.visible');
    },

    assertMovieCardsVisible() {
      this.movieCards.should('be.visible');
    },

    assertSearchInputVisible() {
      this.searchInput.should('be.visible');
    }
  };
}
