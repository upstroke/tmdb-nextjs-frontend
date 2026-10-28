/**
 * Coverage-focused tests for public TMDB API behavior.
 *
 * These tests intentionally use only the public createTmdbApi() surface.
 * HTTP behavior is covered in tmdb-http.test.js and pure mapping behavior in
 * mappers.test.js.
 */
import { describe, expect, it, vi } from 'vitest';
import { createTmdbApi } from '@/lib/services/tmdb-api.js';

const FAKE_KEY = 'test-key';

function makeFetch(responses) {
  let index = 0;
  return vi.fn(async () => {
    const entry = responses[index++];
    return {
      ok: entry.ok ?? true,
      status: entry.status ?? 200,
      statusText: entry.ok === false ? 'Not Found' : 'OK',
      json: async () => entry.body
    };
  });
}

const LIST_BODY = {
  page: 1,
  total_pages: 1,
  results: [
    {
      id: 42,
      media_type: 'movie',
      title: 'Inception',
      vote_average: 8.8,
      poster_path: '/inception.jpg',
      genre_ids: []
    }
  ]
};

const SEARCH_BODY = {
  page: 1,
  total_pages: 2,
  results: [
    {
      id: 42,
      media_type: 'movie',
      title: 'Inception',
      vote_average: 8.8,
      poster_path: '/inception.jpg',
      genre_ids: []
    }
  ]
};

const TRENDING_ALL_BODY = {
  page: 1,
  results: [
    {
      id: 42,
      media_type: 'movie',
      title: 'Inception',
      overview: 'A thief enters dreams.',
      backdrop_path: '/inception_backdrop.jpg',
      poster_path: '/inception.jpg',
      release_date: '2010-07-16',
      vote_average: 8.8,
      vote_count: 30000,
      genre_ids: [28, 878]
    },
    {
      id: 1399,
      media_type: 'tv',
      name: 'Game of Thrones',
      overview: 'Dragons and politics.',
      backdrop_path: '/got_backdrop.jpg',
      poster_path: '/got_poster.jpg',
      first_air_date: '2011-04-17',
      vote_average: 9.2,
      vote_count: 20000,
      genre_ids: [10765]
    },
    {
      id: 1,
      media_type: 'person',
      name: 'Some Actor'
    }
  ]
};

const GENRE_MOVIE_LIST = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 878, name: 'Science Fiction' }
  ]
};

const GENRE_TV_LIST = {
  genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }]
};

describe('createTmdbApi — coverage-focused public behavior', () => {
  it('getList returns hasMore=false when page >= total_pages', async () => {
    const fetch = makeFetch([
      { ok: true, body: LIST_BODY },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getList('/movie/popular', 1, 'movie');

    expect(result.hasMore).toBe(false);
  });

  it('searchMedia returns hasMore=true when page < total_pages', async () => {
    const fetch = makeFetch([
      { ok: true, body: SEARCH_BODY },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.searchMedia('inception', 1);

    expect(result.hasMore).toBe(true);
  });

  it('getFeaturedToday returns normalized featured items', async () => {
    const fetch = makeFetch([
      { ok: true, body: TRENDING_ALL_BODY },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(42);
    expect(result[0].mediaType).toBe('movie');
    expect(result[0].title).toBe('Inception');
    expect(result[1].id).toBe(1399);
    expect(result[1].mediaType).toBe('tv');
    expect(result[1].title).toBe('Game of Thrones');
  });

  it('getFeaturedToday filters out person results', async () => {
    const fetch = makeFetch([
      { ok: true, body: TRENDING_ALL_BODY },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();

    expect(result.every((item) => item.mediaType !== 'person')).toBe(true);
  });

  it('getFeaturedToday limits results to five items', async () => {
    const manyResultsBody = {
      ...TRENDING_ALL_BODY,
      results: Array.from({ length: 8 }, (_, index) => ({
        id: index + 1,
        media_type: 'movie',
        title: `Movie ${index + 1}`,
        vote_average: 7,
        genre_ids: []
      }))
    };
    const fetch = makeFetch([
      { ok: true, body: manyResultsBody },
      { ok: true, body: GENRE_MOVIE_LIST },
      { ok: true, body: GENRE_TV_LIST }
    ]);
    const api = createTmdbApi(fetch, FAKE_KEY, 'de-DE');
    const result = await api.getFeaturedToday();

    expect(result).toHaveLength(5);
  });
});
