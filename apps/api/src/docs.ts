import { apiRoutes, buildOpenApi } from '@socioboard/contracts';
import { Router } from 'express';

/** Version of the Scalar API reference page, loaded from a CDN (development only). */
const SCALAR_VERSION = '1.70.0';

/**
 * Development-only API docs: the OpenAPI document generated from the contracts at
 * /api/docs/openapi.json and a browsable reference at /api/docs. Not mounted in production.
 */
export function createDocsRouter(): Router {
  const spec = buildOpenApi(apiRoutes, { version: '6.0.0-dev', sessionCookie: 'sb.session_token' });
  const router = Router();
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
