import {
  can,
  CommonErrorCode,
  type Access,
  type Permission,
  type RouteBody,
  type RouteDefinition,
  type RouteParams,
  type RouteQuery,
  type RouteResponse,
  type SuccessStatus,
  type ValidationDetails,
} from '@socioboard/contracts';
import { Router, type Request, type RequestHandler, type Response } from 'express';
import type { z } from 'zod';

import { addLogContext } from '../logger';
import type { AuthContext, MemberContext, MembershipLookup } from './context';
import { AppError, forbidden, notFound, unauthorized } from './errors';

type IsWorkspaceAccess<A extends Access> = A extends 'public' | 'user' ? false : true;

/** What a handler receives: parsed inputs plus who is calling. */
export interface RouteContext<R extends RouteDefinition> {
  params: RouteParams<R>;
  query: RouteQuery<R>;
  body: RouteBody<R>;
  auth: R['access'] extends 'public' ? AuthContext | null : AuthContext;
  member: IsWorkspaceAccess<R['access']> extends true ? MemberContext : undefined;
  req: Request;
  res: Response;
}

/**
 * Returns the response body; the router sends it with the route's success status. Handlers may set
 * headers on `ctx.res` (cookies, caching) but must never send a response themselves.
 */
export type RouteHandler<R extends RouteDefinition> = (ctx: RouteContext<R>) => [
  RouteResponse<R>,
] extends [undefined]
  ? void | Promise<void> // bodiless (204) routes
  : RouteResponse<R> | Promise<RouteResponse<R>>;

function validationError(location: string, error: z.ZodError): AppError {
  const details: ValidationDetails = {
    issues: error.issues.map((i) => ({
      path: [location, ...i.path.map((p) => (typeof p === 'number' ? p : String(p)))],
      message: i.message,
    })),
  };
  return new AppError(400, CommonErrorCode.VALIDATION_FAILED, 'Some fields are invalid', details);
}

function parse(schema: z.ZodType | undefined, value: unknown, location: string): unknown {
  if (!schema) return undefined;
  const result = schema.safeParse(value);
  if (!result.success) throw validationError(location, result.error);
  return result.data;
}

const isPermission = (access: Access): access is Permission => access.includes(':');

export interface ApiRouterDeps {
  lookupMembership: MembershipLookup;
}

export interface ApiRouter {
  router: Router;
  /** Mounts a contract route: access checks, validation and response shaping come from `def`. */
  route<R extends RouteDefinition>(def: R, handler: RouteHandler<R>): void;
  /** Every route mounted so far (the app checks all contract routes are implemented). */
  mounted: ReadonlySet<RouteDefinition>;
}

/**
 * Per-route chain, in this order:
 *   signed in (401) → params valid (400) → member of :workspaceId (404, so other workspaces look
 *   like they don't exist) → permission (403) → query and body valid (400) → handler →
 *   response checked against the contract (unknown fields are stripped, never sent).
 * Needs the global middleware first: requestId, requestLogger, rateLimit, session.
 */
export function createApiRouter({ lookupMembership }: ApiRouterDeps): ApiRouter {
  const router = Router();
  const mounted = new Set<RouteDefinition>();

  function route<R extends RouteDefinition>(def: R, handler: RouteHandler<R>) {
    if (mounted.has(def)) throw new Error(`Route mounted twice: ${def.method} ${def.path}`);
    mounted.add(def);
    const workspaceAccess = def.access === 'member' || isPermission(def.access);
    const paramShape = (def.params as { shape?: Record<string, unknown> } | undefined)?.shape;
    if (workspaceAccess && !paramShape?.workspaceId) {
      throw new Error(
        `${def.method} ${def.path}: workspace access needs a params schema with workspaceId`,
      );
    }

    const run: RequestHandler = async (req, res) => {
      const auth = res.locals.auth ?? null;
      if (def.access !== 'public' && !auth) throw unauthorized();

      const params = parse(def.params, req.params, 'params');

      let member: MemberContext | undefined;
      if (workspaceAccess && auth) {
        const workspaceId = (params as { workspaceId: string }).workspaceId;
        member = (await lookupMembership(auth.user.id, workspaceId)) ?? undefined;
        if (!member) throw notFound('WORKSPACE_NOT_FOUND', 'Workspace not found');
        res.locals.member = member;
        addLogContext({ workspaceId });
        if (isPermission(def.access) && !can(member.role, def.access)) {
          throw forbidden(CommonErrorCode.FORBIDDEN, 'Your role does not allow this');
        }
      }

      const query = parse(def.query, req.query, 'query');
      const body = parse(def.body, req.body, 'body');

      // Handlers may return a value, a promise, or nothing (bodiless routes).
      const result: unknown = await Promise.resolve(
        handler({
          params,
          query,
          body,
          auth,
          member,
          req,
          res,
        } as RouteContext<R>),
      );

      const [statusKey, schema] = Object.entries(def.responses)[0] ?? ['200', null];
      const status = Number(statusKey) as SuccessStatus;
      if (!schema) {
        res.status(status).end();
        return;
      }
      const shaped = schema.safeParse(result);
      if (!shaped.success) {
        // The handler broke its own contract: a bug, so a 500 with details only in the logs.
        throw new Error(
          `Response of ${def.method} ${def.path} does not match its contract: ${shaped.error.message}`,
        );
      }
      res.status(status).json(shaped.data);
    };

    const method = def.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
    router[method](def.path, run);
  }

  return { router, route, mounted };
}
