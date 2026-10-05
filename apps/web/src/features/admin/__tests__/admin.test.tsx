// The platform admin console (P2-F6), against a fake server.
import type {
  AdminAccount,
  AdminOverview,
  AdminTarget,
  PublishingHealth,
} from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';

type Reply = [number, unknown];
const WID = halden.workspace.id;
const T1 = '01a0d816-827a-74d6-a46e-409c7db35001';

const OVERVIEW: AdminOverview = {
  generatedAt: '2026-10-05T10:00:00.000Z',
  signups24h: 12,
  activeWorkspaces30d: 340,
  published24h: 1820,
  failed24h: 7,
  stuckTargets: 2,
  accountsNeedingAttention: 0,
  queues: [
    { name: 'publish', waiting: 3, delayed: 120, active: 1, failed: 0 },
    { name: 'notifications', waiting: 0, delayed: 0, active: 0, failed: 4 },
  ],
};

const HEALTH: PublishingHealth = {
  range: '24h',
  generatedAt: '2026-10-05T10:00:00.000Z',
  networks: [
    {
      network: 'facebook_page',
      published: 980,
      failed: 20,
      retried: 31,
      successRate: 0.98,
      topErrors: [
        { kind: 'auth', networkCode: '190', message: 'Error validating access token', count: 12 },
      ],
    },
    { network: 'instagram', published: 0, failed: 0, retried: 0, successRate: null, topErrors: [] },
  ],
};

const TARGET: AdminTarget = {
  id: T1,
  postId: '01a0d816-827a-74d6-a46e-409c7db34001',
  workspace: { id: WID, slug: 'halden', name: 'Halden Coffee' },
  account: {
    id: '01a0d816-827a-74d6-a46e-409c7db31001',
    network: 'facebook_page',
    displayName: 'Halden Roastery',
    username: null,
    status: 'active',
  },
  status: 'failed',
  stuck: false,
  scheduledAt: null,
  attempts: 5,
  lastAttemptAt: '2026-10-05T09:00:00.000Z',
  lastError: { kind: 'retryable', networkCode: null, message: 'Facebook timed out' },
};

const ACCOUNT: AdminAccount = {
  id: '01a0d816-827a-74d6-a46e-409c7db31002',
  workspace: { id: WID, slug: 'halden', name: 'Halden Coffee' },
  network: 'instagram',
  displayName: 'halden.coffee',
  username: 'halden.coffee',
  status: 'reauth_required',
  statusReason: 'The password was changed.',
  tokenExpiresAt: null,
  lastCheckedAt: '2026-10-05T04:00:00.000Z',
  scheduledTargets: 3,
};

const me = (over: { isPlatformAdmin?: boolean; twoFactorEnabled?: boolean } = {}) => {
  const base = meWith({ memberships: [halden], activeWorkspaceId: WID });
  return {
    ...base,
    user: {
      ...base.user,
      isPlatformAdmin: over.isPlatformAdmin ?? true,
      twoFactorEnabled: over.twoFactorEnabled ?? true,
    },
  };
};

const server = (
  extra: Record<string, Reply | Handler> = {},
  who = me(),
): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, who],
  'GET /api/admin/overview': [200, OVERVIEW],
  'GET /api/admin/publishing/health': [200, HEALTH],
  'GET /api/admin/publishing/failed': [200, { items: [TARGET], nextCursor: null }],
  'GET /api/admin/accounts/expiring': [200, { items: [ACCOUNT], nextCursor: null }],
  [`GET /api/v1/workspaces/${WID}/posts`]: [200, { items: [], nextCursor: null }],
  [`GET /api/v1/workspaces/${WID}/labels`]: [200, { items: [] }],
  ...extra,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('who gets in', () => {
  it('anyone who isn’t a platform admin gets “page not found”', async () => {
    const calls = mockServer(server({}, me({ isPlatformAdmin: false })));
    renderApp('/admin');
    expect(await screen.findByText('This page doesn’t exist')).toBeInTheDocument();
    expect(calls.some((c) => c.key.startsWith('GET /api/admin'))).toBe(false);
  });

  it('an admin without 2FA is asked to turn it on; the console asks the API nothing', async () => {
    const calls = mockServer(server({}, me({ twoFactorEnabled: false })));
    renderApp('/admin');
    expect(await screen.findByText('Turn on two-factor authentication')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Set up two-factor' })).toHaveAttribute(
      'href',
      '/me/security',
    );
    expect(calls.some((c) => c.key.startsWith('GET /api/admin'))).toBe(false);
  });

  it('a session that didn’t use the 2FA code is asked to sign in again with it', async () => {
    mockServer(
      server({
        'GET /api/admin/overview': [
          403,
          { error: { code: 'ADMIN_2FA_REQUIRED', message: 'Verify 2FA' } },
        ],
      }),
    );
    renderApp('/admin/publishing');
    expect(await screen.findByText('Confirm it’s you')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in again' })).toBeInTheDocument();
  });

  it('the user menu offers the console to platform admins only', async () => {
    mockServer(server());
    const user = userEvent.setup();
    const { unmount } = renderApp('/w/halden/posts');
    const [menu] = await screen.findAllByRole('button', { name: 'Account menu' });
    if (!menu) throw new Error('No user menu');
    await user.click(menu);
    expect(await screen.findByRole('menuitem', { name: 'Admin console' })).toBeInTheDocument();
    unmount();
    vi.restoreAllMocks();
    mockServer(server({}, me({ isPlatformAdmin: false })));
    renderApp('/w/halden/posts');
    const [other] = await screen.findAllByRole('button', { name: 'Account menu' });
    if (!other) throw new Error('No user menu');
    await user.click(other);
    await screen.findByRole('menuitem', { name: 'Profile' });
    expect(screen.queryByRole('menuitem', { name: 'Admin console' })).not.toBeInTheDocument();
  });
});

describe('overview', () => {
  it('the day’s numbers, what needs someone linking to it, and the queues’ backlog', async () => {
    mockServer(server());
    renderApp('/admin');
    const kpis = await screen.findByRole('region', { name: 'Last 24 hours' });
    expect(await within(kpis).findByText('1,820')).toBeInTheDocument();
    expect(within(kpis).getByText('Sign-ups').previousSibling).toHaveTextContent('12');
    expect(within(kpis).getByRole('link', { name: /7\s*Deliveries failed/ })).toHaveAttribute(
      'href',
      '/admin/publishing?state=failed',
    );
    expect(within(kpis).getByRole('link', { name: /2\s*Stuck/ })).toHaveAttribute(
      'href',
      '/admin/publishing?state=stuck',
    );
    const queues = screen.getByRole('table', { name: 'Queues' });
    const publish = within(queues).getByRole('row', { name: /publish/ });
    expect(
      within(publish)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['3', '120', '1', '0']);
  });
});

describe('publishing', () => {
  it('health by network: success rate, counts and the most common errors', async () => {
    mockServer(server());
    renderApp('/admin/publishing');
    const health = await screen.findByRole('region', { name: 'Health by network' });
    expect(await within(health).findByText('98%')).toBeInTheDocument();
    expect(within(health).getByRole('meter', { name: 'Success rate on Facebook' })).toHaveAttribute(
      'aria-valuenow',
      '98',
    );
    expect(within(health).getByText('Error validating access token')).toBeInTheDocument();
    // Nothing finished on Instagram: no rate to show.
    expect(
      within(health).getByRole('meter', { name: 'Success rate on Instagram' }),
    ).not.toHaveAttribute('aria-valuenow');
  });

  it('the period is kept in the address and asked for', async () => {
    const calls = mockServer(server());
    const user = userEvent.setup();
    const { history } = renderApp('/admin/publishing');
    await user.click(await screen.findByRole('button', { name: '7 days' }));
    await waitFor(() => {
      expect(history.location.search).toContain('range=7d');
    });
    await waitFor(() => {
      expect(
        calls.some(
          (c) => c.key === 'GET /api/admin/publishing/health' && c.search.includes('range=7d'),
        ),
      ).toBe(true);
    });
  });

  it('retry asks why (3 characters or more), sends it, and re-reads the console', async () => {
    const calls = mockServer(
      server({
        [`POST /api/admin/publishing/targets/${T1}/retry`]: [
          202,
          { ...TARGET, status: 'publishing' },
        ],
      }),
    );
    const user = userEvent.setup();
    renderApp('/admin/publishing');
    await user.click(await screen.findByRole('button', { name: 'Retry Halden Roastery' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Retry the delivery to Halden Roastery?',
    });
    const confirm = within(dialog).getByRole('button', { name: 'Retry' });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox', { name: /Why/ }), 'ok');
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox', { name: /Why/ }), ' then');
    expect(confirm).toBeEnabled();
    const before = calls.filter((c) => c.key === 'GET /api/admin/publishing/failed').length;
    await user.click(confirm);
    expect(await screen.findByText('Publishing to Halden Roastery again.')).toBeInTheDocument();
    expect(calls.find((c) => c.key.endsWith('/retry'))?.body).toEqual({ reason: 'ok then' });
    await waitFor(() => {
      expect(
        calls.filter((c) => c.key === 'GET /api/admin/publishing/failed').length,
      ).toBeGreaterThan(before);
    });
  });

  it('a refusal stays in the dialog, explained', async () => {
    mockServer(
      server({
        [`POST /api/admin/publishing/targets/${T1}/cancel`]: [
          409,
          { error: { code: 'TARGET_NOT_CANCELLABLE', message: 'Already published' } },
        ],
      }),
    );
    const user = userEvent.setup();
    renderApp('/admin/publishing');
    await user.click(
      await screen.findByRole('button', { name: 'Cancel delivery to Halden Roastery' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByRole('textbox', { name: /Why/ }), 'Customer asked');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel delivery' }));
    expect(await within(dialog).findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters by state, network and error kind, in the address and the request', async () => {
    const calls = mockServer(server());
    const user = userEvent.setup();
    const { history } = renderApp('/admin/publishing?state=stuck');
    await screen.findByRole('button', { name: 'Retry Halden Roastery' });
    expect(
      calls.some(
        (c) => c.key === 'GET /api/admin/publishing/failed' && c.search.includes('state=stuck'),
      ),
    ).toBe(true);
    await user.click(screen.getByRole('combobox', { name: 'Error kind' }));
    await user.click(await screen.findByRole('option', { name: 'Sign-in' }));
    await waitFor(() => {
      expect(history.location.search).toContain('errorKind=auth');
    });
    expect(history.location.search).toContain('state=stuck');
  });
});

describe('accounts', () => {
  it('lists accounts needing attention, with what they put at risk', async () => {
    const calls = mockServer(server());
    const user = userEvent.setup();
    const { history } = renderApp('/admin/accounts');
    const table = await screen.findByRole('table', { name: 'Accounts needing attention' });
    const row = await within(table).findByRole('row', { name: /halden.coffee/ });
    expect(row).toHaveTextContent('Needs reconnecting');
    expect(row).toHaveTextContent('The password was changed.');
    expect(row).toHaveTextContent('3');
    await user.click(screen.getByRole('combobox', { name: 'Expiring within' }));
    await user.click(await screen.findByRole('option', { name: '30 days' }));
    await waitFor(() => {
      expect(history.location.search).toContain('within=30');
    });
    await waitFor(() => {
      expect(
        calls.some(
          (c) => c.key === 'GET /api/admin/accounts/expiring' && c.search.includes('withinDays=30'),
        ),
      ).toBe(true);
    });
  });
});
