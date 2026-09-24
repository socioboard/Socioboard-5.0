import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

import type { EncryptionKey } from '../config';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

export interface Crypto {
  /** AES-256-GCM with the current key. Output: `v1.<keyId>.<iv>.<tag>.<ciphertext>` (base64url). */
  encrypt(plaintext: string): string;
  /** Decrypts with whichever key encrypted it, so old keys keep working after rotation. */
  decrypt(payload: string): string;
  /** True when the payload was encrypted with an older key and should be re-encrypted. */
  needsRotation(payload: string): boolean;
}

/**
 * Key rotation: put the new key first in ENCRYPTION_KEYS and keep the old ones after it.
 * New writes use the first key; reads accept any listed key.
 */
export function createCrypto(keys: EncryptionKey[]): Crypto {
  const current = keys[0];
  if (!current) throw new Error('createCrypto: at least one key is required');
  const byId = new Map(keys.map((k) => [k.id, k.key]));

  return {
    encrypt(plaintext) {
      const iv = randomBytes(12);
      const cipher = createCipheriv(ALGORITHM, current.key, iv);
      const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
      const tag = cipher.getAuthTag();
      return [VERSION, current.id, iv, tag, ciphertext]
        .map((p) => (typeof p === 'string' ? p : p.toString('base64url')))
        .join('.');
    },

    decrypt(payload) {
      const [version, keyId, iv, tag, ciphertext] = payload.split('.');
      if (version !== VERSION || !keyId || !iv || !tag || ciphertext === undefined) {
        throw new DecryptionError('Malformed encrypted payload');
      }
      const key = byId.get(keyId);
      if (!key) throw new DecryptionError(`Unknown encryption key "${keyId}"`);
      try {
        const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64url'));
        decipher.setAuthTag(Buffer.from(tag, 'base64url'));
        return Buffer.concat([
          decipher.update(Buffer.from(ciphertext, 'base64url')),
          decipher.final(),
        ]).toString('utf8');
      } catch {
        throw new DecryptionError('Encrypted payload failed authentication');
      }
    },

    needsRotation(payload) {
      return payload.split('.')[1] !== current.id;
    },
  };
}

/** HMAC-SHA256, base64url. Used for webhook signatures and OAuth state. */
export function hmacSign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

/** Constant-time comparison of an HMAC signature. */
export function hmacVerify(data: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(hmacSign(data, secret));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
