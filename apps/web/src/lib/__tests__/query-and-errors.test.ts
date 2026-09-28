import { describe, expect, it } from 'vitest';

import { ApiError, NETWORK_ERROR } from '../api';
import { errorMessage } from '../i18n';
import { shouldRetry } from '../query';

describe('shouldRetry', () => {
  it('never retries a 4xx, retries server and network errors twice', () => {
    expect(shouldRetry(0, new ApiError(404, 'NOT_FOUND', '', undefined))).toBe(false);
    expect(shouldRetry(0, new ApiError(503, 'HTTP_503', '', undefined))).toBe(true);
    expect(shouldRetry(1, new ApiError(0, NETWORK_ERROR, '', undefined))).toBe(true);
    expect(shouldRetry(2, new ApiError(500, 'INTERNAL_ERROR', '', undefined))).toBe(false);
  });
});

describe('errorMessage', () => {
  it('translates known codes', () => {
    expect(errorMessage(new ApiError(409, 'SLUG_TAKEN', 'server text', 'r1'))).toBe(
      'That workspace address is already taken.',
    );
  });

  it('gives the request id for unknown codes, and a generic message otherwise', () => {
    expect(errorMessage(new ApiError(500, 'SOMETHING_NEW', '', 'req-9'))).toContain('req-9');
    expect(errorMessage(new Error('boom'))).toBe('Something went wrong. Try again in a moment.');
  });
});
