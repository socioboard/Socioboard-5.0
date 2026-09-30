import type { PostDetails, PostTarget } from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const ME = '01a0d816-827a-74d6-a46e-409c7db36f92';
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
const FB_TARGET = '01a0d816-827a-74d6-a46e-409c7db35001';
const IG_TARGET = '01a0d816-827a-74d6-a46e-409c7db35002';
type Reply = [number, unknown];

const fbAccount: PostTarget['account'] = {
  id: '01a0d816-827a-74d6-a46e-409c7db31001',
  network: 'facebook_page',
  displayName: 'Halden Coffee',
  username: null,
  avatarUrl: null,
  status: 'active',
};
const igAccount: PostTarget['account'] = {
  id: '01a0d816-827a-74d6-a46e-409c7db31002',
  network: 'instagram',
  displayName: 'halden.coffee',
  username: 'halden.coffee',
  avatarUrl: null,
  status: 'active',
};

const target = (over: Partial<PostDetails['targets'][number]>): PostDetails['targets'][number] => ({
  id: FB_TARGET,
  account: fbAccount,
  override: null,
  status: 'pending',
  scheduledAt: null,
  externalPostId: null,
  permalink: null,
  attempts: 0,
  lastError: null,
  publishedAt: null,
  history: [],
  ...over,
});

const postWith = (over: Partial<PostDetails>): PostDetails => ({
  id: POST_ID,
  status: 'draft',
  text: 'Autumn menu is here',
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [],
  author: { id: ME, name: 'Priya Raman', avatarUrl: null },
  targets: [target({})],
  createdAt: '2026-09-28T10:00:00.000Z',
  updatedAt: '2026-09-28T10:00:00.000Z',
  recurrence: null,
  ...over,
});

/** A post that went out to Facebook but failed on Instagram (the sign-in expired). */
const partial = postWith({
  status: 'partial',
  targets: [
    target({
      status: 'published',
      permalink: 'https://www.facebook.com/1/posts/2',
      publishedAt: '2026-09-28T10:05:00.000Z',
      attempts: 1,
      history: [
        {
          id: '01a0d816-827a-74d6-a46e-409c7db37001',
          attemptNo: 1,
          startedAt: '2026-09-28T10:04:58.000Z',
          finishedAt: '2026-09-28T10:05:00.000Z',
          outcome: 'published',
          error: null,
        },
      ],
    }),
    target({
      id: IG_TARGET,
      account: igAccount,
      status: 'failed',
      attempts: 2,
      lastError: { kind: 'auth', networkCode: '190', message: 'Error validating access token' },
      history: [
        {
          id: '01a0d816-827a-74d6-a46e-409c7db37003',
          attemptNo: 2,
          startedAt: '2026-09-28T10:06:00.000Z',
          finishedAt: '2026-09-28T10:06:01.000Z',
          outcome: 'failed',
          error: { kind: 'auth', networkCode: '190', message: 'Error validating access token' },
        },
        {
          id: '01a0d816-827a-74d6-a46e-409c7db37002',
          attemptNo: 1,
          startedAt: '2026-09-28T10:05:00.000Z',
          finishedAt: '2026-09-28T10:05:01.000Z',
          outcome: 'will_retry',
          error: { kind: 'retryable', networkCode: null, message: 'Timed out' },
        },
      ],
    }),
  ],
});

const base = (role = 'owner'): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  [`GET ${BASE}/labels`]: [200, { items: [] }],
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('posts list', () => {
  it('lists posts with their status, and each tab asks for its statuses', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/posts`]: ({ url }) => {
        const statuses = url.searchParams.getAll('status');
        const items =
          statuses.length === 0
            ? [partial, postWith({ id: '01a0d816-827a-74d6-a46e-409c7db34002', text: 'A draft' })]
            : [partial];
        return [200, { items, nextCursor: null }];
      },
      [`GET ${BASE}/posts/${POST_ID}`]: [200, partial],
    });
    const { router } = renderApp('/w/halden/posts');
    const table = await screen.findByRole('table', { name: 'Posts: All' });
    expect(await within(table).findByText('A draft')).toBeInTheDocument();
    expect(within(table).getByText('Partly published')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name: 'Failed' }));
    expect(await screen.findByRole('table', { name: 'Posts: Failed' })).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ tab: 'failed' });
    // The Failed tab is the one marked current, not All.
    expect(screen.getByRole('link', { name: 'Failed' })).toHaveAttribute('data-status', 'active');
    expect(screen.getByRole('link', { name: 'All' })).not.toHaveAttribute('data-status', 'active');

    await user.click(await screen.findByText('Autumn menu is here'));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/w/halden/posts/${POST_ID}`);
    });
  });

  it('the Failed tab asks for failed and partly published posts', async () => {
    const seen: string[][] = [];
    mockServer({
      ...base(),
      [`GET ${BASE}/posts`]: ({ url }) => {
        seen.push(url.searchParams.getAll('status'));
        return [200, { items: [], nextCursor: null }];
      },
    });
    renderApp('/w/halden/posts?tab=failed');
    expect(await screen.findByText('Nothing failed')).toBeInTheDocument();
    expect(seen).toContainEqual(['failed', 'partial']);
  });

  it('an empty workspace invites writing the first post', async () => {
    mockServer({ ...base(), [`GET ${BASE}/posts`]: [200, { items: [], nextCursor: null }] });
    renderApp('/w/halden/posts');
    expect(await screen.findByText('No posts yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write a post' })).toHaveAttribute(
      'href',
      '/w/halden/compose',
    );
  });
});

describe('post detail', () => {
  it('shows each account’s delivery: the link where it went out, and why it failed elsewhere', async () => {
    mockServer({ ...base(), [`GET ${BASE}/posts/${POST_ID}`]: [200, partial] });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByRole('link', { name: 'View on Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/1/posts/2',
    );
    expect(
      screen.getByText(/Instagram no longer accepts this account’s sign-in/),
    ).toBeInTheDocument();
    expect(screen.getByText('Instagram said: “Error validating access token”')).toBeInTheDocument();
    // An expired sign-in is fixed by reconnecting the account, from its details.
    expect(screen.getByRole('link', { name: 'Reconnect account' })).toHaveAttribute(
      'href',
      `/w/halden/accounts?account=${igAccount.id}`,
    );
    // The failed delivery's history is open, oldest attempt first.
    const history = screen.getByRole('list', { name: 'Publishing history' });
    const steps = within(history).getAllByRole('listitem');
    expect(steps.map((s) => s.textContent)).toEqual([
      expect.stringContaining('Attempt 1: Didn’t go through; retried automatically'),
      expect.stringContaining('Attempt 2: Failed'),
    ]);
    // A post that went out somewhere is history: no Edit, and no Delete.
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('a permalink that isn’t a web address is not made a link', async () => {
    const odd = {
      ...partial,
      targets: partial.targets.map((x) =>
        x.id === FB_TARGET ? { ...x, permalink: 'javascript:alert(1)' } : x,
      ),
    };
    mockServer({ ...base(), [`GET ${BASE}/posts/${POST_ID}`]: [200, odd] });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText(/Published Sep 28, 2026/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View on Facebook' })).not.toBeInTheDocument();
  });

  it('Retry sends the failed account again and shows it being sent', async () => {
    let retried = false;
    const sending = {
      ...partial,
      status: 'publishing' as const,
      targets: partial.targets.map((x) =>
        x.id === IG_TARGET ? { ...x, status: 'publishing' as const, lastError: null } : x,
      ),
    };
    const calls = mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: () => [200, retried ? sending : partial],
      [`POST ${BASE}/posts/${POST_ID}/targets/${IG_TARGET}/retry`]: () => {
        retried = true;
        return [202, { ...sending, targets: sending.targets.map(({ history: _, ...x }) => x) }];
      },
    });
    renderApp(`/w/halden/posts/${POST_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Publishing to halden.coffee again.')).toBeInTheDocument();
    expect(await screen.findByText('Sending to Instagram…')).toBeInTheDocument();
    expect(calls.some((c) => c.key.endsWith(`/targets/${IG_TARGET}/retry`))).toBe(true);
    // The history already known stays on screen while the details are fetched again.
    expect(screen.getByText('Publishing history (1 attempt)')).toBeInTheDocument();
  });

  it('a refused retry says why in plain words', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [200, partial],
      [`POST ${BASE}/posts/${POST_ID}/targets/${IG_TARGET}/retry`]: [
        422,
        { error: { code: 'POST_HAS_ERRORS', message: 'Fix first' } },
      ],
    });
    renderApp(`/w/halden/posts/${POST_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByText(/The post has problems to fix for this network first/),
    ).toBeInTheDocument();
  });

  it('viewers see how it went, without Retry, Reconnect or Edit', async () => {
    mockServer({ ...base('viewer'), [`GET ${BASE}/posts/${POST_ID}`]: [200, partial] });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByRole('link', { name: 'View on Facebook' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Reconnect account' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();
  });

  it('a content refusal on a post that can still change links to editing it', async () => {
    const failed = postWith({
      status: 'failed',
      targets: [
        target({
          status: 'failed',
          attempts: 1,
          lastError: { kind: 'content', networkCode: '100', message: 'Text too long' },
        }),
      ],
    });
    mockServer({ ...base(), [`GET ${BASE}/posts/${POST_ID}`]: [200, failed] });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText(/Facebook didn’t accept this post/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit post' })).toHaveAttribute(
      'href',
      `/w/halden/compose/${POST_ID}`,
    );
    expect(screen.queryByRole('link', { name: 'Reconnect account' })).not.toBeInTheDocument();
  });

  it('Duplicate copies the post as a new draft and opens it in the composer', async () => {
    const COPY = '01a0d816-827a-74d6-a46e-409c7db34009';
    mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [200, partial],
      [`POST ${BASE}/posts/${POST_ID}/duplicate`]: [201, postWith({ id: COPY })],
      [`GET ${BASE}/posts/${COPY}`]: [200, postWith({ id: COPY })],
      [`GET ${BASE}/accounts`]: [200, { items: [] }],
      'GET /api/v1/networks': [200, { items: [] }],
      [`GET ${BASE}`]: [200, { ...halden.workspace, timezone: 'UTC', requireReviewForAll: false }],
    });
    const { router } = renderApp(`/w/halden/posts/${POST_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'More actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));
    expect(await screen.findByText('Copied as a new draft.')).toBeInTheDocument();
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/w/halden/compose/${COPY}`);
    });
    // A post that went out can't be deleted, only copied.
    expect(screen.queryByRole('menuitem', { name: 'Delete post' })).not.toBeInTheDocument();
  });

  it('a draft can be edited and deleted', async () => {
    const calls = mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [200, postWith({})],
      [`DELETE ${BASE}/posts/${POST_ID}`]: [204, undefined],
      [`GET ${BASE}/posts`]: [200, { items: [], nextCursor: null }],
    });
    const { router } = renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      `/w/halden/compose/${POST_ID}`,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete post' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete this post?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Post deleted.')).toBeInTheDocument();
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/w/halden/posts');
    });
    expect(calls.some((c) => c.key === `DELETE ${BASE}/posts/${POST_ID}`)).toBe(true);
  });

  it('a missing post says so and leads back to the list', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [404, { error: { code: 'POST_NOT_FOUND', message: 'x' } }],
    });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText('This post doesn’t exist or was deleted.')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Back to posts' })[0]).toHaveAttribute(
      'href',
      '/w/halden/posts',
    );
  });
});

describe('failure messages (P1-Q2 drills)', () => {
  const failedWith = (lastError: PostDetails['targets'][number]['lastError']) =>
    postWith({
      status: 'failed',
      targets: [target({ status: 'failed', attempts: 3, lastError })],
    });

  it('a timeout: says Facebook couldn’t be reached, offers Retry, and quotes nobody', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [
        200,
        failedWith({
          kind: 'retryable',
          networkCode: null,
          message: 'Meta did not answer in time',
        }),
      ],
    });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(
      await screen.findByText(/Facebook couldn’t be reached, and the automatic retries ran out/),
    ).toBeInTheDocument();
    // Our own words about the failure aren't presented as Facebook's.
    expect(screen.queryByText(/Facebook said/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Reconnect account' })).not.toBeInTheDocument();
  });

  it('a rate limit: asks to retry in a few minutes, with what Facebook said', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [
        200,
        failedWith({
          kind: 'rate_limited',
          networkCode: '4',
          message: '(#4) Application request limit reached',
        }),
      ],
    });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText(/Facebook asked us to slow down/)).toBeInTheDocument();
    expect(
      screen.getByText('Facebook said: “(#4) Application request limit reached”'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
