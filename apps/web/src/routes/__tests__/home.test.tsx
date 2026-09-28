import { ThemeProvider } from '@socioboard/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import '../../lib/i18n';
import { createQueryClient } from '../../lib/query';
import { routeTree } from '../../routeTree.gen';

function renderAt(path: string) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { retry: false } });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.className = '';
  localStorage.clear();
});

describe('start page', () => {
  it('shows the API as connected and signed out on 401', async () => {
    respond(401, { error: { code: 'UNAUTHENTICATED', message: 'Sign in first' } });
    renderAt('/');
    expect(await screen.findByText('Connected. You’re signed out.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The foundation is in place' })).toBeInTheDocument();
  });

  it('greets a signed-in user by name', async () => {
    respond(200, { user: { name: 'Priya Raman' }, memberships: [], activeWorkspaceId: null });
    renderAt('/');
    expect(await screen.findByText('Connected. Signed in as Priya Raman.')).toBeInTheDocument();
  });

  it('explains a server failure with the request id', async () => {
    respond(500, { error: { code: 'INTERNAL_ERROR', message: 'x', requestId: 'req-42' } });
    renderAt('/');
    expect(await screen.findByText(/req-42/)).toBeInTheDocument();
  });

  it('switches the theme', async () => {
    respond(401, { error: { code: 'UNAUTHENTICATED', message: 'x' } });
    renderAt('/');
    (await screen.findByRole('button', { name: 'Dark' })).click();
    await vi.waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
  });

  it('shows a not-found page for unknown paths', async () => {
    respond(401, {});
    renderAt('/nowhere');
    expect(
      await screen.findByRole('heading', { name: 'This page doesn’t exist' }),
    ).toBeInTheDocument();
  });
});
