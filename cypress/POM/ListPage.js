export const ListPage = () => {
  const cards = () => cy.get('ul.media-card-list > li');
  const loadMoreButton = () => cy.get('.paged-list-cards button');

  /**
   * Get the link of a card by its target path
   * @param {string} path - e.g. '/en-US/movies/603'
   */
  const cardLink = (path) => cy.get(`ul.media-card-list a[href="${path}"]`);

  /**
   * Visit a list page
   * @param {string} path - e.g. '/en-US/movies'
   */
  const visit = (path) => {
    cy.visit(path);
  };

  return {
    cards,
    loadMoreButton,
    cardLink,
    visit
  };
};
