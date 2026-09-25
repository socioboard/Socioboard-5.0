import type { IncomingHttpHeaders } from 'node:http';
import { isIP } from 'node:net';

import type { RequestHandler } from 'express';

import { newId } from '../ids';
import type { Kv } from '../kv';
import { addLogContext, runWithLogContext, type Logger } from '../logger';
import type { SessionResolver } from './context';
import { forbidden, tooManyRequests } from './errors';

const REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

/**
 * Gives every request an id (reusing a well-formed `X-Request-Id` from our proxy), returns it
 * in the response header and adds it to every log line written while handling the request.
 */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.get('x-request-id');
  const id = incoming && REQUEST_ID.test(incoming) ? incoming : newId();
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  runWithLogContext({ requestId: id }, next);
};

/** One log line per request when the response finishes. */
export function requestLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      const entry = {
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: res.statusCode,
        durationMs: Math.round(durationMs),
      };
      if (res.statusCode >= 500) logger.error(entry, 'request failed');
      else if (res.statusCode >= 400) logger.info(entry, 'request rejected');
      else logger.debug(entry, 'request');
    });
    next();
  };
}

export interface RateLimitOptions {
  kv: Kv;
  /** Counter name, so several limits can coexist. */
  name: string;
  windowSec: number;
  max: number;
}

/**
 * Rate-limit key for a client IP. IPv6 clients usually hold a whole /64, so they are counted per
 * /64 (as Better Auth does); IPv4-mapped IPv6 addresses count as their IPv4 address.
 */
export function clientKey(ip: string | undefined): string {
  if (!ip) return 'unknown';
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped?.[1]) return mapped[1];
  if (isIP(ip) !== 6) return ip;
  const [head = '', tail] = ip.toLowerCase().split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const groups = [
    ...headGroups,
    ...Array<string>(8 - headGroups.length - tailGroups.length).fill('0'),
    ...tailGroups,
  ];
  return `${groups
    .slice(0, 4)
    .map((g) => g.replace(/^0+(?=.)/, ''))
    .join(':')}::/64`;
}

/**
 * Fixed-window limit per client, counted in Valkey so it holds across api instances.
 * The IP comes from Express: `trust proxy`, set from TRUST_PROXY, decides which proxies'
 * X-Forwarded-For is believed.
 */
export function rateLimit({ kv, name, windowSec, max }: RateLimitOptions): RequestHandler {
  return async (req, res, next) => {
    const window = Math.floor(Date.now() / 1000 / windowSec);
    const key = `rl:${name}:${clientKey(req.ip)}:${String(window)}`;
    const count = await kv.incr(key, windowSec);
    const resetSec = (window + 1) * windowSec - Math.floor(Date.now() / 1000);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - count)));
    res.setHeader('RateLimit-Reset', String(resetSec));
    if (count > max) {
      res.setHeader('Retry-After', String(resetSec));
      next(tooManyRequests());
      return;
    }
    next();
  };
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Defence in depth against cross-site requests on top of SameSite=Lax cookies: a state-changing
 * request that carries an Origin header must come from the app itself. Requests without Origin
 * (server-to-server, CLI tools) have no browser cookies to abuse and pass.
 */
export function originCheck(appUrl: string): RequestHandler {
  const allowed = new URL(appUrl).origin;
  return (req, _res, next) => {
    const origin = req.get('origin');
    if (!SAFE_METHODS.has(req.method) && origin && origin !== allowed) {
      next(forbidden('ORIGIN_NOT_ALLOWED', 'This request did not come from the Socioboard app'));
      return;
    }
    next();
  };
}

export function toHeaders(incoming: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incoming)) {
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else if (value !== undefined) headers.set(key, value);
  }
  return headers;
}

/**
 * Resolves the signed-in user, if any, into res.locals.auth, and forwards a refreshed session
 * cookie when Better Auth extended the session. Never rejects a request itself.
 */
export function session(resolve: SessionResolver): RequestHandler {
  return async (req, res, next) => {
    const { auth, setCookies } = await resolve(toHeaders(req.headers));
    for (const cookie of setCookies) res.append('Set-Cookie', cookie);
    res.locals.auth = auth;
    if (auth) addLogContext({ userId: auth.user.id });
    next();
  };
}
