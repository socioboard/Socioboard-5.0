// Test helpers: render the real app (routes, guards, providers) at a URL, against a fake server.
import { ThemeProvider } from '@socioboard/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import '../lib/i18n';
import { createQueryClient } from '../lib/query';
import { routeTree } from '../routeTree.gen';

export function renderApp(path: string) {
  const queryClient = createQueryClient();
  // Keep the app's own caching (staleTime) so tests see what users see; only skip retries.
  const defaults = queryClient.getDefaultOptions();
  queryClient.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, retry: false } });
  const history = createMemoryHistory({ initialEntries: [path] });
  const router = createRouter({ routeTree, context: { queryClient }, history });
  render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>,
  );
  return { router, history, queryClient };
}

type Reply = [status: number, body?: unknown];
export type Handler = (request: { body: unknown; url: URL }) => Reply;

/**
 * Fakes the server by "METHOD /path". Unhandled requests fail the test with a clear message.
 * Returns the calls made, for asserting on what was sent.
 */
export function mockServer(handlers: Record<string, Handler | Reply>) {
  const calls: { key: string; body: unknown }[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url, 'http://localhost');
    const key = `${request.method} ${url.pathname}`;
    const text = await request.text();
    const body: unknown = text ? JSON.parse(text) : undefined;
    calls.push({ key, body });
    const handler = handlers[key];
    if (!handler) throw new Error(`Unexpected request in test: ${key}`);
    const [status, reply] = typeof handler === 'function' ? handler({ body, url }) : handler;
    return new Response(reply === undefined ? null : JSON.stringify(reply), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  });
  return calls;
}

export const signedOut: Record<string, Reply> = {
  'GET /api/v1/me': [401, { error: { code: 'UNAUTHENTICATED', message: 'Sign in' } }],
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
};

export const meWith = (overrides: {
  emailVerified?: boolean;
  memberships?: {
    workspace: { id: string; name: string; slug: string; logoUrl: null };
    role: string;
  }[];
  activeWorkspaceId?: string | null;
}) => ({
  user: {
    id: '01a0d816-827a-74d6-a46e-409c7db36f92',
    email: 'priya@halden.test',
    emailVerified: overrides.emailVerified ?? true,
    name: 'Priya Raman',
    avatarUrl: null,
    timezone: null,
    locale: 'en',
    twoFactorEnabled: false,
    isPlatformAdmin: false,
    createdAt: '2026-09-28T10:00:00.000Z',
  },
  memberships: overrides.memberships ?? [],
  activeWorkspaceId: overrides.activeWorkspaceId ?? null,
});

export const halden = {
  workspace: {
    id: '01a0d816-827a-74d6-a46e-409c7db36f93',
    name: 'Halden Coffee',
    slug: 'halden',
    logoUrl: null,
  },
  role: 'owner',
};
