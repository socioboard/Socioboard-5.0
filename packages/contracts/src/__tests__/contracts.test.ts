import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';

import {
  can,
  defineRoute,
  ErrorEnvelope,
  Id,
  IsoDateTime,
  page,
  PageQuery,
  pathParams,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLES,
  type RouteBody,
  type RouteResponse,
} from '../index';

describe('common schemas', () => {
  it('accepts UUIDv7 ids only', () => {
    expect(Id.safeParse('01890a5d-ac96-774b-bcce-b302099a8057').success).toBe(true);
    expect(Id.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(false); // v4
    expect(Id.safeParse('42').success).toBe(false);
  });

  it('accepts UTC timestamps only', () => {
    expect(IsoDateTime.safeParse('2026-09-24T10:00:00Z').success).toBe(true);
    expect(IsoDateTime.safeParse('2026-09-24T10:00:00.123Z').success).toBe(true);
    expect(IsoDateTime.safeParse('2026-09-24T10:00:00+05:30').success).toBe(false);
  });

  it('pages default to 25 and cap at 100', () => {
    expect(PageQuery.parse({})).toEqual({ limit: 25 });
    expect(PageQuery.parse({ limit: '50', cursor: 'abc' })).toEqual({ limit: 50, cursor: 'abc' });
    expect(PageQuery.safeParse({ limit: '101' }).success).toBe(false);
    expect(PageQuery.safeParse({ limit: '0' }).success).toBe(false);
    const Items = page(z.object({ id: Id }));
    expect(Items.safeParse({ items: [], nextCursor: null }).success).toBe(true);
  });

  it('error envelope requires SCREAMING_SNAKE codes', () => {
    expect(
      ErrorEnvelope.safeParse({ error: { code: 'POST_NOT_FOUND', message: 'x' } }).success,
    ).toBe(true);
    expect(ErrorEnvelope.safeParse({ error: { code: 'postNotFound', message: 'x' } }).success).toBe(
      false,
    );
  });
});

describe('permissions', () => {
  it('matches the permissions table in docs/backend/README.md', () => {
    const table: Record<string, string> = {
      'workspace:delete': 'O----',
      'billing:manage': 'O----',
      'workspace:update': 'OA---',
      'members:manage': 'OA---',
      'accounts:connect': 'OA---',
      'accounts:manage': 'OA---',
      'posts:approve': 'OAE--',
      'posts:publish': 'OAE--',
      'posts:create': 'OAEC-',
      'posts:update-own': 'OAEC-',
      'media:upload': 'OAEC-',
      'ai:generate': 'OAEC-',
      'tasks:manage': 'OAEC-',
      'posts:read': 'OAECV',
      'calendar:read': 'OAECV',
      'analytics:read': 'OAECV',
      'media:read': 'OAECV',
    };
    expect(Object.keys(table).sort()).toEqual([...PERMISSIONS].sort());
    for (const [permission, row] of Object.entries(table)) {
      ROLES.forEach((role, i) => {
        expect(can(role, permission as never), `${role} ${permission}`).toBe(row[i] !== '-');
      });
    }
  });

  it('each role has every permission of the roles below it', () => {
    const pairs = [
      ['owner', 'admin'],
      ['admin', 'editor'],
      ['editor', 'contributor'],
      ['contributor', 'viewer'],
    ] as const;
    for (const [higher, lower] of pairs) {
      for (const p of ROLE_PERMISSIONS[lower]) expect(ROLE_PERMISSIONS[higher].has(p)).toBe(true);
    }
  });
});

describe('defineRoute', () => {
  const Post = z.object({ id: Id, text: z.string() });
  const createPost = defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts',
    access: 'posts:create',
    summary: 'Create a post',
    params: z.object({ workspaceId: Id }),
    body: z.object({ text: z.string().min(1) }),
    responses: { 201: Post },
  });

  it('keeps the definition and infers types', () => {
    expect(createPost.access).toBe('posts:create');
    expectTypeOf<RouteBody<typeof createPost>>().toEqualTypeOf<{ text: string }>();
    expectTypeOf<RouteResponse<typeof createPost>>().toEqualTypeOf<{ id: string; text: string }>();
  });

  it('rejects workspace access on paths without :workspaceId', () => {
    expect(() =>
      defineRoute({
        method: 'GET',
        path: '/api/v1/posts',
        access: 'posts:read',
        summary: 'x',
        responses: { 200: Post },
      }),
    ).toThrow(/:workspaceId/);
    expect(() =>
      defineRoute({
        method: 'GET',
        path: '/api/v1/me',
        access: 'user',
        summary: 'x',
        responses: { 200: Post },
      }),
    ).not.toThrow();
  });

  it('requires camelCase path params', () => {
    expect(pathParams('/api/v1/workspaces/:workspaceId/posts/:postId')).toEqual([
      'workspaceId',
      'postId',
    ]);
    expect(() =>
      defineRoute({
        method: 'GET',
        path: '/api/v1/x/:post_id',
        access: 'user',
        summary: 'x',
        responses: { 204: null },
      }),
    ).toThrow(/camelCase/);
  });
});
