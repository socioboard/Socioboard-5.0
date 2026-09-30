import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  AdminActionBody,
  AdminAccount,
  AdminOverview,
  AdminTarget,
  apiRoutes,
  ListAttentionAccountsQuery,
  PublishingHealth,
  PublishingHealthQuery,
  type RouteDefinition,
} from '../index';

describe('admin console contracts', () => {
  it('every route is platform-admin only and under /api/admin', () => {
    for (const r of Object.values(apiRoutes.admin as Record<string, RouteDefinition>)) {
      expect(r.access, r.path).toBe('platform_admin');
      expect(r.path.startsWith('/api/admin/'), r.path).toBe(true);
    }
  });

  it('actions need a reason for the audit log', () => {
    expect(AdminActionBody.safeParse({}).success).toBe(false);
    expect(AdminActionBody.safeParse({ reason: '  ' }).success).toBe(false);
    expect(AdminActionBody.parse({ reason: ' ticket 4121 ' })).toEqual({ reason: 'ticket 4121' });
    expect(AdminActionBody.safeParse({ reason: 'x'.repeat(501) }).success).toBe(false);
  });

  it('queries have sensible defaults and bounds', () => {
    expect(PublishingHealthQuery.parse({})).toEqual({ range: '24h' });
    expect(PublishingHealthQuery.safeParse({ range: '1y' }).success).toBe(false);
    expect(ListAttentionAccountsQuery.parse({}).withinDays).toBe(7);
    expect(ListAttentionAccountsQuery.safeParse({ withinDays: '61' }).success).toBe(false);
  });

  it('never carries post content, tokens or secrets', () => {
    const fieldsOf = (schema: z.ZodType): string[] => {
      const json = JSON.stringify(z.toJSONSchema(schema, { io: 'output' }));
      return [...json.matchAll(/"([A-Za-z]+)":\{/g)].map((m) => m[1] ?? '');
    };
    const shapes = [AdminOverview, PublishingHealth, AdminTarget, AdminAccount];
    const fields = shapes.flatMap(fieldsOf).map((f) => f.toLowerCase());
    expect(fields).toContain('displayname'); // the scan does see the fields
    for (const banned of ['text', 'mediaids', 'firstcomment', 'override', 'token', 'secret']) {
      expect(fields, banned).not.toContain(banned);
    }
    expect(fields.some((f) => f.includes('tokenenc'))).toBe(false);
  });
});
