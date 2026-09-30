import { describe, expect, it } from 'vitest';

import {
  apiRoutes,
  AppPath,
  FEED_TYPES,
  ListNotificationsQuery,
  realtimeRooms,
  serverEvents,
  UpdateNotificationPreferencesBody,
  type RouteDefinition,
} from '../index';

const A = '01890a5d-ac96-774b-bcce-b302099a8057';

describe('notifications', () => {
  it('links stay inside the app', () => {
    expect(AppPath.safeParse(`/w/acme/posts/${A}`).success).toBe(true);
    expect(AppPath.safeParse('/w/acme/posts?tab=failed#top').success).toBe(true);
    const bad = [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      // Browsers drop tabs and newlines: these become //evil.example.
      '/\t/evil.example',
      '/\n/evil.example',
      '/\r/evil.example',
      '/ /evil.example',
      'w/acme',
      '',
    ];
    for (const path of bad) {
      expect(AppPath.safeParse(path).success, JSON.stringify(path)).toBe(false);
    }
  });

  it('reads ?unread=false as false (not as a non-empty string)', () => {
    expect(ListNotificationsQuery.parse({ unread: 'false' }).unread).toBe(false);
    expect(ListNotificationsQuery.parse({ unread: 'true' }).unread).toBe(true);
    expect(ListNotificationsQuery.safeParse({ unread: 'yes' }).success).toBe(false);
    expect(ListNotificationsQuery.parse({ type: 'publish_failed' }).type).toEqual([
      'publish_failed',
    ]);
  });

  it('the digest is email only', () => {
    expect(FEED_TYPES).not.toContain('digest');
    expect(FEED_TYPES).toContain('publish_failed');
  });

  it('preference updates name each type once, and at least one', () => {
    expect(UpdateNotificationPreferencesBody.safeParse({ items: [] }).success).toBe(false);
    const item = { type: 'publish_failed', email: false };
    expect(UpdateNotificationPreferencesBody.safeParse({ items: [item] }).success).toBe(true);
    expect(UpdateNotificationPreferencesBody.safeParse({ items: [item, item] }).success).toBe(
      false,
    );
  });

  it('are a user’s own: no route is workspace-scoped', () => {
    for (const r of Object.values(apiRoutes.notifications as Record<string, RouteDefinition>)) {
      expect(r.access, r.path).toBe('user');
      expect(r.path.includes(':workspaceId'), r.path).toBe(false);
    }
  });
});

describe('realtime events', () => {
  it('names rooms by user and workspace', () => {
    expect(realtimeRooms.user(A)).toBe(`user:${A}`);
    expect(realtimeRooms.workspace(A)).toBe(`workspace:${A}`);
  });

  it('workspace events say which workspace, so a client can ignore a stale one', () => {
    for (const name of ['post.status_changed', 'account.status_changed'] as const) {
      expect(Object.keys(serverEvents[name].shape), name).toContain('workspaceId');
    }
  });

  it('parses a status change', () => {
    const payload = {
      workspaceId: A,
      postId: A,
      status: 'scheduled',
      targets: [
        { id: A, status: 'scheduled', scheduledAt: '2026-10-05T09:30:00.000Z', publishedAt: null },
      ],
    };
    expect(serverEvents['post.status_changed'].safeParse(payload).success).toBe(true);
    expect(
      serverEvents['post.status_changed'].safeParse({ ...payload, status: 'gone' }).success,
    ).toBe(false);
  });
});
