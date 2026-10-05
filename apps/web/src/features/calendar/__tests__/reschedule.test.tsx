import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from '@socioboard/ui';
import '../../../lib/i18n';
import { WorkspaceContext } from '../../../lib/workspace';
import { halden, meWith, mockServer } from '../../../testing/render';
import { calendarKeys } from '../api';
import { useReschedule } from '../use-reschedule';
import { BASE, ENTRY, SECOND, POST, WID, NOW } from './fixtures';

const query = { from: '2026-10-01T00:00:00Z', to: '2026-11-01T00:00:00Z' };
const next = new Date('2026-10-07T08:30:00Z');
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const key = calendarKeys.range(WID, query);
  client.setQueryData(key, { items: [ENTRY, SECOND], truncated: false });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <WorkspaceContext.Provider
        value={{
          me: { ...meWith({}), memberships: [{ ...halden, role: 'owner' }] },
          workspace: halden.workspace,
          role: 'owner',
        }}
      >
        {children}
      </WorkspaceContext.Provider>
    </QueryClientProvider>
  );
  return { ...renderHook(useReschedule, { wrapper }), client, key };
}
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('moving one delivery', () => {
  it('sends the old time and saves only the selected target, then invalidates calendar and post caches', async () => {
    const calls = mockServer({
      [`PATCH ${BASE}/targets/${ENTRY.targetId}/schedule`]: [
        200,
        {
          ...POST,
          targets: POST.targets.map((x) =>
            x.id === ENTRY.targetId ? { ...x, scheduledAt: next.toISOString() } : x,
          ),
        },
      ],
    });
    const { result, client, key } = setup();
    let ok = false;
    await act(async () => {
      ok = await result.current.move(ENTRY, next);
    });
    expect(ok).toBe(true);
    expect(calls[0]?.body).toEqual({ at: next.toISOString(), previousAt: ENTRY.at });
    expect(client.getQueryData(key)).toMatchObject({
      items: [
        { targetId: ENTRY.targetId, at: next.toISOString() },
        { targetId: SECOND.targetId, at: SECOND.at },
      ],
    });
    expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  });
  it('shows a pending move, rejects a second write on that target, and rolls back on failure', async () => {
    let answer!: (reply: [number, unknown]) => void;
    const calls = mockServer({
      [`PATCH ${BASE}/targets/${ENTRY.targetId}/schedule`]: () =>
        new Promise((resolve) => {
          answer = resolve;
        }),
    });
    const { result, client, key } = setup();
    let write!: Promise<boolean>;
    act(() => {
      write = result.current.move(ENTRY, next);
    });
    await waitFor(() => {
      expect(calls).toHaveLength(1);
    });
    expect(result.current.moves.get(ENTRY.targetId)).toBe(next.toISOString());
    await act(async () => {
      expect(await result.current.move(ENTRY, new Date('2026-10-08T09:00:00Z'))).toBe(false);
    });
    expect(calls).toHaveLength(1);
    await act(async () => {
      answer([422, { error: { code: 'REVIEW_REQUIRED', message: 'Review' } }]);
      expect(await write).toBe(false);
    });
    expect(result.current.moves.size).toBe(0);
    expect(client.getQueryData(key)).toMatchObject({
      items: [{ at: ENTRY.at }, { at: SECOND.at }],
    });
  });
  it('uses the server time on a conflict rather than restoring stale time', async () => {
    mockServer({
      [`PATCH ${BASE}/targets/${ENTRY.targetId}/schedule`]: [
        409,
        {
          error: {
            code: 'SCHEDULE_CHANGED',
            message: 'Moved',
            details: { at: next.toISOString() },
          },
        },
      ],
    });
    const error = vi.spyOn(toast, 'error');
    const { result, client, key } = setup();
    await act(async () => {
      expect(await result.current.move(ENTRY, new Date('2026-10-08T08:30:00Z'))).toBe(false);
    });
    expect(client.getQueryData(key)).toMatchObject({
      items: [{ at: next.toISOString() }, { at: SECOND.at }],
    });
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Someone moved this delivery'));
  });
  it('removes a conflicting delivery which moved outside the viewed period', async () => {
    mockServer({
      [`PATCH ${BASE}/targets/${ENTRY.targetId}/schedule`]: [
        409,
        {
          error: {
            code: 'SCHEDULE_CHANGED',
            message: 'Moved',
            details: { at: '2026-11-02T09:00:00Z' },
          },
        },
      ],
    });
    const { result, client, key } = setup();
    await act(async () => {
      await result.current.move(ENTRY, next);
    });
    expect(client.getQueryData(key)).toMatchObject({ items: [SECOND] });
  });
  it('rejects past times and already published deliveries without making a request', async () => {
    const calls = mockServer({});
    const { result } = setup();
    await act(async () => {
      expect(await result.current.move(ENTRY, NOW)).toBe(false);
      expect(await result.current.move({ ...ENTRY, status: 'published' }, next)).toBe(false);
    });
    expect(calls).toHaveLength(0);
  });
  it('a move offers Undo: a move back, sent with the new time as previousAt, not itself undoable', async () => {
    const replies = (at: string) => [
      200,
      {
        ...POST,
        targets: POST.targets.map((x) => (x.id === ENTRY.targetId ? { ...x, scheduledAt: at } : x)),
      },
    ];
    let count = 0;
    const calls = mockServer({
      [`PATCH ${BASE}/targets/${ENTRY.targetId}/schedule`]: () => {
        count += 1;
        return replies(count === 1 ? next.toISOString() : ENTRY.at) as [number, unknown];
      },
    });
    const success = vi.spyOn(toast, 'success');
    const { result } = setup();
    await act(async () => {
      await result.current.move(ENTRY, next);
    });
    const [, options] = success.mock.calls[0] ?? [];
    const undo = (options as { action?: { label: string; onClick: () => void } } | undefined)
      ?.action;
    expect(undo?.label).toBe('Undo');
    await act(async () => {
      undo?.onClick();
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => {
      expect(calls).toHaveLength(2);
    });
    expect(calls[1]?.body).toEqual({ at: ENTRY.at, previousAt: next.toISOString() });
    await waitFor(() => {
      expect(success).toHaveBeenCalledTimes(2);
    });
    expect(success.mock.calls[1]?.[0]).toMatch(/is back at/);
    expect(success.mock.calls[1]?.[1]).toEqual({});
  });
});
