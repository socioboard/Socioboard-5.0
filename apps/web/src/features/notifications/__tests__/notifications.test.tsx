// The bell, the notifications page, preferences and failure toasts (P2-F4), against a fake server.
import type { Notification, NotificationPreference } from '@socioboard/contracts';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { bellQuery, notificationKeys, rememberRead } from '../api';
import { relativeTime } from '../wording';

const WID = halden.workspace.id;
type Reply = [number, unknown];

const at = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString();
let seq = 0;
const note = (over: Partial<Notification> = {}): Notification => {
  seq += 1;
  return {
    id: `01a0d816-827a-74d6-a46e-409c7db3${String(9000 + seq).padStart(4, '0')}`,
    type: 'publish_failed',
    workspace: { id: WID, slug: 'halden', name: 'Halden Coffee' },
    title: 'A post couldn’t be published to Facebook',
    body: 'The Page’s access token has expired.',
    params: { network: 'facebook_page', postId: 'p1' },
    link: '/w/halden/posts/01a0d816-827a-74d6-a46e-409c7db34001',
    readAt: null,
    createdAt: at(5),
    ...over,
  };
};

const PREFS: NotificationPreference[] = [
  { type: 'publish_failed', inApp: true, email: true },
  { type: 'post_published', inApp: true, email: false },
  { type: 'account_reauth_required', inApp: true, email: true },
  { type: 'digest', inApp: null, email: false },
];

const base = (bell: Notification[] | (() => Notification[])): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [halden], activeWorkspaceId: WID })],
  'GET /api/v1/notifications': ({ url }) => {
    const items = typeof bell === 'function' ? bell() : bell;
    const unread = url.searchParams.get('unread') === 'true';
    const type = url.searchParams.get('type');
    return [
      200,
      {
        items: items.filter((n) => (!unread || n.readAt === null) && (!type || n.type === type)),
        nextCursor: null,
        unreadCount: items.filter((n) => n.readAt === null).length,
      },
    ];
  },
  'GET /api/v1/me/notification-preferences': [200, { items: PREFS }],
  [`GET /api/v1/workspaces/${WID}/posts`]: [200, { items: [], nextCursor: null }],
  [`GET /api/v1/workspaces/${WID}/labels`]: [200, { items: [] }],
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.title = 'Socioboard';
});

/** The sidebar's bell (the phone menu has its own way in). */
const bellButton = () => {
  const [bell] = screen.getAllByRole('button', { name: /^Notifications/ });
  if (!bell) throw new Error('No bell');
  return bell;
};

describe('the bell', () => {
  it('shows the unread count, and lists unread first with their wording', async () => {
    const read = note({
      type: 'post_published',
      readAt: at(1),
      createdAt: at(1),
      params: { network: 'instagram' },
    });
    const failed = note({ createdAt: at(30) });
    const reconnect = note({
      type: 'account_reauth_required',
      createdAt: at(60 * 3),
      params: { account: 'Halden Coffee', network: 'facebook_page' },
      body: 'Facebook no longer accepts this Page’s sign-in.',
    });
    mockServer(base([read, failed, reconnect]));
    const user = userEvent.setup();
    renderApp('/w/halden/posts');
    await waitFor(() => {
      expect(bellButton()).toHaveAccessibleName('Notifications, 2 unread');
    });
    await user.click(bellButton());
    const panel = await screen.findByRole('dialog');
    const items = within(panel)
      .getAllByRole('button')
      .filter((b) => b.closest('li'));
    // Unread first (newest first among them), then what's read.
    expect(items.map((b) => b.textContent)).toEqual([
      expect.stringContaining('A post couldn’t go out to Facebook'),
      expect.stringContaining('Halden Coffee needs reconnecting'),
      expect.stringContaining('Your post is live on Instagram'),
    ]);
    expect(items[0]).toHaveTextContent('The Page’s access token has expired.');
    expect(items[0]).toHaveTextContent('Halden Coffee');
    expect(within(panel).getByRole('link', { name: 'See all notifications' })).toHaveAttribute(
      'href',
      '/me/notifications',
    );
  });

  it('opening one marks it read and goes to its page', async () => {
    const failed = note();
    const calls = mockServer({
      ...base([failed]),
      [`POST /api/v1/notifications/${failed.id}/read`]: [200, { unreadCount: 0 }],
      [`GET /api/v1/workspaces/${WID}/posts/01a0d816-827a-74d6-a46e-409c7db34001`]: [
        404,
        { error: { code: 'POST_NOT_FOUND', message: 'x' } },
      ],
    });
    const user = userEvent.setup();
    const { history } = renderApp('/w/halden/posts');
    await waitFor(() => {
      expect(bellButton()).toHaveAccessibleName('Notifications, 1 unread');
    });
    await user.click(bellButton());
    await user.click(await screen.findByRole('button', { name: /A post couldn’t go out/ }));
    await waitFor(() => {
      expect(history.location.pathname).toBe(
        '/w/halden/posts/01a0d816-827a-74d6-a46e-409c7db34001',
      );
    });
    expect(calls.some((c) => c.key === `POST /api/v1/notifications/${failed.id}/read`)).toBe(true);
    await waitFor(() => {
      expect(bellButton()).toHaveAccessibleName('Notifications');
    });
  });

  it('“Mark all read” clears the count; with nothing there it says you’re caught up', async () => {
    mockServer({
      ...base([note(), note()]),
      'POST /api/v1/notifications/read-all': [200, { unreadCount: 0 }],
    });
    const user = userEvent.setup();
    renderApp('/w/halden/posts');
    await waitFor(() => {
      expect(bellButton()).toHaveAccessibleName('Notifications, 2 unread');
    });
    await user.click(bellButton());
    await user.click(await screen.findByRole('button', { name: 'Mark all read' }));
    await waitFor(() => {
      expect(bellButton()).toHaveAccessibleName('Notifications');
    });
    expect(screen.queryByRole('button', { name: 'Mark all read' })).not.toBeInTheDocument();
    vi.restoreAllMocks();
    mockServer(base([]));
  });

  it('says so when there is nothing', async () => {
    mockServer(base([]));
    const user = userEvent.setup();
    renderApp('/w/halden/posts');
    await user.click(await screen.findByRole('button', { name: 'Notifications' }));
    expect(await screen.findByText('You’re all caught up')).toBeInTheDocument();
  });

  it('the tab title carries the unread count', async () => {
    document.title = 'Socioboard';
    mockServer(base([note(), note(), note()]));
    const { unmount } = renderApp('/w/halden/posts');
    await waitFor(() => {
      expect(document.title).toBe('(3) Socioboard');
    });
    unmount();
    expect(document.title).toBe('Socioboard');
  });
});

describe('toasts', () => {
  it('a failure that arrives while the app is open pops up once; what was there already doesn’t', async () => {
    let items = [note({ createdAt: at(120) })];
    mockServer(base(() => items));
    const { queryClient } = renderApp('/w/halden/posts');
    await waitFor(() => {
      expect(bellButton()).toHaveAccessibleName('Notifications, 1 unread');
    });
    expect(screen.queryByText('A post couldn’t go out to Facebook')).not.toBeInTheDocument();

    const fresh = note({
      createdAt: at(0),
      body: 'Instagram refused the video.',
      params: { network: 'instagram' },
    });
    const published = note({ type: 'post_published', createdAt: at(0) });
    items = [fresh, published, ...items];
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: bellQuery.queryKey });
    });
    expect(await screen.findByText('A post couldn’t go out to Instagram')).toBeInTheDocument();
    expect(screen.getByText('Instagram refused the video.')).toBeInTheDocument();
    // Good news waits in the bell.
    expect(screen.queryByText('Your post is live on Facebook')).not.toBeInTheDocument();
    // Asking again (with something else new) doesn't toast it twice.
    items = [note({ type: 'post_published', createdAt: at(0) }), ...items];
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: bellQuery.queryKey });
    });
    expect(screen.getAllByText('A post couldn’t go out to Instagram')).toHaveLength(1);
  });
});

describe('the notifications page', () => {
  it('filters by unread and kind, kept in the address', async () => {
    const failed = note();
    const published = note({ type: 'post_published', readAt: at(1) });
    mockServer(base([failed, published]));
    const user = userEvent.setup();
    const { history } = renderApp('/me/notifications');
    const feed = await screen.findByRole('region', { name: 'Notifications' });
    expect(await within(feed).findByText('Your post is live on Facebook')).toBeInTheDocument();
    await user.click(within(feed).getByRole('button', { name: 'Unread (1)' }));
    await waitFor(() => {
      expect(history.location.search).toContain('unread=true');
    });
    await waitFor(() => {
      expect(within(feed).queryByText('Your post is live on Facebook')).not.toBeInTheDocument();
    });
    expect(within(feed).getByText('A post couldn’t go out to Facebook')).toBeInTheDocument();
    await user.click(within(feed).getByRole('button', { name: 'All' }));
    await user.click(within(feed).getByRole('combobox', { name: 'Kind' }));
    await user.click(await screen.findByRole('option', { name: 'Your post went out' }));
    await waitFor(() => {
      expect(
        within(feed).queryByText('A post couldn’t go out to Facebook'),
      ).not.toBeInTheDocument();
    });
    expect(history.location.search).toContain('type=post_published');
  });

  it('preferences: a switch applies at once, goes back if the server refuses, and the digest is email only', async () => {
    let fail = false;
    const calls = mockServer({
      ...base([]),
      'PUT /api/v1/me/notification-preferences': ({ body }) => {
        if (fail)
          return [422, { error: { code: 'NOTIFICATION_CHANNEL_NOT_OFFERED', message: 'No' } }];
        const { items } = body as { items: { type: string; email?: boolean; inApp?: boolean }[] };
        return [
          200,
          { items: PREFS.map((p) => (p.type === items[0]?.type ? { ...p, ...items[0] } : p)) },
        ];
      },
    });
    const user = userEvent.setup();
    renderApp('/me/notifications');
    const digestEmail = await screen.findByRole('switch', { name: 'Weekly summary by email' });
    expect(
      screen.queryByRole('switch', { name: 'Weekly summary in the app' }),
    ).not.toBeInTheDocument();
    expect(digestEmail).not.toBeChecked();
    await user.click(digestEmail);
    expect(digestEmail).toBeChecked();
    await waitFor(() => {
      expect(calls.find((c) => c.key === 'PUT /api/v1/me/notification-preferences')?.body).toEqual({
        items: [{ type: 'digest', email: true }],
      });
    });
    fail = true;
    const publishedApp = screen.getByRole('switch', { name: 'Your post went out in the app' });
    expect(publishedApp).toBeChecked();
    await user.click(publishedApp);
    await waitFor(() => {
      expect(publishedApp).toBeChecked();
    });
  });
});

describe('pieces', () => {
  it('relative times read naturally', () => {
    const now = Date.parse('2026-10-05T10:00:00Z');
    expect(relativeTime('2026-10-05T09:59:40Z', now, 'en')).toBe('now');
    expect(relativeTime('2026-10-05T09:55:00Z', now, 'en')).toBe('5 min. ago');
    expect(relativeTime('2026-10-05T07:00:00Z', now, 'en')).toBe('3 hr. ago');
    expect(relativeTime('2026-10-04T10:00:00Z', now, 'en')).toBe('yesterday');
    expect(relativeTime('2026-09-01T10:00:00Z', now, 'en')).toBe('Sep 1, 2026');
  });

  it('reading updates every cached copy, with the server’s count', async () => {
    const { QueryClient } = await import('@tanstack/react-query');
    const client = new QueryClient();
    const a = note();
    const b = note();
    client.setQueryData(notificationKeys.bell, { items: [a, b], nextCursor: null, unreadCount: 2 });
    client.setQueryData(notificationKeys.list({ unread: false, type: null }), {
      pages: [{ items: [a, b], nextCursor: null, unreadCount: 2 }],
      pageParams: [undefined],
    });
    rememberRead(client, [a.id], 1, '2026-10-05T10:00:00.000Z');
    const bell = client.getQueryData<{ items: Notification[]; unreadCount: number }>(
      notificationKeys.bell,
    );
    expect(bell?.unreadCount).toBe(1);
    expect(bell?.items.map((n) => n.readAt)).toEqual(['2026-10-05T10:00:00.000Z', null]);
    rememberRead(client, null, 0, '2026-10-05T11:00:00.000Z');
    const list = client.getQueryData<{ pages: { items: Notification[]; unreadCount: number }[] }>(
      notificationKeys.list({ unread: false, type: null }),
    );
    // Already read keeps its time; the rest are read now.
    expect(list?.pages[0]?.items.map((n) => n.readAt)).toEqual([
      '2026-10-05T10:00:00.000Z',
      '2026-10-05T11:00:00.000Z',
    ]);
    expect(
      client
        .getQueryData<{ items: Notification[] }>(notificationKeys.bell)
        ?.items.map((n) => n.readAt),
    ).toEqual(['2026-10-05T10:00:00.000Z', '2026-10-05T11:00:00.000Z']);
  });
});
