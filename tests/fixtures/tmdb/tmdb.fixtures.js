/**
 * TMDB Test Fixtures
 * Auto-generated from real TMDB API responses.
 * Raw API responses: ./tmdb.raw.fixtures.json
 *
 * rawFixtures  – 1:1 TMDB API response shapes (for mocking fetch/axios)
 * mappedFixtures – app-internal mapped shapes (used in unit/integration tests)
 */

import rawData from './tmdb.raw.fixtures.json' with { type: 'json' };

// ── Raw API Response Fixtures ─────────────────────────────────────────────────
export const rawFixtures = rawData;

// ── Mapped Fixtures (app-internal format) ────────────────────────────────────
export const mappedFixtures = {
  movieListItem: {
    id: 969681,
    mediaType: 'movie',
    title: 'Spider-Man: Brand New Day',
    overview:
      "Fighting crime full-time as Spider-Man in a world that doesn't remember him\u2014and the pressure of seeing his old friends move on without him\u2014sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
    posterPath: '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg',
    backdropPath: '/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg',
    releaseDate: '2026-07-29',
    voteAverage: 7.864,
    genreIds: [878, 28, 12]
  },
  tvShowListItem: {
    id: 91759,
    mediaType: 'tv',
    title: 'Come Home Love: Lo and Behold',
    overview:
      "Hung Sue Gan starting from the bottom, established his own logistics company, which is now running smoothly. His only concern now are his three daughters. His eldest daughter has immigrated overseas. His second daughter Hung Yeuk Shui has reached the marriageable age, but has no hopes for marriage anytime soon. She is constantly bickering with her younger sister Hung Sum Yue, who is an honour student, over trivial matters, causing their father to not know whether to laugh or cry. Hung Sue Yan, Hung Sue Gan's brother, moves in with the family, temporarily ending his life as a nomadic photographer. He joins Hung Yeuk Shui's company and encounters Ko Pak Fei, the director of an online shop. The two appear to be former lovers, making for lots of laughter. Since Hung Sue Yan moved in, a series of strange events have occurred in the family. Upon investigation, the source is traced to Lung Ging Fung, a promising young man who is the son of department store mogul Lung Gam Wai.",
    posterPath: '/lgD4j9gUGmMckZpWWRJjorWqGVT.jpg',
    backdropPath: '/dyFTt1a9ZpFdKE96kPlE9fQvXOJ.jpg',
    firstAirDate: '2017-02-20',
    voteAverage: 5.4,
    genreIds: [10751, 35, 18]
  },
  moviesPopular: {
    page: 1,
    totalPages: 1001,
    totalResults: 20001,
    results: [
      {
        id: 969681,
        mediaType: 'movie',
        title: 'Spider-Man: Brand New Day',
        overview:
          "Fighting crime full-time as Spider-Man in a world that doesn't remember him\u2014and the pressure of seeing his old friends move on without him\u2014sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        posterPath: '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg',
        backdropPath: '/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg',
        releaseDate: '2026-07-29',
        voteAverage: 7.864,
        genreIds: [878, 28, 12]
      },
      {
        id: 1423191,
        mediaType: 'movie',
        title: 'Resident Evil',
        overview:
          'Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.',
        posterPath: '/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg',
        backdropPath: '/3icyRAqgakNcQn6aDVz9libFmBA.jpg',
        releaseDate: '2026-09-16',
        voteAverage: 7.3,
        genreIds: [27, 878, 12]
      },
      {
        id: 1368337,
        mediaType: 'movie',
        title: 'The Odyssey',
        overview:
          'Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.',
        posterPath: '/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg',
        backdropPath: '/bulFtfy3oBQtCnAMSi7g6DSSds3.jpg',
        releaseDate: '2026-07-15',
        voteAverage: 8.012,
        genreIds: [12, 28, 14]
      },
      {
        id: 1101383,
        mediaType: 'movie',
        title: 'The End of Oak Street',
        overview:
          'After a mysterious cosmic event rips Oak Street from suburbia and transports their neighborhood to someplace unknown, the Platt family soon discovers that their very survival depends on them sticking together as they navigate their now unrecognizable surroundings.',
        posterPath: '/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg',
        backdropPath: '/b9q9VmbXDvJmTziRqkwdEmFdwhr.jpg',
        releaseDate: '2026-08-12',
        voteAverage: 7.1,
        genreIds: [878, 9648, 53]
      },
      {
        id: 1032863,
        mediaType: 'movie',
        title: 'The Love Hypothesis',
        overview:
          'Olive Smith, a biology PhD candidate, and Dr. Adam Carlsen, a hotshot professor and well-known tyrant, enter into a fake relationship, seeing each of their carefully calculated theories on love get thrown into chaos.',
        posterPath: '/vfZxVHextAGC70zrNhS8lsROqP1.jpg',
        backdropPath: '/o7Oy9Gbx1CCyaweL8xUhtMW4Puq.jpg',
        releaseDate: '2026-09-23',
        voteAverage: 8.126,
        genreIds: [10749, 35]
      }
    ]
  },
  tvPopular: {
    page: 1,
    totalPages: 1001,
    totalResults: 20001,
    results: [
      {
        id: 91759,
        mediaType: 'tv',
        title: 'Come Home Love: Lo and Behold',
        overview:
          "Hung Sue Gan starting from the bottom, established his own logistics company, which is now running smoothly. His only concern now are his three daughters. His eldest daughter has immigrated overseas. His second daughter Hung Yeuk Shui has reached the marriageable age, but has no hopes for marriage anytime soon. She is constantly bickering with her younger sister Hung Sum Yue, who is an honour student, over trivial matters, causing their father to not know whether to laugh or cry. Hung Sue Yan, Hung Sue Gan's brother, moves in with the family, temporarily ending his life as a nomadic photographer. He joins Hung Yeuk Shui's company and encounters Ko Pak Fei, the director of an online shop. The two appear to be former lovers, making for lots of laughter. Since Hung Sue Yan moved in, a series of strange events have occurred in the family. Upon investigation, the source is traced to Lung Ging Fung, a promising young man who is the son of department store mogul Lung Gam Wai.",
        posterPath: '/lgD4j9gUGmMckZpWWRJjorWqGVT.jpg',
        backdropPath: '/dyFTt1a9ZpFdKE96kPlE9fQvXOJ.jpg',
        firstAirDate: '2017-02-20',
        voteAverage: 5.4,
        genreIds: [10751, 35, 18]
      },
      {
        id: 22980,
        mediaType: 'tv',
        title: 'Watch What Happens Live with Andy Cohen',
        overview:
          'Bravo network executive Andy Cohen discusses pop culture topics with celebrities and reality show personalities.',
        posterPath: '/onSD9UXfJwrMXWhq7UY7hGF2S1h.jpg',
        backdropPath: '/hINekSpbcBxjnjGqmIm6I4bz2ab.jpg',
        firstAirDate: '2009-07-16',
        voteAverage: 4.969,
        genreIds: [10767, 35]
      },
      {
        id: 275102,
        mediaType: 'tv',
        title: 'The Scandal',
        overview:
          'In Joseon, a secret proposal ignites hidden desires in a gifted noblewoman, a famed lover and an unsuspecting lady caught in their dangerous game.',
        posterPath: '/4TU0PcHBIl0wPW5B6aVRGExOnHE.jpg',
        backdropPath: '/uc1p1PEbEMpdIHqnU9TESNC6Jhp.jpg',
        firstAirDate: '2026-09-18',
        voteAverage: 6.6,
        genreIds: [18]
      },
      {
        id: 2734,
        mediaType: 'tv',
        title: 'Law & Order: Special Victims Unit',
        overview:
          'In the criminal justice system, sexually-based offenses are considered especially heinous. In New York City, the dedicated detectives who investigate these vicious felonies are members of an elite squad known as the Special Victims Unit. These are their stories.',
        posterPath: '/iofokHZoUB4Qhik4PflvJl8TT6a.jpg',
        backdropPath: '/obtdxPgmfykYwVnvuYXC5f2xKlQ.jpg',
        firstAirDate: '1999-09-20',
        voteAverage: 7.956,
        genreIds: [80, 18, 9648]
      },
      {
        id: 2261,
        mediaType: 'tv',
        title: 'The Tonight Show Starring Johnny Carson',
        overview:
          'The Tonight Show Starring Johnny Carson is a talk show hosted by Johnny Carson under The Tonight Show franchise from 1962 to 1992.',
        posterPath: '/uSvET5YUvHNDIeoCpErrbSmasFb.jpg',
        backdropPath: '/qFfWFwfaEHzDLWLuttWiYq7Poy2.jpg',
        firstAirDate: '1962-10-01',
        voteAverage: 7.562,
        genreIds: [10767]
      }
    ]
  },
  tvSeasonWithEpisodes: {
    id: 3572,
    showId: 1396,
    seasonNumber: 1,
    name: 'Season 1',
    overview:
      'High school chemistry teacher Walter White\'s life is suddenly transformed by a dire medical diagnosis. Street-savvy former student Jesse Pinkman "teaches" Walter a new trade.',
    airDate: '2008-01-20',
    posterPath: '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg',
    episodes: [
      {
        id: 62085,
        episodeNumber: 1,
        name: 'Pilot',
        overview:
          'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer, he decides to team up with a former student and create a top of the line crystal meth in a used RV, to provide for his family once he is gone.',
        airDate: '2008-01-20',
        stillPath: '/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
        voteAverage: 8.504,
        runtime: 59
      },
      {
        id: 62086,
        episodeNumber: 2,
        name: "Cat's in the Bag...",
        overview:
          "Walt and Jesse attempt to tie up loose ends. The desperate situation gets more complicated with the flip of a coin. Walt's wife, Skyler, becomes suspicious of Walt's strange behavior.",
        airDate: '2008-01-27',
        stillPath: '/AbMoecO0ZZio0LcgeLxlzdyGs6X.jpg',
        voteAverage: 8.249,
        runtime: 49
      },
      {
        id: 62087,
        episodeNumber: 3,
        name: "...And the Bag's in the River",
        overview:
          'Walter fights with Jesse over his drug use, causing him to leave Walter alone with their captive, Krazy-8. Meanwhile, Hank has a scared straight moment with Walter Jr. after his aunt discovers he has been smoking pot.',
        airDate: '2008-02-10',
        stillPath: '/vlgGfjtuO2WSLT7qYDVlvTpSVW.jpg',
        voteAverage: 8.422,
        runtime: 49
      },
      {
        id: 62088,
        episodeNumber: 4,
        name: 'Cancer Man',
        overview:
          'Walter finally tells his family that he has been stricken with cancer. Meanwhile, the DEA believes Albuquerque has a new, big time player to worry about.',
        airDate: '2008-02-17',
        stillPath: '/i5BAJVhuIWfkoSqDID6FnQNCTVc.jpg',
        voteAverage: 7.928,
        runtime: 49
      },
      {
        id: 62089,
        episodeNumber: 5,
        name: 'Gray Matter',
        overview:
          "Walter and Skyler attend a former colleague's party. Jesse tries to free himself from the drugs, while Skyler organizes an intervention.",
        airDate: '2008-02-24',
        stillPath: '/82G3wZgEvZLKcte6yoZJahUWBtx.jpg',
        voteAverage: 8.156,
        runtime: 49
      },
      {
        id: 62090,
        episodeNumber: 6,
        name: "Crazy Handful of Nothin'",
        overview:
          'The side effects of chemo begin to plague Walt. Meanwhile, the DEA rounds up suspected dealers.',
        airDate: '2008-03-02',
        stillPath: '/rCCLuycNPL30W3BtuB8HafxEMYz.jpg',
        voteAverage: 8.902,
        runtime: 49
      },
      {
        id: 62091,
        episodeNumber: 7,
        name: 'A No Rough Stuff Type Deal',
        overview:
          "Walter accepts his new identity as a drug dealer after a PTA meeting. Elsewhere, Jesse decides to put his aunt's house on the market and Skyler is the recipient of a baby shower.",
        airDate: '2008-03-09',
        stillPath: '/1dgFAsajUpUT7DLXgAxHb9GyXHH.jpg',
        voteAverage: 8.388,
        runtime: 48
      }
    ]
  },
  genresMovie: [
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
  ],
  genresTv: [
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
  ],
  movieDetails: {
    id: 155,
    mediaType: 'movie',
    title: 'The Dark Knight',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
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
      {
        id: 3894,
        name: 'Christian Bale',
        character: 'Bruce Wayne',
        profile_path: '/7Pxez9J8fuPd2Mn9kex13YALrCQ.jpg',
        order: 0
      },
      {
        id: 1810,
        name: 'Heath Ledger',
        character: 'Joker',
        profile_path: '/AdWKVqyWpkYSfKE5Gb2qn8JzHni.jpg',
        order: 1
      },
      {
        id: 6383,
        name: 'Aaron Eckhart',
        character: 'Harvey Dent',
        profile_path: '/u5JjnRMr9zKEVvOP7k3F6gdcwT6.jpg',
        order: 2
      },
      {
        id: 3895,
        name: 'Michael Caine',
        character: 'Alfred',
        profile_path: '/bVZRMlpjTAO2pJK6v90buFgVbSW.jpg',
        order: 3
      },
      {
        id: 1579,
        name: 'Maggie Gyllenhaal',
        character: 'Rachel',
        profile_path: '/vsfkWdYWmA9CpzMHTJzrFxlDnEZ.jpg',
        order: 4
      },
      {
        id: 64,
        name: 'Gary Oldman',
        character: 'Gordon',
        profile_path: '/yhaSM5habNNI1Tf4ALRwRk3VvSZ.jpg',
        order: 5
      },
      {
        id: 192,
        name: 'Morgan Freeman',
        character: 'Lucius Fox',
        profile_path: '/905k0RFzH0Kd6gx8oSxRdnr6FL.jpg',
        order: 6
      },
      {
        id: 53651,
        name: 'Monique Gabriela Curnen',
        character: 'Ramirez',
        profile_path: '/lJgLQs7cfM49m8VzVviwxIByz76.jpg',
        order: 7
      },
      {
        id: 57597,
        name: 'Ron Dean',
        character: 'Wuertz',
        profile_path: '/mgqdr4VFrTVZatkki2suNLYxeDG.jpg',
        order: 8
      },
      {
        id: 2037,
        name: 'Cillian Murphy',
        character: 'Scarecrow',
        profile_path: '/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg',
        order: 9
      }
    ],
    crew: [
      {
        id: 3904,
        name: 'Lee Smith',
        job: 'Editor',
        department: 'Editing',
        profile_path: '/zlnK1i7CqdzIFTFqfMsYLyt2Sk8.jpg'
      },
      {
        id: 3893,
        name: 'David S. Goyer',
        job: 'Story',
        department: 'Writing',
        profile_path: '/gf44Hr3HJuWK7ZMHQKzDNBe0ylI.jpg'
      },
      {
        id: 561,
        name: 'John Papsidera',
        job: 'Casting',
        department: 'Production',
        profile_path: '/egwEVyrAmdWhtuLqE5fcThZf41E.jpg'
      },
      {
        id: 10949,
        name: 'Michael Uslan',
        job: 'Executive Producer',
        department: 'Production',
        profile_path: '/cXiiH0SSk5UHCvHOVAhHX7tNuls.jpg'
      },
      {
        id: 10951,
        name: 'Benjamin Melniker',
        job: 'Executive Producer',
        department: 'Production',
        profile_path: null
      }
    ]
  },
  tvShowDetailsWithSeasons: {
    id: 1396,
    mediaType: 'tv',
    title: 'Breaking Bad',
    overview:
      "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
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
        id: 3577,
        season_number: 0,
        name: 'Specials',
        overview: '',
        poster_path: '/4RaIvSQgHHHPfaI1jFqaMR8UJWM.jpg',
        air_date: '2009-02-17',
        episode_count: 9,
        episodes: []
      },
      {
        id: 3572,
        season_number: 1,
        name: 'Season 1',
        overview:
          'High school chemistry teacher Walter White\'s life is suddenly transformed by a dire medical diagnosis. Street-savvy former student Jesse Pinkman "teaches" Walter a new trade.',
        poster_path: '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg',
        air_date: '2008-01-20',
        episode_count: 7,
        episodes: [
          {
            id: 62085,
            episode_number: 1,
            name: 'Pilot',
            overview:
              'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer, he decides to team up with a former student and create a top of the line crystal meth in a used RV, to provide for his family once he is gone.',
            air_date: '2008-01-20',
            still_path: '/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
            vote_average: 8.504,
            runtime: 59
          },
          {
            id: 62086,
            episode_number: 2,
            name: "Cat's in the Bag...",
            overview: 'Walt and Jesse attempt to tie up loose ends.',
            air_date: '2008-01-27',
            still_path: '/AbMoecO0ZZio0LcgeLxlzdyGs6X.jpg',
            vote_average: 8.249,
            runtime: 49
          },
          {
            id: 62087,
            episode_number: 3,
            name: "...And the Bag's in the River",
            overview: 'Walter fights with Jesse over his drug use.',
            air_date: '2008-02-10',
            still_path: '/vlgGfjtuO2WSLT7qYDVlvTpSVW.jpg',
            vote_average: 8.422,
            runtime: 49
          },
          {
            id: 62088,
            episode_number: 4,
            name: 'Cancer Man',
            overview: 'Walter finally tells his family that he has been stricken with cancer.',
            air_date: '2008-02-17',
            still_path: '/i5BAJVhuIWfkoSqDID6FnQNCTVc.jpg',
            vote_average: 7.928,
            runtime: 49
          },
          {
            id: 62089,
            episode_number: 5,
            name: 'Gray Matter',
            overview: "Walter and Skyler attend a former colleague's party.",
            air_date: '2008-02-24',
            still_path: '/82G3wZgEvZLKcte6yoZJahUWBtx.jpg',
            vote_average: 8.156,
            runtime: 49
          },
          {
            id: 62090,
            episode_number: 6,
            name: "Crazy Handful of Nothin'",
            overview: 'The side effects of chemo begin to plague Walt.',
            air_date: '2008-03-02',
            still_path: '/rCCLuycNPL30W3BtuB8HafxEMYz.jpg',
            vote_average: 8.902,
            runtime: 49
          },
          {
            id: 62091,
            episode_number: 7,
            name: 'A No Rough Stuff Type Deal',
            overview: 'Walter accepts his new identity as a drug dealer after a PTA meeting.',
            air_date: '2008-03-09',
            still_path: '/1dgFAsajUpUT7DLXgAxHb9GyXHH.jpg',
            vote_average: 8.388,
            runtime: 48
          }
        ]
      },
      {
        id: 3573,
        season_number: 2,
        name: 'Season 2',
        overview: 'Walt must deal with the chain reaction of his choice.',
        poster_path: '/e3oGYpoTUhOFK0BJfloru5ZmGV.jpg',
        air_date: '2009-03-08',
        episode_count: 13,
        episodes: []
      },
      {
        id: 3575,
        season_number: 3,
        name: 'Season 3',
        overview: 'Walt continues to battle dueling identities.',
        poster_path: '/ffP8Q8ew048YofHRnFVM18B2fPG.jpg',
        air_date: '2010-03-21',
        episode_count: 13,
        episodes: []
      },
      {
        id: 3576,
        season_number: 4,
        name: 'Season 4',
        overview: 'Walt and Jesse must cope with the fallout of their previous actions.',
        poster_path: '/5ewrnKp4TboU4hTLT5cWO350mHj.jpg',
        air_date: '2011-07-17',
        episode_count: 13,
        episodes: []
      },
      {
        id: 3578,
        season_number: 5,
        name: 'Season 5',
        overview: 'Walt is faced with the prospect of moving on in a world without his enemy.',
        poster_path: '/r3z70vunihrAkjILQKWHX0G2xzO.jpg',
        air_date: '2012-07-15',
        episode_count: 16,
        episodes: []
      }
    ],
    cast: [
      {
        id: 17419,
        name: 'Bryan Cranston',
        character: 'Walter White',
        profile_path: '/7Jahy5LZX2Fo8fGJltMreAI49hC.jpg',
        order: 0
      },
      {
        id: 84497,
        name: 'Aaron Paul',
        character: 'Jesse Pinkman',
        profile_path: '/8Ac9uuoYwZoYVAIJfRLzzLsGGJn.jpg',
        order: 1
      },
      {
        id: 134531,
        name: 'Anna Gunn',
        character: 'Skyler White',
        profile_path: '/adppyeu1a4REN3khtgmXusrapFi.jpg',
        order: 2
      },
      {
        id: 209674,
        name: 'RJ Mitte',
        character: 'Walter White Jr.',
        profile_path: '/sNPA92ZrssYhlaB1UA2pWcLD9db.jpg',
        order: 3
      },
      {
        id: 14329,
        name: 'Dean Norris',
        character: 'Hank Schrader',
        profile_path: '/mKRrEbsxAX3ro700HsViFArRM7l.jpg',
        order: 4
      },
      {
        id: 1217934,
        name: 'Betsy Brandt',
        character: 'Marie Schrader',
        profile_path: '/xAnuzyjdMbQq9L1c4JNwXL52Wm4.jpg',
        order: 5
      },
      {
        id: 59410,
        name: 'Bob Odenkirk',
        character: 'Saul Goodman',
        profile_path: '/rF0Lb6SBhGSTvjRffmlKRSeI3jE.jpg',
        order: 7
      },
      {
        id: 783,
        name: 'Jonathan Banks',
        character: 'Mike Ehrmantraut',
        profile_path: '/bswk26L13PvY4iMTwUTAsepXCLv.jpg',
        order: 9
      }
    ],
    crew: [
      {
        id: 24951,
        name: 'Peter Gould',
        job: 'Co-Executive Producer',
        department: 'Production',
        profile_path: '/a2dJSpUiXQ2NAxqSzztr6WsnhOJ.jpg'
      },
      {
        id: 103009,
        name: 'Thomas Schnauz',
        job: 'Co-Executive Producer',
        department: 'Production',
        profile_path: '/uMz5wsgv6QQAgFI809SgCCbwYn9.jpg'
      },
      {
        id: 1223193,
        name: 'George Mastras',
        job: 'Co-Executive Producer',
        department: 'Production',
        profile_path: '/2K0NELbA0Ow45ECudbO2eFc1Fe4.jpg'
      },
      {
        id: 1537674,
        name: 'Jennifer Bryan',
        job: 'Costume Design',
        department: 'Costume & Make-Up',
        profile_path: '/oA5QovyVfEG0SUIs0DIhGsriyok.jpg'
      },
      {
        id: 1223202,
        name: 'Diane Mercer',
        job: 'Producer',
        department: 'Production',
        profile_path: null
      }
    ]
  },
  searchResults: {
    query: 'inception',
    page: 1,
    totalPages: 1,
    totalResults: 13,
    results: [
      {
        id: 27205,
        mediaType: 'movie',
        title: 'Inception',
        posterPath: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
        releaseDate: '2010-07-15',
        voteAverage: 8.373,
        overview:
          'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.'
      },
      {
        id: 542438,
        mediaType: 'movie',
        title: 'Bikini Inception',
        posterPath: '/mNASlEOFX2c9upxaSbgeKFvIr1L.jpg',
        releaseDate: '2015-05-19',
        voteAverage: 5.0,
        overview:
          'Two flunky Janitors in an Arctic Lab perform unauthorized experiments transporting them to a beach dream world.'
      },
      {
        id: 64956,
        mediaType: 'movie',
        title: 'Inception: The Cobol Job',
        posterPath: '/sNxqwtyHMNQwKWoFYDqcYTui5Ok.jpg',
        releaseDate: '2010-12-07',
        voteAverage: 7.2,
        overview: 'Cobb, Arthur and Nash are enlisted by Cobol Engineering.'
      },
      {
        id: 1359046,
        mediaType: 'movie',
        title: 'Inception',
        posterPath: null,
        releaseDate: '1980-01-23',
        voteAverage: 0.0,
        overview: 'This film shows how ordinary people work to build the Erdenet factory.'
      },
      {
        id: 250845,
        mediaType: 'movie',
        title: 'WWA The Inception',
        posterPath: null,
        releaseDate: '2001-10-26',
        voteAverage: 3.8,
        overview: 'The first World Wrestling Allstars pay per view, live from Sydney, Australia!'
      },
      {
        id: 613092,
        mediaType: 'movie',
        title: 'The Crack: Inception',
        posterPath: '/kzgPu2CMxBr4YZZxC1Off4cUfR9.jpg',
        releaseDate: '2019-10-04',
        voteAverage: 6.7,
        overview: 'Madrid, Spain, 1975; shortly after the end of the Franco dictatorship.'
      }
    ]
  },
  emptySearchResults: {
    query: 'xyznotfound999',
    page: 1,
    totalPages: 0,
    totalResults: 0,
    results: []
  },
  apiError: {
    statusCode: 404,
    statusMessage: 'The resource you requested could not be found.',
    success: false
  }
};
