import { z } from 'zod';

import { defineRoute } from './route';

/**
 * A crash in someone's browser (docs/backend/modules/platform.md, "telemetry"). The API logs it
 * and records it on its trace, so browser errors show up next to the server's. Sizes are capped:
 * anyone can send this, signed in or not.
 */
export const ClientErrorReport = z.object({
  /** `error`: window.onerror; `unhandledrejection`: a promise nobody caught; `render`: React. */
  kind: z.enum(['error', 'unhandledrejection', 'render']),
  name: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(1000),
  stack: z.string().max(8000).optional(),
  /** The page's path, without its query string or hash (they can carry tokens). */
  path: z
    .string()
    .max(512)
    .regex(/^\/[^?#]*$/, 'A path starting with /, without ? or #'),
});
export type ClientErrorReport = z.infer<typeof ClientErrorReport>;

export const telemetryRoutes = {
  reportClientError: defineRoute({
    method: 'POST',
    path: '/api/v1/client-errors',
    access: 'public',
    summary: 'Report an error from the web app (logged; 20 a minute per IP)',
    body: ClientErrorReport,
    responses: { 204: null },
  }),
};
