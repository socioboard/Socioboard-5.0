import type { SocialAccount } from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp } from '../../../testing/render';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
type Reply = [number, unknown];

const page: SocialAccount = {
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

const server = ({
  role = 'owner',
  accounts = [] as SocialAccount[],
  posts = 0,
}: { role?: string; accounts?: SocialAccount[]; posts?: number } = {}): Record<string, Reply> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  'GET /api/v1/networks': [200, { items: [] }],
  [`GET ${BASE}/accounts`]: [200, { items: accounts }],
  [`GET ${BASE}/posts`]: [
    200,
    { items: Array.from({ length: posts }, () => ({ id: 'x' })), nextCursor: null },
  ],
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('onboarding steps 2–3', () => {
  it('step 2 offers to connect an account, or to skip to step 3', async () => {
    mockServer(server());
    const { history } = renderApp('/w/halden/welcome');
    expect(
      await screen.findByRole('heading', { name: 'Connect your first account' }),
    ).toBeInTheDocument();
    const steps = screen.getByRole('list', { name: 'Setup steps' });
    expect(within(steps).getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Connect an account' }));
    expect(await screen.findByRole('dialog', { name: 'Connect an account' })).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('link', { name: 'Skip for now' }));
    expect(
      await screen.findByRole('heading', { name: 'Write your first post' }),
    ).toBeInTheDocument();
    expect(history.location.search).toBe('?step=post');
    // With nothing connected, the first post is kept as a draft.
    expect(screen.getByText(/it’s kept as a draft/)).toBeInTheDocument();
  });

  it('with an account connected, step 2 lists it and continues to step 3', async () => {
    mockServer(server({ accounts: [page] }));
    renderApp('/w/halden/welcome');
    expect(await screen.findByText('1 account connected')).toBeInTheDocument();
    const step = screen.getByRole('region', { name: 'Connect your first account' });
    expect(within(step).getByText('Halden Coffee')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute(
      'href',
      '/w/halden/welcome?step=post',
    );
    expect(screen.getByRole('button', { name: 'Connect another' })).toBeInTheDocument();
  });

  it('step 3 opens the composer, or skips to the calendar', async () => {
    mockServer(server({ accounts: [page] }));
    renderApp('/w/halden/welcome?step=post');
    expect(await screen.findByRole('link', { name: 'Write a post' })).toHaveAttribute(
      'href',
      '/w/halden/compose',
    );
    expect(screen.getByRole('link', { name: 'Skip for now' })).toHaveAttribute(
      'href',
      '/w/halden/calendar',
    );
    expect(screen.getByText(/Write it once/)).toBeInTheDocument();
  });

  it('someone who can’t connect accounts can carry on', async () => {
    mockServer(server({ role: 'editor' }));
    renderApp('/w/halden/welcome');
    expect(await screen.findByText(/An admin of this workspace connects/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect an account' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip for now' })).toBeInTheDocument();
  });
});

describe('getting started on the calendar', () => {
  it('lists the steps left, links each to where it’s done, and can be hidden for good', async () => {
    mockServer(server());
    const first = renderApp('/w/halden/calendar');
    const card = await screen.findByRole('region', { name: 'Get started' });
    expect(within(card).getByText('1 of 3 done')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Connect' })).toHaveAttribute(
      'href',
      '/w/halden/welcome?step=connect',
    );
    expect(within(card).getByRole('link', { name: 'Write' })).toHaveAttribute(
      'href',
      '/w/halden/compose',
    );
    const user = userEvent.setup();
    await user.click(within(card).getByRole('button', { name: 'Hide getting started' }));
    expect(screen.queryByRole('region', { name: 'Get started' })).not.toBeInTheDocument();

    // Hidden stays hidden on the next visit.
    first.unmount();
    renderApp('/w/halden/calendar');
    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Get started' })).not.toBeInTheDocument();
    });
  });

  it('ticks off what’s done, and goes away once everything is', async () => {
    mockServer(server({ accounts: [page] }));
    const first = renderApp('/w/halden/calendar');
    const card = await screen.findByRole('region', { name: 'Get started' });
    expect(within(card).getByText('2 of 3 done')).toBeInTheDocument();
    expect(within(card).queryByRole('link', { name: 'Connect' })).not.toBeInTheDocument();
    first.unmount();

    vi.restoreAllMocks();
    mockServer(server({ accounts: [page], posts: 1 }));
    renderApp('/w/halden/calendar');
    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    // Give the queries a moment: the card must stay away once they answer.
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('region', { name: 'Get started' })).not.toBeInTheDocument();
  });

  it('is only for people who set the workspace up', async () => {
    const calls = mockServer(server({ role: 'editor' }));
    renderApp('/w/halden/calendar');
    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('region', { name: 'Get started' })).not.toBeInTheDocument();
    expect(calls.some((c) => c.key === `GET ${BASE}/posts`)).toBe(false);
  });
});
