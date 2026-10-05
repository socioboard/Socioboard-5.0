import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp } from '../../../testing/render';

afterEach(() => {
  vi.restoreAllMocks();
});

const WID = halden.workspace.id;
const options = { socialProviders: [], emailVerificationRequired: true };
const roastery = {
  workspace: {
    id: '01a0d816-827a-74d6-a46e-409c7db36f94',
    name: 'Roastery Social',
    slug: 'roastery',
    logoUrl: null,
    timezone: 'UTC',
  },
  role: 'owner',
};
const detail = {
  ...halden.workspace,
  timezone: 'Europe/Lisbon',
  requireReviewForAll: false,
  createdAt: '2026-09-01T10:00:00.000Z',
  myRole: 'owner',
};
const user = (id: string, name: string, email: string) => ({ id, name, email, avatarUrl: null });
const ME_ID = '01a0d816-827a-74d6-a46e-409c7db36f92';
const OWNER = {
  id: 'm-owner',
  user: user(ME_ID, 'Priya Raman', 'priya@halden.test'),
  role: 'owner',
  joinedAt: '2026-09-01T10:00:00.000Z',
};
const SAM = {
  id: 'm-sam',
  user: user('01a0d816-827a-74d6-a46e-409c7db36fa1', 'Sam Okafor', 'sam@halden.test'),
  role: 'editor',
  joinedAt: '2026-09-02T10:00:00.000Z',
};
const LEA = {
  id: 'm-lea',
  user: user('01a0d816-827a-74d6-a46e-409c7db36fa2', 'Léa Moreau', 'lea@halden.test'),
  role: 'admin',
  joinedAt: '2026-09-03T10:00:00.000Z',
};
const members = [OWNER, SAM, LEA];
const base = (role = 'owner', extra: object = {}) => ({
  'GET /api/v1/auth/options': [200, options] as [number, unknown],
  'GET /api/v1/me': [
    200,
    meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID, ...extra }),
  ] as [number, unknown],
  [`GET /api/v1/workspaces/${WID}`]: [200, { ...detail, myRole: role }] as [number, unknown],
  [`GET /api/v1/workspaces/${WID}/members`]: [200, { items: members }] as [number, unknown],
  [`GET /api/v1/workspaces/${WID}/invitations`]: [200, { items: [] }] as [number, unknown],
});

describe('settings: where it opens', () => {
  it('opens General for those who can change it, Members for everyone else', async () => {
    mockServer(base('owner'));
    const first = renderApp('/w/halden/settings');
    await waitFor(() => {
      expect(first.history.location.pathname).toBe('/w/halden/settings/general');
    });
    first.unmount();

    mockServer(base('viewer'));
    const second = renderApp('/w/halden/settings/general');
    await waitFor(() => {
      expect(second.history.location.pathname).toBe('/w/halden/settings/members');
    });
    expect(screen.queryByRole('link', { name: 'General' })).not.toBeInTheDocument();
  });
});

describe('settings: general', () => {
  it('saves only what changed, and moves to the new address when the URL changes', async () => {
    let slug = 'halden';
    const calls = mockServer({
      ...base(),
      // The server's answer follows the change, as the real one does.
      'GET /api/v1/me': () => [
        200,
        meWith({
          memberships: [{ ...halden, workspace: { ...halden.workspace, slug } }],
          activeWorkspaceId: WID,
        }),
      ],
      [`PATCH /api/v1/workspaces/${WID}`]: ({ body }) => {
        slug = (body as { slug?: string }).slug ?? slug;
        return [200, { ...detail, ...(body as object) }];
      },
    });
    const { history } = renderApp('/w/halden/settings/general');
    const u = userEvent.setup();
    const name = await screen.findByLabelText('Name');
    expect(name).toHaveValue('Halden Coffee');
    const save = screen.getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();

    await u.clear(screen.getByLabelText('URL'));
    await u.type(screen.getByLabelText('URL'), 'Halden-Roasters');
    await u.click(save);
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/halden-roasters/settings/general');
    });
    expect(calls.find((c) => c.key === `PATCH /api/v1/workspaces/${WID}`)?.body).toEqual({
      slug: 'halden-roasters',
    });
  });

  it('explains a taken URL under the field', async () => {
    mockServer({
      ...base(),
      [`PATCH /api/v1/workspaces/${WID}`]: [
        409,
        { error: { code: 'SLUG_TAKEN', message: 'Taken' } },
      ],
    });
    renderApp('/w/halden/settings/general');
    const u = userEvent.setup();
    await u.clear(await screen.findByLabelText('URL'));
    await u.type(screen.getByLabelText('URL'), 'roastery');
    await u.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('That workspace address is already taken.')).toBeInTheDocument();
    expect(screen.getByLabelText('URL')).toHaveAttribute('aria-invalid', 'true');
  });

  it('deletes only after the name is typed, then opens another workspace', async () => {
    const calls = mockServer({
      ...base('owner', { memberships: [halden, roastery] }),
      [`DELETE /api/v1/workspaces/${WID}`]: [204],
      'POST /api/v1/me/active-workspace': [204],
    });
    const { history } = renderApp('/w/halden/settings/general');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Delete…' }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Delete workspace' });
    expect(confirm).toBeDisabled();
    await u.type(within(dialog).getByLabelText('Type Halden Coffee to confirm'), 'Halden Coffee');
    await u.click(confirm);
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/roastery/calendar');
    });
    expect(calls.find((c) => c.key === `DELETE /api/v1/workspaces/${WID}`)?.body).toEqual({
      confirmName: 'Halden Coffee',
    });
  });

  it('shows the danger zone to the owner only', async () => {
    mockServer(base('admin'));
    renderApp('/w/halden/settings/general');
    await screen.findByLabelText('Name');
    expect(screen.queryByText('Danger zone')).not.toBeInTheDocument();
  });
});

describe('settings: members', () => {
  it('lets admins change roles, but not the owner’s or their own', async () => {
    const calls = mockServer({
      ...base('admin', {}),
      'GET /api/v1/me': [
        200,
        meWith({ memberships: [{ ...halden, role: 'admin' }], activeWorkspaceId: WID }),
      ],
      [`GET /api/v1/workspaces/${WID}/members`]: [
        200,
        {
          items: [OWNER, SAM, { ...LEA, user: { ...LEA.user, id: ME_ID } }],
        },
      ],
      [`PATCH /api/v1/workspaces/${WID}/members/m-sam`]: ({ body }) => [
        200,
        { ...SAM, ...(body as object) },
      ],
    });
    renderApp('/w/halden/settings/members');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('combobox', { name: 'Role of Sam Okafor' }));
    await u.click(await screen.findByRole('option', { name: 'Viewer' }));
    expect(await screen.findByText('Sam Okafor is now Viewer.')).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === `PATCH /api/v1/workspaces/${WID}/members/m-sam`)?.body,
    ).toEqual({ role: 'viewer' });
    expect(screen.queryByRole('combobox', { name: 'Role of Priya Raman' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Role of Léa Moreau' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave' })).toBeInTheDocument();
  });

  it('shows viewers the list without any way to change it', async () => {
    mockServer(base('viewer'));
    renderApp('/w/halden/settings/members');
    expect(await screen.findByText('Sam Okafor')).toBeInTheDocument(); // one match: avatars are decorative
    expect(screen.queryByRole('button', { name: 'Invite people' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Role of/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('invites with a role, and explains when the person is already here', async () => {
    let attempt = 0;
    const calls = mockServer({
      ...base(),
      [`POST /api/v1/workspaces/${WID}/invitations`]: ({ body }) => {
        attempt += 1;
        return attempt === 1
          ? [409, { error: { code: 'ALREADY_MEMBER', message: 'Member' } }]
          : [
              201,
              {
                id: 'inv-1',
                ...(body as object),
                status: 'pending',
                invitedBy: OWNER.user,
                expiresAt: '2026-10-05T10:00:00.000Z',
                createdAt: '2026-09-28T10:00:00.000Z',
              },
            ];
      },
    });
    renderApp('/w/halden/settings/members');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Invite people' }));
    const dialog = await screen.findByRole('dialog');
    await u.type(within(dialog).getByLabelText('Email'), 'sam@halden.test');
    expect(within(dialog).getByRole('radio', { name: 'Editor' })).toBeChecked();
    expect(within(dialog).getByRole('radio', { name: 'Admin' })).toHaveAccessibleDescription(
      /Manages members/,
    );
    await u.click(within(dialog).getByRole('radio', { name: 'Admin' }));
    await u.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('already a member');

    await u.clear(within(dialog).getByLabelText('Email'));
    await u.type(within(dialog).getByLabelText('Email'), 'new@halden.test');
    await u.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(
      calls.filter((c) => c.key === `POST /api/v1/workspaces/${WID}/invitations`).at(-1)?.body,
    ).toEqual({
      email: 'new@halden.test',
      role: 'admin',
    });
  });

  it('revokes a pending invitation', async () => {
    const invitation = {
      id: 'inv-9',
      email: 'kai@halden.test',
      role: 'contributor',
      status: 'pending',
      invitedBy: OWNER.user,
      expiresAt: '2026-10-05T10:00:00.000Z',
      createdAt: '2026-09-28T10:00:00.000Z',
    };
    const calls = mockServer({
      ...base(),
      [`GET /api/v1/workspaces/${WID}/invitations`]: [200, { items: [invitation] }],
      [`DELETE /api/v1/workspaces/${WID}/invitations/inv-9`]: [204],
    });
    renderApp('/w/halden/settings/members');
    const u = userEvent.setup();
    expect(await screen.findByText('kai@halden.test')).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: 'Revoke' }));
    await u.click(await screen.findByRole('button', { name: 'Revoke invitation' }));
    await waitFor(() => {
      expect(screen.queryByText('kai@halden.test')).not.toBeInTheDocument();
    });
    expect(calls.some((c) => c.key === `DELETE /api/v1/workspaces/${WID}/invitations/inv-9`)).toBe(
      true,
    );
  });
});
