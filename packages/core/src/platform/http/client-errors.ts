import { trace } from '@opentelemetry/api';
import { telemetryRoutes as r } from '@socioboard/contracts';

import type { Logger } from '../logger';
import type { ApiRouter } from './route';

/** How many reports one IP may send a minute (app.ts mounts the limit before the router). */
export const CLIENT_ERRORS_PER_MIN = 20;

/**
 * `POST /client-errors` (docs/backend/modules/platform.md, "telemetry"): a crash in the web app,
 * logged as `browser error` and, with telemetry on, recorded as an exception on the request's
 * span, where OpenObserve lists it next to the server's. Public (the sign-in pages crash too), but
 * origin-checked, rate-limited and size-capped by its contract.
 */
export function registerClientErrorRoutes(api: ApiRouter, logger: Logger) {
  api.route(r.reportClientError, ({ body, auth }) => {
    logger.warn({ browserError: body, ...(auth ? { userId: auth.user.id } : {}) }, 'browser error');
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException({
        name: body.name ?? 'Error',
        message: body.message,
        ...(body.stack ? { stack: body.stack } : {}),
      });
      span.setAttributes({ 'browser.error.kind': body.kind, 'browser.page.path': body.path });
    }
  });
}
