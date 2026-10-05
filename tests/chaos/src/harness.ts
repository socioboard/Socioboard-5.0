// What the chaos suite drives: its own Valkey in Docker (killed without saving, like a crash with
// no persistence), the api and the worker as child processes (killed with SIGKILL), and an HTTP
// client with a session cookie.
import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import type { Sent } from './network';

const SRC = fileURLToPath(new URL('.', import.meta.url));

/** A free TCP port on this machine. */
export function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('no port'));
      });
    });
  });
}

/** Polls `check` until it's true, or fails after `timeoutMs`. */
export async function until(
  what: string,
  check: () => boolean | Promise<boolean>,
  timeoutMs = 60_000,
) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (await check()) return;
    await sleep(250);
  }
  throw new Error(`timed out waiting for ${what}`);
}

/** Valkey in a container of its own, without persistence: a kill loses every job. */
export class Valkey {
  readonly name: string;
  constructor(
    readonly port: number,
    run: string,
  ) {
    this.name = `sb-chaos-valkey-${run}`;
  }
  get url() {
    return `redis://127.0.0.1:${String(this.port)}`;
  }
  start() {
    execFileSync(
      'docker',
      [
        'run',
        '-d',
        '--name',
        this.name,
        '-p',
        `127.0.0.1:${String(this.port)}:6379`,
        'valkey/valkey:8-alpine',
        'valkey-server',
        '--save',
        '',
        '--appendonly',
        'no',
      ],
      { stdio: 'ignore' },
    );
  }
  /** A crash: the process dies, memory and every job with it. */
  kill() {
    execFileSync('docker', ['kill', this.name], { stdio: 'ignore' });
  }
  restart() {
    execFileSync('docker', ['start', this.name], { stdio: 'ignore' });
  }
  async ready() {
    await until('valkey', () => {
      try {
        return execFileSync('docker', ['exec', this.name, 'valkey-cli', 'ping'])
          .toString()
          .includes('PONG');
      } catch {
        return false;
      }
    });
  }
  remove() {
    try {
      execFileSync('docker', ['rm', '-f', this.name], { stdio: 'ignore' });
    } catch {
      // Already gone.
    }
  }
}

/** The api or the worker as a child process; `kill()` is SIGKILL, no shutdown. */
export class Child {
  private proc: ChildProcess | null = null;
  private starts = 0;
  constructor(
    private readonly entry: 'api.ts' | 'worker.ts',
    private readonly env: Record<string, string>,
    private readonly logDir: string,
    private readonly readyLine: string,
  ) {}

  async start() {
    this.starts += 1;
    const log = `${this.logDir}/${this.entry.replace('.ts', '')}-${String(this.starts)}.log`;
    const out = createWriteStream(log);
    const proc = spawn(process.execPath, ['--import', 'tsx', `${SRC}${this.entry}`], {
      cwd: `${SRC}..`,
      env: { ...process.env, ...this.env, LOG_LEVEL: 'info', NODE_ENV: 'development' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    proc.stdout.pipe(out);
    proc.stderr.pipe(out);
    this.proc = proc;
    await until(`${this.entry} to start`, () => {
      if (proc.exitCode !== null) throw new Error(`${this.entry} exited: see ${log}`);
      return existsSync(log) && readFileSync(log, 'utf8').includes(this.readyLine);
    });
  }

  kill() {
    this.proc?.kill('SIGKILL');
    this.proc = null;
  }

  get pid() {
    return this.proc?.pid;
  }
}

/** Every post the network received, from the ledger file. */
export function ledger(path: string): Sent[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Sent);
}

/** A signed-in browser against the api: the app's Origin and the session cookie on every call. */
export class Client {
  private cookie = '';
  constructor(
    private readonly base: string,
    private readonly origin: string,
  ) {}

  async call(method: string, path: string, body?: unknown) {
    const res = await fetch(`${this.base}${path}`, {
      method,
      headers: {
        Origin: this.origin,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const cookies = res.headers.getSetCookie().map((c) => c.split(';')[0]);
    if (cookies.length) this.cookie = cookies.join('; ');
    const text = await res.text();
    return { status: res.status, body: text ? (JSON.parse(text) as unknown) : null };
  }
}
