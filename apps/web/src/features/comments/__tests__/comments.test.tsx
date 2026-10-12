// Comments on a post's page (P4-F3): the thread, writing with an @mention, the comment a
// notification pointed at, an error that keeps what was typed, and live refresh.
import type { PostComment, PostDetails } from '@socioboard/contracts';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { liveHandlers } from '../../live';
import { commentKeys } from '../api';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const ME = '01a0d816-827a-74d6-a46e-409c7db36f92';
const MARCO = '01a0d816-827a-74d6-a46e-409c7db36f95';
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
type Reply = [number, unknown];

const post: PostDetails = {
  id: POST_ID,
  status: 'in_review',
  text: 'Autumn menu is here',
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [],
  author: { id: ME, name: 'Priya Raman', avatarUrl: null },
  targets: [],
  createdAt: '2026-10-12T09:00:00.000Z',
  updatedAt: '2026-10-12T09:00:00.000Z',
  recurring: null,
  recurrence: null,
  review: { needed: true, latest: null },
};

const comment = (over: Partial<PostComment>): PostComment => ({
  id: '01a0d816-827a-74d6-a46e-409c7db38001',
  postId: POST_ID,
  parentId: null,
  author: { id: MARCO, name: 'Marco Alves', avatarUrl: null },
  body: 'Can we use the autumn photo?',
  mentions: [],
  createdAt: '2026-10-12T09:05:00.000Z',
  editedAt: null,
  deletedAt: null,
  ...over,
});

const people = [
  { id: ME, name: 'Priya Raman', avatarUrl: null },
  { id: MARCO, name: 'Marco Alves', avatarUrl: null },
];

const base = (extra: Record<string, Reply | Handler> = {}): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [
    200,
    meWith({ memberships: [{ ...halden, role: 'editor' }], activeWorkspaceId: WID }),
  ],
  [`GET ${BASE}/labels`]: [200, { items: [] }],
  [`GET ${BASE}/posts/${POST_ID}`]: [200, post],
  [`GET ${BASE}/posts/${POST_ID}/mentionable`]: [200, { items: people }],
  ...extra,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('comments on a post', () => {
  it('shows the thread and sends a comment with an @mention', async () => {
    let thread = [comment({})];
    const calls = mockServer(
      base({
        [`GET ${BASE}/posts/${POST_ID}/comments`]: () => [200, { items: thread }],
        [`POST ${BASE}/posts/${POST_ID}/comments`]: ({ body }) => {
          const sent = body as { body: string; mentionIds: string[] };
          const made = comment({
            id: '01a0d816-827a-74d6-a46e-409c7db38002',
            author: people[0] ?? null,
            body: sent.body,
            mentions: [{ id: MARCO, name: 'Marco Alves' }],
          });
          thread = [...thread, made];
          return [201, made];
        },
      }),
    );
    renderApp(`/w/halden/posts/${POST_ID}`);
    const section = await screen.findByRole('region', { name: /Comments/ });
    expect(await within(section).findByText('Can we use the autumn photo?')).toBeInTheDocument();

    const box = within(section).getByRole('combobox', { name: /Write a comment/ });
    await userEvent.type(box, 'Yes @mar');
    await userEvent.click(await screen.findByRole('option', { name: /Marco Alves/ }));
    await userEvent.type(box, 'done');
    await userEvent.click(within(section).getByRole('button', { name: 'Comment' }));

    await waitFor(() => {
      expect(calls.find((c) => c.key === `POST ${BASE}/posts/${POST_ID}/comments`)?.body).toEqual({
        body: 'Yes @Marco Alves done',
        mentionIds: [MARCO],
      });
    });
    expect(await within(section).findByText('@Marco Alves')).toBeInTheDocument();
    expect(box).toHaveValue('');
  });

  it('a refused comment says why and keeps what was typed', async () => {
    mockServer(
      base({
        [`GET ${BASE}/posts/${POST_ID}/comments`]: [200, { items: [] }],
        [`POST ${BASE}/posts/${POST_ID}/comments`]: [
          422,
          { error: { code: 'MENTION_NOT_ALLOWED', message: 'x' } },
        ],
      }),
    );
    renderApp(`/w/halden/posts/${POST_ID}`);
    const box = await screen.findByRole('combobox', { name: /Write a comment/ });
    expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    await userEvent.type(box, 'Hello');
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }));
    expect(
      await screen.findByText('Only members who can see this post can be mentioned.'),
    ).toBeInTheDocument();
    expect(box).toHaveValue('Hello');
  });

  it('marks the comment a notification pointed at', async () => {
    const target = comment({ id: '01a0d816-827a-74d6-a46e-409c7db38009', body: 'Look here' });
    mockServer(
      base({ [`GET ${BASE}/posts/${POST_ID}/comments`]: [200, { items: [comment({}), target] }] }),
    );
    renderApp(`/w/halden/posts/${POST_ID}?comment=${target.id}`);
    const marked = (await screen.findByText('Look here')).closest('[data-highlighted]');
    expect(marked).not.toBeNull();
    expect(screen.getByText('Can we use the autumn photo?').closest('[data-highlighted]')).toBe(
      null,
    );
  });

  it('a live change rereads only that post’s thread', () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries');
    liveHandlers(client)['post.comments_changed']?.({ workspaceId: WID, postId: POST_ID });
    expect(spy).toHaveBeenCalledWith({ queryKey: commentKeys.thread(WID, POST_ID) });
  });
});
