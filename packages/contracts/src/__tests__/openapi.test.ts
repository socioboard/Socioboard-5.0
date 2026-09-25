import { Validator } from '@seriousme/openapi-schema-validator';
import { describe, expect, it } from 'vitest';

import { apiRoutes, buildOpenApi, pathParams, type RouteDefinition } from '../index';

const spec = buildOpenApi(apiRoutes, { version: 'test', sessionCookie: 'sb.session_token' });
interface Operation {
  operationId: string;
  security: unknown[];
  parameters?: { name: string; in: string; required: boolean }[];
  requestBody?: unknown;
  responses: Record<string, { content?: unknown }>;
}
const operations = Object.entries(spec.paths).flatMap(([path, methods]) =>
  Object.entries(methods).map(([method, op]) => ({ path, method, op: op as Operation })),
);
const routes = Object.values(apiRoutes).flatMap((m) => Object.values(m) as RouteDefinition[]);

describe('OpenAPI document', () => {
  it('is a valid OpenAPI 3.1 document', async () => {
    const result = await new Validator().validate(
      JSON.parse(JSON.stringify(spec)) as Parameters<Validator['validate']>[0],
    );
    expect(result.errors ?? []).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('has one operation per contract route, with unique operation ids', () => {
    expect(operations).toHaveLength(routes.length);
    const ids = operations.map((o) => o.op.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('declares every path parameter and requires a session except on public routes', () => {
    for (const route of routes) {
      const path = route.path.replace(/:([A-Za-z]+)/g, '{$1}');
      const op = (spec.paths[path] as Record<string, Operation>)[route.method.toLowerCase()];
      expect(op, `${route.method} ${route.path}`).toBeDefined();
      const declared = (op?.parameters ?? []).filter((p) => p.in === 'path').map((p) => p.name);
      expect(declared.sort()).toEqual(pathParams(route.path).sort());
      expect(op?.security).toEqual(route.access === 'public' ? [] : [{ session: [] }]);
      expect(Boolean(op?.requestBody)).toBe(Boolean(route.body));
    }
  });

  it('documents bodies, query parameters and bodiless responses from the schemas', () => {
    const upload = spec.paths['/api/v1/workspaces/{workspaceId}/media/uploads']?.post as {
      requestBody: {
        content: { 'application/json': { schema: { properties: { mime: { enum: string[] } } } } };
      };
    };
    expect(upload.requestBody.content['application/json'].schema.properties.mime.enum).toContain(
      'video/mp4',
    );

    const list = spec.paths['/api/v1/workspaces/{workspaceId}/media']?.get as Operation;
    const limit = list.parameters?.find((p) => p.name === 'limit');
    expect(limit).toMatchObject({ in: 'query', required: false });

    const remove = spec.paths['/api/v1/workspaces/{workspaceId}/media/{assetId}']
      ?.delete as Operation;
    expect(remove.responses['204']).toEqual({ description: 'Success, no content' });
  });
});
