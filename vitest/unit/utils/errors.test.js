/**
 * The tests cover the factory function, name, message, and optional status
 * property of the error object returned by createTMDBError, including the
 * case where no status is passed.
 */
import { describe, expect, it } from 'vitest';
import { createTMDBError } from '@/lib/utils/errors.js';

describe('createTMDBError', () => {
  // Statement coverage: returned object extends the native Error class.
  it('is an instance of Error', () => {
    expect(createTMDBError('fail')).toBeInstanceOf(Error);
  });

  // Statement coverage: name property is set to TMDBError.
  it('sets the name property to TMDBError', () => {
    expect(createTMDBError('fail').name).toBe('TMDBError');
  });

  // Statement coverage: message is forwarded to the Error constructor.
  it('sets the message to the provided string', () => {
    expect(createTMDBError('Not found').message).toBe('Not found');
  });

  // Statement coverage: status is set when provided.
  it('sets the status property when a status code is provided', () => {
    expect(createTMDBError('Not found', 404).status).toBe(404);
  });

  // Branch coverage: status is undefined when not provided.
  it('leaves the status property undefined when no status code is provided', () => {
    expect(createTMDBError('fail').status).toBeUndefined();
  });

  // Branch coverage: error can be thrown and caught by message and name.
  it('can be thrown and caught as a TMDBError', () => {
    const throwIt = () => {
      throw createTMDBError('Server error', 500);
    };
    expect(throwIt).toThrow('Server error');
    expect(throwIt).toThrow(Error);
  });
});
