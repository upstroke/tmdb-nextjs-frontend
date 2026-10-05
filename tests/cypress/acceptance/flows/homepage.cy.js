import { HomePage } from '../../POM/HomePage';

describe('Homepage', () => {
  const homePage = new HomePage();

  beforeEach(() => {
    homePage.visit();
  });

  it('should display the homepage title', () => {
    homePage.verifyTitle();
  });

  it('should navigate to movie details when clicking on a movie card', () => {
    homePage.navigateToMovieDetails();
  });

  it('should search for movies when using the search bar', () => {
    homePage.searchForMovie('Inception');
  });
});
