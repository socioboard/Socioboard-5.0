import type { PostDetails, PostLabel } from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const ME = '01a0d816-827a-74d6-a46e-409c7db36f92';
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
type Reply = [number, unknown];

const label = (over: Partial<PostLabel>): PostLabel => ({
  id: '01a0d816-827a-74d6-a46e-409c7db38001',
  name: 'Autumn campaign',
  color: 'orange',
  postCount: 1,
  createdAt: '2026-09-28T10:00:00.000Z',
  ...over,
});
const autumn = label({});
const launch = label({
  id: '01a0d816-827a-74d6-a46e-409c7db38002',
  name: 'Launch',
  color: 'blue',
  postCount: 0,
});

const post = (over: Partial<PostDetails> = {}): PostDetails => ({
  id: POST_ID,
  status: 'draft',
  text: 'Autumn menu is here',
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [autumn.id],
  author: { id: ME, name: 'Priya Raman', avatarUrl: null },
  targets: [],
  createdAt: '2026-09-28T10:00:00.000Z',
  updatedAt: '2026-09-28T10:00:00.000Z',
  ...over,
});

const base = (role = 'owner', labels = [autumn, launch]): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  [`GET ${BASE}/labels`]: [200, { items: labels }],
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('labels in the posts list', () => {
  it('rows show their labels, and the filter narrows the list (kept across tabs)', async () => {
    const asked: (string | null)[] = [];
    mockServer({
      ...base(),
      [`GET ${BASE}/posts`]: ({ url }) => {
        asked.push(url.searchParams.get('labelId'));
        return [
          200,
          {
            items: url.searchParams.get('labelId') === launch.id ? [] : [post()],
            nextCursor: null,
          },
        ];
      },
    });
    const { router } = renderApp('/w/halden/posts');
    const table = await screen.findByRole('table', { name: 'Posts: All' });
    const row = await within(table).findByRole('row', { name: /Autumn menu is here/ });
    expect(within(row).getByText('Autumn campaign').closest('[data-color]')).toHaveAttribute(
      'data-color',
      'orange',
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: 'Label' }));
    await user.click(await screen.findByRole('option', { name: 'Launch' }));
    expect(await screen.findByText('No posts with this label')).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ label: launch.id });
    expect(asked).toContain(launch.id);

    await user.click(screen.getByRole('link', { name: 'Drafts' }));
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: 'drafts', label: launch.id });
    });

    await user.click(await screen.findByRole('button', { name: 'Show all labels' }));
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: 'drafts' });
    });
  });

  it('with no labels yet, there’s no filter; people who can’t manage labels get no Manage', async () => {
    mockServer({
      ...base('contributor', []),
      [`GET ${BASE}/posts`]: [200, { items: [post({ labelIds: [] })], nextCursor: null }],
    });
    renderApp('/w/halden/posts');
    expect(await screen.findByText('Autumn menu is here')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Label' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage labels' })).not.toBeInTheDocument();
  });
});

describe('managing labels', () => {
  it('adds, renames, recolours and deletes labels', async () => {
    const calls = mockServer({
      ...base(),
      [`GET ${BASE}/posts`]: [200, { items: [], nextCursor: null }],
      [`POST ${BASE}/labels`]: ({ body }) => [
        201,
        label({ id: '01a0d816-827a-74d6-a46e-409c7db38003', ...(body as object) }),
      ],
      [`PATCH ${BASE}/labels/${autumn.id}`]: ({ body }) => [
        200,
        { ...autumn, ...(body as object) },
      ],
      [`DELETE ${BASE}/labels/${autumn.id}`]: [204, undefined],
    });
    renderApp('/w/halden/posts');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage labels' }));
    const dialog = await screen.findByRole('dialog', { name: 'Labels' });

    await user.type(
      within(dialog).getByRole('textbox', { name: 'New label name' }),
      'Recipes{Enter}',
    );
    await waitFor(() => {
      expect(calls.find((c) => c.key === `POST ${BASE}/labels`)?.body).toEqual({
        name: 'Recipes',
        color: 'orange',
      });
    });

    const name = within(dialog).getByRole('textbox', { name: 'Name of Autumn campaign' });
    await user.clear(name);
    await user.type(name, 'Autumn 2026{Enter}');
    await waitFor(() => {
      expect(calls.find((c) => c.key === `PATCH ${BASE}/labels/${autumn.id}`)?.body).toEqual({
        name: 'Autumn 2026',
      });
    });

    await user.click(
      within(dialog).getByRole('button', { name: 'Colour of Autumn campaign: Orange' }),
    );
    await user.click(await screen.findByRole('menuitemradio', { name: 'Teal' }));
    await waitFor(() => {
      expect(
        calls.filter((c) => c.key === `PATCH ${BASE}/labels/${autumn.id}`).map((c) => c.body),
      ).toContainEqual({ color: 'teal' });
    });

    await user.click(within(dialog).getByRole('button', { name: 'Delete Autumn campaign' }));
    const confirm = await screen.findByRole('dialog', { name: 'Delete “Autumn campaign”?' });
    expect(confirm).toHaveTextContent('It comes off the 1 post that has it.');
    await user.click(within(confirm).getByRole('button', { name: 'Delete label' }));
    await waitFor(() => {
      expect(calls.some((c) => c.key === `DELETE ${BASE}/labels/${autumn.id}`)).toBe(true);
    });
  });

  it('a name already in use is explained', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/posts`]: [200, { items: [], nextCursor: null }],
      [`POST ${BASE}/labels`]: [409, { error: { code: 'LABEL_EXISTS', message: 'x' } }],
    });
    renderApp('/w/halden/posts');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Manage labels' }));
    const dialog = await screen.findByRole('dialog', { name: 'Labels' });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'New label name' }),
      'launch{Enter}',
    );
    expect(await screen.findByText('There’s already a label called “launch”.')).toBeInTheDocument();
  });
});

describe('labels on a post', () => {
  it('can be changed on a published post, saved at once', async () => {
    const sent = post({
      status: 'published',
      targets: [
        {
          id: '01a0d816-827a-74d6-a46e-409c7db35001',
          account: {
            id: '01a0d816-827a-74d6-a46e-409c7db31001',
            network: 'facebook_page',
            displayName: 'Halden Coffee',
            username: null,
            avatarUrl: null,
            status: 'active',
          },
          override: null,
          status: 'published',
          scheduledAt: null,
          externalPostId: '1_2',
          permalink: 'https://www.facebook.com/1/posts/2',
          attempts: 1,
          lastError: null,
          publishedAt: '2026-09-28T10:05:00.000Z',
          history: [],
        },
      ],
    });
    const calls = mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [200, sent],
      [`PATCH ${BASE}/posts/${POST_ID}`]: ({ body }) => [
        200,
        { ...sent, ...(body as object), targets: sent.targets.map(({ history: _, ...x }) => x) },
      ],
      [`GET ${BASE}/posts`]: [200, { items: [], nextCursor: null }],
    });
    renderApp(`/w/halden/posts/${POST_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Labels' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Launch' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key === `PATCH ${BASE}/posts/${POST_ID}`)?.body).toEqual({
        labelIds: [autumn.id, launch.id],
      });
    });
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Remove label Autumn campaign' }));
    await waitFor(() => {
      expect(calls.filter((c) => c.key === `PATCH ${BASE}/posts/${POST_ID}`).at(-1)?.body).toEqual({
        labelIds: [launch.id],
      });
    });
  });

  it('someone who manages labels can create one while picking', async () => {
    const calls = mockServer({
      ...base(),
      [`GET ${BASE}/posts/${POST_ID}`]: [200, post({ labelIds: [] })],
      [`POST ${BASE}/labels`]: ({ body }) => [
        201,
        label({ id: '01a0d816-827a-74d6-a46e-409c7db38009', ...(body as object), postCount: 0 }),
      ],
      [`PATCH ${BASE}/posts/${POST_ID}`]: ({ body }) => [200, { ...post(), ...(body as object) }],
      [`GET ${BASE}/posts`]: [200, { items: [], nextCursor: null }],
    });
    renderApp(`/w/halden/posts/${POST_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Label' }));
    await user.type(await screen.findByRole('textbox', { name: 'Find a label' }), 'Recipes');
    expect(screen.queryByRole('checkbox', { name: 'Launch' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create “Recipes”' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key === `PATCH ${BASE}/posts/${POST_ID}`)?.body).toEqual({
        labelIds: ['01a0d816-827a-74d6-a46e-409c7db38009'],
      });
    });
  });

  it('viewers see the labels but can’t change them', async () => {
    mockServer({ ...base('viewer'), [`GET ${BASE}/posts/${POST_ID}`]: [200, post()] });
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText('Autumn campaign')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Labels' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove label Autumn campaign' }),
    ).not.toBeInTheDocument();
  });
});
