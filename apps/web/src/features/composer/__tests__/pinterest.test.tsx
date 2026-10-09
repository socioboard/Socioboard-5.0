// Pinterest in the composer (P3-B4, P3-F1, P3-F2): the options panel (each account's board from
// its own list, one title for all, what to do without boards) and the pin preview (picture first,
// title, description cut after three lines, the site the pin leads to, a carousel's dots).
import type { Network, PreviewSpec, SocialAccount } from '@socioboard/contracts';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import '../../../lib/i18n';
import { halden, meWith, mockServer, renderApp } from '../../../testing/render';
import { PinterestPreview } from '../previews/pinterest-preview';
import type { PreviewFile } from '../previews/shared';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const editor = () => within(screen.getByRole('tablist', { name: 'Content for' }));

// The adapter's PINTEREST_PREVIEW.
const spec: PreviewSpec = {
  truncateAt: null,
  truncateLines: 3,
  captionPosition: 'below_media',
  mediaLayout: 'carousel',
  cropAspectRatio: null,
  linkCard: false,
};

const pinterest = {
  id: 'pinterest',
  displayName: 'Pinterest',
  capabilities: { postTypes: ['image', 'carousel'], firstComment: false, altText: true },
  rules: {
    maxChars: 800,
    maxHashtags: null,
    maxMentions: null,
    media: {
      required: true,
      maxItems: 5,
      kinds: ['image'],
      mixKinds: false,
      maxImageBytes: 10 * 1024 * 1024,
      imageAspectRatio: null,
      video: null,
    },
    links: 'card',
  },
  preview: spec,
  logins: [{ provider: 'pinterest', supportsAccountSelection: false }],
} as unknown as Network;

const account = (id: string, name: string): SocialAccount => ({
  id,
  network: 'pinterest',
  displayName: name,
  username: null,
  avatarUrl: null,
  status: 'active',
  connection: null,
  connectedBy: null,
  createdAt: '2026-10-09T10:00:00.000Z',
});
const PIN1 = account('01a0d816-827a-74d6-a46e-409c7db35101', 'Halden Pins');
const PIN2 = account('01a0d816-827a-74d6-a46e-409c7db35102', 'Halden Recipes');

const boards = (...list: [string, 'public' | 'protected'][]) => ({
  network: 'pinterest',
  boards: list.map(([name, privacy]) => ({ id: `board-${name}`, name, privacy })),
});

function server(choices: Record<string, [number, unknown]>, accounts = [PIN1, PIN2]) {
  return mockServer({
    'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
    'GET /api/v1/me': [
      200,
      meWith({ memberships: [{ ...halden, role: 'owner' }], activeWorkspaceId: WID }),
    ],
    'GET /api/v1/networks': [200, { items: [pinterest] }],
    [`GET ${BASE}/accounts`]: [200, { items: accounts }],
    [`GET ${BASE}/labels`]: [200, { items: [] }],
    [`POST ${BASE}/posts/validate`]: ({ body }) => {
      const { targets } = body as { targets: { accountId: string }[] };
      return [
        200,
        {
          issues: [],
          targets: targets.map((t) => ({
            accountId: t.accountId,
            network: 'pinterest',
            issues: [],
          })),
        },
      ];
    },
    ...choices,
  });
}

const lastTargets = (calls: { key: string; body: unknown }[]) =>
  (calls.findLast((c) => c.key === `POST ${BASE}/posts/validate`)?.body as { targets: unknown })
    .targets;

async function openPinterestTab(...names: string[]) {
  renderApp('/w/halden/compose');
  const user = userEvent.setup();
  for (const name of names) {
    await user.click(await screen.findByRole('button', { name: `${name}, Pinterest` }));
  }
  await user.click(editor().getByRole('tab', { name: /^Pinterest/ }));
  return user;
}

describe('Pinterest panel', () => {
  it('picks each account’s board from its own boards and gives all one title', async () => {
    const calls = server({
      [`GET ${BASE}/accounts/${PIN1.id}/options`]: [
        200,
        boards(['Coffee', 'public'], ['Wholesale', 'protected']),
      ],
      [`GET ${BASE}/accounts/${PIN2.id}/options`]: [200, boards(['Recipes', 'public'])],
    });
    const user = await openPinterestTab('Halden Pins', 'Halden Recipes');

    await user.click(await screen.findByRole('button', { name: 'Board for Halden Pins' }));
    // Protected boards say so; the other account's boards aren't offered here.
    expect(await screen.findByRole('option', { name: /Wholesale.*Protected/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Recipes/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Coffee/ }));
    await user.click(screen.getByRole('button', { name: 'Board for Halden Recipes' }));
    await user.click(await screen.findByRole('option', { name: /Recipes/ }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Autumn menu');

    await waitFor(() => {
      expect(lastTargets(calls)).toEqual([
        {
          accountId: PIN1.id,
          override: { options: { pinterest: { title: 'Autumn menu', boardId: 'board-Coffee' } } },
        },
        {
          accountId: PIN2.id,
          override: { options: { pinterest: { title: 'Autumn menu', boardId: 'board-Recipes' } } },
        },
      ]);
    });
  });

  it('counts the title against Pinterest’s 100 characters, and clearing it removes it', async () => {
    const calls = server(
      { [`GET ${BASE}/accounts/${PIN1.id}/options`]: [200, boards(['Coffee', 'public'])] },
      [PIN1],
    );
    const user = await openPinterestTab('Halden Pins');
    const title = await screen.findByRole('textbox', { name: 'Title' });
    await user.type(title, 'Beans');
    expect(screen.getByText('5 of 100 characters for Pinterest')).toBeInTheDocument();
    await user.clear(title);
    await waitFor(() => {
      expect(lastTargets(calls)).toEqual([{ accountId: PIN1.id, override: null }]);
    });
  });

  it('an account without boards says to create one on Pinterest', async () => {
    server({ [`GET ${BASE}/accounts/${PIN1.id}/options`]: [200, boards()] }, [PIN1]);
    await openPinterestTab('Halden Pins');
    expect(
      await screen.findByText(
        'Halden Pins has no boards yet. Create one on Pinterest, then choose it here.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Board' })).not.toBeInTheDocument();
  });
});

const photo = (n: number, width = 1000, height = 1500): PreviewFile => ({
  id: `f${String(n)}`,
  kind: 'image',
  src: `https://cdn.test/${String(n)}.jpg`,
  width,
  height,
  alt: `Photo ${String(n)}`,
});
const who = { name: 'Halden Pins', avatarUrl: null };

describe('PinterestPreview', () => {
  it('shows the picture in its own shape, the title, the description, the site and Save', () => {
    render(
      <PinterestPreview
        account={who}
        text="Fresh roast today #coffee"
        title="Kenya AA"
        files={[photo(1)]}
        link="https://www.halden.coffee/kenya"
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Pinterest' });
    expect(figure).toHaveTextContent('Halden Pins');
    expect(within(figure).getByText('Kenya AA')).toBeInTheDocument();
    expect(figure).toHaveTextContent('Fresh roast today #coffee');
    // The link is where the pin leads, shown as its site, not added to the text.
    expect(within(figure).getByText('halden.coffee')).toBeInTheDocument();
    expect(figure).not.toHaveTextContent('https://');
    expect(figure).toHaveTextContent('Save');
    const picture = within(figure).getByRole('img', { name: 'Photo 1' });
    expect(picture.parentElement).toHaveStyle({ aspectRatio: String(1000 / 1500) });
  });

  it('cuts the description after three lines with "more", which opens the rest', () => {
    render(
      <PinterestPreview
        account={who}
        text={'One\nTwo\nThree\nFour'}
        title=""
        files={[photo(1)]}
        link={null}
        spec={spec}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Pinterest' });
    expect(figure).not.toHaveTextContent('Four');
    fireEvent.click(within(figure).getByRole('button', { name: 'more' }));
    expect(figure).toHaveTextContent('Four');
  });

  it('a carousel shows one picture at a time, with a dot to switch to each', () => {
    render(
      <PinterestPreview
        account={who}
        text=""
        title=""
        files={[photo(1), photo(2), photo(3)]}
        link={null}
        spec={spec}
      />,
    );
    const carousel = screen.getByRole('group', { name: 'Picture 1 of 3' });
    expect(within(carousel).getAllByRole('img')).toHaveLength(1);
    fireEvent.click(within(carousel).getByRole('button', { name: 'Show picture 3 of 3' }));
    expect(screen.getByRole('group', { name: 'Picture 3 of 3' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photo 3' })).toBeInTheDocument();
  });
});
