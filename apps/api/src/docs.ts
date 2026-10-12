import { createHash, timingSafeEqual } from 'node:crypto';

import { apiRoutes, buildOpenApi } from '@socioboard/contracts';
import { Router, type RequestHandler } from 'express';

/** Version of the Scalar API reference page, loaded from a CDN. */
const SCALAR_VERSION = '1.70.0';

/**
 * API docs: the OpenAPI document generated from the contracts at /api/docs/openapi.json and a
 * browsable reference at /api/docs. Mounted outside production, and where API_DOCS is on
 * (staging); never on the live site. With `auth`, both ask for a username and password (HTTP
 * basic auth), so someone who comes across the address sees nothing.
 */
export function createDocsRouter(auth?: { user: string; password: string }): Router {
  const spec = buildOpenApi(apiRoutes, { version: '6.0.0-dev', sessionCookie: 'sb.session_token' });
  const router = Router();
  if (auth) router.use('/api/docs', basicAuth(auth));
  router.get('/api/docs/openapi.json', (_req, res) => {
    res.json(spec);
  });
  router.get('/api/docs', (_req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Socioboard API</title>
  </head>
  <body>
    <script id="api-reference" data-url="/api/docs/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@${SCALAR_VERSION}"></script>
  </body>
</html>`);
  });
  return router;
}

/** Compared as hashes, in constant time, so neither length nor content leaks through timing. */
const digest = (value: string) => createHash('sha256').update(value).digest();

function basicAuth(auth: { user: string; password: string }): RequestHandler {
  const expected = digest(`${auth.user}:${auth.password}`);
  return (req, res, next) => {
    const [scheme, encoded] = (req.headers.authorization ?? '').split(' ');
    const given = scheme === 'Basic' && encoded ? Buffer.from(encoded, 'base64').toString() : '';
    if (given !== '' && timingSafeEqual(digest(given), expected)) {
      next();
      return;
    }
    res.set('WWW-Authenticate', 'Basic realm="Socioboard API docs", charset="UTF-8"');
    res.status(401).type('text').send('Sign in to see the API docs.');
  };
}
