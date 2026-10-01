import type { Server as HttpServer } from 'node:http';

import {
  REALTIME_PATH,
  realtimeRooms,
  type ServerEventName,
  type ServerEventPayload,
  type ServerToClientEvents,
} from '@socioboard/contracts';
import { createAdapter } from '@socket.io/redis-adapter';
import { Emitter } from '@socket.io/redis-emitter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';

import type { Logger } from '../logger';

/**
 * Live updates to browsers (docs/backend/modules/notifications.md#websocket). Any process (the
 * API or the worker) sends a server event to a room through Valkey; the API's Socket.IO server
 * (P2-B11) delivers it to the sockets in that room. Fire and forget: a live update that can't be
 * sent is logged, never an error for the caller (the browser refetches anyway).
 */
export interface Realtime {
  /** `room` from the contracts' `realtimeRooms` (`user:<id>`, `workspace:<id>`). */
  emit<E extends ServerEventName>(room: string, event: E, payload: ServerEventPayload<E>): void;
  close(): void;
}

/** The Valkey channel prefix shared by the emitter and the Socket.IO server's adapter. */
export const realtimeKey = (prefix: string) => `${prefix}:socket.io`;

export function createRealtime({
  url,
  prefix,
  logger,
}: {
  url: string;
  prefix: string;
  logger: Logger;
}): Realtime {
  const client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 });
  // The emitter only publishes, and doesn't wait for or catch the result: a failed publish (Valkey
  // down) would be an unhandled rejection, so it gets a publish that logs instead.
  const publisher = {
    publish: (channel: string, message: string | Buffer) =>
      client.publish(channel, message).catch((err: unknown) => {
        logger.warn({ err }, 'live update not sent');
        return 0;
      }),
  };
  const emitter = new Emitter(publisher, { key: realtimeKey(prefix) });
  return {
    emit(room, event, payload) {
      emitter.to(room).emit(event, payload);
    },
    close() {
      client.disconnect();
    },
  };
}

export interface RealtimeServerDeps {
  url: string;
  prefix: string;
  /** Only browsers on the app's own origin may connect (a WebSocket isn't covered by CORS). */
  appUrl: string;
  logger: Logger;
  /** The signed-in user from the handshake's cookies. */
  resolveUser(headers: Headers): Promise<{ userId: string } | null>;
  /** The live workspaces the user belongs to, whose rooms they join. */
  workspacesOf(userId: string): Promise<string[]>;
}

export interface RealtimeServer {
  /** The user joins a workspace's room on every socket they have open (any API instance). */
  joinWorkspace(userId: string, workspaceId: string): void;
  /** The user leaves a workspace's room everywhere (removed from it). */
  leaveWorkspace(userId: string, workspaceId: string): void;
  /** Everyone leaves a workspace's room (it was deleted). */
  closeWorkspace(workspaceId: string): void;
  close(): Promise<void>;
}

/**
 * The API's Socket.IO server at REALTIME_PATH (notifications.md#websocket). A connection needs a
 * session cookie from the app's origin; it joins `user:<id>` and `workspace:<id>` for each of the
 * user's workspaces, and only listens: the browser sends nothing. The Valkey adapter, on the same
 * channels as the emitter, delivers events emitted by any process to sockets on any instance.
 */
export function createRealtimeServer(
  httpServer: HttpServer,
  deps: RealtimeServerDeps,
): RealtimeServer {
  const pub = new Redis(deps.url, { maxRetriesPerRequest: 3 });
  const sub = pub.duplicate();
  for (const client of [pub, sub]) {
    client.on('error', (err: unknown) => {
      deps.logger.warn({ err }, 'realtime Valkey connection error');
    });
  }
  const allowed = new URL(deps.appUrl).origin;
  const io = new Server<
    Record<string, never>,
    ServerToClientEvents,
    Record<string, never>,
    { userId: string }
  >(httpServer, {
    path: REALTIME_PATH,
    serveClient: false,
    cors: { origin: allowed, credentials: true },
    adapter: createAdapter(pub, sub, { key: realtimeKey(deps.prefix) }),
  });

  io.use((socket, next) => {
    const { headers } = socket.request;
    if (headers.origin !== allowed) {
      next(new Error('ORIGIN_NOT_ALLOWED'));
      return;
    }
    const h = new Headers();
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === 'string') h.set(k, v);
      else if (Array.isArray(v)) for (const one of v) h.append(k, one);
    }
    deps
      .resolveUser(h)
      .then(async (user) => {
        if (!user) {
          next(new Error('UNAUTHENTICATED'));
          return;
        }
        socket.data.userId = user.userId;
        await socket.join([
          realtimeRooms.user(user.userId),
          ...(await deps.workspacesOf(user.userId)).map(realtimeRooms.workspace),
        ]);
        next();
      })
      .catch((err: unknown) => {
        deps.logger.warn({ err }, 'realtime handshake failed');
        next(new Error('UNAVAILABLE'));
      });
  });

  return {
    joinWorkspace(userId, workspaceId) {
      io.in(realtimeRooms.user(userId)).socketsJoin(realtimeRooms.workspace(workspaceId));
    },
    leaveWorkspace(userId, workspaceId) {
      io.in(realtimeRooms.user(userId)).socketsLeave(realtimeRooms.workspace(workspaceId));
    },
    closeWorkspace(workspaceId) {
      io.in(realtimeRooms.workspace(workspaceId)).socketsLeave(
        realtimeRooms.workspace(workspaceId),
      );
    },
    /**
     * Disconnects every socket and the Valkey clients. Leaves the HTTP server alone (Socket.IO's
     * own `close()` would close it too, and the API's graceful close then fails).
     */
    close() {
      io.disconnectSockets(true);
      io.engine.close();
      pub.disconnect();
      sub.disconnect();
      return Promise.resolve();
    },
  };
}
