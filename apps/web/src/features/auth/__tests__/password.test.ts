import { describe, expect, it } from 'vitest';

import { passwordStrength } from '../password';

describe('passwordStrength', () => {
  it('rates length first, then variety', () => {
    expect(passwordStrength('short1!')).toBe('weak');
    expect(passwordStrength('abcdefghij')).toBe('fair');
    expect(passwordStrength('Abcdefgh12!x')).toBe('strong');
    expect(passwordStrength('correct horse battery staple')).toBe('strong');
  });
});
