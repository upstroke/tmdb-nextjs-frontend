// vitest/fixtures/tmdb/tmdb.browser.fixtures.js
// Browser-compatible fixtures (no JSON imports, data embedded)
// Used for browser-based component tests

// Embedded data from tmdb.raw.fixtures.json
const embeddedData = {
  moviesPopular: {
    page: 1,
    total_pages: 1001,
    total_results: 20001,
    results: [
      {
        id: 969681,
        title: 'Spider-Man: Brand New Day',
        original_title: 'Spider-Man: Brand New Day',
        overview:
          "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        poster_path: '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg',
        backdrop_path: '/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg',
        release_date: '2026-07-29',
        vote_average: 7.864,
        vote_count: 2949,
        genre_ids: [878, 28, 12],
        media_type: 'movie',
        certification: 'PG'
      },
      {
        id: 1423191,
        title: 'Resident Evil',
        original_title: 'Resident Evil',
        overview:
          'Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.',
        poster_path: '/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg',
        backdrop_path: '/3icyRAqgakNcQn6aDVz9libFmBA.jpg',
        release_date: '2026-09-16',
        vote_average: 7.3,
        vote_count: 619,
        genre_ids: [27, 878, 12],
        media_type: 'movie',
        certification: 'PG'
      },
      {
        id: 1368337,
        title: 'The Odyssey',
        original_title: 'The Odyssey',
        overview:
          'Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.',
        poster_path: '/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg',
        backdrop_path: '/bulFtfy3oBQtCnAMSi7g6DSSds3.jpg',
        release_date: '2026-07-15',
        vote_average: 8.012,
        vote_count: 3978,
        genre_ids: [12, 28, 14],
        media_type: 'movie',
        certification: 'PG'
      }
    ]
  },
  movieDetail: {
    id: 155,
    title: 'The Dark Knight',
    original_title: 'The Dark Knight',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
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
    budget: 185000000,
    revenue: 1004558444
  },
  tvPopular: {
    page: 1,
    total_pages: 1001,
    total_results: 20001,
    results: [
      {
        id: 91759,
        name: 'Come Home Love: Lo and Behold',
        original_name: '愛·回家之開心速遞',
        overview: 'Hung Sue Gan starting from the bottom, established his own logistics company...',
        poster_path: '/lgD4j9gUGmMckZpWWRJjorWqGVT.jpg',
        backdrop_path: '/dyFTt1a9ZpFdKE96kPlE9fQvXOJ.jpg',
        first_air_date: '2017-02-20',
        vote_average: 5.4,
        vote_count: 46,
        genre_ids: [10751, 35, 18],
        media_type: 'tv'
      }
    ]
  },
  tvDetail: {
    id: 1396,
    name: 'Breaking Bad',
    original_name: 'Breaking Bad',
    overview: 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer...',
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
    number_of_episodes: 62
  },
  tvSeason1: {
    id: 3572,
    season_number: 1,
    name: 'Season 1',
    overview:
      "High school chemistry teacher Walter White's life is suddenly transformed by a dire medical diagnosis...",
    air_date: '2008-01-20',
    poster_path: '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg',
    episodes: [
      {
        id: 62085,
        episode_number: 1,
        name: 'Pilot',
        overview:
          'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer...',
        air_date: '2008-01-20',
        still_path: '/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
        vote_average: 8.504,
        runtime: 59
      }
    ]
  },
  searchMulti: {
    page: 1,
    total_pages: 1,
    total_results: 13,
    results: [
      {
        id: 27205,
        title: 'Inception',
        overview:
          'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious...',
        poster_path: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
        media_type: 'movie',
        release_date: '2010-07-15',
        vote_average: 8.373
      }
    ]
  },
  genresMovie: {
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 10770, name: 'TV Movie' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' }
    ]
  },
  genresTv: {
    genres: [
      { id: 10759, name: 'Action & Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 10762, name: 'Kids' },
      { id: 9648, name: 'Mystery' },
      { id: 10763, name: 'News' },
      { id: 10764, name: 'Reality' },
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 10766, name: 'Soap' },
      { id: 10767, name: 'Talk' },
      { id: 10768, name: 'War & Politics' },
      { id: 37, name: 'Western' }
    ]
  },
  error404: {
    success: false,
    status_code: 34,
    status_message: 'The resource you requested could not be found.'
  }
};

// Map to app-internal format (same structure as tmdb.fixtures.js)
export const mappedFixtures = {
  movies: embeddedData.moviesPopular.results.map((movie) => ({
    id: movie.id,
    mediaType: movie.media_type,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    genreIds: movie.genre_ids
  })),
  tvShows: embeddedData.tvPopular.results.map((show) => ({
    id: show.id,
    mediaType: show.media_type,
    title: show.name,
    overview: show.overview,
    posterPath: show.poster_path,
    backdropPath: show.backdrop_path,
    firstAirDate: show.first_air_date,
    voteAverage: show.vote_average,
    genreIds: show.genre_ids
  })),
  movieDetails: {
    id: embeddedData.movieDetail.id,
    mediaType: 'movie',
    title: embeddedData.movieDetail.title,
    overview: embeddedData.movieDetail.overview,
    posterPath: embeddedData.movieDetail.poster_path,
    backdropPath: embeddedData.movieDetail.backdrop_path,
    releaseDate: embeddedData.movieDetail.release_date,
    runtime: embeddedData.movieDetail.runtime,
    voteAverage: embeddedData.movieDetail.vote_average,
    genres: embeddedData.movieDetail.genres,
    status: embeddedData.movieDetail.status,
    tagline: embeddedData.movieDetail.tagline
  },
  tvShowDetails: {
    id: embeddedData.tvDetail.id,
    mediaType: 'tv',
    title: embeddedData.tvDetail.name,
    overview: embeddedData.tvDetail.overview,
    posterPath: embeddedData.tvDetail.poster_path,
    backdropPath: embeddedData.tvDetail.backdrop_path,
    firstAirDate: embeddedData.tvDetail.first_air_date,
    lastAirDate: embeddedData.tvDetail.last_air_date,
    voteAverage: embeddedData.tvDetail.vote_average,
    genres: embeddedData.tvDetail.genres,
    status: embeddedData.tvDetail.status,
    numberOfSeasons: embeddedData.tvDetail.number_of_seasons,
    numberOfEpisodes: embeddedData.tvDetail.number_of_episodes
  },
  tvSeasonWithEpisodes: {
    id: embeddedData.tvSeason1.id,
    showId: embeddedData.tvDetail.id,
    seasonNumber: embeddedData.tvSeason1.season_number,
    name: embeddedData.tvSeason1.name,
    overview: embeddedData.tvSeason1.overview,
    airDate: embeddedData.tvSeason1.air_date,
    posterPath: embeddedData.tvSeason1.poster_path,
    episodes: embeddedData.tvSeason1.episodes.map((ep) => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      airDate: ep.air_date,
      stillPath: ep.still_path,
      voteAverage: ep.vote_average,
      runtime: ep.runtime
    }))
  },
  searchResults: embeddedData.searchMulti.results.map((item) => ({
    id: item.id,
    mediaType: item.media_type,
    title: item.title,
    posterPath: item.poster_path,
    releaseDate: item.release_date,
    voteAverage: item.vote_average,
    overview: item.overview
  })),
  genres: embeddedData.genresMovie.genres
};

// Export raw fixtures for API mocking
export const rawFixtures = embeddedData;
