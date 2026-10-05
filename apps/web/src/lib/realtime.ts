// Live updates (docs/backend/modules/notifications.md, "WebSocket"): one Socket.IO connection per
// signed-in tab. The server sends, the app only listens; each event says what changed and the app
// refreshes it through the API, where permissions apply.
import {
  REALTIME_PATH,
  serverEvents,
  type ServerEventName,
  type ServerEventPayload,
} from '@socioboard/contracts';
import { useSyncExternalStore } from 'react';
import { io } from 'socket.io-client';

/** `live`: events arrive. Anything else: the app asks the API now and then instead. */
export type RealtimeStatus = 'connecting' | 'live' | 'offline';

let status: RealtimeStatus = 'offline';
const watchers = new Set<() => void>();
const setStatus = (next: RealtimeStatus) => {
  if (next === status) return;
  status = next;
  for (const watch of watchers) watch();
};

export const realtimeStatus = () => status;
/** Whether events arrive: screens then stop asking for news on a timer. */
export const isLive = () => status === 'live';

export function useRealtimeStatus(): RealtimeStatus {
  return useSyncExternalStore(
    (watch) => {
      watchers.add(watch);
      return () => watchers.delete(watch);
    },
    realtimeStatus,
    realtimeStatus,
  );
}

/** What the app does with each event; `resync` runs after a connection that was lost comes back. */
export type RealtimeHandlers = {
  [E in ServerEventName]?: (payload: ServerEventPayload<E>) => void;
} & {
  resync?: () => void;
  status?: (status: RealtimeStatus) => void;
};

/** The few calls the app makes on a socket (Socket.IO's client, or a fake in tests). */
export interface RealtimeSocket {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  disconnect(): unknown;
}

export type SocketFactory = () => RealtimeSocket;

/**
 * The browser's own WebSocket, same origin, with the session cookie. WebSocket only (no long
 * polling), so several API instances need no sticky sessions.
 */
export const defaultSocket: SocketFactory = () =>
  io({ path: REALTIME_PATH, transports: ['websocket'], withCredentials: true });

/**
 * Connects and hands each event, checked against its contract, to its handler (an event that
 * doesn't match is ignored). Socket.IO reconnects by itself; when it does, `resync` refreshes
 * whatever may have changed meanwhile. Returns the way to disconnect.
 */
export function connectRealtime(handlers: RealtimeHandlers, factory = defaultSocket): () => void {
  setStatus('connecting');
  handlers.status?.('connecting');
  const socket = factory();
  let connectedBefore = false;
  socket.on('connect', () => {
    setStatus('live');
    handlers.status?.('live');
    if (connectedBefore) handlers.resync?.();
    connectedBefore = true;
  });
  const drop = () => {
    setStatus('offline');
    handlers.status?.('offline');
  };
  socket.on('disconnect', drop);
  socket.on('connect_error', drop);
  for (const name of Object.keys(serverEvents) as ServerEventName[]) {
    socket.on(name, (raw: unknown) => {
      const parsed = serverEvents[name].safeParse(raw);
      if (!parsed.success) return;
      // Each name is paired with its own schema and handler.
      (handlers[name] as ((p: unknown) => void) | undefined)?.(parsed.data);
    });
  }
  return () => {
    socket.disconnect();
    setStatus('offline');
  };
}
