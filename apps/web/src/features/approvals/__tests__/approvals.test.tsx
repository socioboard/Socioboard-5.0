// Approvals (P4-F1, F2, F5): submitting from the composer, the review banners, the review queue and
// its panel, a contributor's submissions, the sidebar count and the "review every post" switch.
import type { Network, PostDetails, ReviewItem, SocialAccount } from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';

afterEach(() => {
  vi.restoreAllMocks();
});

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
const ME = '01a0d816-827a-74d6-a46e-409c7db36f92';
const SAM = { id: '01a0d816-827a-74d6-a46e-409c7db36fa1', name: 'Sam Okafor', avatarUrl: null };
type Reply = [number, unknown];

const FB: SocialAccount = {
  id: '01a0d816-827a-74d6-a46e-409c7db31001',
  network: 'facebook_page',
  displayName: 'Halden Coffee',
  username: null,
  avatarUrl: null,
  status: 'active',
  connection: null,
  connectedBy: null,
  createdAt: '2026-09-28T10:00:00.000Z',
};
const NETWORK = {
  id: 'facebook_page',
  displayName: 'Facebook',
  capabilities: { postTypes: ['text'], firstComment: true, altText: true },
  rules: {
    maxChars: 63206,
    maxHashtags: null,
    maxMentions: null,
    media: { required: false, maxItems: 10 },
    links: 'card',
  },
  preview: {
    truncateAt: 480,
    truncateLines: 5,
    captionPosition: 'above_media',
    mediaLayout: 'grid',
    cropAspectRatio: null,
    linkCard: true,
  },
  logins: [{ provider: 'facebook', supportsAccountSelection: false }],
} as unknown as Network;

const step = (
  action: 'submitted' | 'approved' | 'changes_requested' | 'withdrawn',
  actor = SAM,
  note: string | null = null,
) => ({
  id: `01a0d816-827a-74d6-a46e-409c7db3800${action.length.toString()}`,
  action,
  actor,
  note,
  createdAt: '2026-10-08T09:00:00.000Z',
});

const post = (
  status: PostDetails['status'],
  {
    author = { id: ME, name: 'Priya Raman', avatarUrl: null },
    latest = null as ReturnType<typeof step> | null,
    text = 'Fresh roast',
  } = {},
): PostDetails => ({
  id: POST_ID,
  status,
  text,
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [],
  author,
  recurring: null,
  createdAt: '2026-10-08T08:00:00.000Z',
  updatedAt: '2026-10-08T08:00:00.000Z',
  recurrence: null,
  review: { needed: true, latest },
  targets: [
    {
      id: '01a0d816-827a-74d6-a46e-409c7db35001',
      account: FB,
      override: null,
      status: 'pending',
      scheduledAt: null,
      externalPostId: null,
      permalink: null,
      attempts: 0,
      lastError: null,
      publishedAt: null,
      history: [],
    },
  ],
});

const base = (
  role: string,
  extra: Record<string, Reply | Handler> = {},
  workspace: object = {},
): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  'GET /api/v1/networks': [200, { items: [NETWORK] }],
  [`GET ${BASE}/accounts`]: [200, { items: [FB] }],
  [`GET ${BASE}`]: [
    200,
    {
      ...halden.workspace,
      timezone: 'UTC',
      requireReviewForAll: false,
      createdAt: '2026-09-01T10:00:00.000Z',
      myRole: role,
      ...workspace,
    },
  ],
  [`GET ${BASE}/labels`]: [200, { items: [] }],
  [`POST ${BASE}/posts/validate`]: [
    200,
    { issues: [], targets: [{ accountId: FB.id, network: 'facebook_page', issues: [] }] },
  ],
  ...extra,
});

describe('the composer and review (P4-F1)', () => {
  it('sends a contributor’s draft for review', async () => {
    const calls = mockServer(
      base('contributor', {
        [`POST ${BASE}/posts`]: [201, post('draft')],
        [`POST ${BASE}/posts/${POST_ID}/submit`]: [200, post('in_review')],
        [`GET ${BASE}/posts/${POST_ID}`]: [200, post('in_review', { latest: step('submitted') })],
      }),
    );
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'Fresh roast');
    await user.click(screen.getByRole('button', { name: 'Submit for review' }));
    expect(await screen.findByText(/Sent for review/)).toBeInTheDocument();
    expect(calls.some((c) => c.key === `POST ${BASE}/posts/${POST_ID}/submit`)).toBe(true);
  });

  it('shows a post waiting for review, and lets its author take it back', async () => {
    const calls = mockServer(
      base('contributor', {
        [`GET ${BASE}/posts/${POST_ID}`]: [200, post('in_review', { latest: step('submitted') })],
        [`POST ${BASE}/posts/${POST_ID}/withdraw`]: [200, post('draft')],
      }),
    );
    renderApp(`/w/halden/compose/${POST_ID}`);
    expect(
      await screen.findByText(/Waiting for review. You can still edit it/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit for review' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Take back' }));
    expect(await screen.findByText(/Taken out of review/)).toBeInTheDocument();
    expect(calls.some((c) => c.key === `POST ${BASE}/posts/${POST_ID}/withdraw`)).toBe(true);
  });

  it('shows the reviewer’s note when changes were asked for', async () => {
    mockServer(
      base('contributor', {
        [`GET ${BASE}/posts/${POST_ID}`]: [
          200,
          post('draft', { latest: step('changes_requested', SAM, 'Shorter, please') }),
        ],
      }),
    );
    renderApp(`/w/halden/compose/${POST_ID}`);
    expect(
      await screen.findByText('Sam Okafor asked for changes: “Shorter, please”'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit for review' })).toBeInTheDocument();
  });

  it('offers publishing again once approved', async () => {
    mockServer(
      base('editor', {
        [`GET ${BASE}/posts/${POST_ID}`]: [
          200,
          post('approved', { author: SAM, latest: step('approved', { ...SAM, name: 'Lea' }) }),
        ],
      }),
    );
    renderApp(`/w/halden/compose/${POST_ID}`);
    expect(await screen.findByRole('button', { name: 'Publish now' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit for review' })).not.toBeInTheDocument();
  });
});

const item = (latest = step('submitted')): ReviewItem => ({
  post: post('in_review', { author: SAM, latest }),
  submittedBy: SAM,
  submittedAt: '2026-10-08T09:00:00.000Z',
  latest,
});

describe('the review queue (P4-F2)', () => {
  it('approves a waiting post from its panel', async () => {
    const calls = mockServer(
      base('editor', {
        [`GET ${BASE}/reviews`]: ({ url }) => [
          200,
          {
            items: url.searchParams.get('status') === 'pending' ? [item()] : [],
            nextCursor: null,
          },
        ],
        [`GET ${BASE}/posts/${POST_ID}`]: [
          200,
          post('in_review', { author: SAM, latest: step('submitted') }),
        ],
        [`GET ${BASE}/posts/${POST_ID}/review`]: [
          200,
          { items: [step('submitted', SAM, 'Launch copy')] },
        ],
        [`POST ${BASE}/posts/${POST_ID}/approve`]: [200, post('approved', { author: SAM })],
      }),
    );
    renderApp('/w/halden/approvals');
    const user = userEvent.setup();
    // The sidebar counts what waits.
    expect(await screen.findByText('1')).toBeInTheDocument();
    await user.click(await screen.findByText('Fresh roast'));
    const panel = await screen.findByRole('dialog');
    expect(await within(panel).findByText('Launch copy')).toBeInTheDocument();
    expect(within(panel).getByText('Sam Okafor sent it for review')).toBeInTheDocument();
    await user.click(within(panel).getByRole('button', { name: 'Approve' }));
    expect(await screen.findByText(/^Approved\./)).toBeInTheDocument();
    expect(calls.find((c) => c.key === `POST ${BASE}/posts/${POST_ID}/approve`)?.body).toEqual({});
  });

  it('sends a post back only with a note', async () => {
    const calls = mockServer(
      base('editor', {
        [`GET ${BASE}/reviews`]: [200, { items: [item()], nextCursor: null }],
        [`GET ${BASE}/posts/${POST_ID}`]: [
          200,
          post('in_review', { author: SAM, latest: step('submitted') }),
        ],
        [`GET ${BASE}/posts/${POST_ID}/review`]: [200, { items: [step('submitted')] }],
        [`POST ${BASE}/posts/${POST_ID}/request-changes`]: [200, post('draft', { author: SAM })],
      }),
    );
    renderApp(`/w/halden/approvals?post=${POST_ID}`);
    const user = userEvent.setup();
    const panel = await screen.findByRole('dialog');
    await user.click(await within(panel).findByRole('button', { name: 'Request changes' }));
    const send = within(panel).getByRole('button', { name: 'Send back' });
    expect(send).toBeDisabled();
    await user.type(within(panel).getByRole('textbox', { name: 'What should change?' }), 'Shorter');
    await user.click(send);
    expect(await screen.findByText('Sent back with your note.')).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === `POST ${BASE}/posts/${POST_ID}/request-changes`)?.body,
    ).toEqual({ note: 'Shorter' });
  });

  it('shows contributors their submissions instead of the queue', async () => {
    const calls = mockServer(
      base('contributor', {
        [`GET ${BASE}/posts`]: [200, { items: [post('in_review')], nextCursor: null }],
      }),
    );
    renderApp('/w/halden/approvals');
    expect(await screen.findByRole('heading', { name: 'My submissions' })).toBeInTheDocument();
    expect(await screen.findByText('Fresh roast')).toBeInTheDocument();
    const list = calls.find((c) => c.key === `GET ${BASE}/posts`);
    expect(list?.search).toContain(`authorId=${ME}`);
    expect(calls.some((c) => c.key === `GET ${BASE}/reviews`)).toBe(false);
  });
});

describe('review every post (P4-F5)', () => {
  it('turns review on for every post from General settings', async () => {
    const calls = mockServer(
      base('owner', {
        [`GET ${BASE}/members`]: [200, { items: [] }],
        [`GET ${BASE}/invitations`]: [200, { items: [] }],
        [`PATCH ${BASE}`]: ({ body }) => [
          200,
          {
            ...halden.workspace,
            timezone: 'UTC',
            createdAt: '2026-09-01T10:00:00.000Z',
            myRole: 'owner',
            requireReviewForAll: (body as { requireReviewForAll: boolean }).requireReviewForAll,
          },
        ],
      }),
    );
    renderApp('/w/halden/settings/general');
    const toggle = await screen.findByRole('switch', {
      name: 'Review every post before it goes out',
    });
    expect(toggle).not.toBeChecked();
    await userEvent.setup().click(toggle);
    expect(
      await screen.findByText('Every post now needs approval before it goes out.'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(toggle).toBeChecked();
    });
    expect(calls.find((c) => c.key === `PATCH ${BASE}`)?.body).toEqual({
      requireReviewForAll: true,
    });
  });
});
