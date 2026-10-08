import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { meQuery } from '../../../lib/session';
import { SESSION_CHECK_MS } from '../hooks';
import { halden, meWith, mockServer, renderApp, signedOut } from '../../../testing/render';

const options = { socialProviders: [], emailVerificationRequired: true };
const roastery = {
  workspace: {
    id: '01a0d816-827a-74d6-a46e-409c7db36f94',
    name: 'Roastery Social',
    slug: 'roastery',
    logoUrl: null,
    timezone: 'UTC',
  },
  role: 'editor',
};
const both = { memberships: [halden, roastery], activeWorkspaceId: halden.workspace.id };

/** The desktop sidebar (the phone tab bar is also a "Main" navigation, hidden by CSS). */
async function findSidebar(): Promise<HTMLElement> {
  const [sidebar] = await screen.findAllByRole('navigation', { name: 'Main' });
  if (!sidebar) throw new Error('No sidebar rendered');
  return sidebar;
}

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.classList.remove('dark');
});

describe('start page', () => {
  it('sends signed-out visitors to sign in', async () => {
    mockServer(signedOut);
    const { history } = renderApp('/');
    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    });
  });

  it('opens the active workspace on its calendar, or setup when there is none', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith({ ...both, activeWorkspaceId: roastery.workspace.id })],
    });
    const { history } = renderApp('/');
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/roastery/calendar');
    });
  });
});

describe('app shell', () => {
  it('frames the page: workspace, search, pages, and who is signed in', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith(both)],
    });
    renderApp('/w/halden');
    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    const sidebar = await findSidebar();
    expect(
      within(sidebar).getByRole('button', { name: 'Switch workspace: Halden Coffee' }),
    ).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'Calendar' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(sidebar).getByRole('button', { name: 'Account menu' })).toHaveTextContent(
      /Priya Raman.*Owner/,
    );
  });

  it('makes the opened workspace the active one on the server', async () => {
    const calls = mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith(both)],
      'POST /api/v1/me/active-workspace': [204],
    });
    renderApp('/w/roastery/calendar');
    await waitFor(() => {
      expect(calls.find((c) => c.key === 'POST /api/v1/me/active-workspace')?.body).toEqual({
        workspaceId: roastery.workspace.id,
      });
    });
  });

  it('switches workspace from the switcher', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith(both)],
      'POST /api/v1/me/active-workspace': [204],
    });
    const { history } = renderApp('/w/halden/calendar');
    const user = userEvent.setup();
    const sidebar = await findSidebar();
    await user.click(within(sidebar).getByRole('button', { name: /Switch workspace/ }));
    expect(await screen.findByRole('menuitemradio', { name: /Halden Coffee/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(screen.getByRole('menuitemradio', { name: /Roastery Social/ }));
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/roastery/calendar');
    });
  });

  it('says "not found" for a workspace I’m not in, after asking the server again', async () => {
    const calls = mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith({ memberships: [halden] })],
    });
    renderApp('/w/someone-else/calendar');
    expect(await screen.findByRole('heading', { name: 'Workspace not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Halden Coffee/ })).toHaveAttribute(
      'href',
      '/w/halden',
    );
    expect(calls.filter((c) => c.key === 'GET /api/v1/me')).toHaveLength(2);
  });

  it('sends people to sign in, and back, when a request says the session ended', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith(both)],
      'POST /api/v1/me/active-workspace': [
        401,
        { error: { code: 'UNAUTHENTICATED', message: 'Sign in' } },
      ],
    });
    const { history, queryClient } = renderApp('/w/roastery/calendar');
    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    });
    expect(history.location.search).toContain('redirect=%2Fw%2Froastery%2Fcalendar');
    expect(await screen.findByText(/Your session has ended/)).toBeInTheDocument();
    expect(queryClient.getQueryData(meQuery.queryKey)).toBeNull();
  });

  it('stays signed in after a 401 that isn’t about the session (a wrong 2FA code)', async () => {
    const calls = mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith(both)],
      'POST /api/v1/me/active-workspace': [
        401,
        { error: { code: 'INVALID_CODE', message: 'Invalid code' } },
      ],
    });
    const { history } = renderApp('/w/roastery/calendar');
    // The 401 makes the shell re-check who is signed in; the answer is "still you".
    await waitFor(() => {
      expect(calls.filter((c) => c.key === 'GET /api/v1/me').length).toBeGreaterThan(1);
    });
    expect(history.location.pathname).toBe('/w/roastery/calendar');
    expect(screen.getByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    expect(screen.queryByText(/Your session has ended/)).not.toBeInTheDocument();
  });

  it('checks who is signed in every few minutes, so an idle page notices an expired session', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    try {
      let signedIn = true;
      const calls = mockServer({
        'GET /api/v1/auth/options': [200, options],
        'GET /api/v1/me': () =>
          signedIn
            ? [200, meWith(both)]
            : [401, { error: { code: 'UNAUTHENTICATED', message: 'Sign in' } }],
      });
      const { history } = renderApp('/w/halden/calendar');
      await screen.findByRole('heading', { name: 'Calendar' });
      const before = calls.filter((c) => c.key === 'GET /api/v1/me').length;
      signedIn = false;
      await act(() => vi.advanceTimersByTimeAsync(SESSION_CHECK_MS));
      await waitFor(() => {
        expect(history.location.pathname).toBe('/login');
      });
      expect(calls.filter((c) => c.key === 'GET /api/v1/me').length).toBeGreaterThan(before);
    } finally {
      vi.useRealTimers();
    }
  });

  it('notices a session that ended elsewhere when it next checks who is signed in', async () => {
    let signedIn = true;
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': () =>
        signedIn
          ? [200, meWith(both)]
          : [401, { error: { code: 'UNAUTHENTICATED', message: 'Sign in' } }],
    });
    const { history, queryClient } = renderApp('/w/halden/calendar');
    await screen.findByRole('heading', { name: 'Calendar' });
    signedIn = false;
    await act(() => queryClient.refetchQueries({ queryKey: meQuery.queryKey }));
    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    });
  });

  it('signs out on purpose without calling it an ended session', async () => {
    let signedIn = true;
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': () =>
        signedIn
          ? [200, meWith(both)]
          : [401, { error: { code: 'UNAUTHENTICATED', message: 'Sign in' } }],
      'POST /api/auth/sign-out': () => {
        signedIn = false;
        return [200, { success: true }];
      },
    });
    const { history } = renderApp('/w/halden/calendar');
    const user = userEvent.setup();
    const sidebar = await findSidebar();
    await user.click(within(sidebar).getByRole('button', { name: 'Account menu' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));
    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    });
    expect(history.location.search).toBe('');
    expect(screen.queryByText(/Your session has ended/)).not.toBeInTheDocument();
  });

  it('toggles the command palette with Ctrl+K and runs a command', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith(both)],
    });
    renderApp('/w/halden/calendar');
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Calendar' });
    await user.keyboard('{Control>}k{/Control}');
    await screen.findByRole('dialog');
    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await user.keyboard('{Control>}k{/Control}');
    const search = await screen.findByRole('combobox', { name: 'Search or jump to' });
    await user.type(search, 'dark theme');
    await user.keyboard('{Enter}');
    expect(document.documentElement).toHaveClass('dark');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('remembers a collapsed sidebar', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith(both)],
    });
    renderApp('/w/halden/calendar');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
    expect(localStorage.getItem('sb-sidebar')).toBe('collapsed');
  });

  it('asks an unverified user to verify, and resends the link from the banner', async () => {
    const calls = mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith({ ...both, emailVerified: false })],
      'POST /api/auth/send-verification-email': [200, { status: true }],
    });
    renderApp('/w/halden/calendar');
    const user = userEvent.setup();
    const banner = await screen.findByText(/Verify your email address/);
    expect(banner).toHaveTextContent('priya@halden.test');
    await user.click(screen.getByRole('button', { name: 'Send the link again' }));
    expect(await screen.findByText('Sent. Check your inbox.')).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/auth/send-verification-email')?.body,
    ).toMatchObject({ callbackURL: '/verify-email?redirect=%2Fw%2Fhalden%2Fcalendar' });
  });
});
