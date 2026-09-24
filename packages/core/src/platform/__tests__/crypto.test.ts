import { describe, expect, it } from 'vitest';

import { createCrypto, DecryptionError, hmacSign, hmacVerify } from '../crypto';

const k1 = { id: 'k1', key: Buffer.alloc(32, 1) };
const k2 = { id: 'k2', key: Buffer.alloc(32, 2) };

describe('createCrypto', () => {
  it('round-trips and never repeats ciphertext for the same input', () => {
    const crypto = createCrypto([k1]);
    const a = crypto.encrypt('access-token-123');
    const b = crypto.encrypt('access-token-123');
    expect(a).not.toBe(b);
    expect(a.startsWith('v1.k1.')).toBe(true);
    expect(crypto.decrypt(a)).toBe('access-token-123');
    expect(crypto.decrypt(crypto.encrypt(''))).toBe('');
  });

  it('keeps decrypting old values after a key rotation', () => {
    const before = createCrypto([k1]).encrypt('secret');
    const rotated = createCrypto([k2, k1]);
    expect(rotated.decrypt(before)).toBe('secret');
    expect(rotated.needsRotation(before)).toBe(true);
    expect(rotated.needsRotation(rotated.encrypt('secret'))).toBe(false);
  });

  it('rejects tampered, malformed or unknown-key payloads', () => {
    const crypto = createCrypto([k1]);
    const parts = crypto.encrypt('secret').split('.');
    parts[4] = Buffer.from('tampered').toString('base64url');
    expect(() => crypto.decrypt(parts.join('.'))).toThrow(DecryptionError);
    expect(() => crypto.decrypt('not-encrypted')).toThrow(DecryptionError);
    expect(() => createCrypto([k2]).decrypt(crypto.encrypt('x'))).toThrow(/Unknown encryption key/);
  });
});

describe('hmac', () => {
  it('verifies only the matching data and secret', () => {
    const sig = hmacSign('payload', 'secret');
    expect(hmacVerify('payload', sig, 'secret')).toBe(true);
    expect(hmacVerify('payload2', sig, 'secret')).toBe(false);
    expect(hmacVerify('payload', sig, 'other')).toBe(false);
    expect(hmacVerify('payload', 'short', 'secret')).toBe(false);
  });
});
