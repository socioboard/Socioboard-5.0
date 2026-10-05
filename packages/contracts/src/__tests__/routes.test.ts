import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import {
  apiRoutes,
  AssignableRole,
  CompleteUploadBody,
  CreateUploadBody,
  CreateWorkspaceBody,
  ListMediaQuery,
  MEDIA_MAX_BYTES,
  MEDIA_MIME_KINDS,
  pathParams,
  Slug,
  Timezone,
  UpdateMeBody,
  UpdateWorkspaceBody,
  type RouteDefinition,
} from '../index';

const ID = '01890a5d-ac96-774b-bcce-b302099a8057';
const all: [string, RouteDefinition][] = Object.values(apiRoutes).flatMap((m) =>
  Object.entries(m as Record<string, RouteDefinition>),
);

describe('route table', () => {
  it('has no duplicate method + path', () => {
    const keys = all.map(([, r]) => `${r.method} ${r.path}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('lives under /api/v1 (admin console: /api/admin) and declares a params schema matching every :param', () => {
    for (const [name, r] of all) {
      const prefix = r.access === 'platform_admin' ? '/api/admin/' : '/api/v1/';
      expect(r.path.startsWith(prefix), name).toBe(true);
      const names = pathParams(r.path).sort();
      const declared = r.params ? Object.keys((r.params as z.ZodObject).shape).sort() : [];
      expect(declared, `${name} params`).toEqual(names);
    }
  });

  it('has a success response for every route and bodies only where they make sense', () => {
    for (const [name, r] of all) {
      expect(Object.keys(r.responses).length, name).toBeGreaterThan(0);
      if (r.method === 'GET') expect(r.body, `${name} GET has no body`).toBeUndefined();
    }
  });

  it('matches the route count (update when routes change)', () => {
    // Phase 0: auth 7, workspaces 16, media 10. Phase 1: networks 1, social accounts 9, posts 13.
    // Phase 2: scheduling 9, notifications 5, admin 6, telemetry 1.
    expect(all.length).toBe(77);
  });

  it('declares folder routes before /media/:assetId so they match first', () => {
    const paths = all.map(([, r]) => r.path);
    const firstFolder = paths.findIndex((p) => p.includes('/media/folders'));
    const assetRoute = paths.indexOf('/api/v1/workspaces/:workspaceId/media/:assetId');
    expect(firstFolder).toBeGreaterThan(-1);
    expect(firstFolder).toBeLessThan(assetRoute);
  });
});

describe('field rules', () => {
  it('timezones must exist', () => {
    expect(Timezone.safeParse('Asia/Kolkata').success).toBe(true);
    expect(Timezone.safeParse('UTC').success).toBe(true);
    expect(Timezone.safeParse('Mars/Olympus').success).toBe(false);
  });

  it('slugs are lowercase kebab-case', () => {
    expect(Slug.safeParse('acme-marketing').success).toBe(true);
    for (const bad of ['Acme', 'a', 'acme--x', '-acme', 'acme_x']) {
      expect(Slug.safeParse(bad).success, bad).toBe(false);
    }
  });

  it('owner cannot be assigned by invite or role change', () => {
    expect(AssignableRole.safeParse('admin').success).toBe(true);
    expect(AssignableRole.safeParse('owner').success).toBe(false);
  });

  it('update bodies must change something', () => {
    expect(UpdateMeBody.safeParse({}).success).toBe(false);
    expect(UpdateMeBody.safeParse({ name: 'Chethan' }).success).toBe(true);
    expect(UpdateWorkspaceBody.safeParse({}).success).toBe(false);
    expect(UpdateWorkspaceBody.safeParse({ logoKey: null }).success).toBe(true);
  });

  it('workspace creation needs a name and a real timezone', () => {
    expect(CreateWorkspaceBody.safeParse({ name: 'Acme', timezone: 'Europe/Berlin' }).success).toBe(
      true,
    );
    expect(CreateWorkspaceBody.safeParse({ name: '  ', timezone: 'Europe/Berlin' }).success).toBe(
      false,
    );
  });
});

describe('media uploads', () => {
  it('maps every allowed type to a kind', () => {
    expect(MEDIA_MIME_KINDS['image/gif']).toBe('gif');
    expect(MEDIA_MIME_KINDS['video/quicktime']).toBe('video');
  });

  it('rejects unsupported types and files over the limit for their kind', () => {
    const ok = { fileName: 'a.jpg', mime: 'image/jpeg', sizeBytes: 1000 };
    expect(CreateUploadBody.safeParse(ok).success).toBe(true);
    expect(CreateUploadBody.safeParse({ ...ok, mime: 'application/pdf' }).success).toBe(false);

    const tooBig = CreateUploadBody.safeParse({ ...ok, sizeBytes: MEDIA_MAX_BYTES.image + 1 });
    expect(tooBig.success).toBe(false);
    expect(tooBig.error?.issues[0]?.message).toMatch(/up to 20 MB/);
    // The same size is fine for a video.
    const video = { fileName: 'v.mp4', mime: 'video/mp4', sizeBytes: MEDIA_MAX_BYTES.image + 1 };
    expect(CreateUploadBody.safeParse(video).success).toBe(true);
  });

  it('complete takes part ETags for multipart, nothing for single uploads', () => {
    expect(CompleteUploadBody.safeParse({}).success).toBe(true);
    expect(
      CompleteUploadBody.safeParse({ parts: [{ partNumber: 1, etag: '"abc"' }] }).success,
    ).toBe(true);
    expect(CompleteUploadBody.safeParse({ parts: [] }).success).toBe(false);
  });

  it('list filters accept a folder id or "root"', () => {
    expect(ListMediaQuery.parse({ folderId: 'root' })).toMatchObject({
      folderId: 'root',
      limit: 25,
    });
    expect(ListMediaQuery.parse({ folderId: ID, kind: 'video' }).kind).toBe('video');
    expect(ListMediaQuery.safeParse({ folderId: 'nope' }).success).toBe(false);
  });
});
