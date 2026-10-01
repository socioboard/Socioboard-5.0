// Live updates (P2-B11) end to end: the API's Socket.IO server on a real HTTP server, a real
// Socket.IO client with the browser's cookie, and events sent the way the app sends them (the
// Valkey emitter, from any process) arriving only in the rooms they're for.
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  Post,
  REALTIME_PATH,
  realtimeRooms,
  type ServerEventName,
  type ServerEventPayload,
} from '@socioboard/contracts';
import { io as connect, type Socket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { RealtimeServer } from '../platform';
import { createTestApp } from '../testing';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let server: Server;
let realtime: RealtimeServer;
let url = '';
let owner: Browser;
let member: Browser;
let outsider: Browser;
let ws = '';
let other = '';
let memberId = '';
let accountId = '';
const sockets: Socket[] = [];

/** A socket for this browser, connected (or refused, with the reason). */
function open(who: Browser | null, origin = t.config.appUrl) {
  const socket = connect(url, {
    path: REALTIME_PATH,
    transports: ['websocket'],
    reconnection: false,
    extraHeaders: { origin, ...(who ? { cookie: who.cookieHeader() } : {}) },
  });
  sockets.push(socket);
  return new Promise<Socket>((resolve, reject) => {
    socket.on('connect', () => {
      resolve(socket);
    });
    socket.on('connect_error', (err) => {
      reject(err);
    });
  });
}

/** The next `event` this socket gets, or null if none arrives within `ms`. */
function next<E extends ServerEventName>(socket: Socket, event: E, ms = 2000) {
  return new Promise<ServerEventPayload<E> | null>((resolve) => {
    const timer = setTimeout(() => {
      socket.off(event);
      resolve(null);
    }, ms);
    // The client socket is untyped: listen by name and type the payload here.
    const name: string = event;
    socket.once(name, (payload: unknown) => {
      clearTimeout(timer);
      resolve(payload as ServerEventPayload<E>);
    });
  });
}

const accountEvent = (workspaceId: string, id: string) => {
  t.platform.realtime.emit(realtimeRooms.workspace(workspaceId), 'account.status_changed', {
    workspaceId,
    accountId: id,
    status: 'active',
  });
};

beforeAll(async () => {
  server = createServer(t.app);
  realtime = t.attachRealtime(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;

  owner = await t.signUp('rt-owner');
  member = await t.signUp('rt-member');
  outsider = await t.signUp('rt-outsider');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Live'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  other = (
    (await outsider.post('/api/v1/workspaces', { name: t.workspaceName('Else'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const inv = await owner.post(`/api/v1/workspaces/${ws}/invitations`, {
    email: t.email('rt-member'),
    role: 'editor',
  });
  await member.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  memberId = (
    await t.db.client.member.findFirstOrThrow({ where: { workspaceId: ws, userId: member.userId } })
  ).id;
  accountId = (
    await t.db.client.socialAccount.create({
      data: { workspaceId: ws, network: 'facebook_page', externalId: 'rt-1', displayName: 'Live' },
    })
  ).id;
});

afterAll(async () => {
  for (const s of sockets) s.disconnect();
  await t.cleanup();
});

describe('connecting', () => {
  it('needs a session cookie', async () => {
    await expect(open(null)).rejects.toThrow('UNAUTHENTICATED');
  });

  it('needs the app’s own origin, even with a valid cookie', async () => {
    await expect(open(owner, 'https://evil.example')).rejects.toThrow('ORIGIN_NOT_ALLOWED');
  });
});

describe('rooms', () => {
  it('a user gets their own events, and their workspaces’, not anyone else’s', async () => {
    const mine = await open(owner);
    const theirs = await open(outsider);
    const forOwner = next(mine, 'notification.read');
    const notForOutsider = next(theirs, 'notification.read', 500);
    t.platform.realtime.emit(realtimeRooms.user(owner.userId), 'notification.read', {
      ids: null,
      unreadCount: 0,
    });
    expect(await forOwner).toEqual({ ids: null, unreadCount: 0 });
    expect(await notForOutsider).toBeNull();

    const inWs = next(mine, 'account.status_changed');
    const notInWs = next(theirs, 'account.status_changed', 500);
    accountEvent(ws, accountId);
    expect(await inWs).toMatchObject({ workspaceId: ws, accountId });
    expect(await notInWs).toBeNull();
    // The outsider's own workspace reaches them.
    const own = next(theirs, 'account.status_changed');
    accountEvent(other, accountId);
    expect(await own).toMatchObject({ workspaceId: other });
  });

  it('removed from a workspace: its events stop at once, on the open socket', async () => {
    const socket = await open(member);
    const before = next(socket, 'account.status_changed');
    accountEvent(ws, accountId);
    expect(await before).not.toBeNull();
    expect(
      (await owner.send('DELETE', `/api/v1/workspaces/${ws}/members/${memberId}`)).status,
    ).toBe(204);
    // Room changes travel through Valkey too; give them a moment.
    await new Promise((r) => setTimeout(r, 300));
    const after = next(socket, 'account.status_changed', 600);
    accountEvent(ws, accountId);
    expect(await after).toBeNull();
  });

  it('a new workspace joins its creator’s open sockets', async () => {
    const socket = await open(owner);
    const created = (
      (await owner.post('/api/v1/workspaces', { name: t.workspaceName('New'), timezone: 'UTC' }))
        .body as { id: string }
    ).id;
    await new Promise((r) => setTimeout(r, 300));
    const got = next(socket, 'account.status_changed');
    accountEvent(created, accountId);
    expect(await got).toMatchObject({ workspaceId: created });
  });
});

describe('what the app sends', () => {
  it('a post scheduled, moved or sent: post.status_changed with each target’s times', async () => {
    const socket = await open(owner);
    const draft = Post.parse(
      (
        await owner.post(`/api/v1/workspaces/${ws}/posts`, {
          text: 'Live',
          targets: [{ accountId }],
        })
      ).body,
    );
    const at = new Date(Date.now() + 86_400_000).toISOString();
    const scheduled = next(socket, 'post.status_changed');
    const res = await owner.post(`/api/v1/workspaces/${ws}/posts/${draft.id}/schedule`, { at });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const target = draft.targets[0];
    expect(await scheduled).toEqual({
      workspaceId: ws,
      postId: draft.id,
      status: 'scheduled',
      targets: [{ id: target?.id, status: 'scheduled', scheduledAt: at, publishedAt: null }],
    });
    // Moving it keeps the status but changes the time: still sent.
    const later = new Date(Date.now() + 2 * 86_400_000).toISOString();
    const moved = next(socket, 'post.status_changed');
    await owner.send('PATCH', `/api/v1/workspaces/${ws}/targets/${target?.id ?? ''}/schedule`, {
      at: later,
      previousAt: at,
    });
    expect((await moved)?.targets[0]?.scheduledAt).toBe(later);
  });

  it('an account disconnected: account.status_changed', async () => {
    const socket = await open(owner);
    const got = next(socket, 'account.status_changed');
    await owner.send('DELETE', `/api/v1/workspaces/${ws}/accounts/${accountId}`);
    expect(await got).toEqual({ workspaceId: ws, accountId, status: 'disconnected' });
  });
});

// Last: it shuts the server down.
describe('shutting down', () => {
  it('closes the sockets but leaves the HTTP server to the API’s graceful close', async () => {
    const socket = await open(owner);
    const gone = new Promise<void>((resolve) => {
      socket.on('disconnect', () => {
        resolve();
      });
    });
    await realtime.close();
    await gone;
    expect(server.listening).toBe(true);
    // The API closes it next (closeServer); that must not fail.
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
});
