// The options panel frame (P3-F2): asking accounts for their choices, a failure for one account,
// per-account rows, and where each kind of setting ends up in the post body. A stand-in Pinterest
// panel plays the part the network's own panel will (P3-B4).
import type { Network, SocialAccount } from '@socioboard/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { PerAccount } from '../options/panels';
import { OPTION_PANELS } from '../options/registry';
import type { OptionsPanelProps } from '../options/types';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
type Reply = [number, unknown];
const editor = () => within(screen.getByRole('tablist', { name: 'Content for' }));

const pinterest = {
  id: 'pinterest',
  displayName: 'Pinterest',
  capabilities: { postTypes: ['image'], firstComment: false, altText: true },
  rules: {
    maxChars: 500,
    maxHashtags: null,
    maxMentions: null,
    media: { required: false, maxItems: 1 },
    links: 'card',
  },
  preview: {
    truncateAt: 500,
    truncateLines: 3,
    captionPosition: 'below_media',
    mediaLayout: 'single',
    cropAspectRatio: null,
    linkCard: false,
  },
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
  createdAt: '2026-09-28T10:00:00.000Z',
});
const PIN1 = account('01a0d816-827a-74d6-a46e-409c7db35001', 'Halden Pins');
const PIN2 = account('01a0d816-827a-74d6-a46e-409c7db35002', 'Halden Recipes');
const boards = (...names: string[]) => ({
  network: 'pinterest',
  boards: names.map((name) => ({ id: `board-${name}`, name, privacy: 'public' })),
});

function TestPinterestPanel({ accounts, options, set }: OptionsPanelProps) {
  return (
    <>
      <label>
        Pin title
        <input
          value={options.pinterest?.title ?? ''}
          onChange={(e) => {
            set('pinterest', { title: e.target.value || undefined });
          }}
        />
      </label>
      <PerAccount accounts={accounts} label="Board">
        {(a, label) => (
          <label>
            {label}
            <select
              value={a.own.pinterest?.boardId ?? ''}
              onChange={(e) => {
                a.setOwn('pinterest', { boardId: e.target.value || undefined });
              }}
            >
              <option value="">Pick a board</option>
              {a.choices?.network === 'pinterest' &&
                a.choices.boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </label>
        )}
      </PerAccount>
    </>
  );
}

const server = (choices: Record<string, Reply | Handler>) =>
  mockServer({
    'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
    'GET /api/v1/me': [
      200,
      meWith({ memberships: [{ ...halden, role: 'owner' }], activeWorkspaceId: WID }),
    ],
    'GET /api/v1/networks': [200, { items: [pinterest] }],
    [`GET ${BASE}/accounts`]: [200, { items: [PIN1, PIN2] }],
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

const lastTargets = (calls: { key: string; body: unknown }[]) =>
  (calls.findLast((c) => c.key === `POST ${BASE}/posts/validate`)?.body as { targets: unknown })
    .targets;

beforeEach(() => {
  OPTION_PANELS.pinterest = { Component: TestPinterestPanel, needsChoices: true };
});
afterEach(() => {
  delete OPTION_PANELS.pinterest;
  vi.restoreAllMocks();
});

describe('options panels', () => {
  it('asks each account for its choices, then gives each its own board and all one title', async () => {
    const calls = server({
      [`GET ${BASE}/accounts/${PIN1.id}/options`]: [200, boards('Menu', 'Latte art')],
      [`GET ${BASE}/accounts/${PIN2.id}/options`]: [200, boards('Recipes')],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Pins, Pinterest' }));
    await user.click(screen.getByRole('button', { name: 'Halden Recipes, Pinterest' }));
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'Autumn menu');
    await user.click(editor().getByRole('tab', { name: /^Pinterest/ }));

    const board1 = await screen.findByRole('combobox', { name: 'Board for Halden Pins' });
    await user.selectOptions(board1, 'Latte art');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Board for Halden Recipes' }),
      'Recipes',
    );
    await user.type(screen.getByRole('textbox', { name: 'Pin title' }), 'Menu');

    await waitFor(() => {
      expect(lastTargets(calls)).toEqual([
        {
          accountId: PIN1.id,
          override: { options: { pinterest: { title: 'Menu', boardId: 'board-Latte art' } } },
        },
        {
          accountId: PIN2.id,
          override: { options: { pinterest: { title: 'Menu', boardId: 'board-Recipes' } } },
        },
      ]);
    });
  });

  it('one account’s choices failing names it, offers a retry, and keeps the others usable', async () => {
    let fail = true;
    server({
      [`GET ${BASE}/accounts/${PIN1.id}/options`]: [200, boards('Menu')],
      [`GET ${BASE}/accounts/${PIN2.id}/options`]: () =>
        fail
          ? [502, { error: { code: 'NETWORK_UNAVAILABLE', message: 'Pinterest is down' } }]
          : [200, boards('Recipes')],
    });
    renderApp('/w/halden/compose');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Halden Pins, Pinterest' }));
    await user.click(screen.getByRole('button', { name: 'Halden Recipes, Pinterest' }));
    await user.click(editor().getByRole('tab', { name: /^Pinterest/ }));

    expect(
      await screen.findByText(/Couldn’t load the settings for Halden Recipes/),
    ).toBeInTheDocument();
    // The account that answered can still be set up: one account left, so no name on its field.
    expect(screen.getByRole('combobox', { name: 'Board' })).toBeInTheDocument();

    fail = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('combobox', { name: 'Board for Halden Recipes' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Couldn’t load the settings/)).not.toBeInTheDocument();
  });
});
