// vitest/fixtures/tmdb/search-to-details.browser.fixtures.js
// Fixture for the integration flow: search -> search results -> redirect to detail page.
// Search results reference the existing detail IDs: movie 155, tv 1396.
//
// Flow steps (see `flows.movie` / `flows.tv`):
//   1. search    : query typed by the user + response of the internal search API
//   2. result    : the result that is clicked + the link it points to
//   3. tmdb      : raw TMDB responses the detail page loads for that link
//   4. expected  : what the rendered detail page must show

import { apiResponses } from './tmdb.api.fixtures.js';
import { rawFixtures } from './tmdb.browser.fixtures.js';

const searchResponse = {
  page: 1,
  total_pages: 1,
  total_results: 2,
  results: [
    {
      id: 155,
      title: 'The Dark Knight',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      media_type: 'movie',
      release_date: '2008-07-16',
      vote_average: 8.536
    },
    {
      id: 1396,
      name: 'Breaking Bad',
      poster_path: '/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg',
      media_type: 'tv',
      first_air_date: '2008-01-20',
      vote_average: 9.0
    }
  ]
};

// Response of the internal /api/<locale>/search route (already mapped for the UI).
const apiResponse = {
  movies: [
    {
      id: 155,
      title: 'The Dark Knight',
      mediaType: 'movie',
      date: '2008-07-16',
      rating: 8.536,
      posterUrl: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    }
  ],
  tvShows: [
    {
      id: 1396,
      title: 'Breaking Bad',
      mediaType: 'tv',
      date: '2008-01-20',
      rating: 9.0,
      posterUrl: '/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg'
    }
  ]
};

const expectedLinks = {
  movie: { id: 155, title: 'The Dark Knight', href: '/en-US/movies/155' },
  tv: { id: 1396, title: 'Breaking Bad', href: '/en-US/tv-shows/1396' }
};

const flows = {
  movie: {
    search: { query: 'Dark', apiResponse },
    result: expectedLinks.movie,
    tmdb: {
      details: apiResponses.movieDetailFull,
      certification: apiResponses.movieCertification,
      providers: apiResponses.movieWatchProviders
    },
    expected: {
      title: 'The Dark Knight',
      runtime: '152 min',
      certification: 'PG-13',
      castNames: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
      providerName: 'Netflix'
    }
  },

  tv: {
    search: { query: 'Breaking', apiResponse },
    result: expectedLinks.tv,
    tmdb: {
      details: apiResponses.tvDetailFull,
      certification: apiResponses.tvCertification,
      providers: apiResponses.tvWatchProviders,
      season: rawFixtures.tvSeason1
    },
    expected: {
      title: 'Breaking Bad',
      certification: 'TV-MA',
      castNames: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
      providerName: 'Amazon Video',
      seasonLabel: 'Season 1'
    }
  }
};

export const searchToDetailsFixture = {
  searchResponse,
  apiResponse,
  expectedLinks,
  flows,

  movieDetails: {
    id: 155,
    mediaType: 'movie',
    title: 'The Dark Knight',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: '/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg',
    releaseDate: '2008-07-16',
    runtime: 152,
    voteAverage: 8.536,
    voteCount: 36849,
    genres: [
      { id: 28, name: 'Action' },
      { id: 53, name: 'Thriller' },
      { id: 80, name: 'Crime' }
    ],
    status: 'Released',
    tagline: 'Some men just want to watch the world burn.',
    cast: [
      { id: 3894, name: 'Christian Bale', character: 'Bruce Wayne', order: 0 },
      { id: 1810, name: 'Heath Ledger', character: 'Joker', order: 1 },
      { id: 6383, name: 'Aaron Eckhart', character: 'Harvey Dent', order: 2 },
      { id: 3895, name: 'Michael Caine', character: 'Alfred', order: 3 },
      { id: 192, name: 'Morgan Freeman', character: 'Lucius Fox', order: 6 }
    ],
    crew: [
      { id: 3904, name: 'Lee Smith', job: 'Editor', department: 'Editing' },
      { id: 3893, name: 'David S. Goyer', job: 'Story', department: 'Writing' },
      { id: 10949, name: 'Michael Uslan', job: 'Executive Producer', department: 'Production' }
    ],
    // Not in source fixtures, added for the detail page:
    productionCompanies: [
      { id: 174, name: 'Warner Bros. Pictures' },
      { id: 9993, name: 'DC Comics' }
    ],
    certification: 'PG-13',
    homepage: '',
    trailerUrls: []
  },

  tvShowDetails: {
    id: 1396,
    mediaType: 'tv',
    title: 'Breaking Bad',
    overview:
      'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live.',
    posterPath: '/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg',
    backdropPath: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    firstAirDate: '2008-01-20',
    lastAirDate: '2013-09-29',
    voteAverage: 9.0,
    voteCount: 18726,
    genres: [
      { id: 18, name: 'Drama' },
      { id: 80, name: 'Crime' }
    ],
    status: 'Ended',
    numberOfSeasons: 5,
    numberOfEpisodes: 62,
    seasons: [
      {
        id: 3572,
        season_number: 1,
        name: 'Season 1',
        air_date: '2008-01-20',
        episode_count: 7,
        episodes: [
          {
            id: 62085,
            episode_number: 1,
            name: 'Pilot',
            air_date: '2008-01-20',
            runtime: 59,
            vote_average: 8.504
          },
          {
            id: 62086,
            episode_number: 2,
            name: "Cat's in the Bag...",
            air_date: '2008-01-27',
            runtime: 49,
            vote_average: 8.249
          },
          {
            id: 62087,
            episode_number: 3,
            name: "...And the Bag's in the River",
            air_date: '2008-02-10',
            runtime: 49,
            vote_average: 8.422
          }
        ]
      },
      {
        id: 3573,
        season_number: 2,
        name: 'Season 2',
        air_date: '2009-03-08',
        episode_count: 13,
        episodes: []
      }
    ],
    cast: [
      { id: 17419, name: 'Bryan Cranston', character: 'Walter White', order: 0 },
      { id: 84497, name: 'Aaron Paul', character: 'Jesse Pinkman', order: 1 },
      { id: 134531, name: 'Anna Gunn', character: 'Skyler White', order: 2 }
    ],
    crew: [
      { id: 24951, name: 'Peter Gould', job: 'Co-Executive Producer', department: 'Production' },
      { id: 1223202, name: 'Diane Mercer', job: 'Producer', department: 'Production' }
    ]
  }
};

export const searchToDetailsApiResponse = searchToDetailsFixture.apiResponse;
export const searchToDetailsExpectedLinks = searchToDetailsFixture.expectedLinks;
