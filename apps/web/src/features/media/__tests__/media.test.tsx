import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../lib/api';
import { notifySignedOut } from '../../../lib/session';
import { halden, meWith, mockServer, renderApp } from '../../../testing/render';
import { checkFile, uploadMedia } from '../upload';
import { resetUploads } from '../uploads';

const WID = halden.workspace.id;
const MB = 1024 * 1024;
const options = { socialProviders: [], emailVerificationRequired: true };

/** A file of `size` bytes without allocating them. */
function fakeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/** Stands in for XMLHttpRequest: records each PUT, reports progress, answers 200 with an ETag. */
class FakeXhr {
  static sent: { url: string; headers: Record<string, string>; size: number }[] = [];
  static etag: ((url: string) => string | null) | null = (url) => `"etag-${url.slice(-1)}"`;
  upload: { onprogress: ((e: { loaded: number }) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0;
  private url = '';
  private headers: Record<string, string> = {};
  open(_method: string, url: string) {
    this.url = url;
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  getResponseHeader(name: string) {
    return name === 'ETag' && FakeXhr.etag ? FakeXhr.etag(this.url) : null;
  }
  abort() {
    this.onabort?.();
  }
  send(body: Blob) {
    FakeXhr.sent.push({ url: this.url, headers: this.headers, size: body.size });
    queueMicrotask(() => {
      this.upload.onprogress?.({ loaded: body.size / 2 });
      this.status = 200;
      this.onload?.();
    });
  }
}

beforeEach(() => {
  FakeXhr.sent = [];
  FakeXhr.etag = (url) => `"etag-${url.slice(-1)}"`;
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
});
afterEach(() => {
  resetUploads();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const asset = (overrides: object = {}) => ({
  id: '01a0d816-827a-74d6-a46e-409c7db36fb1',
  name: 'tulip-latte.jpg',
  kind: 'image',
  mime: 'image/jpeg',
  sizeBytes: 312_000,
  width: 1080,
  height: 1080,
  durationSec: null,
  status: 'ready',
  source: 'upload',
  altText: null,
  folderId: null,
  thumbnailUrl: 'https://media.test/thumb.webp',
  uploadedBy: { id: 'u', name: 'Priya Raman' },
  createdAt: '2026-09-28T10:00:00.000Z',
  ...overrides,
});

describe('checkFile', () => {
  it('uses the API’s own limits: types, and size per kind', () => {
    expect(checkFile(fakeFile('a.jpg', 'image/jpeg', 5 * MB))).toBeNull();
    expect(checkFile(fakeFile('a.svg', 'image/svg+xml', 1))).toEqual({ code: 'type' });
    expect(checkFile(fakeFile('a.png', 'image/png', 21 * MB))).toMatchObject({
      code: 'size',
      kind: 'image',
      maxBytes: 20 * MB,
    });
    expect(checkFile(fakeFile('a.mp4', 'video/mp4', 500 * MB))).toBeNull();
  });
});

describe('uploadMedia', () => {
  it('sends a small file in one PUT with the given headers, then completes', async () => {
    const calls = mockServer({
      [`POST /api/v1/workspaces/${WID}/media/uploads`]: [
        201,
        {
          asset: asset({ status: 'uploading' }),
          upload: {
            type: 'single',
            url: 'https://s3.test/put-1',
            headers: { 'Content-Type': 'image/jpeg' },
          },
          expiresAt: '2026-09-28T11:00:00.000Z',
        },
      ],
      [`POST /api/v1/workspaces/${WID}/media/uploads/${asset().id}/complete`]: [
        200,
        asset({ status: 'processing' }),
      ],
    });
    const progress: number[] = [];
    const result = await uploadMedia(WID, fakeFile('latte.jpg', 'image/jpeg', 4 * MB), {
      folderId: 'f-1',
      signal: new AbortController().signal,
      onProgress: (p) => progress.push(p),
    });
    expect(result.status).toBe('processing');
    expect(FakeXhr.sent).toEqual([
      { url: 'https://s3.test/put-1', headers: { 'Content-Type': 'image/jpeg' }, size: 4 * MB },
    ]);
    expect(progress).toEqual([50, 100]);
    expect(calls[0]?.body).toEqual({
      fileName: 'latte.jpg',
      mime: 'image/jpeg',
      sizeBytes: 4 * MB,
      folderId: 'f-1',
    });
  });

  it('sends a large file in parts and completes with every ETag, in order', async () => {
    // The server sets the part size; a tiny one lets the test use a real 10-byte file.
    const calls = mockServer({
      [`POST /api/v1/workspaces/${WID}/media/uploads`]: [
        201,
        {
          asset: asset({ status: 'uploading', kind: 'video', mime: 'video/mp4' }),
          upload: {
            type: 'multipart',
            partSize: 4,
            parts: [1, 2, 3].map((n) => ({
              partNumber: n,
              url: `https://s3.test/part-${String(n)}`,
            })),
          },
          expiresAt: '2026-09-28T11:00:00.000Z',
        },
      ],
      [`POST /api/v1/workspaces/${WID}/media/uploads/${asset().id}/complete`]: [
        200,
        asset({ status: 'processing' }),
      ],
    });
    await uploadMedia(WID, new File(['0123456789'], 'reel.mp4', { type: 'video/mp4' }), {
      signal: new AbortController().signal,
      onProgress: () => undefined,
    });
    expect(
      FakeXhr.sent
        .map((s) => [s.url, s.size])
        .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
    ).toEqual([
      ['https://s3.test/part-1', 4],
      ['https://s3.test/part-2', 4],
      ['https://s3.test/part-3', 2],
    ]);
    expect(calls.at(-1)?.body).toEqual({
      parts: [
        { partNumber: 1, etag: '"etag-1"' },
        { partNumber: 2, etag: '"etag-2"' },
        { partNumber: 3, etag: '"etag-3"' },
      ],
    });
  });

  it('fails clearly when storage hides the ETag (bucket CORS)', async () => {
    FakeXhr.etag = null;
    mockServer({
      [`POST /api/v1/workspaces/${WID}/media/uploads`]: [
        201,
        {
          asset: asset({ status: 'uploading' }),
          upload: {
            type: 'multipart',
            partSize: 16 * MB,
            parts: [{ partNumber: 1, url: 'https://s3.test/part-1' }],
          },
          expiresAt: '2026-09-28T11:00:00.000Z',
        },
      ],
    });
    await expect(
      uploadMedia(WID, fakeFile('reel.mp4', 'video/mp4', 17 * MB), {
        signal: new AbortController().signal,
        onProgress: () => undefined,
      }),
    ).rejects.toSatisfy((err) => err instanceof ApiError && err.code === 'UPLOAD_FAILED');
  });
});

const signedIn = (role = 'owner') => ({
  'GET /api/v1/auth/options': [200, options] as [number, unknown],
  'GET /api/v1/me': [
    200,
    meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID }),
  ] as [number, unknown],
  [`GET /api/v1/workspaces/${WID}/media/folders`]: [200, { items: [] }] as [number, unknown],
});

describe('uploads and signing out', () => {
  it('forgets pending and failed uploads when the session ends', async () => {
    mockServer({
      ...signedIn(),
      [`GET /api/v1/workspaces/${WID}/media`]: [200, { items: [], nextCursor: null }],
    });
    renderApp('/w/halden/media');
    await screen.findByText('No media yet');
    fireEvent.change(screen.getByTestId('media-file-input'), {
      target: { files: [fakeFile('private-plan.svg', 'image/svg+xml', 10)] },
    });
    expect(await screen.findByText('private-plan.svg')).toBeInTheDocument();
    act(() => {
      notifySignedOut();
    });
    await waitFor(() => {
      expect(screen.queryByText('private-plan.svg')).not.toBeInTheDocument();
    });
  });
});

describe('media library', () => {
  it('shows the grid and opens details, where alt text is saved', async () => {
    const calls = mockServer({
      ...signedIn(),
      [`GET /api/v1/workspaces/${WID}/media`]: [200, { items: [asset()], nextCursor: null }],
      [`GET /api/v1/workspaces/${WID}/media/${asset().id}`]: [
        200,
        { ...asset(), url: 'https://media.test/full.jpg' },
      ],
      [`PATCH /api/v1/workspaces/${WID}/media/${asset().id}`]: ({ body }) => [
        200,
        { ...asset(), ...(body as object) },
      ],
    });
    const { history } = renderApp('/w/halden/media');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /tulip-latte\.jpg/ }));
    expect(history.location.search).toContain(`asset=${asset().id}`);
    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByText('1080 × 1080')).toBeInTheDocument();
    await user.type(within(drawer).getByLabelText('Alt text'), 'A latte with a tulip pour');
    await user.click(within(drawer).getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
    expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
      altText: 'A latte with a tulip pour',
    });
  });

  it('lets viewers look but not upload or edit', async () => {
    mockServer({
      ...signedIn('viewer'),
      [`GET /api/v1/workspaces/${WID}/media`]: [
        200,
        { items: [asset({ altText: 'A latte' })], nextCursor: null },
      ],
      [`GET /api/v1/workspaces/${WID}/media/${asset().id}`]: [
        200,
        { ...asset({ altText: 'A latte' }), url: null },
      ],
    });
    renderApp(`/w/halden/media?asset=${asset().id}`);
    const drawer = await screen.findByRole('dialog');
    expect(await within(drawer).findByText('A latte')).toBeInTheDocument();
    expect(within(drawer).queryByLabelText('Alt text')).not.toBeInTheDocument();
    expect(within(drawer).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
  });

  it('refuses a file it can’t take, without sending anything, and says why', async () => {
    const calls = mockServer({
      ...signedIn(),
      [`GET /api/v1/workspaces/${WID}/media`]: [200, { items: [], nextCursor: null }],
    });
    renderApp('/w/halden/media');
    await screen.findByText('No media yet');
    fireEvent.change(screen.getByTestId('media-file-input'), {
      target: { files: [fakeFile('big.png', 'image/png', 25 * MB)] },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too large: Image files can be up to 20 MB.',
    );
    expect(calls.some((c) => c.key.includes('/media/uploads'))).toBe(false);
  });

  it('uploads into the open folder and shows the new file when done', async () => {
    let uploaded = false;
    const calls = mockServer({
      ...signedIn(),
      [`GET /api/v1/workspaces/${WID}/media/folders`]: [
        200,
        {
          items: [
            {
              id: 'f-autumn',
              name: 'Autumn campaign',
              parentId: null,
              createdAt: '2026-09-28T10:00:00.000Z',
            },
          ],
        },
      ],
      [`GET /api/v1/workspaces/${WID}/media`]: () => [
        200,
        {
          items: uploaded ? [asset({ name: 'harvest.jpg', folderId: 'f-autumn' })] : [],
          nextCursor: null,
        },
      ],
      [`POST /api/v1/workspaces/${WID}/media/uploads`]: [
        201,
        {
          asset: asset({ status: 'uploading' }),
          upload: {
            type: 'single',
            url: 'https://s3.test/put',
            headers: { 'Content-Type': 'image/jpeg' },
          },
          expiresAt: '2026-09-28T11:00:00.000Z',
        },
      ],
      [`POST /api/v1/workspaces/${WID}/media/uploads/${asset().id}/complete`]: () => {
        uploaded = true;
        return [200, asset({ status: 'processing' })];
      },
    });
    renderApp('/w/halden/media?folder=f-autumn');
    expect(await screen.findByRole('button', { name: 'Autumn campaign' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.change(screen.getByTestId('media-file-input'), {
      target: { files: [fakeFile('harvest.jpg', 'image/jpeg', 2 * MB)] },
    });
    // Anchored: "Cancel upload of harvest.jpg" is also a button while it uploads.
    expect(await screen.findByRole('button', { name: /^harvest\.jpg/ })).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === `POST /api/v1/workspaces/${WID}/media/uploads`)?.body,
    ).toMatchObject({
      folderId: 'f-autumn',
    });
  });

  it('creates a folder and opens it', async () => {
    const calls = mockServer({
      ...signedIn(),
      [`GET /api/v1/workspaces/${WID}/media`]: [200, { items: [asset()], nextCursor: null }],
      [`POST /api/v1/workspaces/${WID}/media/folders`]: [
        201,
        { id: 'f-new', name: 'Brand kit', parentId: null, createdAt: '2026-09-28T10:00:00.000Z' },
      ],
    });
    const { history } = renderApp('/w/halden/media');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'New folder' }));
    await user.type(await screen.findByLabelText('Folder name'), 'Brand kit');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(history.location.search).toContain('folder=f-new');
    });
    expect(
      calls.find((c) => c.key.endsWith('/media/folders') && c.key.startsWith('POST'))?.body,
    ).toEqual({
      name: 'Brand kit',
    });
  });

  it('keeps filters in the URL and sends them to the server', async () => {
    const queries: URLSearchParams[] = [];
    mockServer({
      ...signedIn(),
      [`GET /api/v1/workspaces/${WID}/media`]: ({ url }) => {
        queries.push(url.searchParams);
        return [200, { items: [asset()], nextCursor: null }];
      },
    });
    renderApp('/w/halden/media?kind=video&q=reel&source=bogus');
    await screen.findByRole('button', { name: /^tulip-latte\.jpg/ });
    expect(screen.getByRole('combobox', { name: 'Type' })).toHaveTextContent('Videos');
    const sent = queries[0];
    expect(sent?.get('kind')).toBe('video');
    expect(sent?.get('q')).toBe('reel');
    // An unknown value is dropped, not passed on.
    expect(sent?.has('source')).toBe(false);
  });
});
