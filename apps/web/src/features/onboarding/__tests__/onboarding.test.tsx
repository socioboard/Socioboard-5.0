import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, signedOut } from '../../../testing/render';

afterEach(() => {
  vi.restoreAllMocks();
});

const options = { socialProviders: [], emailVerificationRequired: true };
const created = {
  id: '01a0d816-827a-74d6-a46e-409c7db36f95',
  name: 'Roastery Social',
  slug: 'roastery-social',
  logoUrl: null,
  timezone: 'Europe/Lisbon',
  requireReviewForAll: false,
  createdAt: '2026-09-28T10:00:00.000Z',
  myRole: 'owner',
};

describe('onboarding: create a workspace', () => {
  it('sends signed-out visitors to sign in and back', async () => {
    mockServer(signedOut);
    const { history } = renderApp('/onboarding');
    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    });
    expect(history.location.search).toContain('redirect=%2Fonboarding');
  });

  it('asks for a verified email first when the server requires one', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith({ emailVerified: false })],
    });
    const { history } = renderApp('/onboarding');
    expect(await screen.findByRole('heading', { name: 'Check your inbox' })).toBeInTheDocument();
    expect(history.location.pathname).toBe('/verify-email');
    expect(history.location.search).toContain('redirect=%2Fonboarding');
  });

  it('needs a name, then creates the workspace in the chosen time zone and opens it', async () => {
    let hasWorkspace = false;
    const calls = mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': () => [
        200,
        meWith(
          hasWorkspace
            ? {
                timezone: 'Asia/Tokyo',
                memberships: [
                  {
                    workspace: { ...halden.workspace, id: created.id, slug: created.slug },
                    role: 'owner',
                  },
                ],
                activeWorkspaceId: created.id,
              }
            : { timezone: 'Asia/Tokyo' },
        ),
      ],
      'POST /api/v1/workspaces': () => {
        hasWorkspace = true;
        return [201, created];
      },
    });
    const { history } = renderApp('/onboarding');
    const user = userEvent.setup();
    expect(
      await screen.findByRole('heading', { name: 'Set up your workspace' }),
    ).toBeInTheDocument();
    // The profile's time zone is the default.
    expect(screen.getByRole('button', { name: /Time zone/ })).toHaveTextContent('Tokyo');

    await user.click(screen.getByRole('button', { name: 'Create workspace' }));
    expect(await screen.findByText('Give the workspace a name.')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'POST /api/v1/workspaces')).toBe(false);

    await user.type(screen.getByLabelText('Workspace name'), '  Roastery Social ');
    await user.click(screen.getByRole('button', { name: /Time zone/ }));
    await user.type(await screen.findByRole('combobox', { name: /Search/ }), 'lisbon');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: /Time zone/ })).toHaveTextContent('Lisbon');
    await user.click(screen.getByRole('button', { name: 'Create workspace' }));

    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/roastery-social');
    });
    expect(calls.find((c) => c.key === 'POST /api/v1/workspaces')?.body).toEqual({
      name: 'Roastery Social',
      timezone: 'Europe/Lisbon',
    });
  });

  it('explains when the server wants the email verified first', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, { ...options, emailVerificationRequired: false }],
      'GET /api/v1/me': [200, meWith({ emailVerified: false })],
      'POST /api/v1/workspaces': [
        403,
        { error: { code: 'EMAIL_NOT_VERIFIED', message: 'Verify your email' } },
      ],
    });
    renderApp('/onboarding');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Workspace name'), 'Roastery');
    await user.click(screen.getByRole('button', { name: 'Create workspace' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Verify your email address before creating a workspace.',
    );
    expect(screen.getByRole('link', { name: 'Verify email' })).toHaveAttribute(
      'href',
      '/verify-email?redirect=%2Fonboarding',
    );
  });

  it('lets someone with a workspace create another, or go back to theirs', async () => {
    mockServer({
      'GET /api/v1/auth/options': [200, options],
      'GET /api/v1/me': [200, meWith({ memberships: [halden] })],
    });
    renderApp('/onboarding');
    expect(
      await screen.findByRole('heading', { name: 'Create another workspace' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Halden Coffee' })).toHaveAttribute(
      'href',
      '/w/halden',
    );
  });
});
