import type { Network, SocialAccount } from '@socioboard/contracts';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { resetUploads } from '../../media';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const ME = '01a0d816-827a-74d6-a46e-409c7db36f92';
type Reply = [number, unknown];
/** The editor's tabs (the preview has its own). */
const editor = () => within(screen.getByRole('tablist', { name: 'Content for' }));

const network = (id: 'facebook_page' | 'instagram', maxChars: number) =>
  ({
    id,
    displayName: id === 'facebook_page' ? 'Facebook' : 'Instagram',
    capabilities: { postTypes: ['image'], firstComment: true, altText: true },
    rules: {
      maxChars,
      maxHashtags: null,
      maxMentions: null,
      media: { required: id === 'instagram', maxItems: 10 },
      links: 'card',
    },
    preview:
      id === 'facebook_page'
        ? {
            truncateAt: 480,
            truncateLines: 5,
            captionPosition: 'above_media',
            mediaLayout: 'grid',
            cropAspectRatio: null,
            linkCard: true,
          }
        : {
            truncateAt: 125,
            truncateLines: 2,
            captionPosition: 'below_media',
            mediaLayout: 'carousel',
            cropAspectRatio: { min: 0.8, max: 1.91 },
            linkCard: false,
          },
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
const IG = {
  ...account('01a0d816-827a-74d6-a46e-409c7db31002', 'instagram', 'Halden Gram'),
  username: 'halden.coffee',
};
const FB2 = account('01a0d816-827a-74d6-a46e-409c7db31003', 'facebook_page', 'Halden Roastery');

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

const base = (role = 'owner'): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [200, meWith({ memberships: [{ ...halden, role }], activeWorkspaceId: WID })],
  'GET /api/v1/networks': [
    200,
    { items: [network('facebook_page', 63206), network('instagram', 2200)] },
  ],
  [`GET ${BASE}/accounts`]: [200, { items: [FB, IG, FB2] }],
  [`GET ${BASE}/media/${M1.id}`]: [200, M1],
  [`GET ${BASE}/media/${M2.id}`]: [200, M2],
  // Nothing to report unless a test says otherwise.
  [`GET ${BASE}/labels`]: [200, { items: [] }],
  [`POST ${BASE}/posts/validate`]: ({ body }) => [200, validated(body)],
});

/** The validate answer for a body: each target with the given issues (none by default). */
function validated(body: unknown, byNetwork: Record<string, object[]> = {}, post: object[] = []) {
  const { targets } = body as { targets: { accountId: string }[] };
  return {
    issues: post,
    targets: targets.map((t) => {
      const network = [FB, IG, FB2].find((a) => a.id === t.accountId)?.network ?? 'facebook_page';
      return { accountId: t.accountId, network, issues: byNetwork[network] ?? [] };
    }),
  };
}

const serverIssue = (code: string, field: string, extra: object = {}) => ({
  severity: 'error',
  code,
  message: `${code} (server wording)`,
  field,
  mediaId: null,
  ...extra,
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

    await user.click(editor().getByRole('tab', { name: /^Instagram/ }));
    const igText = screen.getByRole('textbox', { name: 'Text for Instagram' });
    expect(igText).toHaveValue('Fresh roast');
    expect(screen.getByText(/Using the shared text/)).toBeInTheDocument();
    await user.type(igText, ' ☕');
    expect(editor().getByRole('tab', { name: /Instagram \(customised\)/ })).toBeInTheDocument();

    await user.click(editor().getByRole('tab', { name: 'All networks' }));
    expect(screen.getByRole('textbox', { name: 'Text' })).toHaveValue('Fresh roast');
    expect(screen.getByText(/Instagram has its own text/)).toBeInTheDocument();
    expect(screen.queryByText(/characters for Instagram/)).not.toBeInTheDocument();

    await user.click(editor().getByRole('tab', { name: /Instagram/ }));
    await user.click(screen.getByRole('button', { name: 'Reset to shared' }));
    expect(screen.getByRole('textbox', { name: 'Text for Instagram' })).toHaveValue('Fresh roast');
    expect(editor().getByRole('tab', { name: /^Instagram/ })).toBeInTheDocument();
  });

  it('tabs move with the arrow keys, and a deselected network’s tab goes away', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(editor().getByRole('tab', { name: 'All networks' }));
    await user.keyboard('{ArrowRight}');
    expect(editor().getByRole('tab', { name: /^Facebook/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(editor().getByRole('tab', { name: /^Facebook/ })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Halden Coffee, Facebook' }));
    expect(editor().queryByRole('tab', { name: /^Facebook/ })).not.toBeInTheDocument();
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
    await user.click(editor().getByRole('tab', { name: /^Instagram/ }));
    await user.click(screen.getByRole('button', { name: 'Use different media for Instagram' }));
    await user.click(editor().getByRole('tab', { name: /All networks/ }));
    fireEvent.change(screen.getByTestId('composer-file-input'), {
      target: { files: [new File(['x'], 'slow.jpg', { type: 'image/jpeg' })] },
    });
    const shared = screen.getByRole('list', { name: 'Media' });
    expect(await within(shared).findByRole('status', { name: 'Uploading' })).toBeInTheDocument();
    await user.click(editor().getByRole('tab', { name: /Instagram/ }));
    const ig = screen.getByRole('list', { name: 'Media for Instagram' });
    expect(within(ig).queryByRole('status', { name: 'Uploading' })).not.toBeInTheDocument();
    await user.click(editor().getByRole('tab', { name: /All networks/ }));
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
    await user.click(editor().getByRole('tab', { name: /^Instagram/ }));
    await user.click(screen.getByRole('radio', { name: /Reel/ }));
    expect(screen.getByRole('radio', { name: /Reel/ })).toBeChecked();
    expect(editor().getByRole('tab', { name: /Instagram \(customised\)/ })).toBeInTheDocument();
  });
});

/** Storage that answers only when told to, so a test decides which upload finishes first. */
class ControlledXhr extends FakeXhr {
  static pending: (() => void)[] = [];
  override send() {
    ControlledXhr.pending.push(() => {
      this.status = 200;
      this.onload?.();
    });
  }
}

describe('uploading several files', () => {
  it('keeps the order they were picked in, whichever finishes first', async () => {
    ControlledXhr.pending = [];
    vi.stubGlobal('XMLHttpRequest', ControlledXhr);
    const first = media('01a0d816-827a-74d6-a46e-409c7db32021', 'first.jpg');
    const second = media('01a0d816-827a-74d6-a46e-409c7db32022', 'second.jpg');
    let created = 0;
    mockServer({
      ...base(),
      [`POST ${BASE}/media/uploads`]: () => {
        const asset = [first, second][created++] ?? first;
        return [
          201,
          {
            asset: { ...asset, status: 'uploading' },
            upload: { type: 'single', url: `https://s3.test/${asset.id}`, headers: {} },
            expiresAt: '2026-09-28T11:00:00.000Z',
          },
        ];
      },
      [`POST ${BASE}/media/uploads/${first.id}/complete`]: [200, first],
      [`POST ${BASE}/media/uploads/${second.id}/complete`]: [200, second],
      [`GET ${BASE}/media/${first.id}`]: [200, first],
      [`GET ${BASE}/media/${second.id}`]: [200, second],
      [`GET ${BASE}/media`]: [200, { items: [], nextCursor: null }],
    });
    renderApp('/w/halden/compose');
    await screen.findByRole('button', { name: 'Upload' });
    fireEvent.change(screen.getByTestId('composer-file-input'), {
      target: {
        files: [
          new File(['1'], 'first.jpg', { type: 'image/jpeg' }),
          new File(['2'], 'second.jpg', { type: 'image/jpeg' }),
        ],
      },
    });
    await waitFor(() => {
      expect(ControlledXhr.pending).toHaveLength(2);
    });
    // The second file finishes first.
    ControlledXhr.pending[1]?.();
    const strip = screen.getByRole('list', { name: 'Media' });
    await within(strip).findByRole('img', { name: 'second.jpg' });
    ControlledXhr.pending[0]?.();
    await within(strip).findByRole('img', { name: 'first.jpg' });
    // The finished upload's placeholder leaves (animated) a frame later.
    await waitFor(() => {
      expect(
        within(strip)
          .getAllByRole('img')
          .map((i) => i.getAttribute('alt')),
      ).toEqual(['first.jpg', 'second.jpg']);
    });
  });
});

describe('live preview', () => {
  const preview = () => screen.getByRole('complementary', { name: 'Preview' });
  const long = `${'Fresh roast today, washed Ethiopia Guji. '.repeat(14)}#coffee`;

  it('shows each network as it will look, and cuts where the network cuts', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await screen.findByRole('complementary', { name: 'Preview' });
    expect(
      within(preview()).getByText('Pick an account to see how the post will look.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('button', { name: 'Halden Gram, Instagram' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Text' }), { target: { value: long } });

    const fb = within(preview()).getByRole('figure', { name: 'Preview on Facebook' });
    expect(within(fb).getByText('Halden Coffee')).toBeInTheDocument();
    expect(fb).not.toHaveTextContent('#coffee');
    await user.click(within(fb).getByRole('button', { name: 'See more' }));
    expect(fb).toHaveTextContent('#coffee');

    await user.click(within(preview()).getByRole('tab', { name: 'Instagram' }));
    const ig = within(preview()).getByRole('figure', { name: 'Preview on Instagram' });
    expect(within(ig).getAllByText('halden.coffee').length).toBeGreaterThan(0);
    expect(within(ig).getByRole('button', { name: 'more' })).toBeInTheDocument();
    expect(ig).toHaveTextContent('Instagram posts need a photo or video.');
  });

  it('follows the editor to a network, and shows its own text and format', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('button', { name: 'Halden Gram, Instagram' }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'Shared');
    await user.click(editor().getByRole('tab', { name: /^Instagram/ }));
    expect(within(preview()).getByRole('tab', { name: 'Instagram' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.type(screen.getByRole('textbox', { name: 'Text for Instagram' }), ' on IG');
    // Facebook colours web addresses in text; Instagram doesn't make them links, so neither do we.
    const LINK = 'text-[var(--sb-preview-link)]';
    await user.click(editor().getByRole('tab', { name: /All networks/ }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), ' https://halden.coffee');
    await user.click(within(preview()).getByRole('tab', { name: 'Facebook' }));
    expect(within(preview()).getByText('https://halden.coffee')).toHaveClass(LINK);
    await user.click(editor().getByRole('tab', { name: /Instagram/ }));
    await user.type(
      screen.getByRole('textbox', { name: 'Text for Instagram' }),
      ' https://halden.coffee',
    );
    expect(within(preview()).getByText('https://halden.coffee')).not.toHaveClass(LINK);
    expect(
      within(preview()).getByRole('figure', { name: 'Preview on Instagram' }),
    ).toHaveTextContent('Shared on IG https://halden.coffee');
    await user.click(screen.getByRole('radio', { name: /Story/ }));
    expect(preview()).toHaveTextContent('Stories don’t show a caption.');
    expect(preview()).not.toHaveTextContent('Shared on IG');
  });

  it('Facebook shows a link card when there are no photos, and the first comment', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Link' }),
      'https://www.halden.coffee/guji',
    );
    await user.click(screen.getByRole('button', { name: 'Add a first comment' }));
    await user.type(screen.getByRole('textbox', { name: 'First comment' }), 'Tickets at the bar');
    const fb = within(preview()).getByRole('figure', { name: 'Preview on Facebook' });
    expect(within(fb).getByText('halden.coffee')).toBeInTheDocument();
    expect(fb).toHaveTextContent('Tickets at the bar');
  });

  it('a lone modest picture shows in full; several show their thumbnails', async () => {
    const small = { ...M1, url: 'https://media.test/full-1.jpg' };
    const big = { ...M2, url: 'https://media.test/full-2.jpg', sizeBytes: 9 * 1024 * 1024 };
    mockServer({
      ...base(),
      [`GET ${BASE}/media/${M1.id}`]: [200, small],
      [`GET ${BASE}/media/${M2.id}`]: [200, big],
      [`GET ${BASE}/media`]: [200, { items: [small, big], nextCursor: null }],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    const attach = async (name: string) => {
      await user.click(screen.getByRole('button', { name: 'Choose from library' }));
      const dialog = await screen.findByRole('dialog', { name: 'Choose from library' });
      await user.click(await within(dialog).findByRole('button', { name: `Select ${name}` }));
      await user.click(within(dialog).getByRole('button', { name: 'Attach 1 file' }));
    };
    const fb = () => within(preview()).getByRole('figure', { name: 'Preview on Facebook' });
    await attach('latte.jpg');
    await waitFor(() => {
      expect(within(fb()).getByRole('img', { name: 'latte.jpg' })).toHaveAttribute(
        'src',
        'https://media.test/full-1.jpg',
      );
    });
    await attach('beans.jpg');
    await waitFor(() => {
      expect(within(fb()).getByRole('img', { name: 'latte.jpg' })).toHaveAttribute(
        'src',
        `https://media.test/${M1.id}.webp`,
      );
    });
    expect(within(fb()).getByRole('img', { name: 'beans.jpg' })).toHaveAttribute(
      'src',
      `https://media.test/${M2.id}.webp`,
    );
  });

  it('a caption of short lines is cut where Instagram cuts it', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Gram, Instagram' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Text' }), {
      target: { value: 'Line one\nLine two\nLine three' },
    });
    const ig = within(preview()).getByRole('figure', { name: 'Preview on Instagram' });
    expect(ig).not.toHaveTextContent('Line three');
    await user.click(within(ig).getByRole('button', { name: 'more' }));
    expect(ig).toHaveTextContent('Line three');
  });

  it('with two Pages selected, previews as either', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('button', { name: 'Halden Roastery, Facebook' }));
    const fb = () => within(preview()).getByRole('figure', { name: 'Preview on Facebook' });
    expect(within(fb()).getByText('Halden Coffee')).toBeInTheDocument();
    await user.click(within(preview()).getByRole('combobox', { name: 'Preview as' }));
    await user.click(await screen.findByRole('option', { name: 'Preview as Halden Roastery' }));
    expect(within(fb()).getByText('Halden Roastery')).toBeInTheDocument();
  });

  it('on small screens, Edit and Preview take turns', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    const show = await screen.findByRole('group', { name: 'Show' });
    const previewButton = within(show).getByRole('button', { name: 'Preview' });
    expect(within(show).getByRole('button', { name: 'Edit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(preview()).toHaveClass('@max-4xl:hidden');
    await user.click(previewButton);
    expect(previewButton).toHaveAttribute('aria-pressed', 'true');
    expect(preview()).not.toHaveClass('@max-4xl:hidden');
  });
});

describe('validation', () => {
  const panel = () => screen.getByRole('region', { name: 'Before you publish' });

  it('checks length at once, asks the server once typing pauses, and words each issue', async () => {
    const calls = mockServer({
      ...base(),
      [`POST ${BASE}/posts/validate`]: ({ body }) => [
        200,
        validated(body, {
          instagram: [
            serverIssue('TOO_MANY_HASHTAGS', 'text', { params: { max: 30, actual: 35 } }),
            // A stale copy of a quick check: the composer's own result is shown instead.
            serverIssue('TEXT_TOO_LONG', 'text', { params: { max: 2200, actual: 9999 } }),
            serverIssue('SOMETHING_NEW', 'text'),
          ],
        }),
      ],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Gram, Instagram' }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'Hello');
    // The quick check is there before the server answers.
    expect(within(panel()).getByText('Instagram posts need a photo or video.')).toBeInTheDocument();
    expect(
      await within(panel()).findByText('Instagram allows 30 hashtags; this has 35.'),
    ).toBeInTheDocument();
    expect(within(panel()).getByText('SOMETHING_NEW (server wording)')).toBeInTheDocument();
    expect(within(panel()).queryByText(/9,999|over/)).not.toBeInTheDocument();
    // Asked once typing paused: no request ever carried half-typed text.
    const sent = calls
      .filter((c) => c.key.endsWith('/posts/validate'))
      .map((c) => (c.body as { text: string }).text);
    expect(sent).toContain('Hello');
    expect(sent.filter((t) => ['H', 'He', 'Hel', 'Hell'].includes(t))).toEqual([]);
    expect(
      editor().getByRole('tab', { name: /Instagram has problems to fix/ }),
    ).toBeInTheDocument();
  });

  it('too long shows at once, marks the text box, and names how far over', async () => {
    mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Gram, Instagram' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Text' }), {
      target: { value: 'x'.repeat(2210) },
    });
    expect(
      within(panel()).getByText('Instagram allows 2,200 characters; this is 10 over.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Text' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('a link that isn’t a web address is reported, and not sent to the server', async () => {
    const calls = mockServer(base());
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.type(screen.getByRole('textbox', { name: 'Link' }), 'halden.coffee');
    expect(within(panel()).getByText(/The link isn’t a web address/)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 700));
    const links = calls
      .filter((c) => c.key.endsWith('/posts/validate'))
      .map((c) => (c.body as { link: string | null }).link);
    expect(links.filter((l) => l !== null)).toEqual([]);
  });

  it('an issue jumps to what needs fixing, on the tab that holds it', async () => {
    mockServer({
      ...base(),
      [`POST ${BASE}/posts/validate`]: ({ body }) => [
        200,
        validated(body, {
          instagram: [
            serverIssue('TOO_MANY_HASHTAGS', 'text', { params: { max: 30, actual: 31 } }),
          ],
        }),
      ],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('button', { name: 'Halden Gram, Instagram' }));
    // Instagram has its own text: the issue is about that text.
    await user.click(editor().getByRole('tab', { name: /^Instagram/ }));
    await user.type(screen.getByRole('textbox', { name: 'Text for Instagram' }), '#a');
    await user.click(editor().getByRole('tab', { name: /All networks/ }));
    await user.click(await within(panel()).findByRole('button', { name: /allows 30 hashtags/ }));
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Text for Instagram' })).toHaveFocus();
    });
    // A post-level issue (no accounts left) goes to the account picker.
    await user.click(screen.getByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('button', { name: 'Halden Gram, Instagram' }));
    await user.click(within(panel()).getByRole('button', { name: /Choose at least one account/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Halden Coffee, Facebook' })).toHaveFocus();
    });
  });

  it('account problems name the account; nothing left says ready', async () => {
    mockServer({
      ...base(),
      [`POST ${BASE}/posts/validate`]: ({ body }) => {
        const { text } = body as { text: string };
        return [
          200,
          validated(
            body,
            text === 'ok' ? {} : { facebook_page: [serverIssue('ACCOUNT_PAUSED', 'account')] },
          ),
        ];
      },
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'hi');
    expect(
      await within(panel()).findByText('Halden Coffee (Facebook) is paused.'),
    ).toBeInTheDocument();
    await user.clear(screen.getByRole('textbox', { name: 'Text' }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'ok');
    expect(await within(panel()).findByText('Ready to publish')).toBeInTheDocument();
  });

  it('when the server can’t be asked, the quick checks still show and say so', async () => {
    mockServer({
      ...base(),
      [`POST ${BASE}/posts/validate`]: [500, { error: { code: 'INTERNAL_ERROR', message: 'x' } }],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Gram, Instagram' }));
    expect(
      await within(panel()).findByText(/Couldn’t check with the networks just now/),
    ).toBeInTheDocument();
    expect(within(panel()).getByText('Instagram posts need a photo or video.')).toBeInTheDocument();
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
    await user.click(editor().getByRole('tab', { name: /Instagram \(customised\)/ }));
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
    expect(screen.queryByRole('region', { name: 'Before you publish' })).not.toBeInTheDocument();
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

describe('files that are still processing', () => {
  it('the check runs again once a file is ready, so the post can be published', async () => {
    // The file is processing on the first read and ready from the second (the composer re-reads
    // a processing file every 3 s); the server's check follows what the file is.
    let reads = 0;
    let status = 'processing';
    mockServer({
      ...base(),
      [`GET ${BASE}/media`]: [200, { items: [M1], nextCursor: null }],
      [`GET ${BASE}/media/${M1.id}`]: () => {
        reads += 1;
        status = reads === 1 ? 'processing' : 'ready';
        return [200, { ...M1, status, thumbnailUrl: status === 'ready' ? M1.thumbnailUrl : null }];
      },
      [`POST ${BASE}/posts/validate`]: ({ body }) => [
        200,
        validated(body, {
          facebook_page:
            status === 'ready'
              ? []
              : [
                  {
                    severity: 'error',
                    code: 'MEDIA_NOT_READY',
                    message: 'Still processing',
                    field: 'media',
                    mediaId: M1.id,
                    params: { file: 'latte.jpg' },
                  },
                ],
        }),
      ],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
    await user.click(screen.getByRole('button', { name: 'Choose from library' }));
    const dialog = await screen.findByRole('dialog', { name: 'Choose from library' });
    await user.click(await within(dialog).findByRole('button', { name: 'Select latte.jpg' }));
    await user.click(within(dialog).getByRole('button', { name: 'Attach 1 file' }));
    expect(await screen.findByText(/latte\.jpg is still being processed/)).toBeInTheDocument();
    // The file turns ready (re-read every 3 s): the server is asked again, without any edit.
    expect(await screen.findByText('Ready to publish', {}, { timeout: 8_000 })).toBeInTheDocument();
    expect(screen.queryByText(/still being processed/)).not.toBeInTheDocument();
  });
});
