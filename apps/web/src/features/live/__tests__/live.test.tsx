// Live updates (P2-F5): the socket's events, checked and turned into fresh screens, through the
// whole app with a fake socket (vitest.setup.ts) and a fake server.
import type { Notification, NotificationPage, PostDetails } from '@socioboard/contracts';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { connectRealtime, isLive, realtimeStatus } from '../../../lib/realtime';
import { FakeSocket, openSocket } from '../../../testing/fake-socket';
import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { BELL_SIZE, notificationKeys } from '../../notifications';
import { postKeys } from '../../posts';
import { liveHandlers } from '../use-live-updates';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
const TARGET = '01a0d816-827a-74d6-a46e-409c7db35001';
type Reply = [number, unknown];

const note = (n: number, over: Partial<Notification> = {}): Notification => ({
  id: `01a0d816-827a-74d6-a46e-409c7db3${String(9000 + n)}`,
  type: 'publish_failed',
  workspace: { id: WID, slug: 'halden', name: 'Halden Coffee' },
  title: 'A post couldn’t be published to Facebook',
  body: 'The Page’s access token has expired.',
  params: { network: 'facebook_page' },
  link: `/w/halden/posts/${POST_ID}`,
  readAt: null,
  createdAt: new Date().toISOString(),
  ...over,
});

const post = (status: string, targetStatus: string): PostDetails =>
  ({
    id: POST_ID,
    status,
    text: 'Autumn menu is here',
    mediaIds: [],
    link: null,
    firstComment: null,
    labelIds: [],
    author: { id: '01a0d816-827a-74d6-a46e-409c7db36f92', name: 'Priya Raman', avatarUrl: null },
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    recurring: null,
    recurrence: null,
    review: { needed: false, latest: null },
    targets: [
      {
        id: TARGET,
        account: {
          id: '01a0d816-827a-74d6-a46e-409c7db31001',
          network: 'facebook_page',
          displayName: 'Halden Coffee',
          username: null,
          avatarUrl: null,
          status: 'active',
        },
        override: null,
        status: targetStatus,
        scheduledAt: null,
        externalPostId: null,
        permalink: null,
        attempts: 1,
        lastError: null,
        publishedAt: null,
        history: [],
      },
    ],
  }) as unknown as PostDetails;

const base = (extra: Record<string, Reply | Handler> = {}): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [halden], activeWorkspaceId: WID })],
  [`GET ${BASE}/labels`]: [200, { items: [] }],
  [`GET ${BASE}/posts`]: [200, { items: [], nextCursor: null }],
  ...extra,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the connection', () => {
  it('is live once connected, offline when dropped, and refreshes what it missed when back', () => {
    const socket = new FakeSocket();
    const resync = vi.fn();
    const stop = connectRealtime({ resync }, () => socket);
    expect(realtimeStatus()).toBe('connecting');
    socket.fire('connect');
    expect(isLive()).toBe(true);
    // The first connection has nothing to catch up on.
    expect(resync).not.toHaveBeenCalled();
    socket.fire('disconnect');
    expect(realtimeStatus()).toBe('offline');
    socket.fire('connect');
    expect(isLive()).toBe(true);
    expect(resync).toHaveBeenCalledTimes(1);
    socket.fire('connect_error', new Error('refused'));
    expect(isLive()).toBe(false);
    stop();
    expect(socket.disconnected).toBe(true);
    expect(realtimeStatus()).toBe('offline');
  });

  it('hands each event to its handler, and ignores one that doesn’t match its contract', () => {
    const socket = new FakeSocket();
    const handler = vi.fn();
    const stop = connectRealtime({ 'notification.read': handler }, () => socket);
    socket.fire('notification.read', { ids: null, unreadCount: 2 });
    socket.fire('notification.read', { ids: 'everything', unreadCount: -1 });
    socket.fire('notification.read');
    expect(handler.mock.calls).toEqual([[{ ids: null, unreadCount: 2 }]]);
    stop();
  });
});

describe('what each event changes', () => {
  it('a new notification goes on top of the bell (at most 20) with the server’s count', () => {
    const client = new QueryClient();
    const old = Array.from({ length: BELL_SIZE }, (_, i) => note(i + 1));
    client.setQueryData<NotificationPage>(notificationKeys.bell, {
      items: old,
      nextCursor: 'more',
      unreadCount: 20,
    });
    const fresh = note(99);
    liveHandlers(client)['notification.new']?.({ notification: fresh, unreadCount: 21 });
    const bell = client.getQueryData<NotificationPage>(notificationKeys.bell);
    expect(bell?.unreadCount).toBe(21);
    expect(bell?.items).toHaveLength(BELL_SIZE);
    expect(bell?.items[0]).toEqual(fresh);
    expect(bell?.items.at(-1)?.id).toBe(old[18]?.id);
    // The same one again (another tab, a retry) isn't listed twice.
    liveHandlers(client)['notification.new']?.({ notification: fresh, unreadCount: 21 });
    expect(
      client
        .getQueryData<NotificationPage>(notificationKeys.bell)
        ?.items.filter((n) => n.id === fresh.id),
    ).toHaveLength(1);
  });

  it('a post’s new statuses show on its page at once, and everything showing it refreshes', () => {
    const client = new QueryClient();
    const detail = postKeys.detail(WID, POST_ID);
    client.setQueryData(detail, post('publishing', 'publishing'));
    const lists = ['workspaces', WID, 'posts', 'list', 'all', null];
    const calendar = ['workspaces', WID, 'calendar', { from: 'a', to: 'b' }];
    const slots = ['workspaces', WID, 'accounts', 'acc', 'queue-slots'];
    const accounts = ['workspaces', WID, 'accounts', 'list'];
    const other = ['workspaces', 'another', 'calendar', {}];
    for (const key of [lists, calendar, slots, accounts, other]) client.setQueryData(key, {});
    liveHandlers(client)['post.status_changed']?.({
      workspaceId: WID,
      postId: POST_ID,
      status: 'published',
      targets: [
        {
          id: TARGET,
          status: 'published',
          scheduledAt: null,
          publishedAt: '2026-10-05T10:00:00.000Z',
        },
      ],
    });
    const now = client.getQueryData<PostDetails>(detail);
    expect(now?.status).toBe('published');
    expect(now?.targets[0]).toMatchObject({
      status: 'published',
      publishedAt: '2026-10-05T10:00:00.000Z',
      attempts: 1,
    });
    const stale = (key: unknown[]) => client.getQueryState(key)?.isInvalidated;
    expect([detail, lists, calendar, slots].map((k) => stale([...k]))).toEqual([
      true,
      true,
      true,
      true,
    ]);
    // Not the accounts list, nor another workspace.
    expect([accounts, other].map(stale)).toEqual([false, false]);
  });

  it('an account’s new status refreshes that workspace’s accounts and posts', () => {
    const client = new QueryClient();
    const accounts = ['workspaces', WID, 'accounts', 'list'];
    const posts = ['workspaces', WID, 'posts', 'list', 'all', null];
    const other = ['workspaces', 'another', 'accounts', 'list'];
    for (const key of [accounts, posts, other]) client.setQueryData(key, {});
    liveHandlers(client)['account.status_changed']?.({
      workspaceId: WID,
      accountId: '01a0d816-827a-74d6-a46e-409c7db31001',
      status: 'reauth_required',
    });
    expect([accounts, posts, other].map((k) => client.getQueryState(k)?.isInvalidated)).toEqual([
      true,
      true,
      false,
    ]);
  });
});

describe('in the app', () => {
  it('connects when signed in; a failure that arrives pops up and counts on the bell at once', async () => {
    mockServer(base());
    renderApp('/w/halden/posts');
    await screen.findByRole('heading', { name: 'Posts' });
    const socket = openSocket();
    act(() => {
      socket.fire('connect');
    });
    await waitFor(() => {
      expect(document.documentElement.dataset.live).toBe('live');
    });
    act(() => {
      socket.fire('notification.new', {
        notification: note(1, { params: { network: 'instagram' }, body: 'Instagram refused it.' }),
        unreadCount: 1,
      });
    });
    expect(await screen.findByText('A post couldn’t go out to Instagram')).toBeInTheDocument();
    const [bell] = screen.getAllByRole('button', { name: /^Notifications/ });
    expect(bell).toHaveAccessibleName('Notifications, 1 unread');
  });

  it('the post’s page follows its delivery live', async () => {
    let current = post('publishing', 'publishing');
    mockServer(base({ [`GET ${BASE}/posts/${POST_ID}`]: () => [200, current] }));
    renderApp(`/w/halden/posts/${POST_ID}`);
    const card = await screen.findByText('Sending to Facebook…');
    expect(card).toBeInTheDocument();
    const socket = openSocket();
    act(() => {
      socket.fire('connect');
    });
    current = post('published', 'published');
    act(() => {
      socket.fire('post.status_changed', {
        workspaceId: WID,
        postId: POST_ID,
        status: 'published',
        targets: [
          {
            id: TARGET,
            status: 'published',
            scheduledAt: null,
            publishedAt: new Date().toISOString(),
          },
        ],
      });
    });
    await waitFor(() => {
      expect(screen.queryByText('Sending to Facebook…')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('Published').length).toBeGreaterThan(0);
  });

  it('Posts carries how many need fixing, and the count follows live changes', async () => {
    let failed = [{ id: '1' }, { id: '2' }];
    mockServer(
      base({
        [`GET ${BASE}/posts`]: ({ url }) => [
          200,
          {
            items: url.searchParams.getAll('status').includes('failed') ? failed : [],
            nextCursor: null,
          },
        ],
      }),
    );
    renderApp('/w/halden/calendar');
    // The sidebar (the phone tab bar is also a Main navigation, hidden by CSS).
    const [nav] = await screen.findAllByRole('navigation', { name: 'Main' });
    if (!nav) throw new Error('No sidebar');
    expect(await within(nav).findByText('2 need fixing')).toBeInTheDocument();
    const socket = openSocket();
    act(() => {
      socket.fire('connect');
    });
    failed = [];
    act(() => {
      socket.fire('post.status_changed', {
        workspaceId: WID,
        postId: POST_ID,
        status: 'published',
        targets: [],
      });
    });
    await waitFor(() => {
      expect(within(nav).queryByText(/need fixing/)).not.toBeInTheDocument();
    });
  });

  it('signing out (leaving the app) closes the socket', async () => {
    mockServer(base());
    const { unmount } = renderApp('/w/halden/posts');
    await screen.findByRole('heading', { name: 'Posts' });
    const socket = openSocket();
    unmount();
    expect(socket.disconnected).toBe(true);
  });
});
