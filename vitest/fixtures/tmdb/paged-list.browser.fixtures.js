// vitest/fixtures/tmdb/paged-list.browser.fixtures.js
// Trending pages (3 pages) for movies and tv shows, used by the PagedList integration test.
// Page 2 contains the last card of page 1 again (duplicate) plus one new card.
// Items 1-3 of the movie list and item 1 of the tv list come from tmdb.browser.fixtures.js.
import { rawFixtures } from './tmdb.browser.fixtures.js';

const TOTAL_PAGES = 3;

const page = (number, results, totalPages = TOTAL_PAGES) => ({
  page: number,
  total_pages: totalPages,
  total_results: totalPages * 20,
  results
});

const movie = (id, title) => ({
  id,
  title,
  original_title: title,
  overview: `Overview of ${title}.`,
  poster_path: `/fixture-${id}.jpg`,
  backdrop_path: `/fixture-${id}-bg.jpg`,
  release_date: '2026-08-01',
  vote_average: 6.5,
  vote_count: 10,
  genre_ids: [28],
  media_type: 'movie'
});

const show = (id, name) => ({
  id,
  name,
  original_name: name,
  overview: `Overview of ${name}.`,
  poster_path: `/fixture-${id}.jpg`,
  backdrop_path: `/fixture-${id}-bg.jpg`,
  first_air_date: '2026-08-01',
  vote_average: 6.5,
  vote_count: 10,
  genre_ids: [18],
  media_type: 'tv'
});

const movieItems = [
  ...rawFixtures.moviesPopular.results,
  movie(1100004, 'Fixture Movie Four'),
  movie(1100005, 'Fixture Movie Five')
];

const tvItems = [
  rawFixtures.tvPopular.results[0],
  show(1200002, 'Fixture Show Two'),
  show(1200003, 'Fixture Show Three'),
  show(1200004, 'Fixture Show Four'),
  show(1200005, 'Fixture Show Five')
];

const movieFeatured = {
  id: movieItems[1].id,
  title: movieItems[1].title,
  original_title: movieItems[1].title,
  overview: 'Featured movie overview.',
  homepage: '',
  poster_path: movieItems[1].poster_path,
  backdrop_path: movieItems[1].backdrop_path,
  release_date: movieItems[1].release_date,
  genres: [{ id: 27, name: 'Horror' }],
  runtime: 100,
  vote_average: 7.3,
  credits: { cast: [], crew: [] },
  videos: { results: [] }
};

const tvFeatured = {
  id: tvItems[1].id,
  name: tvItems[1].name,
  original_name: tvItems[1].name,
  overview: 'Featured show overview.',
  homepage: '',
  poster_path: tvItems[1].poster_path,
  backdrop_path: tvItems[1].backdrop_path,
  first_air_date: tvItems[1].first_air_date,
  genres: [{ id: 18, name: 'Drama' }],
  number_of_seasons: 1,
  number_of_episodes: 8,
  seasons: [],
  episode_run_time: [45],
  production_companies: [],
  vote_average: 7.1,
  credits: { cast: [], crew: [] },
  videos: { results: [] }
};

function buildList(items, featured, titleOf) {
  return {
    featured,
    pages: {
      1: page(1, items.slice(0, 3)),
      2: page(2, [items[2], items[3]]),
      3: page(3, [items[4]])
    },
    titles: {
      initial: items.slice(0, 3).map(titleOf),
      afterPage2: items.slice(0, 4).map(titleOf),
      all: items.map(titleOf)
    }
  };
}

export const pagedListFixture = {
  totalPages: TOTAL_PAGES,
  movies: buildList(movieItems, movieFeatured, (item) => item.title),
  tv: buildList(tvItems, tvFeatured, (item) => item.name)
};
