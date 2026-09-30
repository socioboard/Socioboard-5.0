import type { Network, SocialAccount } from '@socioboard/contracts';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { AUTOSAVE_MS } from '../use-save';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
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

/** The post the server keeps, as the API returns it. */
const post = (body: { text?: string } = {}, status = 'pending') => ({
  id: POST_ID,
  status: status === 'publishing' ? 'publishing' : 'draft',
  text: body.text ?? '',
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [],
  author: { id: '01a0d816-827a-74d6-a46e-409c7db36f92', name: 'Priya Raman', avatarUrl: null },
  createdAt: '2026-09-28T10:00:00.000Z',
  updatedAt: '2026-09-28T10:00:00.000Z',
  targets: [
    {
      id: 't1',
      account: FB,
      override: null,
      status,
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
  role = 'owner',
  workspace: object = { requireReviewForAll: false },
): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  'GET /api/v1/networks': [200, { items: [NETWORK] }],
  [`GET ${BASE}/accounts`]: [200, { items: [FB] }],
  [`GET ${BASE}`]: [200, { ...halden.workspace, timezone: 'UTC', ...workspace }],
  [`POST ${BASE}/posts/validate`]: ({ body }) => {
    const { targets } = body as { targets: { accountId: string }[] };
    return [
      200,
      {
        issues: [],
        targets: targets.map((t) => ({
          accountId: t.accountId,
          network: 'facebook_page',
          issues: [],
        })),
      },
    ];
  },
  [`POST ${BASE}/posts`]: ({ body }) => [201, post(body as { text: string })],
  [`PATCH ${BASE}/posts/${POST_ID}`]: ({ body }) => [200, post(body as { text: string })],
});

const writePost = async (text: string) => {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
  await user.type(screen.getByRole('textbox', { name: 'Text' }), text);
  return user;
};

/** The sidebar's link to Media (the mobile tab bar has one too). */
const mediaLink = () => {
  const [link] = screen.getAllByRole('link', { name: 'Media' });
  if (!link) throw new Error('No link to Media');
  return link;
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('saving', () => {
  it('the first save creates the draft and puts its id in the address; later ones update it', async () => {
    const calls = mockServer(base());
    const { history } = renderApp('/w/halden/compose');
    const user = await writePost('Autumn menu');
    const box = screen.getByRole('textbox', { name: 'Text' });
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText(/^Saved at/)).toBeInTheDocument();
    await waitFor(() => {
      expect(history.location.pathname).toBe(`/w/halden/compose/${POST_ID}`);
    });
    // Same composer: the very same text box survives the address change (nothing remounted).
    expect(screen.getByRole('heading', { name: 'Edit post' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Text' })).toBe(box);

    await user.type(screen.getByRole('textbox', { name: 'Text' }), ' starts Monday');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => {
      expect(calls.filter((c) => c.key === `PATCH ${BASE}/posts/${POST_ID}`)).toHaveLength(1);
    });
    expect(calls.find((c) => c.key === `POST ${BASE}/posts`)?.body).toMatchObject({
      text: 'Autumn menu',
      targets: [{ accountId: FB.id, override: null }],
    });
    expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toMatchObject({
      text: 'Autumn menu starts Monday',
    });
  });

  it('what’s typed while a save is under way stays unsaved, and goes in the next save', async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => (release = r));
    const calls = mockServer({
      ...base(),
      [`POST ${BASE}/posts`]: async ({ body }) => {
        await gate;
        return [201, post(body as { text: string })];
      },
    });
    renderApp('/w/halden/compose');
    const user = await writePost('First');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('Saving…')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Text' }), ' and more');
    release();
    expect(await screen.findByText('Unsaved changes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toMatchObject({
        text: 'First and more',
      });
    });
  });

  it('autosaves within 10 seconds of the first change, even while typing goes on', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const calls = mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    const box = screen.getByRole('textbox', { name: 'Text' });
    // Type steadily for longer than the autosave interval.
    for (let i = 0; i < 12; i++) {
      await user.type(box, 'a');
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    await waitFor(() => {
      expect(calls.some((c) => c.key === `POST ${BASE}/posts`)).toBe(true);
    });
    expect(AUTOSAVE_MS).toBe(10_000);
  });

  it('a failed save says why and offers to try again', async () => {
    let fail = true;
    mockServer({
      ...base(),
      [`POST ${BASE}/posts`]: ({ body }) =>
        fail
          ? [500, { error: { code: 'INTERNAL_ERROR', message: 'x', requestId: 'req-1' } }]
          : [201, post(body as { text: string })],
    });
    renderApp('/w/halden/compose');
    const user = await writePost('Hello');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText(/Didn’t save\./)).toBeInTheDocument();
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Try saving again' }));
    expect(await screen.findByText(/^Saved at/)).toBeInTheDocument();
  });

  it('leaving with unsaved changes asks first', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/media/folders`]: [200, { items: [] }],
      [`GET ${BASE}/media`]: [200, { items: [], nextCursor: null }],
    });
    const { history } = renderApp('/w/halden/compose');
    const user = await writePost('Half a thought');
    await user.click(mediaLink());
    const dialog = await screen.findByRole('dialog', { name: 'Leave without saving?' });
    await user.click(within(dialog).getByRole('button', { name: 'Stay' }));
    expect(history.location.pathname).toBe('/w/halden/compose');
    await user.click(mediaLink());
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Leave without saving?' })).getByRole(
        'button',
        { name: 'Leave' },
      ),
    );
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/halden/media');
    });
  });
});

describe('publishing', () => {
  it('saves, publishes with an Idempotency-Key, and then shows the post as sent', async () => {
    const calls = mockServer({
      ...base(),
      [`POST ${BASE}/posts/${POST_ID}/publish-now`]: [202, post({ text: 'Go' }, 'publishing')],
    });
    renderApp('/w/halden/compose');
    const user = await writePost('Go');
    await user.click(screen.getByRole('button', { name: 'Publish now' }));
    expect(await screen.findByText('Publishing to 1 account.')).toBeInTheDocument();
    const publish = calls.find((c) => c.key.endsWith('/publish-now'));
    expect(publish?.headers['idempotency-key']).toMatch(/^[0-9a-f-]{36}$/);
    expect(calls.findIndex((c) => c.key === `POST ${BASE}/posts`)).toBeLessThan(
      calls.findIndex((c) => c.key.endsWith('/publish-now')),
    );
    expect(await screen.findByText(/being published or was published/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publish now' })).not.toBeInTheDocument();
  });

  it('after a dropped connection, trying again reuses the key, so it can’t post twice', async () => {
    let drop = true;
    const calls = mockServer({
      ...base(),
      [`POST ${BASE}/posts/${POST_ID}/publish-now`]: () => {
        if (drop) {
          drop = false;
          throw new TypeError('Failed to fetch');
        }
        return [202, post({ text: 'Go' }, 'publishing')];
      },
    });
    renderApp('/w/halden/compose');
    const user = await writePost('Go');
    await user.click(screen.getByRole('button', { name: 'Publish now' }));
    expect(await screen.findByText(/Can’t reach Socioboard/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish now' }));
    expect(await screen.findByText('Publishing to 1 account.')).toBeInTheDocument();
    const keys = calls
      .filter((c) => c.key.endsWith('/publish-now'))
      .map((c) => c.headers['idempotency-key']);
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  });

  it('the server’s refusal is explained', async () => {
    mockServer({
      ...base(),
      [`POST ${BASE}/posts/${POST_ID}/publish-now`]: [
        422,
        { error: { code: 'POST_HAS_ERRORS', message: 'x' } },
      ],
    });
    renderApp('/w/halden/compose');
    const user = await writePost('Go');
    await user.click(screen.getByRole('button', { name: 'Publish now' }));
    expect(
      await screen.findByText('Some networks have problems to fix first; they’re listed above.'),
    ).toBeInTheDocument();
  });

  it('is disabled while a network has a problem, and says why', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    await screen.findByRole('button', { name: 'Halden Coffee, Facebook' });
    expect(screen.getByRole('button', { name: 'Publish now' })).toBeDisabled();
    expect(screen.getByText('Choose accounts to publish to.')).toBeInTheDocument();
  });

  it('contributors save drafts; a workspace that reviews every post offers no Publish', async () => {
    mockServer(base('contributor'));
    const view = renderApp('/w/halden/compose');
    await writePost('Mine');
    expect(screen.queryByRole('button', { name: 'Publish now' })).not.toBeInTheDocument();
    expect(screen.getByText('Someone who can publish sends this out.')).toBeInTheDocument();
    view.unmount();

    mockServer(base('owner', { requireReviewForAll: true }));
    renderApp('/w/halden/compose');
    await writePost('Reviewed');
    expect(screen.queryByRole('button', { name: 'Publish now' })).not.toBeInTheDocument();
    expect(await screen.findByText(/reviews every post before it goes out/)).toBeInTheDocument();
  });
});

describe('the sidebar', () => {
  it('has "New post" for people who can write, not for viewers', async () => {
    mockServer(base());
    const view = renderApp('/w/halden/compose');
    await screen.findByRole('button', { name: 'Halden Coffee, Facebook' });
    expect(screen.getAllByRole('link', { name: 'New post' })[0]).toHaveAttribute(
      'href',
      '/w/halden/compose',
    );
    view.unmount();
    mockServer({ ...base('viewer'), 'GET /api/v1/workspaces': [200, { items: [] }] });
    renderApp('/w/halden/calendar');
    await screen.findByRole('heading', { name: 'Calendar' });
    expect(screen.queryByRole('link', { name: 'New post' })).not.toBeInTheDocument();
  });
});
