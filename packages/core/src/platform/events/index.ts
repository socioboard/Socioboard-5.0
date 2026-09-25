import type { Logger } from '../logger';

type Handler<P> = (payload: P) => void | Promise<void>;

export interface EventBus<Events extends Record<string, unknown>> {
  /** Subscribe; returns an unsubscribe function. */
  on<K extends keyof Events & string>(name: K, handler: Handler<Events[K]>): () => void;
  /**
   * In-process delivery. Waits for every handler; a failing handler is logged and does not
   * stop the others or the caller. Use for side effects that may be lost on a crash.
   */
  emit<K extends keyof Events & string>(name: K, payload: Events[K]): Promise<void>;
  /**
   * Durable delivery: also hands the event to the queue so a worker processes it even if this
   * process dies. Needs `durable` in createEventBus options.
   */
  emitDurable<K extends keyof Events & string>(name: K, payload: Events[K]): Promise<void>;
}

export interface CreateEventBusOptions {
  logger: Logger;
  /** Enqueues an event for background processing (wired to BullMQ by the app). */
  durable?: (name: string, payload: unknown) => Promise<void>;
}

/** Typed in-process event bus. Modules declare their events as a map of name → payload. */
export function createEventBus<Events extends Record<string, unknown>>({
  logger,
  durable,
}: CreateEventBusOptions): EventBus<Events> {
  const handlers = new Map<string, Set<Handler<never>>>();

  const bus: EventBus<Events> = {
    on(name, handler) {
      let set = handlers.get(name);
      if (!set) handlers.set(name, (set = new Set()));
      set.add(handler);
      return () => set.delete(handler);
    },

    async emit(name, payload) {
      const set = handlers.get(name);
      if (!set || set.size === 0) return;
      const results = await Promise.allSettled(
        [...set].map(async (h) => {
          await (h as Handler<Events[typeof name]>)(payload);
        }),
      );
      for (const r of results) {
        if (r.status === 'rejected')
          logger.error({ err: r.reason, event: name }, 'event handler failed');
      }
    },

    async emitDurable(name, payload) {
      if (!durable) throw new Error(`emitDurable("${name}"): no durable sink configured`);
      await durable(name, payload);
      await bus.emit(name, payload);
    },
  };
  return bus;
}

/**
 * A module's typed view of the app-wide bus (createPlatform's `events`). Event names are plain
 * strings at runtime; this only adds the module's payload types.
 */
export function typedEvents<Events extends Record<string, unknown>>(
  bus: EventBus<Record<string, unknown>>,
): EventBus<Events> {
  return bus as unknown as EventBus<Events>;
}
