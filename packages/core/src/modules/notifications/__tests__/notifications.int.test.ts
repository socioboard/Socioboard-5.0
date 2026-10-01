// Notifications (P2-B8) against Postgres and Valkey: events become notifications for the right
// people, through the channels each chose; the feed, read state and preferences over HTTP; a
// burst becomes one email; live updates go to the user's room.
import {
  ErrorEnvelope,
  NotificationPage,
  NotificationPreferences,
  UnreadCount,
  type ServerEventName,
} from '@socioboard/contracts';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestApp } from '../../../testing';
import type { MailMessage } from '../../../platform';
import type { PublishingEvents } from '../../publishing';
import type { SocialAccountEvents } from '../../social-accounts';
import { createNotifications, EMAIL_WINDOW_MS, sendNotificationEmail } from '../index';

const t = createTestApp();
const notifications = createNotifications(t.platform);
const emailQueue = t.platform.queues.get(notifications.emailQueue);
type Browser = Awaited<ReturnType<typeof t.signUp>>;
type Events = PublishingEvents & SocialAccountEvents;
const emit = <E extends keyof Events & string>(name: E, payload: Events[E]) =>
  t.platform.events.emit(name, payload);
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;

let owner: Browser;
let admin: Browser;
let editor: Browser;
let viewer: Browser;
let ws = '';
let slug = '';
let editorMemberId = '';
let accountId = '';
const base = () => `/api/v1/workspaces/${ws}`;

/** Live updates sent through the platform's emitter, as [room, event]. */
const live: [string, ServerEventName, unknown][] = [];

const feed = async (who: Browser, query = '') =>
  NotificationPage.parse((await who.get(`/api/v1/notifications${query}`)).body);

beforeAll(async () => {
  owner = await t.signUp('nt-owner');
  admin = await t.signUp('nt-admin');
  editor = await t.signUp('nt-editor');
  viewer = await t.signUp('nt-viewer');
  const created = (
    await owner.post('/api/v1/workspaces', {
      name: t.workspaceName('Notify'),
      timezone: 'UTC',
    })
  ).body as { id: string; slug: string };
  ({ id: ws, slug } = created);
  for (const [who, role, label] of [
    [admin, 'admin', 'nt-admin'],
    [editor, 'editor', 'nt-editor'],
    [viewer, 'viewer', 'nt-viewer'],
  ] as const) {
    const inv = await owner.post(`${base()}/invitations`, { email: t.email(label), role });
    await who.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  }
  editorMemberId = (
    await t.db.client.member.findFirstOrThrow({ where: { workspaceId: ws, userId: editor.userId } })
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-nt-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('token'),
    },
  });
  accountId = (
    await t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId: login.id,
        network: 'facebook_page',
        externalId: '501',
        displayName: 'Halden Coffee',
      },
    })
  ).id;
  t.platform.realtime.emit = (room, event, payload) => {
    live.push([room, event, payload]);
  };
});

beforeEach(async () => {
  live.length = 0;
  await t.db.client.notification.deleteMany({ where: { workspaceId: ws } });
  await t.db.client.notificationPreference.deleteMany({
    where: { userId: { in: [owner.userId, admin.userId, editor.userId, viewer.userId] } },
  });
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

/** A post written by `who`. */
async function post(who: Browser = editor) {
  const res = await who.post(`${base()}/posts`, {
    text: 'Fresh roast',
    targets: [{ accountId }],
  });
  return res.body as { id: string; targets: { id: string }[] };
}

const failed = (postId: string, message = 'Session expired') =>
  emit('target.failed', {
    workspaceId: ws,
    postId,
    targetId: postId,
    network: 'facebook_page',
    errorKind: 'auth',
    message,
  });

describe('who hears about what', () => {
  it('a failed delivery: its author and the workspace admins, not other members', async () => {
    const p = await post();
    await failed(p.id);
    for (const who of [editor, owner, admin]) {
      const page = await feed(who);
      expect(page.unreadCount).toBe(1);
      expect(page.items[0]).toMatchObject({
        type: 'publish_failed',
        title: 'A post couldn’t be published to Facebook',
        body: 'Session expired',
        link: `/w/${slug}/posts/${p.id}`,
        params: { postId: p.id, network: 'facebook_page', kind: 'auth' },
        workspace: { id: ws, slug },
        readAt: null,
      });
    }
    expect((await feed(viewer)).items).toHaveLength(0);
  });

  it('a published post: its author only', async () => {
    const p = await post();
    await emit('target.published', {
      workspaceId: ws,
      postId: p.id,
      targetId: p.id,
      network: 'facebook_page',
      externalPostId: 'x',
    });
    expect((await feed(editor)).items.map((n) => n.type)).toEqual(['post_published']);
    expect((await feed(owner)).items).toHaveLength(0);
  });

  it('an account needing reconnecting: the admins, with the reason', async () => {
    await emit('account.reauth_required', {
      workspaceId: ws,
      accountId,
      connectionId: accountId,
      reason: 'Priya no longer has permission to post here',
    });
    for (const who of [owner, admin]) {
      expect((await feed(who)).items[0]).toMatchObject({
        type: 'account_reauth_required',
        title: 'Halden Coffee needs reconnecting',
        body: 'Priya no longer has permission to post here',
        link: `/w/${slug}/accounts?account=${accountId}`,
      });
    }
    expect((await feed(editor)).items).toHaveLength(0);
  });

  it('a deleted workspace notifies nobody', async () => {
    const p = await post();
    await t.db.client.workspace.update({ where: { id: ws }, data: { deletedAt: new Date() } });
    try {
      await failed(p.id);
      expect(await t.db.client.notification.count({ where: { workspaceId: ws } })).toBe(0);
    } finally {
      await t.db.client.workspace.update({ where: { id: ws }, data: { deletedAt: null } });
    }
  });

  it('each new notification goes live to its user, with the unread count', async () => {
    const p = await post();
    await failed(p.id);
    const rooms = live.filter(([, e]) => e === 'notification.new').map(([room]) => room);
    expect(rooms.sort()).toEqual(
      [`user:${editor.userId}`, `user:${owner.userId}`, `user:${admin.userId}`].sort(),
    );
    expect(live[0]?.[2]).toMatchObject({
      unreadCount: 1,
      notification: { type: 'publish_failed' },
    });
  });
});

describe('the feed', () => {
  it('reads one or all, says so live, and counts what is left', async () => {
    for (const msg of ['one', 'two', 'three']) await failed((await post()).id, msg);
    const page = await feed(editor);
    expect(page.items.map((n) => n.body)).toEqual(['three', 'two', 'one']);
    const [newest] = page.items;
    const one = await editor.post(`/api/v1/notifications/${newest?.id ?? ''}/read`);
    expect(UnreadCount.parse(one.body)).toEqual({ unreadCount: 2 });
    // Again is fine, and says nothing new.
    live.length = 0;
    await editor.post(`/api/v1/notifications/${newest?.id ?? ''}/read`);
    expect(live).toHaveLength(0);

    expect((await feed(editor, '?unread=true')).items.map((n) => n.body)).toEqual(['two', 'one']);
    expect((await feed(editor, '?unread=false')).items.map((n) => n.body)).toEqual(['three']);

    const all = await editor.post('/api/v1/notifications/read-all');
    expect(UnreadCount.parse(all.body)).toEqual({ unreadCount: 0 });
    expect(live).toContainEqual([
      `user:${editor.userId}`,
      'notification.read',
      { ids: null, unreadCount: 0 },
    ]);
    // Reading mine leaves others' unread.
    expect((await feed(owner)).unreadCount).toBe(3);
  });

  it('pages newest first, and filters by type', async () => {
    for (let i = 0; i < 3; i++) await failed((await post()).id, `f${String(i)}`);
    const first = await feed(editor, '?limit=2');
    expect(first.items.map((n) => n.body)).toEqual(['f2', 'f1']);
    const next = await feed(editor, `?limit=2&cursor=${first.nextCursor ?? ''}`);
    expect(next.items.map((n) => n.body)).toEqual(['f0']);
    expect(next.nextCursor).toBeNull();
    expect((await feed(editor, '?type=post_published')).items).toHaveLength(0);
  });

  it('someone else’s notification is not found', async () => {
    await failed((await post()).id);
    const [mine] = (await feed(owner)).items;
    const res = await viewer.post(`/api/v1/notifications/${mine?.id ?? ''}/read`);
    expect([res.status, code(res)]).toEqual([404, 'NOTIFICATION_NOT_FOUND']);
    expect((await feed(owner)).unreadCount).toBe(1);
  });

  it('removed from the workspace: its notifications leave the feed and the count', async () => {
    await failed((await post()).id);
    expect((await feed(editor)).unreadCount).toBe(1);
    await owner.send('DELETE', `${base()}/members/${editorMemberId}`);
    try {
      const page = await feed(editor);
      expect(page.items).toHaveLength(0);
      expect(page.unreadCount).toBe(0);
    } finally {
      const inv = await owner.post(`${base()}/invitations`, {
        email: t.email('nt-editor'),
        role: 'editor',
      });
      await editor.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
      editorMemberId = (
        await t.db.client.member.findFirstOrThrow({
          where: { workspaceId: ws, userId: editor.userId },
        })
      ).id;
    }
  });

  it('notifications older than 90 days are purged', async () => {
    await failed((await post()).id);
    await t.db.client.notification.updateMany({
      where: { workspaceId: ws, userId: owner.userId },
      data: { createdAt: new Date(Date.now() - 91 * 86_400_000) },
    });
    expect(await notifications.service.purgeExpired()).toBeGreaterThanOrEqual(1);
    expect((await feed(owner)).items).toHaveLength(0);
    expect((await feed(editor)).items).toHaveLength(1);
  });
});

describe('preferences', () => {
  it('every type with its defaults; changing some keeps the rest', async () => {
    const defaults = NotificationPreferences.parse(
      (await editor.get('/api/v1/me/notification-preferences')).body,
    );
    expect(defaults.items).toEqual([
      { type: 'publish_failed', inApp: true, email: true },
      { type: 'post_published', inApp: true, email: false },
      { type: 'account_reauth_required', inApp: true, email: true },
      { type: 'digest', inApp: null, email: false },
    ]);
    const res = await editor.send('PUT', '/api/v1/me/notification-preferences', {
      items: [
        { type: 'publish_failed', inApp: false },
        { type: 'digest', email: true },
      ],
    });
    expect(NotificationPreferences.parse(res.body).items).toEqual([
      { type: 'publish_failed', inApp: false, email: true },
      { type: 'post_published', inApp: true, email: false },
      { type: 'account_reauth_required', inApp: true, email: true },
      { type: 'digest', inApp: null, email: true },
    ]);
  });

  it('a channel a type doesn’t offer can’t be turned on', async () => {
    const res = await editor.send('PUT', '/api/v1/me/notification-preferences', {
      items: [{ type: 'digest', inApp: true }],
    });
    expect([res.status, code(res)]).toEqual([422, 'NOTIFICATION_CHANNEL_NOT_OFFERED']);
  });

  it('in-app off: no notification in the feed, the email still goes', async () => {
    await editor.send('PUT', '/api/v1/me/notification-preferences', {
      items: [{ type: 'publish_failed', inApp: false }],
    });
    const p = await post();
    await failed(p.id);
    expect((await feed(editor)).items).toHaveLength(0);
    expect(await emailItems(editor.userId, `post:${p.id}`)).toHaveLength(1);
  });
});

/** The items waiting in this user's email for this group, in the current window. */
async function emailItems(userId: string, group: string) {
  const window = Math.floor(Date.now() / EMAIL_WINDOW_MS);
  return t.platform.kv.listRange(`notify-email:${userId}:${group}:${String(window)}`);
}

describe('emails', () => {
  const sent: MailMessage[] = [];
  const deps = {
    db: t.db,
    kv: t.platform.kv,
    logger: t.platform.logger,
    notifications: notifications.service,
    appUrl: 'https://app.example.test',
    mailer: {
      send: (m: MailMessage) => {
        sent.push(m);
        return Promise.resolve();
      },
      verify: () => Promise.resolve(true),
      close: () => undefined,
    },
  };
  beforeEach(() => {
    sent.length = 0;
  });

  it('several failures of one post become one email, sent once its window closes', async () => {
    const p = await post();
    await failed(p.id, 'Facebook said no');
    await failed(p.id, 'Instagram said no');
    const window = Math.floor(Date.now() / EMAIL_WINDOW_MS);
    const jobId = `email-${editor.userId}-post-${p.id}-${String(window)}`;
    const job = await emailQueue.getJob(jobId);
    expect(job?.data).toEqual({
      userId: editor.userId,
      key: `notify-email:${editor.userId}:post:${p.id}:${String(window)}`,
    });
    expect(await job?.getState()).toBe('delayed');
    // Delayed until the window closes, plus a few seconds.
    expect(job?.opts.delay).toBeLessThanOrEqual(EMAIL_WINDOW_MS + 5_000);

    if (!job) throw new Error('no email job');
    await sendNotificationEmail(deps, job.data);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      to: t.email('nt-editor'),
      subject: 'A post couldn’t be published to Facebook (and 1 more)',
    });
    expect(sent[0]?.text).toContain('Facebook said no');
    expect(sent[0]?.text).toContain('Instagram said no');
    expect(sent[0]?.text).toContain(`https://app.example.test/w/${slug}/posts/${p.id}`);
    // Sent once: the items are gone.
    await sendNotificationEmail(deps, job.data);
    expect(sent).toHaveLength(1);
  });

  it('only types with email on: a published post isn’t emailed by default', async () => {
    const p = await post();
    await emit('target.published', {
      workspaceId: ws,
      postId: p.id,
      targetId: p.id,
      network: 'facebook_page',
      externalPostId: 'x',
    });
    expect(await emailItems(editor.userId, `post:${p.id}`)).toHaveLength(0);
  });

  it('email turned off before the window closes: left out', async () => {
    const p = await post();
    await failed(p.id);
    await editor.send('PUT', '/api/v1/me/notification-preferences', {
      items: [{ type: 'publish_failed', email: false }],
    });
    const window = Math.floor(Date.now() / EMAIL_WINDOW_MS);
    await sendNotificationEmail(deps, {
      userId: editor.userId,
      key: `notify-email:${editor.userId}:post:${p.id}:${String(window)}`,
    });
    expect(sent).toHaveLength(0);
  });

  it('a failed send keeps the items for the retry', async () => {
    const p = await post();
    await failed(p.id);
    const window = Math.floor(Date.now() / EMAIL_WINDOW_MS);
    const data = {
      userId: editor.userId,
      key: `notify-email:${editor.userId}:post:${p.id}:${String(window)}`,
    };
    const down = { ...deps.mailer, send: () => Promise.reject(new Error('SMTP down')) };
    await expect(sendNotificationEmail({ ...deps, mailer: down }, data)).rejects.toThrow();
    await sendNotificationEmail(deps, data);
    expect(sent).toHaveLength(1);
  });
});
