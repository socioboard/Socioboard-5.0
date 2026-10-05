// A stand-in for Socket.IO's client in unit tests (vitest.setup.ts mocks 'socket.io-client' with
// it): no network; tests connect, drop and send events by hand.
type Listener = (...args: unknown[]) => void;

export class FakeSocket {
  listeners = new Map<string, Listener[]>();
  disconnected = false;
  on(event: string, listener: Listener) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
    return this;
  }
  disconnect() {
    this.disconnected = true;
    return this;
  }
  /** What the server would do: `connect`, `disconnect`, or an event with its payload. */
  fire(event: string, ...args: unknown[]) {
    for (const listener of this.listeners.get(event) ?? []) listener(...args);
  }
}

/** Every socket the app opened, newest last. */
export const fakeSockets: FakeSocket[] = [];

export const fakeIo = () => {
  const socket = new FakeSocket();
  fakeSockets.push(socket);
  return socket;
};

/** The socket the app has open now. */
export function openSocket(): FakeSocket {
  const socket = fakeSockets.filter((s) => !s.disconnected).at(-1);
  if (!socket) throw new Error('The app has no socket open');
  return socket;
}
