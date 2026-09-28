import { apiRoutes } from '@socioboard/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ApiError, buildPath, buildQuery, createApiClient, NETWORK_ERROR } from '../api';

const WS = '01a0d816-827a-74d6-a46e-409c7db36f92';

function fakeFetch(status: number, body?: unknown, headers: Record<string, string> = {}) {
  return vi.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', ...headers },
      }),
    ),
  );
}

describe('buildPath and buildQuery', () => {
  it('fills and encodes path params', () => {
    const route = {
      method: 'GET',
      path: '/api/v1/a/:x/b/:y',
      access: 'user',
      summary: '',
      responses: {},
    } as const;
    expect(buildPath(route, { x: 'a b', y: 7 })).toBe('/api/v1/a/a%20b/b/7');
  });

  it('refuses a missing param instead of calling a wrong URL', () => {
    expect(() => buildPath(apiRoutes.workspaces.getWorkspace, {})).toThrow(
      /missing param "workspaceId"/,
    );
  });

  it('skips empty values and repeats arrays', () => {
    expect(buildQuery({ a: 1, b: undefined, c: null, d: ['x', 'y'], e: false })).toBe(
      '?a=1&d=x&d=y&e=false',
    );
    expect(buildQuery({})).toBe('');
  });
});

describe('createApiClient', () => {
  it('sends cookies, JSON and the typed path, and returns the body', async () => {
    const fetch = fakeFetch(200, { id: WS });
    const api = createApiClient({ fetch, baseUrl: 'https://app.test' });
    await api(apiRoutes.workspaces.updateWorkspace, {
      params: { workspaceId: WS },
      body: { name: 'Halden' },
    });
    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe(`https://app.test/api/v1/workspaces/${WS}`);
    expect(init).toMatchObject({
      method: 'PATCH',
      credentials: 'include',
      body: '{"name":"Halden"}',
    });
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('returns undefined for an empty success (204)', async () => {
    const api = createApiClient({
      fetch: vi.fn<typeof fetch>(() => Promise.resolve(new Response(null, { status: 204 }))),
    });
    await expect(
      api(apiRoutes.workspaces.deleteWorkspace, {
        params: { workspaceId: WS },
        body: { confirmName: 'Halden' },
      }),
    ).resolves.toBeUndefined();
  });

  it('turns the error envelope into an ApiError with code and request id', async () => {
    const api = createApiClient({
      fetch: fakeFetch(409, {
        error: { code: 'SLUG_TAKEN', message: 'That address is already taken', requestId: 'req-1' },
      }),
    });
    const err = await api(apiRoutes.workspaces.createWorkspace, {
      body: { name: 'Halden', timezone: 'UTC' },
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'SLUG_TAKEN', requestId: 'req-1' });
  });

  it('falls back to the response header and an HTTP_ code for non-envelope errors', async () => {
    const api = createApiClient({
      fetch: vi.fn<typeof fetch>(() =>
        Promise.resolve(
          new Response('<html>Bad gateway</html>', {
            status: 502,
            statusText: 'Bad Gateway',
            headers: { 'x-request-id': 'req-2' },
          }),
        ),
      ),
    });
    await expect(api(apiRoutes.auth.getMe)).rejects.toMatchObject({
      status: 502,
      code: 'HTTP_502',
      requestId: 'req-2',
    });
  });

  it('reports a dropped connection as NETWORK_ERROR, and passes aborts through', async () => {
    const down = createApiClient({
      fetch: vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch'))),
    });
    await expect(down(apiRoutes.auth.getMe)).rejects.toMatchObject({
      status: 0,
      code: NETWORK_ERROR,
    });
    const aborted = createApiClient({
      fetch: vi.fn<typeof fetch>(() => Promise.reject(new DOMException('aborted', 'AbortError'))),
    });
    await expect(aborted(apiRoutes.auth.getMe)).rejects.toMatchObject({ name: 'AbortError' });
  });
});
