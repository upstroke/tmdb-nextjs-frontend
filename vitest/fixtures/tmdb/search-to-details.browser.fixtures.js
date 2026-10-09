const IMG = 'https://image.tmdb.org/t/p';

const mapPerson = (p) => ({
  ...p,
  creditId: `credit-${p.id}`,
  profilePath: p.profile_path ?? '',
  imageUrl: p.profile_path ? `${IMG}/w185${p.profile_path}` : '/not-available.png'
});

export const movieDetailMapped = {
  id: 155,
  mediaType: 'movie',
  title: 'The Dark Knight',
  releaseDate: '2008-07-16',
  overview: mappedFixtures.movieDetails.overview,
  homepage: '',
  trailerUrls: [],
  genres: mappedFixtures.movieDetails.genres,
  rating: 8.536,
  runtime: 152,
  episodeRunTime: [],
  productionCompanies: [{ id: 174, name: 'Warner Bros. Pictures' }],
  imageUrl: `${IMG}/w1280/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg`,
  posterUrl: `${IMG}/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
  cast: mappedFixtures.movieDetails.cast.map((c) =>
    mapPerson({ id: c.id, name: c.name, character: c.character, order: c.order, profile_path: c.profile_path })),
  crew: mappedFixtures.movieDetails.crew.map((c) =>
    mapPerson({ id: c.id, name: c.name, job: c.job, department: c.department, profile_path: c.profile_path })),
  certification: 'PG-13',
  providers: null
};

const tv = mappedFixtures.tvShowDetailsWithSeasons;

export const tvDetailMapped = {
  id: 1396,
  mediaType: 'tv',
  title: 'Breaking Bad',
  releaseDate: '2008-01-20',
  overview: tv.overview,
  homepage: '',
  trailerUrls: [],
  genres: tv.genres,
  rating: 9.0,
  runtime: null,
  episodeRunTime: [47],
  productionCompanies: [{ id: 11073, name: 'Sony Pictures Television Studios' }],
  imageUrl: `${IMG}/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg`,
  posterUrl: `${IMG}/w342/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg`,
  cast: tv.cast.map((c) =>
    mapPerson({ id: c.id, name: c.name, character: c.character, order: c.order, profile_path: c.profile_path })),
  crew: tv.crew.map((c) =>
    mapPerson({ id: c.id, name: c.name, job: c.job, department: c.department, profile_path: c.profile_path })),
  certification: 'TV-MA',
  providers: null,
  numberOfSeasons: 5,
  numberOfEpisodes: 62,
  seasons: tv.seasons.map(({ episodes, ...s }) => s)
};

export const tvSeasonMapped = (seasonNumber) => {
  const s = tv.seasons.find((x) => x.season_number === seasonNumber);
  return {
    id: s.id,
    seasonNumber: s.season_number,
    name: s.name,
    overview: s.overview,
    airDate: s.air_date,
    posterUrl: `${IMG}/w342${s.poster_path}`,
    episodes: s.episodes.map((e) => ({
      id: e.id,
      episodeNumber: e.episode_number,
      name: e.name,
      overview: e.overview,
      airDate: e.air_date,
      runtime: e.runtime,
      rating: e.vote_average,
      stillUrl: `${IMG}/w300${e.still_path}`
    }))
  };
};
