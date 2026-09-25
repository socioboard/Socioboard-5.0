import { AsyncLocalStorage } from 'node:async_hooks';

import type { RequestHandler } from 'express';

/**
 * Who is on the other end of the current request, for records that need it (the audit log).
 * Kept apart from the log context on purpose: IPs are personal data and don't belong on every
 * log line.
 */
export interface RequestContext {
  ip: string | null;
  userAgent: string | null;
}

const store = new AsyncLocalStorage<RequestContext>();

/** The current request's context, or null outside a request (jobs, scripts). */
export function getRequestContext(): RequestContext | null {
  return store.getStore() ?? null;
}

/** Captures the client IP (as resolved under TRUST_PROXY) and user agent for this request. */
export const requestContext: RequestHandler = (req, _res, next) => {
  store.run({ ip: req.ip ?? null, userAgent: req.get('user-agent')?.slice(0, 512) ?? null }, next);
};
