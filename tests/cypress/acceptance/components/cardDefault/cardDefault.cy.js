import CardDefault from '../../../POM/CardDefault';

describe('CardDefault Component', () => {
  let card;

  beforeEach(() => {
    card = new CardDefault();
    card.visit();
  });

  it('renders the card with expected content', () => {
    card.assertCardExists();
    card.assertTitle('Movie Title');
    card.assertOverview('This is a movie overview.');
    card.assertRating('7.5');
    card.assertReleaseDate('2024-01-15');
  });

  it('shows favorite button and toggles it', () => {
    card.assertFavoriteButtonExists();
    card.clickFavoriteButton();
    card.assertFavoriteButtonActive();
  });

  it('shows media type badge', () => {
    card.assertMediaTypeBadge('Movie');
  });
});
