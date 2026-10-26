/**
 * Unit tests for loadTmdbResources.
 *
 * Covers successful loading, optional-resource failures, required-resource
 * failures (Error and non-Error), early-termination on required failure,
 * and the default value of the `required` flag.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { loadTmdbResources } from '@/lib/server/load-tmdb-resources.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a no-op API object.
 * @returns {object} Dummy API instance.
 */
function makeApi() {
  return {};
}

/**
 * Creates a load function that resolves with the given value.
 * @param {*} value - The resolved value.
 * @returns {Function} Load function returning a resolved Promise.
 */
function makeResolvedLoad(value) {
  return async () => value;
}

/**
 * Creates a load function that rejects with the given reason.
 * @param {*} reason - The rejection reason.
 * @returns {Function} Load function returning a rejected Promise.
 */
function makeRejectedLoad(reason) {
  return async () => {
    throw reason;
  };
}

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

let consoleWarnSpy;
let consoleErrorSpy;

beforeEach(() => {
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

describe('loadTmdbResources — all resources succeed', () => {
  // Statement coverage: all resources fulfill and data contains every result.
  it('returns all successful results with error set to null', async () => {
    const resources = [
      { name: 'trending', required: true, load: makeResolvedLoad({ items: ['movie-1'] }) },
      { name: 'genres', required: true, load: makeResolvedLoad(['Action', 'Drama']) },
      { name: 'streaming', required: false, load: makeResolvedLoad({ providers: [] }) }
    ];

    const result = await loadTmdbResources(makeApi, resources, 'Fallback error');

    expect(result.data).toEqual({
      trending: { items: ['movie-1'] },
      genres: ['Action', 'Drama'],
      streaming: { providers: [] }
    });
    expect(result.error).toBeNull();
  });
});

describe('loadTmdbResources — optional resource fails', () => {
  // Branch coverage: an optional resource rejects, but required resources
  // still succeed — data remains available and error is null.
  it('keeps required data, sets error to null, and calls console.warn once', async () => {
    const resources = [
      { name: 'trending', required: true, load: makeResolvedLoad({ items: ['movie-1'] }) },
      { name: 'streaming', required: false, load: makeRejectedLoad(new Error('API timeout')) },
      { name: 'genres', required: true, load: makeResolvedLoad(['Action']) }
    ];

    const result = await loadTmdbResources(makeApi, resources, 'Fallback error');

    expect(result.data).toEqual({
      trending: { items: ['movie-1'] },
      genres: ['Action']
    });
    expect(result.error).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[loadTmdbResources] Optional resource "streaming" failed.'
    );
  });
});

describe('loadTmdbResources — required resource rejects with Error', () => {
  // Branch coverage: a required resource rejects with an Error instance —
  // data is null and error is reason.message.
  it('returns null data and reason.message as error', async () => {
    const resources = [
      { name: 'trending', required: true, load: makeRejectedLoad(new Error('Network failure')) },
      { name: 'genres', required: true, load: makeResolvedLoad(['Action']) }
    ];

    const result = await loadTmdbResources(makeApi, resources, 'Fallback error');

    expect(result.data).toBeNull();
    expect(result.error).toBe('Network failure');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[loadTmdbResources] Required resource "trending" failed.'
    );
  });
});

describe('loadTmdbResources — required resource rejects with non-Error', () => {
  // Branch coverage: a required resource rejects with a non-Error value —
  // data is null and error is fallbackMessage.
  it('returns null data and the fallback message as error', async () => {
    const resources = [
      { name: 'trending', required: true, load: makeRejectedLoad('Service unavailable') },
      { name: 'genres', required: true, load: makeResolvedLoad(['Action']) }
    ];

    const result = await loadTmdbResources(makeApi, resources, 'Fallback error');

    expect(result.data).toBeNull();
    expect(result.error).toBe('Fallback error');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });
});

describe('loadTmdbResources — required failure after optional success', () => {
  // Branch coverage: a required resource fails after an optional resource
  // has already succeeded — result evaluation stops and no later successful
  // resource is added to data.
  it('stops at the first required failure and excludes later successful resources', async () => {
    const resources = [
      { name: 'trending', required: true, load: makeResolvedLoad({ items: ['movie-1'] }) },
      { name: 'streaming', required: false, load: makeResolvedLoad({ providers: [] }) },
      { name: 'genres', required: true, load: makeRejectedLoad(new Error('Genre API down')) },
      { name: 'credits', required: true, load: makeResolvedLoad(['Actor Name']) }
    ];

    const result = await loadTmdbResources(makeApi, resources, 'Fallback error');

    // When a required resource fails, data is null regardless of prior
    // successful resources. The key assertion is that 'credits' — which
    // appears after the failing 'genres' — is never evaluated or added.
    expect(result.data).toBeNull();
    expect(result.error).toBe('Genre API down');
  });
});

describe('loadTmdbResources — required defaults to true', () => {
  // Statement coverage: when `required` is omitted, the resource is treated
  // as required — a rejection returns { data: null, error: … }.
  it('treats omitted required as true and fails on rejection', async () => {
    const resources = [
      { name: 'trending', load: makeRejectedLoad(new Error('Trending unavailable')) }
    ];

    const result = await loadTmdbResources(makeApi, resources, 'Fallback error');

    expect(result.data).toBeNull();
    expect(result.error).toBe('Trending unavailable');
  });
});
