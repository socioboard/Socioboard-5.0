// NAS storage (STORAGE_DRIVER=nas; docs/backend/modules/media.md, "NAS storage"): a NAS behind a
// small HTTP API that uploads (POST <api>/upload, form fields `key` and `file`) and deletes
// (DELETE <api>/<path>) with a bearer token, and serves every file publicly at
// <public url><path>, without expiry.
//
// The app's Storage contract is S3's, so this fills the gaps:
// - Browsers can't hold the NAS token, so "presigned" uploads point at our own API
//   (PUT /api/storage/upload/<signed token>): the file waits in STORAGE_TEMP_DIR, then the API
//   sends it on. Large files arrive in parts and are joined before sending.
// - The NAS can't say what it holds, so StoredObject rows keep each file's path, size and type
//   (for head(), and for deleting a folder key by key).
// - Reads are the NAS's public URLs: "presigned" GETs don't expire.
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createWriteStream, openAsBlob } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import type { Db } from '../db';
import type { ObjectInfo, Storage } from './types';

export interface NasStorageConfig {
  driver: 'nas';
  /** Upload/delete endpoint with its bucket, e.g. http://host:8119/socioboard-dev */
  apiUrl: string;
  /** Public base the NAS serves files from, e.g. https://media.example.com */
  publicUrl: string;
  token: string;
  tempDir: string | undefined;
}

export interface NasStorageDeps {
  db: Db;
  /** APP_URL: browsers reach the upload route on the app's own origin. */
  appUrl: string;
  /** AUTH_SECRET; a label keeps these signatures apart from anything else signed with it. */
  secret: string;
  fetch?: typeof fetch;
}

/** Why a browser upload was refused; the route answers with `status`. */
export class UploadRefused extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'UploadRefused';
  }
}

/** The path browsers upload to; the API mounts it when the storage takes uploads itself. */
export const STORAGE_UPLOAD_PATH = '/api/storage/upload';

/** A part may be this much larger than MULTIPART_PART_BYTES (16 MB) before it's refused. */
const MAX_PART_BYTES = 64 * 1024 * 1024;
const FIFTEEN_MINUTES = 15 * 60;
/**
 * Tries per upload: the NAS has refused a connection for a moment under load (seen on staging,
 * 2026-10-06), so a send that couldn't connect or got a 5xx is tried again after a short wait. A
 * 4xx (a bad token, a name the NAS refuses) is final.
 */
export const NAS_UPLOAD_TRIES = 3;
const RETRY_WAIT_MS = [500, 1500];
const ONE_HOUR = 60 * 60;

/** What an upload URL's token carries: which file, and what the upload must be. */
interface UploadGrant {
  /** Storage key. */
  k: string;
  /** Expiry, seconds since the epoch. */
  e: number;
  /** Single upload: the content type and exact size it must have. */
  t?: string;
  l?: number;
  /** Multipart: the upload id and part number. */
  u?: string;
  n?: number;
}

const SAFE_ID = /^[0-9a-f-]{36}$/;

/** The NAS's own name for a file: the app's key under the bucket, with a leading slash. */
const nasKeyFor = (key: string) => `/${key}`;

/** Finds the stored path in the NAS's upload answer (`path`, else `key` or a URL). */
export function pathFromUploadAnswer(answer: unknown, fallbackKey: string): string {
  const pick = (o: unknown): string | undefined => {
    if (!o || typeof o !== 'object') return undefined;
    const r = o as Record<string, unknown>;
    for (const name of ['path', 'key', 'url', 'location', 'file']) {
      const v = r[name];
      if (typeof v === 'string' && v.length > 0) return v;
    }
    return pick(r.data) ?? pick(r.result);
  };
  const found = pick(answer) ?? fallbackKey;
  const path = /^https?:\/\//.test(found) ? new URL(found).pathname : found;
  return path.startsWith('/') ? path : `/${path}`;
}

export function createNasStorage(config: NasStorageConfig, deps: NasStorageDeps): Storage {
  const http = deps.fetch ?? fetch;
  const { db } = deps;
  const tempRoot = config.tempDir ?? join(tmpdir(), 'socioboard-uploads');
  const bucket = config.apiUrl.split('/').pop() ?? '';
  const appUrl = deps.appUrl.replace(/\/+$/, '');
  const auth = { authorization: `Bearer ${config.token}` };

  const mac = (payload: string) =>
    createHmac('sha256', deps.secret).update(`storage-upload:${payload}`).digest('base64url');
  const sign = (grant: UploadGrant) => {
    const payload = Buffer.from(JSON.stringify(grant)).toString('base64url');
    return `${appUrl}${STORAGE_UPLOAD_PATH}/${payload}.${mac(payload)}`;
  };
  const verify = (token: string): UploadGrant => {
    const [payload = '', sig = ''] = token.split('.');
    const expected = Buffer.from(mac(payload));
    const given = Buffer.from(sig);
    if (payload === '' || given.length !== expected.length || !timingSafeEqual(given, expected)) {
      throw new UploadRefused(403, 'This upload link is not valid');
    }
    const grant = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as UploadGrant;
    if (grant.e * 1000 < Date.now()) throw new UploadRefused(403, 'This upload link has expired');
    return grant;
  };

  const partsDir = (uploadId: string) => {
    if (!SAFE_ID.test(uploadId)) throw new Error('Not an upload id');
    return join(tempRoot, `mp-${uploadId}`);
  };
  const publicUrlOf = (path: string) =>
    `${config.publicUrl}${path.split('/').map(encodeURIComponent).join('/')}`;
  /** DELETE takes the path under the bucket (the upload answer may include the bucket). */
  const deleteUrlOf = (path: string) => {
    const under = path.startsWith(`/${bucket}/`) ? path.slice(bucket.length + 1) : path;
    return `${config.apiUrl}${under.split('/').map(encodeURIComponent).join('/')}`;
  };

  /** Sends a file to the NAS and records where it went. */
  async function send(key: string, file: Blob, contentType: string, size: number) {
    let res: Response | undefined;
    let text = '';
    for (let attempt = 1; ; attempt++) {
      // A new form each time: a file-backed Blob can be read again, a sent body can't.
      const form = new FormData();
      form.set('key', nasKeyFor(key));
      form.set('file', file, key.split('/').pop() ?? 'file');
      try {
        res = await http(`${config.apiUrl}/upload`, { method: 'POST', headers: auth, body: form });
        text = await res.text();
        if (res.ok || res.status < 500) break;
      } catch (err) {
        if (attempt >= NAS_UPLOAD_TRIES) throw err;
      }
      if (attempt >= NAS_UPLOAD_TRIES) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_WAIT_MS[attempt - 1] ?? 1500));
    }
    if (!res?.ok) {
      throw new Error(`NAS upload failed (${String(res?.status)}): ${text.slice(0, 200)}`);
    }
    let answer: unknown = null;
    try {
      answer = JSON.parse(text);
    } catch {
      // Not JSON: the key is the path.
    }
    const path = pathFromUploadAnswer(answer, nasKeyFor(key));
    await db.client.storedObject.upsert({
      where: { key },
      create: { key, path, size, contentType },
      update: { path, size, contentType },
    });
  }

  async function removeFromNas(path: string) {
    const res = await http(deleteUrlOf(path), { method: 'DELETE', headers: auth });
    // Already gone counts as deleted.
    if (!res.ok && res.status !== 404) {
      throw new Error(
        `NAS delete failed (${String(res.status)}): ${(await res.text()).slice(0, 200)}`,
      );
    }
  }

  /** Writes a request body to `file`, refusing more than `max` bytes; returns its MD5 and size. */
  async function receive(body: Readable, file: string, max: number) {
    const md5 = createHash('md5');
    let size = 0;
    body.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > max) body.destroy(new UploadRefused(413, 'The file is larger than allowed'));
      md5.update(chunk);
    });
    try {
      await pipeline(body, createWriteStream(file));
    } catch (err) {
      await rm(file, { force: true });
      throw err instanceof UploadRefused ? err : new UploadRefused(400, 'The upload was cut off');
    }
    return { etag: `"${md5.digest('hex')}"`, size };
  }

  return {
    bucket,

    presignPut: (key, contentType, { expiresInSec = FIFTEEN_MINUTES, contentLength } = {}) =>
      Promise.resolve(
        sign({
          k: key,
          t: contentType,
          ...(contentLength === undefined ? {} : { l: contentLength }),
          e: Math.floor(Date.now() / 1000) + expiresInSec,
        }),
      ),

    async createMultipart(key, contentType) {
      const uploadId = randomUUID();
      const dir = partsDir(uploadId);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'upload.json'), JSON.stringify({ key, contentType }));
      return uploadId;
    },

    presignPart: (key, uploadId, partNumber, expiresIn = ONE_HOUR) =>
      Promise.resolve(
        sign({ k: key, u: uploadId, n: partNumber, e: Math.floor(Date.now() / 1000) + expiresIn }),
      ),

    async completeMultipart(key, uploadId, parts) {
      const dir = partsDir(uploadId);
      const upload = JSON.parse(await readFile(join(dir, 'upload.json'), 'utf8')) as {
        key: string;
        contentType: string;
      };
      if (upload.key !== key) throw new Error('This upload is for another file');
      const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
      const blobs: Blob[] = [];
      let size = 0;
      for (const [i, part] of sorted.entries()) {
        if (part.partNumber !== i + 1) throw new Error(`Part ${String(i + 1)} is missing`);
        const file = join(dir, `${String(part.partNumber)}.part`);
        const etag = await readFile(`${file}.etag`, 'utf8').catch(() => null);
        if (etag !== part.etag) throw new Error(`Part ${String(part.partNumber)} doesn't match`);
        size += (await stat(file)).size;
        blobs.push(await openAsBlob(file));
      }
      await send(key, new Blob(blobs, { type: upload.contentType }), upload.contentType, size);
      await rm(dir, { recursive: true, force: true });
    },

    async abortMultipart(_key, uploadId) {
      await rm(partsDir(uploadId), { recursive: true, force: true });
    },

    async presignGet(key) {
      const row = await db.client.storedObject.findUnique({ where: { key } });
      return publicUrlOf(row?.path ?? nasKeyFor(key));
    },

    async head(key): Promise<ObjectInfo | undefined> {
      const row = await db.client.storedObject.findUnique({ where: { key } });
      return row ? { size: row.size, contentType: row.contentType, etag: row.path } : undefined;
    },

    async put(key, body, contentType) {
      await send(key, new Blob([body], { type: contentType }), contentType, body.length);
    },

    async getBytes(key, maxBytes) {
      const row = await db.client.storedObject.findUnique({ where: { key } });
      if (!row) throw new Error(`Object ${key} isn't stored`);
      if (row.size > maxBytes) {
        throw new Error(`Object ${key} is larger than ${String(maxBytes)} bytes`);
      }
      const res = await http(publicUrlOf(row.path));
      if (!res.ok) throw new Error(`NAS read failed (${String(res.status)}) for ${key}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length > maxBytes) {
        throw new Error(`Object ${key} is larger than ${String(maxBytes)} bytes`);
      }
      return bytes;
    },

    async delete(key) {
      const row = await db.client.storedObject.findUnique({ where: { key } });
      if (!row) return;
      await removeFromNas(row.path);
      await db.client.storedObject.delete({ where: { key } }).catch(() => undefined);
    },

    async deletePrefix(prefix) {
      // A slip here would empty the store: only whole folders, never "" or a bare word.
      if (!/^[^/]+\/.+\/$|^[^/]+\/$/.test(prefix) || prefix.length < 12) {
        throw new Error(`Refusing to delete by prefix "${prefix}"`);
      }
      const rows = await db.client.storedObject.findMany({
        where: { key: { startsWith: prefix } },
        select: { key: true, path: true },
      });
      for (const row of rows) {
        await removeFromNas(row.path);
        await db.client.storedObject.delete({ where: { key: row.key } }).catch(() => undefined);
      }
      return rows.length;
    },

    async ping() {
      try {
        const res = await http(`${new URL(config.apiUrl).origin}/health`, {
          signal: AbortSignal.timeout(5000),
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async acceptUpload(token, body, headers) {
      const grant = verify(token);
      await mkdir(tempRoot, { recursive: true });
      if (grant.u !== undefined && grant.n !== undefined) {
        const file = join(partsDir(grant.u), `${String(grant.n)}.part`);
        await stat(partsDir(grant.u)).catch(() => {
          throw new UploadRefused(404, 'This upload was cancelled or has finished');
        });
        const { etag } = await receive(body, file, MAX_PART_BYTES);
        await writeFile(`${file}.etag`, etag);
        return { etag };
      }
      // A single upload must be what it was signed for.
      if (headers.contentType !== grant.t) {
        throw new UploadRefused(400, 'The Content-Type differs from the one the link was made for');
      }
      if (grant.l !== undefined && headers.contentLength !== grant.l) {
        throw new UploadRefused(400, 'The file size differs from the one the link was made for');
      }
      const file = join(tempRoot, `single-${randomUUID()}`);
      try {
        const { etag, size } = await receive(body, file, grant.l ?? MAX_PART_BYTES);
        if (grant.l !== undefined && size !== grant.l) {
          throw new UploadRefused(400, 'The upload was cut off');
        }
        await send(grant.k, await openAsBlob(file, { type: grant.t ?? '' }), grant.t ?? '', size);
        return { etag };
      } finally {
        await rm(file, { force: true });
      }
    },

    close: () => undefined,
  };
}
