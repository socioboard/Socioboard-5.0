// Account groups (P3-F3): the Accounts page's Groups tab (create, edit, delete, a name clash,
// read-only for others) and the composer's group chips (pick a group's accounts at once).
import type { AccountGroup, Network, SocialAccount } from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const GROUPS = `${BASE}/account-groups`;
type Reply = [number, unknown];

const network = (id: 'facebook_page' | 'instagram') =>
  ({
    id,
    displayName: id === 'facebook_page' ? 'Facebook' : 'Instagram',
    capabilities: { postTypes: ['image'], firstComment: true, altText: true },
    rules: {
      maxChars: 2200,
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
  }) as unknown as Network;

const account = (
  n: number,
  name: string,
  net: 'facebook_page' | 'instagram',
  status: SocialAccount['status'] = 'active',
): SocialAccount => ({
  id: `01a0d816-827a-74d6-a46e-409c7db3600${String(n)}`,
  network: net,
  displayName: name,
  username: null,
  avatarUrl: null,
  status,
  connection: null,
  connectedBy: null,
  createdAt: '2026-09-28T10:00:00.000Z',
});
const COFFEE = account(1, 'Halden Coffee', 'facebook_page');
const GRAM = account(2, 'Halden Gram', 'instagram');
const KIOSK = account(3, 'Halden Kiosk', 'facebook_page', 'reauth_required');

const group = (id: number, name: string, accountIds: string[]): AccountGroup => ({
  id: `01a0d816-827a-74d6-a46e-409c7db3700${String(id)}`,
  name,
  accountIds,
  createdAt: '2026-10-07T10:00:00.000Z',
});

const server = (role: string, handlers: Record<string, Reply | Handler>) =>
  mockServer({
    'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
    'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
    'GET /api/v1/networks': [200, { items: [network('facebook_page'), network('instagram')] }],
    [`GET ${BASE}/accounts`]: [200, { items: [COFFEE, GRAM, KIOSK] }],
    [`GET ${BASE}/connections`]: [200, { items: [] }],
    ...handlers,
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('groups tab', () => {
  it('an admin creates a group from a name and the accounts picked', async () => {
    let groups: AccountGroup[] = [];
    const calls = server('owner', {
      [`GET ${GROUPS}`]: () => [200, { items: groups }],
      [`POST ${GROUPS}`]: ({ body }) => {
        const made = { ...group(1, '', []), ...(body as object) } as AccountGroup;
        groups = [made];
        return [201, made];
      },
    });
    renderApp('/w/halden/accounts?tab=groups');
    const user = userEvent.setup();
    expect(await screen.findByText('No groups yet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'New group' }));

    const dialog = await screen.findByRole('dialog', { name: 'New group' });
    // Both are needed: nothing is sent until they are.
    await user.click(within(dialog).getByRole('button', { name: 'Create group' }));
    expect(within(dialog).getByText('Give the group a name.')).toBeInTheDocument();
    expect(within(dialog).getByText('Pick at least one account.')).toBeInTheDocument();

    await user.type(within(dialog).getByRole('textbox', { name: /Name/ }), 'Halden: all');
    await user.click(within(dialog).getByRole('button', { name: 'Halden Gram, Instagram' }));
    await user.click(within(dialog).getByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(within(dialog).getByRole('button', { name: 'Create group' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(calls.find((c) => c.key === `POST ${GROUPS}`)?.body).toEqual({
      name: 'Halden: all',
      accountIds: [GRAM.id, COFFEE.id],
    });
    const list = await screen.findByRole('list', { name: 'Account groups' });
    expect(within(list).getByText('Halden: all')).toBeInTheDocument();
    expect(within(list).getByText('2 accounts')).toBeInTheDocument();
  });

  it('a name another group has shows on the name field', async () => {
    server('owner', {
      [`GET ${GROUPS}`]: [200, { items: [group(1, 'Launch', [COFFEE.id])] }],
      [`POST ${GROUPS}`]: [
        409,
        { error: { code: 'GROUP_EXISTS', message: 'There is already a group called "Launch"' } },
      ],
    });
    renderApp('/w/halden/accounts?tab=groups');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'New group' }));
    const dialog = await screen.findByRole('dialog', { name: 'New group' });
    await user.type(within(dialog).getByRole('textbox', { name: /Name/ }), 'launch');
    await user.click(within(dialog).getByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(within(dialog).getByRole('button', { name: 'Create group' }));
    expect(
      await within(dialog).findByText('There’s already a group called “launch”.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: /Name/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('edits a group’s name and accounts together, and deletes one after asking', async () => {
    const launch = group(1, 'Launch', [COFFEE.id, KIOSK.id]);
    const calls = server('admin', {
      [`GET ${GROUPS}`]: [200, { items: [launch] }],
      [`PUT ${GROUPS}/${launch.id}`]: ({ body }) => [200, { ...launch, ...(body as object) }],
      [`DELETE ${GROUPS}/${launch.id}`]: [204, undefined],
    });
    renderApp('/w/halden/accounts?tab=groups');
    const user = userEvent.setup();
    // One of its accounts needs reconnecting: the card says so.
    expect(await screen.findByText(/1 can’t post right now/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Launch' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit group' });
    const name = within(dialog).getByRole('textbox', { name: /Name/ });
    expect(name).toHaveValue('Launch');
    await user.clear(name);
    await user.type(name, 'Launch week');
    await user.click(within(dialog).getByRole('button', { name: 'Halden Gram, Instagram' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key === `PUT ${GROUPS}/${launch.id}`)?.body).toEqual({
        name: 'Launch week',
        accountIds: [COFFEE.id, KIOSK.id, GRAM.id],
      });
    });

    await user.click(screen.getByRole('button', { name: 'Delete Launch' }));
    const confirm = await screen.findByRole('dialog', { name: 'Delete “Launch”?' });
    await user.click(within(confirm).getByRole('button', { name: 'Delete group' }));
    await waitFor(() => {
      expect(calls.some((c) => c.key === `DELETE ${GROUPS}/${launch.id}`)).toBe(true);
    });
  });

  it('people who don’t manage accounts see the groups, with nothing to change them', async () => {
    server('editor', { [`GET ${GROUPS}`]: [200, { items: [group(1, 'Launch', [COFFEE.id])] }] });
    renderApp('/w/halden/accounts?tab=groups');
    expect(await screen.findByText('Launch')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New group' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Launch' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete Launch' })).not.toBeInTheDocument();
  });
});

describe('composer group chips', () => {
  const validate: Handler = ({ body }) => {
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
  };

  it('a group picks its accounts that can post; picking it again takes them off', async () => {
    server('owner', {
      [`GET ${GROUPS}`]: [
        200,
        {
          items: [
            group(1, 'Halden all', [COFFEE.id, GRAM.id, KIOSK.id]),
            group(2, 'Kiosk only', [KIOSK.id]),
          ],
        },
      ],
      [`GET ${BASE}/labels`]: [200, { items: [] }],
      [`POST ${BASE}/posts/validate`]: validate,
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    const chips = await screen.findByRole('group', { name: 'Account groups' });
    const all = within(chips).getByRole('button', { name: 'Halden all, 2 accounts' });
    const coffee = screen.getByRole('button', { name: 'Halden Coffee, Facebook' });
    const gram = screen.getByRole('button', { name: 'Halden Gram, Instagram' });

    await user.click(all);
    expect(all).toHaveAttribute('aria-pressed', 'true');
    expect(coffee).toHaveAttribute('aria-pressed', 'true');
    expect(gram).toHaveAttribute('aria-pressed', 'true');
    // The account that needs reconnecting stays out.
    expect(screen.getByRole('button', { name: /^Halden Kiosk, Facebook/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    // Taking one account off un-presses the group; picking the group again adds it back.
    await user.click(gram);
    expect(all).toHaveAttribute('aria-pressed', 'false');
    await user.click(all);
    expect(gram).toHaveAttribute('aria-pressed', 'true');
    await user.click(all);
    expect(coffee).toHaveAttribute('aria-pressed', 'false');
    expect(gram).toHaveAttribute('aria-pressed', 'false');

    // A group none of whose accounts can post does nothing.
    const kiosk = within(chips).getByRole('button', { name: 'Kiosk only, 0 accounts' });
    expect(kiosk).toHaveAttribute('aria-disabled', 'true');
    await user.click(kiosk);
    expect(kiosk).toHaveAttribute('aria-pressed', 'false');
  });
});
