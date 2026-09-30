import type { z } from 'zod';

import type { Permission } from './permissions';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Who may call a route:
 * - `public`: anyone (webhooks, health)
 * - `user`: any signed-in user ("signed in" in the module docs)
 * - `member`: any member of the `:workspaceId` workspace
 * - a permission: a member whose role has it
 * - `platform_admin`: Socioboard staff (`isPlatformAdmin`, with 2FA), only on `/api/admin/*`
 * Finer rules ("members:manage or self", "owner only", "matching email") are enforced in the
 * service on top of this baseline.
 */
export type Access = 'public' | 'user' | 'member' | 'platform_admin' | Permission;

export type SuccessStatus = 200 | 201 | 202 | 204;

export interface RouteDefinition {
  method: HttpMethod;
  /** Express-style path, e.g. `/api/v1/workspaces/:workspaceId/posts/:postId`. */
  path: string;
  access: Access;
  /** One line for the OpenAPI docs. */
  summary: string;
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
  /** Success responses by status. Use `null` for bodiless responses (204). */
  responses: Partial<Record<SuccessStatus, z.ZodType | null>>;
}

/** Declares an endpoint once; the API validates against it and the web client is typed by it. */
export function defineRoute<const R extends RouteDefinition>(route: R): R {
  if (route.access === 'member' || isPermission(route.access)) {
    if (!route.path.includes('/:workspaceId')) {
      throw new Error(`${route.method} ${route.path}: workspace access needs a :workspaceId param`);
    }
  }
  // The admin console's routes and only those live under /api/admin, outside the versioned API.
  if ((route.access === 'platform_admin') !== route.path.startsWith('/api/admin/')) {
    throw new Error(
      `${route.method} ${route.path}: platform_admin access goes with /api/admin/ paths`,
    );
  }
  for (const name of pathParams(route.path)) {
    if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
      throw new Error(`${route.method} ${route.path}: param ":${name}" must be camelCase`);
    }
  }
  return route;
}

/** Names of the `:params` in a path, in order. */
export function pathParams(path: string): string[] {
  return [...path.matchAll(/:([^/]+)/g)].map((m) => m[1] ?? '');
}

function isPermission(access: Access): access is Permission {
  return access.includes(':');
}

type Infer<S> = S extends z.ZodType ? z.infer<S> : undefined;
type InferIn<S> = S extends z.ZodType ? z.input<S> : undefined;

/** Parsed (server-side) and raw (client-side) shapes of a route's inputs and outputs. */
export type RouteParams<R extends RouteDefinition> = Infer<R['params']>;
export type RouteQuery<R extends RouteDefinition> = Infer<R['query']>;
export type RouteQueryInput<R extends RouteDefinition> = InferIn<R['query']>;
export type RouteBody<R extends RouteDefinition> = Infer<R['body']>;
export type RouteBodyInput<R extends RouteDefinition> = InferIn<R['body']>;
export type RouteResponse<R extends RouteDefinition> = {
  [S in keyof R['responses']]: R['responses'][S] extends z.ZodType
    ? z.infer<R['responses'][S]>
    : undefined;
}[keyof R['responses']];
