import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, signedOut } from '../../../testing/render';

afterEach(() => {
  vi.restoreAllMocks();
});

const INVITE_ID = '01a0d816-827a-74d6-a46e-409c7db36f99';

describe('sign in', () => {
  it('checks the email before calling the server', async () => {
    const calls = mockServer(signedOut);
    renderApp('/login');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'POST /api/auth/sign-in/email')).toBe(false);
  });

  it('explains a wrong password in plain words', async () => {
    mockServer({
      ...signedOut,
      'POST /api/auth/sign-in/email': [
        401,
        { code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Invalid email or password' },
      ],
    });
    renderApp('/login');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Email'), 'priya@halden.test');
    await user.type(screen.getByLabelText('Password'), 'wrong password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password don’t match.',
    );
  });

  it('signs in and lands on onboarding when the user has no workspace', async () => {
    let signedIn = false;
    mockServer({
      'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
      'GET /api/v1/me': () =>
        signedIn ? [200, meWith({})] : [401, { error: { code: 'UNAUTHENTICATED', message: 'x' } }],
      'POST /api/auth/sign-in/email': () => {
        signedIn = true;
        return [200, { redirect: false, token: 't', user: { id: 'u' } }];
      },
    });
    const { history } = renderApp('/login');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Email'), 'priya@halden.test');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(history.location.pathname).toBe('/onboarding');
    });
  });

  it('goes to the 2FA step when the account has it on', async () => {
    mockServer({
      ...signedOut,
      'POST /api/auth/sign-in/email': [200, { twoFactorRedirect: true }],
    });
    const { history } = renderApp('/login?redirect=%2Finvite%2Fabc');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Email'), 'priya@halden.test');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('heading', { name: 'Enter your 2FA code' })).toBeInTheDocument();
    expect(history.location.pathname).toBe('/login/2fa');
    expect(history.location.search).toContain('redirect=%2Finvite%2Fabc');
  });

  it('ignores an off-site redirect and sends a signed-in visitor to their workspace', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
      'GET /api/v1/me': [200, meWith({ memberships: [halden] })],
    });
    const { history } = renderApp('/login?redirect=%2F%2Fevil.test');
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/halden');
    });
  });

  it('shows Google and Microsoft only when the server has them configured', async () => {
    mockServer({
      ...signedOut,
      'GET /api/v1/auth/options': [
        200,
        { socialProviders: ['google'], emailVerificationRequired: true },
      ],
    });
    renderApp('/login');
    expect(await screen.findByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue with Microsoft' }),
    ).not.toBeInTheDocument();
  });

  it('sends a magic link and says so without revealing whether the account exists', async () => {
    const calls = mockServer({
      ...signedOut,
      'POST /api/auth/sign-in/magic-link': [200, { status: true }],
    });
    renderApp('/login');
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('button', { name: 'Email me a sign-in link instead' }),
    );
    await user.type(screen.getByLabelText('Email'), 'priya@halden.test');
    await user.click(screen.getByRole('button', { name: 'Send sign-in link' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'If there’s an account for priya@halden.test',
    );
    expect(calls.find((c) => c.key === 'POST /api/auth/sign-in/magic-link')?.body).toMatchObject({
      email: 'priya@halden.test',
      callbackURL: '/login',
    });
  });
});

describe('sign up', () => {
  it('asks for 10+ characters, then sends new accounts to check their inbox', async () => {
    let created = false;
    const calls = mockServer({
      'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
      'GET /api/v1/me': () =>
        created
          ? [200, meWith({ emailVerified: false })]
          : [401, { error: { code: 'UNAUTHENTICATED', message: 'x' } }],
      'POST /api/auth/sign-up/email': () => {
        created = true;
        return [200, { token: 't', user: { id: 'u' } }];
      },
    });
    const { history } = renderApp('/signup');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Your name'), 'Priya Raman');
    await user.type(screen.getByLabelText('Email'), 'priya@halden.test');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Use at least 10 characters.')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple');
    expect(screen.getByText('Password strength: strong')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('heading', { name: 'Check your inbox' })).toBeInTheDocument();
    expect(history.location.pathname).toBe('/verify-email');
    expect(
      screen.getByText(/We sent a verification link to priya@halden.test/),
    ).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/auth/sign-up/email')?.body).toMatchObject({
      name: 'Priya Raman',
      callbackURL: '/verify-email',
    });
  });

  it('turns a breached password into a clear message', async () => {
    mockServer({
      ...signedOut,
      'POST /api/auth/sign-up/email': [
        400,
        { code: 'PASSWORD_COMPROMISED', message: 'This password has appeared in a data breach.' },
      ],
    });
    renderApp('/signup');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Your name'), 'Priya');
    await user.type(screen.getByLabelText('Email'), 'priya@halden.test');
    await user.type(screen.getByLabelText('Password'), 'password1234');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('appeared in a data breach');
  });
});

describe('verify email', () => {
  it('shows "verified" only when the server says so', async () => {
    mockServer({ ...signedOut, 'GET /api/v1/me': [200, meWith({ emailVerified: false })] });
    renderApp('/verify-email?verified=1&status=ok');
    expect(await screen.findByRole('heading', { name: 'Check your inbox' })).toBeInTheDocument();
  });

  it('confirms a verified email and continues to onboarding', async () => {
    mockServer({ ...signedOut, 'GET /api/v1/me': [200, meWith({ emailVerified: true })] });
    const { history } = renderApp('/verify-email');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(screen.queryByText('Check your inbox')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(history.location.pathname).toBe('/onboarding');
    });
  });

  it('resends the link, then waits before allowing another', async () => {
    mockServer({
      ...signedOut,
      'GET /api/v1/me': [200, meWith({ emailVerified: false })],
      'POST /api/auth/send-verification-email': [200, { status: true }],
    });
    renderApp('/verify-email');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Send the link again' }));
    expect(await screen.findByText(/Sent. Check your inbox/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send again in \d+ s/ })).toBeDisabled();
  });
});

describe('reset password', () => {
  it('confirms a request without revealing whether the account exists', async () => {
    mockServer({ ...signedOut, 'POST /api/auth/request-password-reset': [200, { status: true }] });
    renderApp('/reset-password');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Email'), 'nobody@halden.test');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'If there’s an account for nobody@halden.test',
    );
  });

  it('sets a new password from the emailed link', async () => {
    const calls = mockServer({
      ...signedOut,
      'POST /api/auth/reset-password': [200, { status: true }],
    });
    renderApp('/reset-password?token=abc123');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('New password'), 'a brand new passphrase');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));
    expect(await screen.findByText(/Password changed/)).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /api/auth/reset-password')?.body).toEqual({
      newPassword: 'a brand new passphrase',
      token: 'abc123',
    });
  });

  it('explains an expired link and offers a new one', async () => {
    mockServer(signedOut);
    renderApp('/reset-password?error=INVALID_TOKEN');
    expect(await screen.findByRole('alert')).toHaveTextContent('expired or was already used');
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument();
  });
});

describe('two-factor step', () => {
  it('needs 6 digits, and sends people back to sign in when the attempt timed out', async () => {
    mockServer({
      ...signedOut,
      'POST /api/auth/two-factor/verify-totp': [
        401,
        { code: 'INVALID_TWO_FACTOR_COOKIE', message: 'Invalid two factor cookie' },
      ],
    });
    renderApp('/login/2fa');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('6-digit code'), '12ab3');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByText(/Enter the 6 digits/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('6-digit code'), '456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByText('Your sign-in timed out. Start again.')).toBeInTheDocument();
  });
});

describe('invitation', () => {
  const preview = {
    id: INVITE_ID,
    workspace: { name: 'Halden Coffee', logoUrl: null },
    role: 'editor',
    invitedByName: 'Priya Raman',
    emailHint: 'm•••o@halden.test',
    status: 'pending',
    expiresAt: '2026-10-05T10:00:00.000Z',
  };

  it('asks signed-out visitors to sign in and come back', async () => {
    mockServer({ ...signedOut, [`GET /api/v1/invitations/${INVITE_ID}`]: [200, preview] });
    renderApp(`/invite/${INVITE_ID}`);
    expect(
      await screen.findByText('Priya Raman invited you to join as an editor.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in to accept' })).toHaveAttribute(
      'href',
      `/login?redirect=%2Finvite%2F${INVITE_ID}`,
    );
  });

  it('accepts and opens the workspace', async () => {
    mockServer({
      ...signedOut,
      'GET /api/v1/me': [200, meWith({})],
      [`GET /api/v1/invitations/${INVITE_ID}`]: [200, preview],
      [`POST /api/v1/invitations/${INVITE_ID}/accept`]: [
        200,
        {
          ...halden.workspace,
          timezone: 'UTC',
          requireReviewForAll: false,
          createdAt: '2026-09-28T10:00:00.000Z',
          myRole: 'editor',
        },
      ],
    });
    const { history } = renderApp(`/invite/${INVITE_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Accept invitation' }));
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/halden');
    });
  });

  it('explains which address the invitation went to when signed in as someone else', async () => {
    mockServer({
      ...signedOut,
      'GET /api/v1/me': [200, meWith({})],
      [`GET /api/v1/invitations/${INVITE_ID}`]: [200, preview],
      [`POST /api/v1/invitations/${INVITE_ID}/accept`]: [
        404,
        { error: { code: 'INVITATION_NOT_FOUND', message: 'Invitation not found' } },
      ],
    });
    renderApp(`/invite/${INVITE_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Accept invitation' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This invitation was sent to m•••o@halden.test, and you’re signed in as priya@halden.test.',
    );
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('says when an invitation expired', async () => {
    mockServer({
      ...signedOut,
      [`GET /api/v1/invitations/${INVITE_ID}`]: [200, { ...preview, status: 'expired' }],
    });
    renderApp(`/invite/${INVITE_ID}`);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This invitation expired. Ask Priya Raman to send a new one.',
    );
  });
});
