import { describe, expect, it, vi } from 'vitest';
import {
  getTrailerUrls,
  mapCardItem,
  mapCast,
  mapCrew,
  mapDetails,
  mapFeaturedItem,
  mapWatchProvider,
  mapWatchProviderList,
  parseFeaturedItem,
  parseWatchProviderResult,
  resolveGenres
} from '@/lib/services/tmdb/mappers';

const GENRE_MAPS = {
  movie: { 18: 'Drama', 878: 'Science Fiction' },
  tv: { 10765: 'Sci-Fi & Fantasy' }
};

const RAW_MOVIE = {
  id: 550,
  title: 'Fight Club',
  overview: 'Rules.',
  homepage: 'https://example.com',
  backdrop_path: '/fc_backdrop.jpg',
  poster_path: '/fc_poster.jpg',
  release_date: '1999-10-15',
  vote_average: 8.8,
  genres: [{ id: 18, name: 'Drama' }],
  runtime: 139,
  episode_run_time: [],
  production_companies: [
    { id: 1, name: 'A24', logo_path: '/a24.png' },
    { id: 2, name: 'No Logo' }
  ],
  credits: {
    cast: [
      {
        id: 1,
        credit_id: 'c1',
        name: 'Alice',
        character: 'Hero',
        order: 0,
        profile_path: '/alice.jpg'
      }
    ],
    crew: [
      {
        id: 2,
        credit_id: 'c2',
        name: 'Bob',
        job: 'Director',
        department: 'Directing',
        profile_path: '/bob.jpg'
      }
    ]
  },
  videos: {
    results: [
      { site: 'YouTube', type: 'Trailer', key: 'abc123' },
      { site: 'YouTube', type: 'Teaser', key: 'teaser' },
      { site: 'Vimeo', type: 'Trailer', key: 'vimeo' }
    ]
  },
  media_type: 'movie'
};

const RAW_TV_SHOW = {
  id: 1399,
  name: 'Game of Thrones',
  overview: 'Dragons.',
  homepage: 'https://hbo.com/got',
  backdrop_path: '/got_backdrop.jpg',
  poster_path: '/got_poster.jpg',
  first_air_date: '2011-04-17',
  vote_average: 9.2,
  genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
  runtime: null,
  episode_run_time: [60],
  production_companies: [],
  number_of_seasons: 8,
  number_of_episodes: 73,
  seasons: [],
  credits: { cast: [], crew: [] },
  videos: { results: [] },
  media_type: 'tv'
};

describe('resolveGenres', () => {
  it('resolves movie genre IDs', () => {
    expect(resolveGenres([18, 878], 'movie', GENRE_MAPS)).toEqual([
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' }
    ]);
  });

  it('resolves TV genre IDs', () => {
    expect(resolveGenres([10765], 'tv', GENRE_MAPS)).toEqual([
      { id: 10765, name: 'Sci-Fi & Fantasy' }
    ]);
  });

  it('filters unknown genre IDs', () => {
    expect(resolveGenres([18, 999], 'movie', GENRE_MAPS)).toEqual([{ id: 18, name: 'Drama' }]);
  });

  it('returns an empty array for empty input', () => {
    expect(resolveGenres([], 'movie', GENRE_MAPS)).toEqual([]);
  });
});

describe('mapCardItem', () => {
  it('maps a movie with inline genres', () => {
    const result = mapCardItem(
      {
        id: 550,
        media_type: 'movie',
        title: 'Fight Club',
        release_date: '1999-10-15',
        vote_average: 8.8,
        genres: [{ id: 18, name: 'Drama' }],
        poster_path: '/fc_poster.jpg'
      },
      GENRE_MAPS
    );

    expect(result).toMatchObject({
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      date: '1999-10-15',
      rating: 8.8,
      genres: [{ id: 18, name: 'Drama' }],
      imageUrl: 'https://image.tmdb.org/t/p/w500/fc_poster.jpg',
      posterUrl: 'https://image.tmdb.org/t/p/w342/fc_poster.jpg'
    });
  });

  it('maps a TV show and resolves genre IDs', () => {
    const result = mapCardItem(
      {
        id: 1399,
        media_type: 'tv',
        name: 'Game of Thrones',
        first_air_date: '2011-04-17',
        vote_average: 9.2,
        genre_ids: [10765],
        poster_path: '/got_poster.jpg'
      },
      GENRE_MAPS
    );

    expect(result).toMatchObject({
      id: 1399,
      mediaType: 'tv',
      title: 'Game of Thrones',
      date: '2011-04-17',
      genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }]
    });
  });

  it('uses the fallback media type when media_type is absent', () => {
    const result = mapCardItem({ id: 1, title: 'Movie', vote_average: 7 }, GENRE_MAPS, 'movie');

    expect(result?.mediaType).toBe('movie');
  });

  it('uses the placeholder image when no image path exists', () => {
    const result = mapCardItem(
      { id: 1, media_type: 'movie', title: 'No Image', vote_average: 7 },
      GENRE_MAPS
    );

    expect(result?.imageUrl).toBe('/not-available.png');
    expect(result?.posterUrl).toBe('/not-available.png');
  });

  it('returns null when the item has no ID', () => {
    expect(mapCardItem({ title: 'No ID' }, GENRE_MAPS)).toBeNull();
  });

  it('returns null when the media type cannot be resolved', () => {
    expect(mapCardItem({ id: 1, vote_average: 7 }, GENRE_MAPS)).toBeNull();
  });

  it('returns N/A genres when genre resolution fails', () => {
    const result = mapCardItem(
      { id: 1, media_type: 'movie', title: 'Unknown', vote_average: 7, genre_ids: [999] },
      GENRE_MAPS
    );

    expect(result?.genres).toEqual([{ id: 'na', name: 'N/A' }]);
  });
});

describe('mapWatchProvider', () => {
  it('maps a valid provider', () => {
    const provider = {
      provider_id: 8,
      provider_name: 'Netflix',
      logo_path: '/netflix.png',
      display_priority: 1
    };

    expect(mapWatchProvider(provider, 'flatrate', 'https://example.com')).toEqual({
      providerId: 8,
      providerName: 'Netflix',
      type: 'flatrate',
      link: 'https://example.com',
      logoPath: '/netflix.png',
      displayPriority: 1
    });
  });

  it('returns null when provider_id is missing', () => {
    expect(mapWatchProvider({ provider_name: 'Netflix' }, 'flatrate', null)).toBeNull();
  });

  it('returns null when provider_name is missing', () => {
    expect(mapWatchProvider({ provider_id: 8 }, 'flatrate', null)).toBeNull();
  });

  it('sets link to null when baseLink is null', () => {
    const result = mapWatchProvider({ provider_id: 8, provider_name: 'Netflix' }, 'rent', null);

    expect(result?.link).toBeNull();
  });
});

describe('mapWatchProviderList', () => {
  it('returns an empty array for an empty list', () => {
    expect(mapWatchProviderList([], 'buy', null)).toEqual([]);
  });

  it('filters invalid providers', () => {
    const result = mapWatchProviderList(
      [
        { provider_id: 8, provider_name: 'Netflix' },
        { provider_name: 'Missing ID' },
        { provider_id: 9 }
      ],
      'flatrate',
      null
    );

    expect(result).toHaveLength(1);
    expect(result[0].providerName).toBe('Netflix');
  });
});

describe('getTrailerUrls', () => {
  it('returns YouTube trailer URLs', () => {
    const details = {
      videos: {
        results: [
          { site: 'YouTube', type: 'Trailer', key: 'abc123' },
          { site: 'YouTube', type: 'Teaser', key: 'teaser' },
          { site: 'Vimeo', type: 'Trailer', key: 'vimeo' }
        ]
      }
    };

    expect(getTrailerUrls(details)).toEqual(['https://www.youtube.com/watch?v=abc123']);
  });

  it('returns an empty array when there are no videos', () => {
    expect(getTrailerUrls({})).toEqual([]);
  });

  it('excludes entries without a key', () => {
    const details = {
      videos: {
        results: [{ site: 'YouTube', type: 'Trailer', key: '' }]
      }
    };

    expect(getTrailerUrls(details)).toEqual([]);
  });
});

describe('mapCast', () => {
  it('returns an empty array for empty cast', () => {
    expect(mapCast([])).toEqual([]);
  });

  it('maps a cast member', () => {
    const person = {
      id: 1,
      credit_id: 'c1',
      name: 'Alice',
      character: 'Hero',
      order: 0,
      profile_path: '/alice.jpg'
    };

    expect(mapCast([person])).toEqual([
      {
        id: 1,
        creditId: 'c1',
        name: 'Alice',
        character: 'Hero',
        order: 0,
        profilePath: '/alice.jpg',
        imageUrl: 'https://image.tmdb.org/t/p/w185/alice.jpg'
      }
    ]);
  });

  it('limits the result to 20 members', () => {
    const cast = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
      name: `Person ${index + 1}`,
      credit_id: `c${index + 1}`
    }));

    expect(mapCast(cast)).toHaveLength(20);
  });
});

describe('mapCrew', () => {
  it('returns an empty array for empty crew', () => {
    expect(mapCrew([])).toEqual([]);
  });

  it('maps a crew member', () => {
    const person = {
      id: 2,
      credit_id: 'c2',
      name: 'Bob',
      job: 'Director',
      department: 'Directing',
      profile_path: '/bob.jpg'
    };

    expect(mapCrew([person])).toEqual([
      {
        id: 2,
        creditId: 'c2',
        name: 'Bob',
        character: '',
        order: null,
        profilePath: '/bob.jpg',
        imageUrl: 'https://image.tmdb.org/t/p/w185/bob.jpg',
        job: 'Director',
        department: 'Directing'
      }
    ]);
  });

  it('limits the result to 20 members', () => {
    const crew = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
      name: `Person ${index + 1}`,
      credit_id: `c${index + 1}`
    }));

    expect(mapCrew(crew)).toHaveLength(20);
  });
});

describe('mapDetails', () => {
  it('maps movie details correctly', () => {
    const result = mapDetails(RAW_MOVIE, 'movie');

    expect(result).toMatchObject({
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      releaseDate: '1999-10-15',
      rating: 8.8,
      runtime: 139,
      trailerUrls: ['https://www.youtube.com/watch?v=abc123']
    });
    expect(result?.cast).toHaveLength(1);
    expect(result?.crew).toHaveLength(1);
    expect(result?.productionCompanies).toEqual([
      { id: 1, name: 'A24', logo_path: '/a24.png' },
      { id: 2, name: 'No Logo', logo_path: null }
    ]);
  });

  it('maps TV details correctly', () => {
    const result = mapDetails(RAW_TV_SHOW, 'tv');

    expect(result).toMatchObject({
      id: 1399,
      mediaType: 'tv',
      title: 'Game of Thrones',
      releaseDate: '2011-04-17',
      rating: 9.2,
      runtime: null,
      episodeRunTime: [60]
    });
  });

  it('normalizes invalid optional fields', () => {
    const result = mapDetails(
      {
        ...RAW_MOVIE,
        overview: 42,
        homepage: 42,
        vote_average: 'invalid',
        runtime: 'invalid',
        episode_run_time: 'invalid',
        production_companies: 'invalid',
        credits: 'invalid',
        videos: 'invalid'
      },
      'movie'
    );

    expect(result).toMatchObject({
      overview: '',
      homepage: '',
      rating: 0,
      runtime: null,
      episodeRunTime: [],
      productionCompanies: [],
      cast: [],
      crew: [],
      trailerUrls: []
    });
  });

  it('returns null when the movie has no ID', () => {
    expect(mapDetails({ ...RAW_MOVIE, id: undefined }, 'movie')).toBeNull();
  });

  it('returns null when the media type cannot be resolved', () => {
    const details = { ...RAW_MOVIE };
    delete details.media_type;
    delete details.title;

    expect(mapDetails(details, null)).toBeNull();
  });

  it('keeps certification and providers from the details object', () => {
    const result = mapDetails({ ...RAW_MOVIE, certification: 'FSK 16', providers: null }, 'movie');

    expect(result?.certification).toBe('FSK 16');
    expect(result?.providers).toBeNull();
  });
});

describe('mapFeaturedItem', () => {
  it('maps a TV show to a featured item', () => {
    const result = mapFeaturedItem(RAW_TV_SHOW, 'tv');

    expect(result).toMatchObject({
      id: 1399,
      mediaType: 'tv',
      title: 'Game of Thrones',
      releaseDate: '2011-04-17',
      overview: 'Dragons.',
      homepage: 'https://hbo.com/got'
    });
    expect(result.imageUrl).toContain('got_backdrop');
  });

  it('maps a movie to a featured item', () => {
    const result = mapFeaturedItem(RAW_MOVIE, 'movie');

    expect(result).toMatchObject({
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club'
    });
    expect(result.imageUrl).toContain('fc_backdrop');
  });
});

describe('parseFeaturedItem', () => {
  it('returns the parsed featured item for valid data', () => {
    const result = parseFeaturedItem({
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      releaseDate: '1999-10-15',
      overview: 'Rules.',
      homepage: '',
      genres: [],
      imageUrl: '/image.jpg',
      posterUrl: '/poster.jpg',
      productionCompanies: [],
      certification: '',
      providers: null,
      trailerUrls: []
    });

    expect(result?.id).toBe(550);
  });

  it('returns null for invalid featured data', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(parseFeaturedItem({ id: 'invalid' })).toBeNull();
    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });
});

describe('parseWatchProviderResult', () => {
  it('returns the parsed provider result for valid data', () => {
    const result = parseWatchProviderResult({
      link: 'https://example.com',
      providers: []
    });

    expect(result?.link).toBe('https://example.com');
  });

  it('returns null for invalid provider data', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(parseWatchProviderResult({})).toBeNull();
    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });
});
