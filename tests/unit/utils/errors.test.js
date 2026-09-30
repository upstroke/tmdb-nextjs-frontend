import { describe, expect, it } from 'vitest';
import { TMDBError } from '@/lib/utils/errors.js';

describe('TMDBError', () => {
  it('is an instance of Error', () => {
    expect(new TMDBError('fail')).toBeInstanceOf(Error);
  });

  it('sets the message correctly', () => {
    expect(new TMDBError('Not found').message).toBe('Not found');
  });

  it('sets name to TMDBError', () => {
    expect(new TMDBError('fail').name).toBe('TMDBError');
  });

  it('sets the status when provided', () => {
    expect(new TMDBError('Not found', 404).status).toBe(404);
  });

  it('leaves status undefined when not provided', () => {
    expect(new TMDBError('fail').status).toBeUndefined();
  });
});
