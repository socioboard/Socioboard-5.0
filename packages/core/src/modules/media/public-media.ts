import { createHmac, timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { Router } from 'express';

import type { Logger, Storage } from '../../platform';

/**
 * Public addresses for media that networks fetch themselves (Instagram images, TikTok later):
 * `<MEDIA_PUBLIC_URL>/<token>.<ext>`, where the token names the stored file and an expiry and is
 * signed, so addresses can't be guessed or changed (docs/backend/modules/media.md,
 * "Delivering media to networks"). The API serves them at /public-media/:file; production points
 * media.<domain> there.
 */
export interface MediaUrlSigner {
  /** Null when no public address is configured (MEDIA_PUBLIC_URL unset). */
  sign(storageKey: string, ttlSec?: number): string | null;
  /** The storage key a request's file name stands for, or null if forged or expired. */
  verify(file: string, now?: number): string | null;
}

/** Networks fetch at publish time and on retries; a day covers both. */
export const PUBLIC_MEDIA_TTL_SEC = 24 * 3600;
const EXTENSION = /\.[a-z0-9]{2,4}$/;

export function createMediaUrlSigner(input: {
  /** MEDIA_PUBLIC_URL, e.g. https://media.socioboard.com (no trailing slash needed). */
  baseUrl: string | undefined;
  /** AUTH_SECRET; a label keeps these signatures apart from anything else signed with it. */
  secret: string;
}): MediaUrlSigner {
  const mac = (payload: string) =>
    createHmac('sha256', input.secret).update(`public-media:${payload}`).digest('base64url');
  const base = input.baseUrl?.replace(/\/+$/, '');

  return {
    sign(storageKey, ttlSec = PUBLIC_MEDIA_TTL_SEC) {
      if (!base) return null;
      const exp = Math.floor(Date.now() / 1000) + ttlSec;
      const payload = Buffer.from(JSON.stringify({ k: storageKey, e: exp })).toString('base64url');
      // The extension helps fetchers that look at it; it isn't part of what's signed.
      const ext = EXTENSION.exec(storageKey)?.[0] ?? '';
      return `${base}/${payload}.${mac(payload)}${ext}`;
    },
    verify(file, now = Date.now()) {
      const [payload = '', sig = ''] = file.replace(EXTENSION, '').split('.');
      const expected = Buffer.from(mac(payload));
      const given = Buffer.from(sig);
      if (payload === '' || given.length !== expected.length || !timingSafeEqual(given, expected)) {
        return null;
      }
      try {
        const { k, e } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
          k?: unknown;
          e?: unknown;
        };
        if (typeof k !== 'string' || typeof e !== 'number' || e * 1000 < now) return null;
        return k;
      } catch {
        return null;
      }
    },
  };
}

/** Headers passed on from storage to the network fetching the file. */
const PASSED_ON = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
];

/**
 * GET /public-media/:file: streams the stored file (whole, or the byte range asked for). Every
 * problem is a bare 404, so nothing is learned by probing.
 */
export function createPublicMediaRouter(deps: {
  signer: MediaUrlSigner;
  storage: Storage | undefined;
  logger: Logger;
}): Router {
  const router = Router();
  router.get('/public-media/:file', async (req, res) => {
    const key = deps.signer.verify(req.params.file);
    if (!key || !deps.storage) {
      res.status(404).end();
      return;
    }
    const range = req.get('range');
    const upstream = await fetch(await deps.storage.presignGet(key, 300), {
      headers: range ? { range } : {},
    }).catch((err: unknown) => {
      deps.logger.warn({ err }, 'public media: storage unreachable');
      return null;
    });
    if (!upstream?.body || (upstream.status !== 200 && upstream.status !== 206)) {
      res.status(upstream?.status === 416 ? 416 : 404).end();
      return;
    }
    res.status(upstream.status);
    for (const h of PASSED_ON) {
      const v = upstream.headers.get(h);
      if (v) res.set(h, v);
    }
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') {
      res.end();
      await upstream.body.cancel();
      return;
    }
    // pipeline handles back-pressure and stops reading storage if the fetcher hangs up.
    await pipeline(Readable.fromWeb(upstream.body), res).catch((err: unknown) => {
      deps.logger.debug({ err }, 'public media: fetch ended early');
    });
  });
  return router;
}
