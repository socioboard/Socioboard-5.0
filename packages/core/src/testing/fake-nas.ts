// A stand-in for the NAS media API (platform/storage/nas.ts), as its docs describe it: POST
// /<bucket>/upload with a bearer token and form fields `key` and `file`; DELETE /<bucket>/<path>;
// public GET /<bucket>/<path>; GET /health. Files live in memory.
import { createServer, type IncomingMessage } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Readable } from 'node:stream';

export interface FakeNasFile {
  bytes: Buffer;
  contentType: string;
}

export interface FakeNas {
  /** NAS_API_URL: the server with its bucket. */
  apiUrl: string;
  /** NAS_PUBLIC_URL. */
  publicUrl: string;
  token: string;
  /** Stored files by their public path (`/<bucket>/<key>`). */
  files: Map<string, FakeNasFile>;
  /** Every request, as `METHOD path`. */
  calls: string[];
  /** Set to make the next uploads fail with this status (`times` of them; default 1). */
  failNextUpload: { status?: number; times?: number };
  close(): Promise<void>;
}

const BUCKET = 'socioboard-test';

export async function startFakeNas(): Promise<FakeNas> {
  const token = 'ak_test:sk_test';
  const files = new Map<string, FakeNasFile>();
  const calls: string[] = [];
  const failNextUpload: FakeNas['failNextUpload'] = {};
  const toRequest = (req: IncomingMessage) =>
    new Request(`http://nas${req.url ?? '/'}`, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: Readable.toWeb(req) as ReadableStream,
      duplex: 'half',
    } as RequestInit);

  /** Answers one request; returns the status and JSON body, or serves a file itself. */
  async function handle(
    req: IncomingMessage,
    path: string,
  ): Promise<[number, object] | FakeNasFile> {
    const authorized = req.headers.authorization === `Bearer ${token}`;
    if (req.method === 'GET' && path === '/health') return [200, { ok: true }];
    if (req.method === 'POST' && path === `/${BUCKET}/upload`) {
      if (!authorized) return [401, { ok: false, code: 'AUTH_REQUIRED' }];
      if (failNextUpload.status) {
        const status = failNextUpload.status;
        failNextUpload.times = (failNextUpload.times ?? 1) - 1;
        if (failNextUpload.times <= 0) {
          delete failNextUpload.status;
          delete failNextUpload.times;
        }
        return [status, { ok: false, code: 'BROKEN' }];
      }
      // Fine for a test double; a real server would stream with a multipart parser.
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const form = await toRequest(req).formData();
      const key = form.get('key');
      const file = form.get('file');
      if (typeof key !== 'string' || !(file instanceof Blob)) {
        return [400, { ok: false, code: 'BAD_FORM' }];
      }
      const stored = `/${BUCKET}${key.startsWith('/') ? key : `/${key}`}`;
      files.set(stored, {
        bytes: Buffer.from(await file.arrayBuffer()),
        contentType: file.type || 'application/octet-stream',
      });
      return [200, { ok: true, path: stored, size: file.size }];
    }
    if (req.method === 'DELETE' && path.startsWith(`/${BUCKET}/`)) {
      if (!authorized) return [401, { ok: false, code: 'AUTH_REQUIRED' }];
      return files.delete(path) ? [200, { ok: true }] : [404, { ok: false }];
    }
    if (req.method === 'GET') {
      return files.get(path) ?? [404, { ok: false, code: 'NOT_FOUND' }];
    }
    return [404, { ok: false, code: 'ROUTE_NOT_FOUND' }];
  }

  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://nas').pathname);
    calls.push(`${req.method ?? ''} ${path}`);
    handle(req, path)
      .catch((): [number, object] => [500, { ok: false }])
      .then(
        (answer) => {
          if (Array.isArray(answer)) {
            const [status, body] = answer;
            res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
          } else {
            res
              .writeHead(200, {
                'content-type': answer.contentType,
                'content-length': String(answer.bytes.length),
              })
              .end(answer.bytes);
          }
        },
        () => undefined,
      );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  const origin = `http://127.0.0.1:${String(port)}`;
  return {
    apiUrl: `${origin}/${BUCKET}`,
    publicUrl: origin,
    token,
    files,
    calls,
    failNextUpload,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  };
}
