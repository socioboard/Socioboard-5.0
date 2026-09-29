import type { Network, SocialAccount } from '@socioboard/contracts';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp } from '../../../testing/render';
import { resetUploads } from '../../media';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const ME = '01a0d816-827a-74d6-a46e-409c7db36f92';
type Reply = [number, unknown];

const network = (id: 'facebook_page' | 'instagram', maxChars: number) =>
  ({
    id,
    displayName: id === 'facebook_page' ? 'Facebook' : 'Instagram',
    capabilities: { postTypes: ['image'], firstComment: true, altText: true },
    rules: { maxChars, maxHashtags: null, maxMentions: null, media: {}, links: 'card' },
    preview: { truncateAt: 125, cropAspectRatio: null },
    logins: [{ provider: 'facebook', supportsAccountSelection: false }],
  }) as unknown as Network;

const account = (id: string, net: 'facebook_page' | 'instagram', name: string): SocialAccount => ({
  id,
  network: net,
  displayName: name,
  username: null,
  avatarUrl: null,
  status: 'active',
  connection: null,
  connectedBy: null,
  createdAt: '2026-09-28T10:00:00.000Z',
});
const FB = account('01a0d816-827a-74d6-a46e-409c7db31001', 'facebook_page', 'Halden Coffee');
const IG = account('01a0d816-827a-74d6-a46e-409c7db31002', 'instagram', 'Halden Gram');

const media = (id: string, name: string, overrides: object = {}) => ({
  id,
  name,
  kind: 'image',
  mime: 'image/jpeg',
  sizeBytes: 1000,
  width: 1080,
  height: 1080,
  durationSec: null,
  status: 'ready',
  source: 'upload',
  altText: null,
  folderId: null,
  thumbnailUrl: `https://media.test/${id}.webp`,
  uploadedBy: null,
  createdAt: '2026-09-28T10:00:00.000Z',
  url: null,
  ...overrides,
});
const M1 = media('01a0d816-827a-74d6-a46e-409c7db32001', 'latte.jpg');
const M2 = media('01a0d816-827a-74d6-a46e-409c7db32002', 'beans.jpg');

const base = (role = 'owner'): Record<string, Reply> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  'GET /api/v1/networks': [
    200,
    { items: [network('facebook_page', 63206), network('instagram', 2200)] },
  ],
  [`GET ${BASE}/accounts`]: [200, { items: [FB, IG] }],
  [`GET ${BASE}/media/${M1.id}`]: [200, M1],
  [`GET ${BASE}/media/${M2.id}`]: [200, M2],
});

/** Answers every storage PUT with 200 and an ETag (see the media tests). */
class FakeXhr {
  upload = { onprogress: null as ((e: { loaded: number }) => void) | null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0;
  open() {
    // nothing to record
  }
  setRequestHeader() {
    // nothing to record
  }
  getResponseHeader() {
    return '"etag"';
  }
  abort() {
    // never aborted here
  }
  send() {
    queueMicrotask(() => {
      this.status = 200;
      this.onload?.();
    });
  }
}

beforeEach(() => {
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
});
afterEach(() => {
  resetUploads();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('composer', () => {
  it('writes once, counts per network, and tailors one network without touching the others', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('button', { name: 'Halden Gram, Instagram' }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'Fresh roast');
    expect(screen.getByText('11 of 63,206 characters for Facebook')).toBeInTheDocument();
    expect(screen.getByText('11 of 2,200 characters for Instagram')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Instagram' }));
    const igText = screen.getByRole('textbox', { name: 'Text for Instagram' });
    expect(igText).toHaveValue('Fresh roast');
    expect(screen.getByText(/Using the shared text/)).toBeInTheDocument();
    await user.type(igText, ' ☕');
    expect(screen.getByRole('tab', { name: /Instagram \(customised\)/ })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'All networks' }));
    expect(screen.getByRole('textbox', { name: 'Text' })).toHaveValue('Fresh roast');
    expect(screen.getByText(/Instagram has its own text/)).toBeInTheDocument();
    expect(screen.queryByText(/characters for Instagram/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Instagram/ }));
    await user.click(screen.getByRole('button', { name: 'Reset to shared' }));
    expect(screen.getByRole('textbox', { name: 'Text for Instagram' })).toHaveValue('Fresh roast');
    expect(screen.getByRole('tab', { name: 'Instagram' })).toBeInTheDocument();
  });

  it('tabs move with the arrow keys, and a deselected network’s tab goes away', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('tab', { name: 'All networks' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Facebook' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Facebook' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Halden Coffee, Facebook' }));
    expect(screen.queryByRole('tab', { name: 'Facebook' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Text' })).toBeInTheDocument();
  });

  it('attaches files from the library in the order picked', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/media`]: [200, { items: [M1, M2], nextCursor: null }],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Choose from library' }));
    const dialog = await screen.findByRole('dialog', { name: 'Choose from library' });
    await user.click(await within(dialog).findByRole('button', { name: 'Select beans.jpg' }));
    await user.click(within(dialog).getByRole('button', { name: 'Select latte.jpg' }));
    await user.click(within(dialog).getByRole('button', { name: 'Attach 2 files' }));
    const strip = screen.getByRole('list', { name: 'Media' });
    await waitFor(() => {
      expect(
        within(strip)
          .getAllByRole('img')
          .map((i) => i.getAttribute('alt')),
      ).toEqual(['beans.jpg', 'latte.jpg']);
    });
    // Reorder: latte first.
    await user.click(within(strip).getByRole('button', { name: 'Move earlier: latte.jpg' }));
    expect(
      within(strip)
        .getAllByRole('img')
        .map((i) => i.getAttribute('alt')),
    ).toEqual(['latte.jpg', 'beans.jpg']);
    // Already attached files are shown as such next time.
    await user.click(screen.getByRole('button', { name: 'Choose from library' }));
    expect(await screen.findByRole('button', { name: 'latte.jpg, Attached' })).toBeDisabled();
  });

  it('a file uploaded from the composer is attached once it’s stored', async () => {
    const uploaded = media('01a0d816-827a-74d6-a46e-409c7db32009', 'fresh.jpg', {
      status: 'processing',
      thumbnailUrl: null,
    });
    mockServer({
      ...base(),
      [`POST ${BASE}/media/uploads`]: [
        201,
        {
          asset: { ...uploaded, status: 'uploading' },
          upload: { type: 'single', url: 'https://s3.test/put', headers: {} },
          expiresAt: '2026-09-28T11:00:00.000Z',
        },
      ],
      [`POST ${BASE}/media/uploads/${uploaded.id}/complete`]: [200, uploaded],
      [`GET ${BASE}/media/${uploaded.id}`]: [200, uploaded],
      [`GET ${BASE}/media`]: [200, { items: [], nextCursor: null }],
    });
    renderApp('/w/halden/compose');
    await screen.findByRole('button', { name: 'Upload' });
    fireEvent.change(screen.getByTestId('composer-file-input'), {
      target: { files: [new File(['x'], 'fresh.jpg', { type: 'image/jpeg' })] },
    });
    const strip = screen.getByRole('list', { name: 'Media' });
    expect(await within(strip).findByRole('status', { name: 'Processing' })).toBeInTheDocument();
    expect(within(strip).getByRole('img', { name: 'fresh.jpg' })).toBeInTheDocument();
  });

  it('a file still uploading shows on the tab it was started from, not on the others', async () => {
    // Storage never answers: the upload stays in progress for the whole test.
    vi.stubGlobal(
      'XMLHttpRequest',
      class extends FakeXhr {
        override send() {
          // left hanging
        }
      },
    );
    const pending = media('01a0d816-827a-74d6-a46e-409c7db32010', 'slow.jpg');
    mockServer({
      ...base(),
      [`POST ${BASE}/media/uploads`]: [
        201,
        {
          asset: { ...pending, status: 'uploading' },
          upload: { type: 'single', url: 'https://s3.test/put', headers: {} },
          expiresAt: '2026-09-28T11:00:00.000Z',
        },
      ],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Gram, Instagram' }));
    await user.click(screen.getByRole('tab', { name: 'Instagram' }));
    await user.click(screen.getByRole('button', { name: 'Use different media for Instagram' }));
    await user.click(screen.getByRole('tab', { name: /All networks/ }));
    fireEvent.change(screen.getByTestId('composer-file-input'), {
      target: { files: [new File(['x'], 'slow.jpg', { type: 'image/jpeg' })] },
    });
    const shared = screen.getByRole('list', { name: 'Media' });
    expect(await within(shared).findByRole('status', { name: 'Uploading' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Instagram/ }));
    const ig = screen.getByRole('list', { name: 'Media for Instagram' });
    expect(within(ig).queryByRole('status', { name: 'Uploading' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /All networks/ }));
    expect(
      within(screen.getByRole('list', { name: 'Media' })).getByRole('status', {
        name: 'Uploading',
      }),
    ).toBeInTheDocument();
  });

  it('checks the link is a web address once the field is left', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    const link = await screen.findByRole('textbox', { name: 'Link' });
    await user.type(link, 'halden.test');
    expect(screen.queryByText(/Enter a full web address/)).not.toBeInTheDocument();
    await user.tab();
    expect(
      screen.getByText('Enter a full web address, starting with https://'),
    ).toBeInTheDocument();
  });

  it('only Instagram offers feed, reel or story', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Gram, Instagram' }));
    expect(screen.queryByRole('radio', { name: /Reel/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Instagram' }));
    await user.click(screen.getByRole('radio', { name: /Reel/ }));
    expect(screen.getByRole('radio', { name: /Reel/ })).toBeChecked();
    expect(screen.getByRole('tab', { name: /Instagram \(customised\)/ })).toBeInTheDocument();
  });
});

const post = (overrides: object = {}) => ({
  id: '01a0d816-827a-74d6-a46e-409c7db33001',
  status: 'draft',
  text: 'Saved text',
  mediaIds: [],
  link: 'https://halden.test',
  firstComment: null,
  labelIds: [],
  author: { id: ME, name: 'Priya Raman', avatarUrl: null },
  createdAt: '2026-09-28T10:00:00.000Z',
  updatedAt: '2026-09-28T10:00:00.000Z',
  targets: [
    {
      id: 't1',
      account: { ...FB },
      override: null,
      status: 'pending',
      scheduledAt: null,
      externalPostId: null,
      permalink: null,
      attempts: 0,
      lastError: null,
      publishedAt: null,
      history: [],
    },
    {
      id: 't2',
      account: { ...IG },
      override: { text: 'Saved for Instagram' },
      status: 'pending',
      scheduledAt: null,
      externalPostId: null,
      permalink: null,
      attempts: 0,
      lastError: null,
      publishedAt: null,
      history: [],
    },
  ],
  ...overrides,
});

describe('editing a post', () => {
  const url = `/w/halden/compose/${post().id}`;

  it('opens with its content, accounts and per-network text', async () => {
    mockServer({ ...base(), [`GET ${BASE}/posts/${post().id}`]: [200, post()] });
    renderApp(url);
    expect(await screen.findByRole('heading', { name: 'Edit post' })).toBeInTheDocument();
    expect(await screen.findByRole('textbox', { name: 'Text' })).toHaveValue('Saved text');
    expect(screen.getByRole('textbox', { name: 'Link' })).toHaveValue('https://halden.test');
    expect(screen.getByRole('button', { name: 'Halden Coffee, Facebook' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /Instagram \(customised\)/ }));
    expect(screen.getByRole('textbox', { name: 'Text for Instagram' })).toHaveValue(
      'Saved for Instagram',
    );
  });

  it('a post that was published is shown, not edited', async () => {
    const published = post({
      targets: post().targets.map((t) => ({ ...t, status: 'published' })),
    });
    mockServer({ ...base(), [`GET ${BASE}/posts/${post().id}`]: [200, published] });
    renderApp(url);
    expect(await screen.findByText(/was published, so it can’t be changed/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Text' })).toBeDisabled();
  });

  it('someone else’s post is read-only for a contributor', async () => {
    const theirs = post({ author: { id: 'someone-else', name: 'Brand Admin', avatarUrl: null } });
    mockServer({ ...base('contributor'), [`GET ${BASE}/posts/${post().id}`]: [200, theirs] });
    renderApp(url);
    expect(
      await screen.findByText('Only its author or someone who approves posts can edit this post.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Text' })).toBeDisabled();
  });

  it('a post that doesn’t exist says so', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/posts/${post().id}`]: [
        404,
        { error: { code: 'POST_NOT_FOUND', message: 'x' } },
      ],
    });
    renderApp(url);
    expect(await screen.findByText('This post doesn’t exist or was deleted.')).toBeInTheDocument();
  });

  it('viewers can’t open the composer', async () => {
    mockServer({ ...base('viewer'), 'GET /api/v1/workspaces': [200, { items: [] }] });
    const { history } = renderApp('/w/halden/compose');
    await waitFor(() => {
      expect(history.location.pathname).toBe('/w/halden/calendar');
    });
  });
});
