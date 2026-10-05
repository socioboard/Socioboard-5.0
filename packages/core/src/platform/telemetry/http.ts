import {
  context,
  metrics,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
  type Histogram,
} from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_URL_PATH,
  ATTR_URL_SCHEME,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import type { RequestHandler, Response } from 'express';

/**
 * The route a request matched, as its contract writes it (`/api/v1/posts/:postId`): the span's
 * name and the duration's label. Set by the API router; other routers leave it unset.
 */
export function setRouteName(res: Response, path: string): void {
  res.locals.route = path;
}

/**
 * Requests outside the contract (Better Auth, OAuth callbacks, public media, Bull Board) are
 * named by their first segments only, so ids and file names don't each become a span name.
 */
function routeGroup(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return `/${parts.slice(0, parts[0] === 'api' ? 2 : 1).join('/')}/*`;
}

let duration: Histogram | undefined;

/**
 * One server span per request (continuing the caller's trace when it sends `traceparent`) and
 * its duration in `http.server.request.duration`. Mounted first, only when telemetry is on.
 * Query strings are never recorded: OAuth callbacks carry codes there.
 */
export function traceRequests(): RequestHandler {
  const tracer = trace.getTracer('socioboard-api');
  duration ??= metrics.getMeter('socioboard-api').createHistogram('http.server.request.duration', {
    unit: 's',
    description: 'API request duration',
  });
  const histogram = duration;
  return (req, res, next) => {
    // Load balancers ask every few seconds; those spans would drown the rest.
    if (req.path.startsWith('/api/health')) {
      next();
      return;
    }
    const parent = propagation.extract(context.active(), req.headers);
    const span = tracer.startSpan(
      req.method,
      {
        kind: SpanKind.SERVER,
        attributes: {
          [ATTR_HTTP_REQUEST_METHOD]: req.method,
          [ATTR_URL_PATH]: req.path,
          [ATTR_URL_SCHEME]: req.protocol,
          ...(req.get('user-agent')
            ? { [ATTR_USER_AGENT_ORIGINAL]: req.get('user-agent')?.slice(0, 256) }
            : {}),
        },
      },
      parent,
    );
    const start = performance.now();
    let ended = false;
    const end = () => {
      if (ended) return;
      ended = true;
      const route = typeof res.locals.route === 'string' ? res.locals.route : undefined;
      const name = route ?? routeGroup(req.path);
      span.updateName(`${req.method} ${name}`);
      if (route) span.setAttribute(ATTR_HTTP_ROUTE, route);
      // `finish` never came: the client went away before the response was sent.
      const status = res.writableFinished ? res.statusCode : 499;
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, status);
      if (status >= 500) span.setStatus({ code: SpanStatusCode.ERROR });
      span.end();
      histogram.record((performance.now() - start) / 1000, {
        [ATTR_HTTP_REQUEST_METHOD]: req.method,
        [ATTR_HTTP_ROUTE]: name,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: status,
      });
    };
    res.on('finish', end);
    res.on('close', end);
    context.with(trace.setSpan(parent, span), next);
  };
}
