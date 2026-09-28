import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { describeUserAgent, formatIp } from '../user-agent';

afterEach(() => {
  vi.restoreAllMocks();
});

const options = { socialProviders: [], emailVerificationRequired: true };
const signedIn = { memberships: [halden], activeWorkspaceId: halden.workspace.id };
const CHROME_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const sessions = [
  {
    id: 's-1',
    createdAt: '2026-09-28T09:00:00.000Z',
    expiresAt: '2026-10-05T09:00:00.000Z',
    ipAddress: '203.0.113.7',
    userAgent: CHROME_WINDOWS,
    current: true,
  },
  {
    id: 's-2',
    createdAt: '2026-09-20T09:00:00.000Z',
    expiresAt: '2026-10-05T09:00:00.000Z',
    ipAddress: '198.51.100.4',
    userAgent: SAFARI_IPHONE,
    current: false,
  },
];

function server(
  me: Parameters<typeof meWith>[0],
  extra: Record<string, Handler | [number, unknown?]> = {},
) {
  return mockServer({
    'GET /api/v1/auth/options': [200, options],
    'GET /api/v1/me': [200, meWith({ ...signedIn, ...me })],
    'GET /api/auth/list-accounts': [200, [{ providerId: 'credential', accountId: 'u' }]],
    'GET /api/v1/me/sessions': [200, { items: sessions }],
    ...extra,
  });
}

describe('formatIp', () => {
  it.each([
    ['2001:0db8:0000:0000:0000:0000:0000:0000', '2001:db8::'],
    ['2001:0db8:0001:0000:0000:0000:0000:0001', '2001:db8:1::1'],
    ['fe80:0000:0000:0000:0204:61ff:fe9d:f156', 'fe80::204:61ff:fe9d:f156'],
    ['2001:0db8:0001:0002:0003:0004:0005:0006', '2001:db8:1:2:3:4:5:6'],
    ['0000:0000:0000:0000:0000:0000:0000:0000', null],
    ['203.0.113.7', '203.0.113.7'],
    [null, null],
  ])('%s shows as %s', (ip, shown) => {
    expect(formatIp(ip)).toBe(shown);
  });
});

describe('describeUserAgent', () => {
  it('names common browsers and systems, and gives up on the rest', () => {
    expect(describeUserAgent(CHROME_WINDOWS)).toEqual({ browser: 'Chrome', os: 'Windows' });
    expect(describeUserAgent(SAFARI_IPHONE)).toEqual({ browser: 'Safari', os: 'iOS' });
    expect(describeUserAgent('curl/8.0')).toBeNull();
    expect(describeUserAgent(null)).toBeNull();
  });
});

describe('profile', () => {
  it('opens in the app shell and saves the changed name', async () => {
    const calls = server(
      { timezone: 'Europe/Lisbon' },
      {
        'PATCH /api/v1/me': ({ body }) =>
          [
            200,
            meWith({ ...signedIn, timezone: 'Europe/Lisbon' }),
            // echo is enough: the page only needs a Me back
          ][0] === 200
            ? [
                200,
                {
                  ...meWith({ ...signedIn, timezone: 'Europe/Lisbon' }),
                  ...{},
                  user: { ...meWith({}).user, ...(body as object), timezone: 'Europe/Lisbon' },
                },
              ]
            : [500],
      },
    );
    renderApp('/me');
    const user = userEvent.setup();
    const name = await screen.findByLabelText('Name');
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText('Email')).toHaveValue('priya@halden.test');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await user.clear(name);
    await user.type(name, 'Priya R.');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'PATCH /api/v1/me')?.body).toEqual({ name: 'Priya R.' });
  });

  it('offers to save the browser’s time zone when none is set yet', async () => {
    server({ timezone: null });
    renderApp('/me/profile');
    expect(await screen.findByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  it('sends people without a workspace to set one up first', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith({})],
    });
    const { history } = renderApp('/me/security');
    await waitFor(() => {
      expect(history.location.pathname).toBe('/onboarding');
    });
  });
});

describe('security: password', () => {
  it('changes the password, signing out other devices by default', async () => {
    const calls = server({}, { 'POST /api/auth/change-password': [200, { token: null }] });
    renderApp('/me/security');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Current password'), 'old password here');
    await user.type(screen.getByLabelText('New password'), 'correct horse battery staple');
    expect(screen.getByRole('checkbox', { name: 'Sign out of other devices' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText('Password changed.')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/auth/change-password')?.body).toEqual({
      currentPassword: 'old password here',
      newPassword: 'correct horse battery staple',
      revokeOtherSessions: true,
    });
  });

  it('lets someone without a password set one by email', async () => {
    const calls = server(
      {},
      {
        'GET /api/auth/list-accounts': [200, [{ providerId: 'google', accountId: 'g' }]],
        'POST /api/auth/request-password-reset': [200, { status: true }],
      },
    );
    renderApp('/me/security');
    const user = userEvent.setup();
    expect(await screen.findByText('You sign in without a password')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Two-factor authentication' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Email me a link to set one' }));
    expect(await screen.findByText(/Check your inbox for the link/)).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/auth/request-password-reset')?.body).toEqual({
      email: 'priya@halden.test',
      redirectTo: '/reset-password',
    });
  });
});

describe('security: two-factor authentication', () => {
  const totpURI =
    'otpauth://totp/Socioboard:priya%40halden.test?secret=JBSWY3DPEHPK3PXP&issuer=Socioboard';
  const backupCodes = ['aaaa-1111', 'bbbb-2222', 'cccc-3333', 'dddd-4444'];

  it('turns on in steps: password, scan, code, then backup codes', async () => {
    let enabled = false;
    let codeRight = false;
    const calls = server(
      {},
      {
        'GET /api/v1/me': () =>
          [200, meWith({ ...signedIn })].map((v, i) =>
            i === 1
              ? { ...(v as object), user: { ...meWith({}).user, twoFactorEnabled: enabled } }
              : v,
          ) as [number, unknown],
        'POST /api/auth/two-factor/enable': [200, { totpURI, backupCodes }],
        'POST /api/auth/two-factor/verify-totp': () => {
          if (!codeRight) return [401, { code: 'INVALID_CODE', message: 'Invalid code' }];
          enabled = true;
          return [200, { token: 't' }];
        },
      },
    );
    const { history } = renderApp('/me/security');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('switch', { name: 'Two-factor authentication' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Password'), 'my password');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));

    expect(
      await within(dialog).findByRole('img', { name: 'QR code for your authenticator app' }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('JBSW Y3DP EHPK 3PXP')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('6-digit code'), '123456');
    await user.click(within(dialog).getByRole('button', { name: 'Turn on' }));
    // A wrong code is Better Auth's 401: explained here, and nobody gets signed out.
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('That code isn’t right');
    expect(history.location.pathname).toBe('/me/security');

    codeRight = true;
    await user.click(within(dialog).getByRole('button', { name: 'Turn on' }));
    expect(await within(dialog).findByText('aaaa-1111')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/auth/two-factor/enable')?.body).toEqual({
      password: 'my password',
    });
    await user.click(within(dialog).getByRole('button', { name: 'I’ve saved them' }));
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Two-factor authentication' })).toBeChecked();
    });
  });

  it('turns off with the password', async () => {
    const calls = server(
      {},
      {
        'GET /api/v1/me': [
          200,
          { ...meWith(signedIn), user: { ...meWith({}).user, twoFactorEnabled: true } },
        ],
        'POST /api/auth/two-factor/disable': [200, { status: true }],
      },
    );
    renderApp('/me/security');
    const user = userEvent.setup();
    const toggle = await screen.findByRole('switch', { name: 'Two-factor authentication' });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Password'), 'my password');
    await user.click(within(dialog).getByRole('button', { name: 'Turn off' }));
    expect(await screen.findByText('Two-factor authentication is off.')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/auth/two-factor/disable')?.body).toEqual({
      password: 'my password',
    });
  });
});

describe('security: sessions', () => {
  it('lists devices, marks this one, and signs another out', async () => {
    const calls = server({}, { 'DELETE /api/v1/me/sessions/s-2': [204] });
    renderApp('/me/security');
    const user = userEvent.setup();
    const current = await screen.findByText('Chrome on Windows');
    expect(within(current).getByText('This device')).toBeInTheDocument();
    expect(screen.getByText('Safari on iOS')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    await user.click(await screen.findByRole('button', { name: 'Sign out', hidden: false }));
    expect(await screen.findByText('Signed out of Safari on iOS.')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'DELETE /api/v1/me/sessions/s-2')).toBe(true);
  });
});
