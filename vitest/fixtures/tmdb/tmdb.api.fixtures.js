// vitest/fixtures/tmdb/tmdb.api.fixtures.js
// Additional raw TMDB API responses (snake_case) for the fetch mock.
// Pure module exports, no JSON import, usable in node and browser tests.

const person = (id, name, extra = {}) => ({
  id,
  credit_id: `credit-${id}`,
  name,
  profile_path: `/profile-${id}.jpg`,
  ...extra
});

export const apiResponses = {
  movieCertification: {
    results: [{ iso_3166_1: 'US', release_dates: [{ certification: 'PG-13' }] }]
  },
  tvCertification: {
    results: [{ iso_3166_1: 'US', rating: 'TV-MA' }]
  },
  movieWatchProviders: {
    results: {
      US: {
        link: 'https://example.com/watch/movie',
        flatrate: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png', display_priority: 1 }
        ]
      }
    }
  },
  tvWatchProviders: {
    results: {
      US: {
        link: 'https://example.com/watch/tv',
        buy: [
          {
            provider_id: 119,
            provider_name: 'Amazon Video',
            logo_path: '/amazon.png',
            display_priority: 2
          }
        ]
      }
    }
  },

  // Full raw movie detail (as returned with append_to_response=videos,credits)
  movieDetailFull: {
    id: 155,
    title: 'The Dark Knight',
    original_title: 'The Dark Knight',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    homepage: 'https://example.com/the-dark-knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg',
    release_date: '2008-07-16',
    runtime: 152,
    vote_average: 8.536,
    vote_count: 36849,
    genres: [
      { id: 28, name: 'Action' },
      { id: 53, name: 'Thriller' },
      { id: 80, name: 'Crime' }
    ],
    status: 'Released',
    tagline: 'Some men just want to watch the world burn.',
    production_companies: [
      { id: 174, name: 'Warner Bros. Pictures' },
      { id: 9993, name: 'DC Comics' }
    ],
    videos: {
      results: [{ site: 'YouTube', type: 'Trailer', official: true, key: 'EXeTwQWrcwY' }]
    },
    credits: {
      cast: [
        person(3894, 'Christian Bale', { character: 'Bruce Wayne', order: 0 }),
        person(1810, 'Heath Ledger', { character: 'Joker', order: 1 }),
        person(6383, 'Aaron Eckhart', { character: 'Harvey Dent', order: 2 }),
        person(3895, 'Michael Caine', { character: 'Alfred', order: 3 }),
        person(192, 'Morgan Freeman', { character: 'Lucius Fox', order: 6 })
      ],
      crew: [
        person(3904, 'Lee Smith', { job: 'Editor', department: 'Editing' }),
        person(3893, 'David S. Goyer', { job: 'Story', department: 'Writing' }),
        person(10949, 'Michael Uslan', { job: 'Executive Producer', department: 'Production' })
      ]
    }
  },

  // Full raw TV detail
  tvDetailFull: {
    id: 1396,
    name: 'Breaking Bad',
    original_name: 'Breaking Bad',
    overview:
      'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live.',
    homepage: 'https://example.com/breaking-bad',
    poster_path: '/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    first_air_date: '2008-01-20',
    last_air_date: '2013-09-29',
    vote_average: 9.0,
    vote_count: 18726,
    genres: [
      { id: 18, name: 'Drama' },
      { id: 80, name: 'Crime' }
    ],
    status: 'Ended',
    number_of_seasons: 5,
    number_of_episodes: 62,
    production_companies: [{ id: 11073, name: 'Sony Pictures Television Studios' }],
    seasons: [
      { id: 3577, season_number: 0, name: 'Specials', overview: '', poster_path: '/4RaIvSQgHHHPfaI1jFqaMR8UJWM.jpg', air_date: '2009-02-17', episode_count: 9 },
      { id: 3572, season_number: 1, name: 'Season 1', overview: 'High school chemistry teacher Walter White\'s life is suddenly transformed by a dire medical diagnosis.', poster_path: '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg', air_date: '2008-01-20', episode_count: 7 },
      { id: 3573, season_number: 2, name: 'Season 2', overview: 'Walt must deal with the chain reaction of his choice.', poster_path: '/e3oGYpoTUhOFK0BJfloru5ZmGV.jpg', air_date: '2009-03-08', episode_count: 13 },
      { id: 3575, season_number: 3, name: 'Season 3', overview: 'Walt continues to battle dueling identities.', poster_path: '/ffP8Q8ew048YofHRnFVM18B2fPG.jpg', air_date: '2010-03-21', episode_count: 13 },
      { id: 3576, season_number: 4, name: 'Season 4', overview: 'Walt and Jesse must cope with the fallout of their previous actions.', poster_path: '/5ewrnKp4TboU4hTLT5cWO350mHj.jpg', air_date: '2011-07-17', episode_count: 13 },
      { id: 3578, season_number: 5, name: 'Season 5', overview: 'Walt is faced with the prospect of moving on in a world without his enemy.', poster_path: '/r3z70vunihrAkjILQKWHX0G2xzO.jpg', air_date: '2012-07-15', episode_count: 16 }
    ],
    videos: {
      results: [{ site: 'YouTube', type: 'Trailer', official: true, key: 'HhesaQXLuRY' }]
    },
    credits: {
      cast: [
        person(17419, 'Bryan Cranston', { character: 'Walter White', order: 0 }),
        person(84497, 'Aaron Paul', { character: 'Jesse Pinkman', order: 1 }),
        person(134531, 'Anna Gunn', { character: 'Skyler White', order: 2 }),
        person(209674, 'RJ Mitte', { character: 'Walter White Jr.', order: 3 }),
        person(14329, 'Dean Norris', { character: 'Hank Schrader', order: 4 })
      ],
      crew: [
        person(24951, 'Peter Gould', { job: 'Co-Executive Producer', department: 'Production' }),
        person(103009, 'Thomas Schnauz', { job: 'Co-Executive Producer', department: 'Production' }),
        person(1537674, 'Jennifer Bryan', { job: 'Costume Design', department: 'Costume & Make-Up' })
      ]
    }
  }
};
