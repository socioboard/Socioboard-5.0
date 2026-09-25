import { z } from 'zod';

import { ErrorEnvelope } from './common';
import type { RouteDefinition } from './route';

type JsonSchema = Record<string, unknown>;

/**
 * JSON Schema for one Zod schema, as OpenAPI 3.1 embeds it. `input` describes what clients send
 * (before defaults and coercion), `output` what the API returns.
 */
function schemaOf(schema: z.ZodType, io: 'input' | 'output'): JsonSchema {
  const { $schema: _dialect, ...rest } = z.toJSONSchema(schema, {
    io,
    target: 'draft-2020-12',
    // Refinements (e.g. "a real timezone") can't be expressed; they show as their base type.
    unrepresentable: 'any',
  }) as JsonSchema;
  return rest;
}

const ERRORS: Record<string, string> = {
  '400': 'Invalid input (VALIDATION_FAILED) or request body',
  '401': 'Not signed in (UNAUTHENTICATED)',
  '403': 'Role not allowed, or request from another site',
  '404': 'Not found, or a workspace the caller is not a member of',
  '409': 'Conflict with the current state (e.g. SLUG_TAKEN)',
  '422': 'Business rule violated (codes per endpoint)',
  '429': 'Too many requests (RATE_LIMITED)',
};

export interface OpenApiOptions {
  version: string;
  /** Session cookie name, for the security scheme. */
  sessionCookie: string;
}

/**
 * OpenAPI 3.1 document for the contract routes, grouped by module (tag). Generated from the same
 * Zod schemas the API validates with, so it can't drift from the code. Better Auth's own
 * endpoints (/api/auth/*) are not included.
 */
export function buildOpenApi(
  modules: Record<string, Record<string, RouteDefinition>>,
  { version, sessionCookie }: OpenApiOptions,
) {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const [tag, routes] of Object.entries(modules)) {
    for (const [operationId, route] of Object.entries(routes)) {
      const path = route.path.replace(/:([A-Za-z]+)/g, '{$1}');
      const parameters: unknown[] = [];

      for (const [location, schema] of [
        ['path', route.params],
        ['query', route.query],
      ] as const) {
        if (!schema) continue;
        const json = schemaOf(schema, 'input');
        const properties = (json.properties ?? {}) as Record<string, JsonSchema>;
        const required = new Set((json.required ?? []) as string[]);
        for (const [name, property] of Object.entries(properties)) {
          parameters.push({
            name,
            in: location,
            required: location === 'path' || required.has(name),
            schema: property,
          });
        }
      }

      const responses: Record<string, unknown> = {};
      for (const [status, schema] of Object.entries(route.responses)) {
        responses[status] = schema
          ? {
              description: 'Success',
              content: { 'application/json': { schema: schemaOf(schema, 'output') } },
            }
          : { description: 'Success, no content' };
      }
      const errorCodes =
        route.access === 'public' ? ['400', '404', '422', '429'] : Object.keys(ERRORS);
      for (const status of errorCodes) {
        responses[status] = {
          description: ERRORS[status],
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } },
          },
        };
      }

      paths[path] ??= {};
      paths[path][route.method.toLowerCase()] = {
        operationId,
        tags: [tag],
        summary: route.summary,
        // Who may call it: public, any signed-in user, any workspace member, or a permission.
        'x-access': route.access,
        security: route.access === 'public' ? [] : [{ session: [] }],
        ...(parameters.length > 0 ? { parameters } : {}),
        ...(route.body
          ? {
              requestBody: {
                required: true,
                content: { 'application/json': { schema: schemaOf(route.body, 'input') } },
              },
            }
          : {}),
        responses,
      };
    }
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Socioboard API',
      version,
      description:
        'Generated from @socioboard/contracts. Authentication uses the session cookie set by the ' +
        'Better Auth endpoints under /api/auth (not listed here).',
    },
    servers: [{ url: '/' }],
    tags: Object.keys(modules).map((name) => ({ name })),
    paths,
    components: {
      securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: sessionCookie } },
      schemas: { ErrorEnvelope: schemaOf(ErrorEnvelope, 'output') },
    },
  };
}
