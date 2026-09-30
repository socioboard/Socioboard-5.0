import type { Network, SocialAccount, SocialConnection } from '@socioboard/contracts';
import { act, screen, waitFor, within } from '@testing-library/react';
import { focusManager } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { rememberConnectReturn, takeConnectReturn } from '../../../lib/return-to';
import { halden, meWith, mockServer, renderApp } from '../../../testing/render';
import { browser, groupAccounts } from '../api';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const options = { socialProviders: [], emailVerificationRequired: true };
type Reply = [number, unknown];

const rules = {
  maxChars: 2200,
  media: {
    kinds: ['image', 'video'],
    maxItems: 10,
    maxImageBytes: 8,
    maxVideoBytes: 8,
    maxVideoSec: 60,
    imageAspectRatio: null,
    videoAspectRatio: null,
  },
  links: 'card',
};
const network = (id: 'facebook_page' | 'instagram', logins: Network['logins']) =>
  ({
    id,
    displayName: id === 'facebook_page' ? 'Facebook' : 'Instagram',
    capabilities: { postTypes: ['text', 'image'], firstComment: true, altText: true },
    rules,
    preview: { truncateAt: 480, cropAspectRatio: null },
    logins,
  }) as unknown as Network;
const NETWORKS = [
  network('facebook_page', [{ provider: 'facebook', supportsAccountSelection: false }]),
  network('instagram', [
    { provider: 'facebook', supportsAccountSelection: false },
    { provider: 'instagram', supportsAccountSelection: true },
  ]),
];

const priya = {
  id: '01a0d816-827a-74d6-a46e-409c7db30001',
  provider: 'facebook' as const,
  displayName: 'Priya Raman',
  avatarUrl: null,
  status: 'active' as const,
};
const brand = { ...priya, id: '01a0d816-827a-74d6-a46e-409c7db30002', displayName: 'Brand Admin' };

const account = (overrides: Partial<SocialAccount> = {}): SocialAccount => ({
  id: '01a0d816-827a-74d6-a46e-409c7db31001',
  network: 'facebook_page',
  displayName: 'Halden Coffee',
  username: null,
  avatarUrl: null,
  status: 'active',
  connection: priya,
  connectedBy: { id: 'u1', name: 'Priya Raman' },
  createdAt: '2026-09-28T10:00:00.000Z',
  ...overrides,
});
const coffee = account();
const kiosk = account({
  id: '01a0d816-827a-74d6-a46e-409c7db31002',
  displayName: 'Halden Kiosk',
  status: 'reauth_required',
  connection: brand,
});
const gram = account({
  id: '01a0d816-827a-74d6-a46e-409c7db31003',
  network: 'instagram',
  username: 'halden.coffee',
});

const connection = (c: typeof priya, accounts: SocialAccount[]): SocialConnection => ({
  ...c,
  connectedBy: { id: 'u1', name: 'Priya Raman' },
  createdAt: '2026-09-28T10:00:00.000Z',
  lastCheckedAt: null,
  accounts,
});

const signedIn = (role = 'owner'): Record<string, Reply> => ({
  'GET /api/v1/auth/options': [200, options],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  'GET /api/v1/networks': [200, { items: NETWORKS }],
  [`GET ${BASE}/accounts`]: [200, { items: [coffee, kiosk, gram] }],
});
const asAdmin = (connections: SocialConnection[] = []): Record<string, Reply> => ({
  ...signedIn(),
  [`GET ${BASE}/connections`]: [200, { items: connections }],
});

let assign: ReturnType<typeof vi.fn<(url: string) => void>>;
beforeEach(() => {
  assign = vi.fn<(url: string) => void>();
  vi.spyOn(browser, 'assign').mockImplementation(assign);
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('groupAccounts', () => {
  it('groups by network, then by the login each account comes through', () => {
    const sections = groupAccounts([gram, kiosk, coffee], NETWORKS);
    expect(sections.map((s) => s.network)).toEqual(['facebook_page', 'instagram']);
    expect(sections[0]?.logins.map((g) => [g.connection?.displayName, g.accounts.length])).toEqual([
      ['Brand Admin', 1],
      ['Priya Raman', 1],
    ]);
    expect(sections[0]?.count).toBe(2);
  });

  it('puts a login nothing was added from under the first network it reaches', () => {
    const empty = { ...priya, id: '01a0d816-827a-74d6-a46e-409c7db30003', displayName: 'New' };
    const sections = groupAccounts([gram], NETWORKS, [
      connection(priya, [gram]),
      connection(empty, []),
    ]);
    const facebook = sections.find((s) => s.network === 'facebook_page');
    expect(facebook?.logins.map((g) => [g.connection?.displayName, g.accounts])).toEqual([
      ['New', []],
    ]);
  });
});

describe('accounts page', () => {
  it('shows accounts by network and login, with what needs attention', async () => {
    mockServer(asAdmin([connection(priya, [coffee, gram]), connection(brand, [kiosk])]));
    renderApp('/w/halden/accounts');
    const facebook = await screen.findByRole('region', { name: 'Facebook' });
    expect(within(facebook).getByText('2 accounts')).toBeInTheDocument();
    expect(within(facebook).getByText('Brand Admin')).toBeInTheDocument();
    const stale = within(facebook).getByRole('button', {
      name: 'Details for Halden Kiosk on Facebook',
    });
    expect(within(stale).getByText('Needs reconnecting')).toBeInTheDocument();
    const instagram = screen.getByRole('region', { name: 'Instagram' });
    expect(within(instagram).getByText('@halden.coffee')).toBeInTheDocument();
  });

  it('viewers see the accounts but no connecting or managing (and logins aren’t asked for)', async () => {
    const calls = mockServer(signedIn('viewer'));
    renderApp('/w/halden/accounts');
    await screen.findByRole('region', { name: 'Facebook' });
    expect(calls.map((c) => c.key)).not.toContain(`GET ${BASE}/connections`);
    expect(screen.queryByRole('button', { name: /Connect/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Manage/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reconnect' })).not.toBeInTheDocument();
  });

  it('a login nothing was added from yet links straight to adding its accounts', async () => {
    const fresh = {
      ...priya,
      id: '01a0d816-827a-74d6-a46e-409c7db30009',
      displayName: 'New Login',
    };
    mockServer(asAdmin([connection(priya, [coffee, gram]), connection(fresh, [])]));
    renderApp('/w/halden/accounts');
    const facebook = await screen.findByRole('region', { name: 'Facebook' });
    expect(within(facebook).getByText('Nothing added from this login yet.')).toBeInTheDocument();
    expect(within(facebook).getByRole('link', { name: 'Add accounts' })).toHaveAttribute(
      'href',
      `/w/halden/accounts/connect/facebook?connection=${fresh.id}`,
    );
  });

  it('with nothing connected, invites connecting the first account', async () => {
    mockServer({ ...asAdmin(), [`GET ${BASE}/accounts`]: [200, { items: [] }] });
    renderApp('/w/halden/accounts');
    expect(await screen.findByText('No accounts yet')).toBeInTheDocument();
  });
});

describe('connecting', () => {
  it('another Facebook account first explains how to switch accounts, then asks Facebook for its picker', async () => {
    const calls = mockServer({
      ...asAdmin([connection(priya, [coffee])]),
      [`POST ${BASE}/accounts/connect/facebook`]: [200, { authUrl: 'https://facebook.test/auth' }],
    });
    renderApp('/w/halden/accounts');
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('button', { name: 'Connect another Facebook account' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Adding another Facebook account?' });
    expect(dialog).toHaveTextContent('sign out of Facebook first');
    // A way back left over from onboarding is forgotten: this connect ends on the Accounts page.
    rememberConnectReturn(WID, '/w/halden/welcome?step=post');
    await user.click(within(dialog).getByRole('button', { name: 'Continue to Facebook' }));
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('https://facebook.test/auth');
    });
    expect(calls.find((c) => c.key.startsWith('POST'))?.body).toEqual({
      forceAccountSelection: true,
    });
    expect(takeConnectReturn(WID)).toBeUndefined();
  });

  it('Instagram offers both ways to sign in; a first Instagram login goes straight there', async () => {
    const calls = mockServer({
      ...asAdmin([connection(priya, [coffee])]),
      [`POST ${BASE}/accounts/connect/instagram`]: [200, { authUrl: 'https://ig.test/auth' }],
    });
    renderApp('/w/halden/accounts');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Connect account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Connect an account' });
    expect(within(dialog).getAllByText('Posts text and photos')).toHaveLength(2);
    await user.click(within(dialog).getByRole('button', { name: /^Instagram/ }));
    expect(screen.getByRole('dialog', { name: 'How do you want to sign in?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Continue with Instagram/ }));
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('https://ig.test/auth');
    });
    expect(calls.find((c) => c.key.startsWith('POST'))?.body).toEqual({
      forceAccountSelection: false,
    });
  });

  it('a login that needs reconnecting has a Reconnect that signs in again', async () => {
    mockServer({
      ...asAdmin(),
      [`GET ${BASE}/accounts`]: [
        200,
        { items: [account({ connection: { ...priya, status: 'reauth_required' } })] },
      ],
      [`POST ${BASE}/connections/${priya.id}/reconnect`]: [
        200,
        { authUrl: 'https://facebook.test/again' },
      ],
    });
    // A way back left from an onboarding connect that was abandoned at Facebook.
    rememberConnectReturn(WID, '/w/halden/welcome?step=post');
    renderApp('/w/halden/accounts');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Reconnect' }));
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('https://facebook.test/again');
    });
    // This reconnect ends on the Accounts page, not on onboarding.
    expect(takeConnectReturn(WID)).toBeUndefined();
  });
});

describe('leaving for the network', () => {
  it('only ever goes to an https sign-in page', async () => {
    mockServer({
      ...asAdmin(),
      [`POST ${BASE}/accounts/connect/instagram`]: [200, { authUrl: 'javascript:alert(1)' }],
    });
    renderApp('/w/halden/accounts');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Connect account' }));
    await user.click(await screen.findByRole('button', { name: /^Instagram/ }));
    await user.click(screen.getByRole('button', { name: /Continue with Instagram/ }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(assign).not.toHaveBeenCalled();
  });
});

describe('details', () => {
  it('an account’s drawer gives its health, and disconnecting says what gets cancelled', async () => {
    const calls = mockServer({
      ...asAdmin(),
      [`GET ${BASE}/accounts/${kiosk.id}`]: [
        200,
        {
          ...kiosk,
          lastCheckedAt: null,
          statusReason: 'The Page admin removed our access.',
          pendingPostCount: 3,
        },
      ],
      [`DELETE ${BASE}/accounts/${kiosk.id}`]: [204],
    });
    const { history } = renderApp('/w/halden/accounts');
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('button', { name: 'Details for Halden Kiosk on Facebook' }),
    );
    expect(history.location.search).toContain(`account=${kiosk.id}`);
    const drawer = await screen.findByRole('dialog', { name: 'Halden Kiosk' });
    expect(within(drawer).getByText('The Page admin removed our access.')).toBeInTheDocument();
    await user.click(within(drawer).getByRole('button', { name: 'Disconnect' }));
    const confirm = await screen.findByRole('dialog', { name: 'Disconnect Halden Kiosk?' });
    expect(confirm).toHaveTextContent('3 scheduled posts to it will be cancelled.');
    await user.click(within(confirm).getByRole('button', { name: 'Disconnect' }));
    expect(await screen.findByText('Halden Kiosk disconnected.')).toBeInTheDocument();
    expect(calls.some((c) => c.key === `DELETE ${BASE}/accounts/${kiosk.id}`)).toBe(true);
    await waitFor(() => {
      expect(history.location.search).not.toContain('account=');
    });
  });

  it('a login’s drawer removes the login, saying how many accounts go with it', async () => {
    const calls = mockServer({
      ...asAdmin([connection(priya, [coffee, gram]), connection(brand, [kiosk])]),
      [`DELETE ${BASE}/connections/${priya.id}`]: [204],
    });
    renderApp('/w/halden/accounts');
    const user = userEvent.setup();
    const facebook = await screen.findByRole('region', { name: 'Facebook' });
    await user.click(
      within(facebook).getByRole('button', { name: 'Manage Priya Raman’s Facebook login' }),
    );
    const drawer = await screen.findByRole('dialog', { name: 'Priya Raman' });
    expect(within(drawer).getByRole('link', { name: 'Add more from this login' })).toHaveAttribute(
      'href',
      `/w/halden/accounts/connect/facebook?connection=${priya.id}`,
    );
    await user.click(within(drawer).getByRole('button', { name: 'Remove login' }));
    const confirm = await screen.findByRole('dialog', {
      name: 'Remove Priya Raman’s Facebook login?',
    });
    expect(confirm).toHaveTextContent('Its 2 accounts are disconnected');
    await user.click(within(confirm).getByRole('button', { name: 'Remove login' }));
    expect(await screen.findByText('Priya Raman’s login removed.')).toBeInTheDocument();
    expect(calls.some((c) => c.key === `DELETE ${BASE}/connections/${priya.id}`)).toBe(true);
  });
});

const asset = (overrides: object) => ({
  externalId: 'x',
  network: 'facebook_page',
  displayName: 'Page',
  username: null,
  avatarUrl: null,
  account: null,
  connectedVia: null,
  unavailableReason: null,
  ...overrides,
});

describe('asset picker', () => {
  const picker = `/w/halden/accounts/connect/facebook?connection=${priya.id}`;

  it('a connect started from onboarding ends on its next step, once', async () => {
    mockServer({
      ...asAdmin(),
      [`GET ${BASE}/connections/${priya.id}/assets`]: [
        200,
        {
          connection: priya,
          items: [asset({ externalId: 'new', displayName: 'Halden Roastery' })],
        },
      ],
      [`POST ${BASE}/connections/${priya.id}/assets`]: [201, { items: [coffee] }],
    });
    rememberConnectReturn(WID, '/w/halden/welcome?step=post');
    const { history } = renderApp(picker);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Add 1 account' }));
    await waitFor(() => {
      expect(history.location.pathname + history.location.search).toBe(
        '/w/halden/welcome?step=post',
      );
    });
    // Read once: the next connect ends on the Accounts page again.
    expect(takeConnectReturn(WID)).toBeUndefined();
  });

  it('a remembered way back is only followed for its workspace, and only inside the app', () => {
    rememberConnectReturn('another-workspace', '/w/other/welcome');
    expect(takeConnectReturn(WID)).toBeUndefined();
    rememberConnectReturn(WID, '//evil.test/steal');
    expect(takeConnectReturn(WID)).toBeUndefined();
    rememberConnectReturn(WID, '/w/halden/welcome?step=post');
    expect(takeConnectReturn(WID)).toBe('/w/halden/welcome?step=post');
  });

  it('ticks what’s new, marks what’s added, and adds the chosen ones', async () => {
    const calls = mockServer({
      ...asAdmin(),
      [`GET ${BASE}/connections/${priya.id}/assets`]: [
        200,
        {
          connection: priya,
          items: [
            asset({ externalId: 'new', displayName: 'Halden Roastery' }),
            asset({
              externalId: 'here',
              displayName: 'Halden Coffee',
              account: { id: coffee.id, status: 'active' },
            }),
            asset({
              externalId: 'moved',
              displayName: 'Halden Kiosk',
              account: { id: kiosk.id, status: 'reauth_required' },
              connectedVia: { connectionId: brand.id, displayName: 'Brand Admin' },
            }),
            asset({
              externalId: 'personal',
              network: 'instagram',
              displayName: 'priya.personal',
              unavailableReason: 'not_professional',
            }),
          ],
        },
      ],
      [`POST ${BASE}/connections/${priya.id}/assets`]: [201, { items: [coffee] }],
    });
    const { history } = renderApp(`${picker}&result=already_connected`);
    const user = userEvent.setup();
    expect(await screen.findByText(/Priya Raman is already connected/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Halden Roastery/ })).toBeChecked();
    const here = screen.getByRole('checkbox', { name: /Halden Coffee/ });
    expect(here).toBeChecked();
    expect(here).toBeDisabled();
    const moved = screen.getByRole('checkbox', { name: /Halden Kiosk/ });
    expect(moved).not.toBeChecked();
    expect(moved).toHaveAccessibleDescription(/Added through Brand Admin’s login/);
    expect(screen.getByRole('checkbox', { name: /priya\.personal/ })).toBeDisabled();

    await user.click(moved);
    await user.click(screen.getByRole('button', { name: 'Add 2 accounts' }));
    expect(await screen.findByText('Added 1 account.')).toBeInTheDocument();
    expect(calls.find((c) => c.key.startsWith('POST'))?.body).toEqual({
      externalIds: ['new', 'moved'],
    });
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/halden/accounts');
    });
  });

  it('coming back to the tab doesn’t ask the network again', async () => {
    const calls = mockServer({
      ...asAdmin(),
      [`GET ${BASE}/connections/${priya.id}/assets`]: [
        200,
        { connection: priya, items: [asset({ externalId: 'a', displayName: 'Halden Roastery' })] },
      ],
    });
    renderApp(picker);
    await screen.findByRole('checkbox', { name: /Halden Roastery/ });
    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    focusManager.setFocused(undefined);
    expect(calls.filter((c) => c.key.endsWith('/assets'))).toHaveLength(1);
  });

  it('a failed refresh in the background keeps the list and the ticks', async () => {
    let fail = false;
    mockServer({
      ...asAdmin(),
      [`GET ${BASE}/connections/${priya.id}/assets`]: () =>
        fail
          ? [502, { error: { code: 'NETWORK_ERROR', message: 'x' } }]
          : [
              200,
              {
                connection: priya,
                items: [
                  asset({ externalId: 'a', displayName: 'Halden Roastery' }),
                  asset({ externalId: 'b', displayName: 'Halden Bakery' }),
                ],
              },
            ],
    });
    const { queryClient } = renderApp(picker);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('checkbox', { name: /Halden Bakery/ }));
    fail = true;
    const key = ['workspaces', WID, 'accounts', 'assets', priya.id];
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: key });
    });
    expect(queryClient.getQueryState(key)?.status).toBe('error');
    // React Query tells the screen on its next tick; let it render before looking.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(screen.getByRole('checkbox', { name: /Halden Bakery/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Halden Roastery/ })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Add 1 account' })).toBeInTheDocument();
  });

  it('a login Facebook no longer accepts offers to reconnect it', async () => {
    mockServer({
      ...asAdmin(),
      [`GET ${BASE}/connections/${priya.id}/assets`]: [
        409,
        { error: { code: 'CONNECTION_REAUTH_REQUIRED', message: 'x' } },
      ],
      [`POST ${BASE}/connections/${priya.id}/reconnect`]: [200, { authUrl: 'https://fb.test/r' }],
    });
    // Mid-connect from onboarding: reconnecting here is part of it and keeps where it ends.
    rememberConnectReturn(WID, '/w/halden/welcome?step=post');
    renderApp(picker);
    const user = userEvent.setup();
    expect(
      await screen.findByText('Facebook no longer accepts this login. Reconnect it to continue.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reconnect' }));
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('https://fb.test/r');
    });
    expect(takeConnectReturn(WID)).toBe('/w/halden/welcome?step=post');
  });

  it('a failed connect reads as what happened, with a way to try again', async () => {
    mockServer({
      ...asAdmin(),
      [`POST ${BASE}/accounts/connect/facebook`]: [200, { authUrl: 'https://fb.test/again' }],
    });
    renderApp('/w/halden/accounts/connect/facebook?error=ACCESS_DENIED');
    const user = userEvent.setup();
    expect(await screen.findByText('Facebook didn’t connect')).toBeInTheDocument();
    expect(
      screen.getByText('The sign-in was cancelled, so nothing was connected.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('https://fb.test/again');
    });
  });

  it('is only for people who can connect accounts', async () => {
    mockServer(signedIn('editor'));
    const { history } = renderApp(picker);
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/halden/accounts');
    });
  });
});

describe('a connect that lost its way (/?connectError=)', () => {
  it('lands on the accounts page with the message', async () => {
    mockServer(asAdmin());
    const { history } = renderApp('/?connectError=OAUTH_STATE_INVALID');
    expect(
      await screen.findByText(
        'That sign-in link expired or was already used. Start again from here.',
      ),
    ).toBeInTheDocument();
    expect(history.location.pathname).toBe('/w/halden/accounts');
  });

  it('never shows text from the URL: an unknown code reads as the network failing', async () => {
    mockServer(asAdmin());
    renderApp('/?connectError=%3Cb%3EPay%20here%3C%2Fb%3E');
    expect(
      await screen.findByText('The network didn’t answer as expected. Try again in a moment.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Pay here/)).not.toBeInTheDocument();
  });
});
