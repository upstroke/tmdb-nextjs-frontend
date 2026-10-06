// tests/cypress/POM/CardDefault.js
import CardDefaultComponent from '../../../components/CardDefault';

export const CardDefault = () => {
  const card = () => cy.get('.ui.card.default-card');
  const title = () => cy.get('.ui.card.default-card h3.header');
  const rating = () => cy.get('.ui.card.default-card .rating-value');
  const poster = () => cy.get('.ui.card.default-card .image-stage img');
  const posterPlaceholder = () => cy.get('.ui.card.default-card .image-error');
  const genre = () => cy.get('.ui.card.default-card .genres');
  const releaseDate = () => cy.get('.ui.card.default-card .date time');
  const certification = () => cy.get('.ui.card.default-card .certification-text');

  /**
   * Mount CardDefault component with data
   * @param {Object} props - Component props
   * @param {number|string} props.id - TMDB item id
   * @param {'movie'|'tv'} props.mediaType - Media type
   * @param {string} props.title - Display title
   * @param {string} [props.date] - ISO date string
   * @param {number} [props.rating] - TMDB vote average
   * @param {string} [props.certification] - Age rating
   * @param {Array} [props.genres] - Genre list
   * @param {string} [props.imageUrl] - Poster image URL
   */
  const mount = (props) => {
    cy.mount(<CardDefaultComponent {...props} />);
    return card();
  };

  /**
   * Click on the card
   */
  const click = () => {
    card().click();
  };

  return {
    card,
    title,
    rating,
    poster,
    posterPlaceholder,
    genre,
    releaseDate,
    certification,
    mount,
    click,
  };
};
