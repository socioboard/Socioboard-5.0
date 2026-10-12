// Tasks (P4-F4): the page (mine or everyone's, to do or done), ticking one done, creating one
// with a due date in the workspace's timezone, what an assignee without task rights can change,
// and a post's tasks on its page.
import type { PostDetails, Task } from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const ME = '01a0d816-827a-74d6-a46e-409c7db36f92';
const MARCO = '01a0d816-827a-74d6-a46e-409c7db36f95';
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
type Reply = [number, unknown];

const task = (over: Partial<Task>): Task => ({
  id: '01a0d816-827a-74d6-a46e-409c7db3a001',
  title: 'Write the caption',
  description: '',
  status: 'open',
  post: { id: POST_ID, excerpt: 'Autumn menu is here', gone: false },
  assignee: { id: ME, name: 'Priya Raman', avatarUrl: null },
  createdBy: { id: MARCO, name: 'Marco Alves', avatarUrl: null },
  dueAt: '2099-10-14T17:00:00.000Z',
  completedAt: null,
  createdAt: '2026-10-12T09:00:00.000Z',
  updatedAt: '2026-10-12T09:00:00.000Z',
  ...over,
});

const members = [
  {
    id: 'm1',
    role: 'owner',
    user: { id: ME, name: 'Priya Raman', email: 'p@x.test', avatarUrl: null },
  },
  {
    id: 'm2',
    role: 'editor',
    user: { id: MARCO, name: 'Marco Alves', email: 'm@x.test', avatarUrl: null },
  },
];

const base = (role = 'owner', extra: Record<string, Reply | Handler> = {}) =>
  ({
    'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
    'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
    [`GET ${BASE}/members`]: [200, { items: members }],
    ...extra,
  }) as Record<string, Reply | Handler>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('tasks page', () => {
  it('shows my tasks to do, and switches to everyone’s and done', async () => {
    const calls = mockServer(
      base('owner', {
        [`GET ${BASE}/tasks`]: ({ url }) => [
          200,
          {
            items: url.searchParams.getAll('status').includes('done')
              ? [
                  task({
                    id: '01a0d816-827a-74d6-a46e-409c7db3a009',
                    title: 'Old one',
                    status: 'done',
                    completedAt: '2026-10-10T09:00:00.000Z',
                  }),
                ]
              : [task({})],
            nextCursor: null,
          },
        ],
      }),
    );
    renderApp('/w/halden/tasks');
    expect(await screen.findByRole('button', { name: 'Write the caption' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Post: Autumn menu is here' })).toBeInTheDocument();
    const first = calls.find((c) => c.key === `GET ${BASE}/tasks`);
    expect(first?.search).toContain('assignee=me');

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(await screen.findByRole('button', { name: 'Old one' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Everyone’s' }));
    await waitFor(() => {
      expect(calls.filter((c) => c.key === `GET ${BASE}/tasks`).at(-1)?.search).not.toContain(
        'assignee',
      );
    });
  });

  it('ticks a task done', async () => {
    const calls = mockServer(
      base('owner', {
        [`GET ${BASE}/tasks`]: [200, { items: [task({})], nextCursor: null }],
        [`PATCH ${BASE}/tasks/${task({}).id}`]: [200, task({ status: 'done' })],
      }),
    );
    renderApp('/w/halden/tasks');
    await userEvent.click(
      await screen.findByRole('checkbox', { name: 'Mark “Write the caption” done' }),
    );
    await waitFor(() => {
      expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({ status: 'done' });
    });
  });

  it('creates a task, due in the workspace’s timezone', async () => {
    const calls = mockServer(
      base('owner', {
        [`GET ${BASE}/tasks`]: [200, { items: [], nextCursor: null }],
        [`POST ${BASE}/tasks`]: [201, task({})],
      }),
    );
    renderApp('/w/halden/tasks');
    await userEvent.click(await screen.findByRole('button', { name: 'New task' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create task' }));
    expect(within(dialog).getByText('Give the task a title.')).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText(/Title/), 'Fix the photo');
    await userEvent.click(within(dialog).getByRole('combobox', { name: 'Assigned to' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Marco Alves' }));
    const date = within(dialog).getByLabelText('Due date');
    await userEvent.type(date, '2099-10-14');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create task' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key === `POST ${BASE}/tasks`)?.body).toEqual({
        title: 'Fix the photo',
        description: '',
        assigneeId: MARCO,
        // 17:00 in Halden's timezone (UTC).
        dueAt: '2099-10-14T17:00:00.000Z',
      });
    });
  });

  it('a viewer given a task can change only its status', async () => {
    const calls = mockServer(
      base('viewer', {
        [`GET ${BASE}/tasks`]: [200, { items: [task({})], nextCursor: null }],
        [`PATCH ${BASE}/tasks/${task({}).id}`]: [200, task({ status: 'in_progress' })],
      }),
    );
    renderApp('/w/halden/tasks');
    expect(screen.queryByRole('button', { name: 'New task' })).toBeNull();
    await userEvent.click(await screen.findByRole('button', { name: 'Write the caption' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText(/Title/)).toBeDisabled();
    expect(within(dialog).queryByRole('button', { name: 'Delete' })).toBeNull();
    await userEvent.click(within(dialog).getByRole('combobox', { name: 'Status' }));
    await userEvent.click(await screen.findByRole('option', { name: 'In progress' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
        status: 'in_progress',
      });
    });
  });
});

describe('a post’s tasks', () => {
  it('are listed on its page, with Add task', async () => {
    const post: PostDetails = {
      id: POST_ID,
      status: 'draft',
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
      review: { needed: false, latest: null },
    };
    mockServer(
      base('owner', {
        [`GET ${BASE}/labels`]: [200, { items: [] }],
        [`GET ${BASE}/posts/${POST_ID}`]: [200, post],
        [`GET ${BASE}/tasks`]: [200, { items: [task({})], nextCursor: null }],
      }),
    );
    renderApp(`/w/halden/posts/${POST_ID}`);
    const section = await screen.findByRole('region', { name: /Tasks/ });
    expect(
      await within(section).findByRole('button', { name: 'Write the caption' }),
    ).toBeInTheDocument();
    // On the post's own page, the task doesn't link back to it.
    expect(within(section).queryByRole('link', { name: /Post:/ })).toBeNull();
    expect(within(section).getByRole('button', { name: 'Add task' })).toBeInTheDocument();
  });
});
