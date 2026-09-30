/**
 * The tests cover the constructor, name, message, and optional status
 * property of TMDBError, including the case where no status is passed.
 */
import { describe, expect, it } from 'vitest';
import { TMDBError } from '@/lib/utils/errors.js';

describe('TMDBError', () => {
  // Statement coverage: error extends the native Error class.
  it('is an instance of Error', () => {
    expect(new TMDBError('fail')).toBeInstanceOf(Error);
  });

  // Statement coverage: name property is set to TMDBError.
  it('sets the name property to TMDBError', () => {
    expect(new TMDBError('fail').name).toBe('TMDBError');
  });

  // Statement coverage: message is forwarded to the Error superclass.
  it('sets the message to the provided string', () => {
    expect(new TMDBError('Not found').message).toBe('Not found');
  });

  // Statement coverage: status is set when provided.
  it('sets the status property when a status code is provided', () => {
    expect(new TMDBError('Not found', 404).status).toBe(404);
  });

  // Branch coverage: status is undefined when not provided.
  it('leaves the status property undefined when no status code is provided', () => {
    expect(new TMDBError('fail').status).toBeUndefined();
  });

  // Branch coverage: error can be thrown and caught by message and type.
  it('can be thrown and caught as a TMDBError', () => {
    const throwIt = () => { throw new TMDBError('Server error', 500); };
    expect(throwIt).toThrow(TMDBError);
    expect(throwIt).toThrow('Server error');
  });
});
