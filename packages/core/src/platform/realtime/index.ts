import type { ServerEventName, ServerEventPayload } from '@socioboard/contracts';
import { Emitter } from '@socket.io/redis-emitter';
import { Redis } from 'ioredis';

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
