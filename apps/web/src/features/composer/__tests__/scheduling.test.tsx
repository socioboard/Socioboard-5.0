// The composer's Schedule, Add to queue and Repeat (P2-F1), against a fake server: what is sent,
// in which order, and what the person is told.
import type { Network, Recurrence, SocialAccount } from '@socioboard/contracts';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatZoned } from '../../../lib/time';
import { halden, meWith, mockServer, renderApp, type Handler } from '../../../testing/render';
import { AUTOSAVE_MS } from '../use-save';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
const POST = `${BASE}/posts/${POST_ID}`;
type Reply = [number, unknown];

/** Monday 5 October 2026, 10:00 on the workspace's clock (UTC unless a test says otherwise). */
const NOW = new Date('2026-10-05T10:00:00Z');

const FB: SocialAccount = {
  id: '01a0d816-827a-74d6-a46e-409c7db31001',
  network: 'facebook_page',
  displayName: 'Halden Coffee',
  username: null,
  avatarUrl: null,
  status: 'active',
  connection: null,
  connectedBy: null,
  createdAt: '2026-09-28T10:00:00.000Z',
};
const FB2: SocialAccount = {
  ...FB,
  id: '01a0d816-827a-74d6-a46e-409c7db31002',
  displayName: 'Halden Roastery',
};
const NETWORK = {
  id: 'facebook_page',
  displayName: 'Facebook',
  capabilities: { postTypes: ['text'], firstComment: true, altText: true },
  rules: {
    maxChars: 63206,
    maxHashtags: null,
    maxMentions: null,
    media: { required: false, maxItems: 10 },
    links: 'card',
  },
  preview: {
    truncateAt: 480,
    truncateLines: 5,
    captionPosition: 'above_media',
    mediaLayout: 'grid',
    cropAspectRatio: null,
    linkCard: true,
  },
  logins: [{ provider: 'facebook', supportsAccountSelection: false }],
} as unknown as Network;

const RULE: Recurrence = {
  active: true,
  nextRunAt: '2026-10-07T09:00:00.000Z',
  rule: {
    frequency: 'weekly',
    interval: 1,
    weekdays: [1, 3],
    time: '09:00',
    timezone: 'UTC',
    startsOn: '2026-10-05',
    ends: { type: 'never' },
  },
};

/** The post as the API returns it: a draft, or scheduled at `at`. */
const post = (
  over: {
    text?: string;
    at?: string | null;
    recurring?: 'template' | 'occurrence' | null;
    recurrence?: Recurrence | null;
  } = {},
) => ({
  id: POST_ID,
  status: over.at ? 'scheduled' : 'draft',
  text: over.text ?? 'Autumn menu',
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [],
  author: { id: '01a0d816-827a-74d6-a46e-409c7db36f92', name: 'Priya Raman', avatarUrl: null },
  createdAt: '2026-09-28T10:00:00.000Z',
  updatedAt: '2026-09-28T10:00:00.000Z',
  recurring: over.recurring ?? null,
  recurrence: over.recurrence ?? null,
  targets: [
    {
      id: 't1',
      account: FB,
      override: null,
      status: over.at ? 'scheduled' : 'pending',
      scheduledAt: over.at ?? null,
      externalPostId: null,
      permalink: null,
      attempts: 0,
      lastError: null,
      publishedAt: null,
      history: [],
    },
  ],
});

const slots = (list: { weekday: number; time: string }[]) => ({
  timezone: 'UTC',
  slots: list,
  upcoming: [],
});

const base = (
  options: { role?: string; timezone?: string; accounts?: SocialAccount[] } = {},
): Record<string, Reply | Handler> => ({
  'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
  'GET /api/v1/me': [
    200,
    meWith({
      memberships: [
        {
          workspace: { ...halden.workspace, timezone: options.timezone ?? 'UTC' },
          role: options.role ?? 'owner',
        },
      ],
      activeWorkspaceId: WID,
    }),
  ],
  'GET /api/v1/networks': [200, { items: [NETWORK] }],
  [`GET ${BASE}/accounts`]: [200, { items: options.accounts ?? [FB] }],
  [`GET ${BASE}`]: [200, { ...halden.workspace, requireReviewForAll: false }],
  [`GET ${BASE}/labels`]: [200, { items: [] }],
  [`GET ${BASE}/accounts/${FB.id}/queue-slots`]: [200, slots([])],
  [`GET ${BASE}/accounts/${FB2.id}/queue-slots`]: [200, slots([])],
  [`POST ${BASE}/posts/validate`]: ({ body }) => {
    const { targets } = body as { targets: { accountId: string }[] };
    return [
      200,
      {
        issues: [],
        targets: targets.map((t) => ({
          accountId: t.accountId,
          network: 'facebook_page',
          issues: [],
        })),
      },
    ];
  },
  [`POST ${BASE}/posts`]: ({ body }) => [201, post(body as { text: string })],
  [`PATCH ${POST}`]: ({ body }) => [200, post(body as { text: string })],
  [`GET ${POST}`]: [200, post()],
});

const writePost = async (text = 'Autumn menu') => {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'Halden Coffee, Facebook' }));
  await user.type(screen.getByRole('textbox', { name: 'Text' }), text);
  return user;
};

const dialog = () => within(screen.getByRole('dialog'));
/** A day of the month on screen, by its date. */
const day = (date: string) => {
  const button = screen.getByRole('dialog').querySelector(`button[data-date="${date}"]`);
  if (!button) throw new Error(`No day ${date} in the picker`);
  return button;
};
const long = (iso: string, zone = 'UTC') => formatZoned(iso, zone, 'long');
const sent = (calls: { key: string }[]) =>
  calls.map((c) => c.key).filter((k) => !k.startsWith('GET') && !k.endsWith('/validate'));

beforeEach(() => {
  // Only the clock is set; timers run as usual.
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('scheduling', () => {
  it('saves the draft, schedules it at the picked time, and opens the post’s page', async () => {
    const at = '2026-10-06T11:00:00.000Z';
    const calls = mockServer({
      ...base(),
      [`POST ${POST}/schedule`]: [200, post({ at })],
    });
    const { history } = renderApp('/w/halden/compose');
    const user = await writePost();
    await user.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(dialog().getByRole('heading', { name: 'Schedule post' })).toBeInTheDocument();
    expect(dialog().getByText(/Times are in UTC/)).toBeInTheDocument();
    // It opens an hour from now.
    expect(dialog().getByLabelText('Time')).toHaveValue('11:00');
    expect(dialog().getByText(`Goes out ${long('2026-10-05T11:00:00.000Z')}`)).toBeInTheDocument();
    await user.click(day('2026-10-06'));
    expect(dialog().getByText(`Goes out ${long(at)}`)).toBeInTheDocument();
    await user.click(dialog().getByRole('button', { name: 'Schedule' }));

    expect(await screen.findByText(`Scheduled for ${long(at)}.`)).toBeInTheDocument();
    // The draft is created first; then one request schedules it.
    expect(sent(calls)).toEqual([`POST ${BASE}/posts`, `POST ${POST}/schedule`]);
    expect(calls.find((c) => c.key === `POST ${POST}/schedule`)?.body).toEqual({ at });
    await waitFor(() => {
      expect(history.location.pathname).toBe(`/w/halden/posts/${POST_ID}`);
    });
  });

  it('the time is on the workspace’s clock, not the browser’s', async () => {
    const calls = mockServer({
      ...base({ timezone: 'Asia/Tokyo' }),
      [`POST ${POST}/schedule`]: [200, post({ at: '2026-10-06T00:00:00.000Z' })],
    });
    renderApp('/w/halden/compose');
    const user = await writePost();
    await user.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(dialog().getByText(/Times are in Tokyo time/)).toBeInTheDocument();
    // 10:00 UTC is 19:00 in Tokyo; an hour on is 20:00 there.
    expect(dialog().getByLabelText('Time')).toHaveValue('20:00');
    await user.click(day('2026-10-06'));
    fireEvent.change(dialog().getByLabelText('Time'), { target: { value: '09:00' } });
    await user.click(dialog().getByRole('button', { name: 'Schedule' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key === `POST ${POST}/schedule`)?.body).toEqual({
        at: '2026-10-06T00:00:00.000Z',
      });
    });
    expect(
      await screen.findByText(`Scheduled for ${long('2026-10-06T00:00:00.000Z', 'Asia/Tokyo')}.`),
    ).toBeInTheDocument();
  });

  it('a time less than 2 minutes away can’t be sent; days already past can’t be picked', async () => {
    const calls = mockServer(base());
    renderApp('/w/halden/compose');
    const user = await writePost();
    await user.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(day('2026-10-04')).toBeDisabled();
    expect(day('2026-10-05')).toBeEnabled();
    fireEvent.change(dialog().getByLabelText('Time'), { target: { value: '10:01' } });
    expect(dialog().getByText('Pick a time at least 2 minutes from now.')).toBeInTheDocument();
    expect(dialog().getByLabelText('Time')).toBeInvalid();
    expect(dialog().getByRole('button', { name: 'Schedule' })).toBeDisabled();
    fireEvent.change(dialog().getByLabelText('Time'), { target: { value: '10:02' } });
    expect(dialog().getByRole('button', { name: 'Schedule' })).toBeEnabled();
    // Cancel sends nothing.
    await user.click(dialog().getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(sent(calls)).toEqual([]);
  });

  it('the server’s refusal is explained, and the dialog stays to pick again', async () => {
    mockServer({
      ...base(),
      [`POST ${POST}/schedule`]: [422, { error: { code: 'SCHEDULE_TOO_SOON', message: 'x' } }],
    });
    renderApp('/w/halden/compose');
    const user = await writePost();
    await user.click(screen.getByRole('button', { name: 'Schedule' }));
    await user.click(dialog().getByRole('button', { name: 'Schedule' }));
    expect(
      await screen.findByText('That time is too close. Pick one at least 2 minutes from now.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('isn’t offered to people who can’t publish, or before an account is chosen', async () => {
    mockServer(base({ role: 'contributor' }));
    const { unmount } = renderApp('/w/halden/compose');
    await writePost();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Schedule' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add to queue' })).not.toBeInTheDocument();
    unmount();
    vi.restoreAllMocks();
    mockServer(base());
    renderApp('/w/halden/compose');
    expect(await screen.findByRole('button', { name: 'Schedule' })).toBeDisabled();
    expect(screen.getByText('Choose accounts to publish to.')).toBeInTheDocument();
  });
});

describe('a scheduled post', () => {
  const AT = '2026-10-09T14:30:00.000Z';
  const scheduled = (): Record<string, Reply | Handler> => ({
    ...base(),
    [`GET ${POST}`]: [200, post({ at: AT })],
  });

  it('says when it goes out; saving is the main action and nothing is saved on its own', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: NOW });
    const calls = mockServer(scheduled());
    renderApp(`/w/halden/compose/${POST_ID}`);
    expect(await screen.findByText(`Scheduled for ${long(AT)}.`)).toBeInTheDocument();
    expect(screen.getByText(/Changes you save go out then\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reschedule' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Publish now' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Add to queue' })).not.toBeInTheDocument();

    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    await user.type(screen.getByRole('textbox', { name: 'Text' }), '!');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_MS * 2);
    });
    // A save, had one started, would have reached the server by now.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(sent(calls)).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(sent(calls)).toEqual([`PATCH ${POST}`]);
    });
  });

  it('rescheduling starts from its time and moves it', async () => {
    const later = '2026-10-12T14:30:00.000Z';
    const calls = mockServer({
      ...scheduled(),
      [`POST ${POST}/schedule`]: [200, post({ at: later })],
    });
    renderApp(`/w/halden/compose/${POST_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Reschedule' }));
    expect(dialog().getByRole('heading', { name: 'Change schedule' })).toBeInTheDocument();
    expect(dialog().getByLabelText('Time')).toHaveValue('14:30');
    expect(day('2026-10-09').closest('[role=gridcell]')).toHaveAttribute('aria-selected', 'true');
    await user.click(day('2026-10-12'));
    await user.click(dialog().getByRole('button', { name: 'Schedule' }));
    expect(await screen.findByText(`Scheduled for ${long(later)}.`)).toBeInTheDocument();
    // Nothing changed in the post, so it isn't saved again.
    expect(sent(calls)).toEqual([`POST ${POST}/schedule`]);
    expect(calls.find((c) => c.key === `POST ${POST}/schedule`)?.body).toEqual({ at: later });
  });

  it('Unschedule makes it a draft again, without saving what’s being typed', async () => {
    const calls = mockServer({
      ...scheduled(),
      [`POST ${POST}/unschedule`]: [200, post()],
    });
    renderApp(`/w/halden/compose/${POST_ID}`);
    const user = userEvent.setup();
    await user.type(await screen.findByRole('textbox', { name: 'Text' }), '!');
    await user.click(screen.getByRole('button', { name: 'Unschedule' }));
    expect(await screen.findByText('Unscheduled. It’s a draft again.')).toBeInTheDocument();
    expect(sent(calls)).toEqual([`POST ${POST}/unschedule`]);
    await waitFor(() => {
      expect(screen.queryByText(/Changes you save go out then/)).not.toBeInTheDocument();
    });
    // A draft's actions are back, and what was typed is still there, unsaved.
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Text' })).toHaveValue('Autumn menu!');
  });

  it('making it repeat unschedules it first, as the server asks', async () => {
    const calls = mockServer({
      ...scheduled(),
      [`POST ${POST}/unschedule`]: [200, post()],
      [`PUT ${POST}/recurrence`]: [200, RULE],
    });
    renderApp(`/w/halden/compose/${POST_ID}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Reschedule' }));
    await user.click(dialog().getByRole('combobox', { name: 'Repeat' }));
    await user.click(await screen.findByRole('option', { name: 'Daily' }));
    await user.click(dialog().getByRole('button', { name: 'Repeat post' }));
    await waitFor(() => {
      expect(sent(calls)).toEqual([`POST ${POST}/unschedule`, `PUT ${POST}/recurrence`]);
    });
    expect(calls.find((c) => c.key === `PUT ${POST}/recurrence`)?.body).toEqual({
      frequency: 'daily',
      interval: 1,
      time: '14:30',
      timezone: 'UTC',
      startsOn: '2026-10-09',
      ends: { type: 'never' },
    });
  });

  it('a copy of a repeating post says so, and can’t repeat on its own', async () => {
    mockServer({ ...base(), [`GET ${POST}`]: [200, post({ at: AT, recurring: 'occurrence' })] });
    renderApp(`/w/halden/compose/${POST_ID}`);
    expect(
      await screen.findByText(/It’s a copy of a repeating post: changes here apply to this copy/),
    ).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Reschedule' }));
    expect(dialog().getByLabelText('Time')).toBeInTheDocument();
    expect(dialog().queryByRole('combobox', { name: 'Repeat' })).not.toBeInTheDocument();
  });
});

describe('repeating', () => {
  it('weekly on chosen days: the rule is sent in the workspace’s timezone', async () => {
    const calls = mockServer({
      ...base({ timezone: 'Europe/Lisbon' }),
      [`PUT ${POST}/recurrence`]: [200, { ...RULE, nextRunAt: '2026-10-07T08:00:00.000Z' }],
    });
    const { history } = renderApp('/w/halden/compose');
    const user = await writePost();
    await user.click(screen.getByRole('button', { name: 'Schedule' }));
    await user.click(day('2026-10-07'));
    fireEvent.change(dialog().getByLabelText('Time'), { target: { value: '09:00' } });
    await user.click(dialog().getByRole('combobox', { name: 'Repeat' }));
    await user.click(await screen.findByRole('option', { name: 'Weekly' }));
    // The chosen day's weekday is on; it can't be the only one taken off.
    const wednesday = dialog().getByRole('button', { name: 'Wednesday' });
    expect(wednesday).toHaveAttribute('aria-pressed', 'true');
    await user.click(wednesday);
    expect(wednesday).toHaveAttribute('aria-pressed', 'true');
    await user.click(dialog().getByRole('button', { name: 'Monday' }));
    await user.click(dialog().getByRole('combobox', { name: 'How often' }));
    await user.click(await screen.findByRole('option', { name: 'Every 2 weeks' }));
    await user.click(dialog().getByRole('combobox', { name: 'Ends' }));
    await user.click(await screen.findByRole('option', { name: 'After a number of times' }));
    fireEvent.change(dialog().getByLabelText('Number of times'), { target: { value: '8' } });
    expect(
      dialog().getByText(/^Every 2 weeks on Monday and Wednesday at .*, 8 times$/),
    ).toBeInTheDocument();
    await user.click(dialog().getByRole('button', { name: 'Repeat post' }));

    expect(
      await screen.findByText(
        `Repeating. The first one goes out ${long('2026-10-07T08:00:00.000Z', 'Europe/Lisbon')}.`,
      ),
    ).toBeInTheDocument();
    expect(sent(calls)).toEqual([`POST ${BASE}/posts`, `PUT ${POST}/recurrence`]);
    expect(calls.find((c) => c.key === `PUT ${POST}/recurrence`)?.body).toEqual({
      frequency: 'weekly',
      interval: 2,
      weekdays: [1, 3],
      time: '09:00',
      timezone: 'Europe/Lisbon',
      startsOn: '2026-10-07',
      ends: { type: 'after', count: 8 },
    });
    await waitFor(() => {
      expect(history.location.pathname).toBe(`/w/halden/posts/${POST_ID}`);
    });
  });

  it('monthly: on the day’s number or the last day; an end date must not be before the start', async () => {
    const calls = mockServer({ ...base(), [`PUT ${POST}/recurrence`]: [200, RULE] });
    renderApp('/w/halden/compose');
    const user = await writePost();
    await user.click(screen.getByRole('button', { name: 'Schedule' }));
    await user.click(day('2026-10-31'));
    await user.click(dialog().getByRole('combobox', { name: 'Repeat' }));
    await user.click(await screen.findByRole('option', { name: 'Monthly' }));
    expect(dialog().getByText('Months without a day 31 are skipped.')).toBeInTheDocument();
    await user.click(dialog().getByRole('combobox', { name: 'On' }));
    await user.click(await screen.findByRole('option', { name: 'The last day of the month' }));
    expect(dialog().queryByText('Months without a day 31 are skipped.')).not.toBeInTheDocument();
    await user.click(dialog().getByRole('combobox', { name: 'Ends' }));
    await user.click(await screen.findByRole('option', { name: 'On a date' }));
    // It starts a month after the first date.
    expect(dialog().getByLabelText('Last date')).toHaveValue('2026-11-30');
    fireEvent.change(dialog().getByLabelText('Last date'), { target: { value: '2026-10-30' } });
    expect(dialog().getByText('The last date is before the first one.')).toBeInTheDocument();
    expect(dialog().getByRole('button', { name: 'Repeat post' })).toBeDisabled();
    fireEvent.change(dialog().getByLabelText('Last date'), { target: { value: '2027-03-31' } });
    await user.click(dialog().getByRole('button', { name: 'Repeat post' }));
    await waitFor(() => {
      expect(calls.find((c) => c.key === `PUT ${POST}/recurrence`)?.body).toEqual({
        frequency: 'monthly',
        interval: 1,
        monthDay: -1,
        time: '11:00',
        timezone: 'UTC',
        startsOn: '2026-10-31',
        ends: { type: 'on', date: '2027-03-31' },
      });
    });
  });

  describe('a post that repeats', () => {
    const repeating = (): Record<string, Reply | Handler> => ({
      ...base(),
      [`GET ${POST}`]: [200, post({ recurring: 'template', recurrence: RULE })],
    });

    it('says how, offers to change or stop it, and not to publish or queue it', async () => {
      mockServer({
        ...repeating(),
        [`GET ${BASE}/accounts/${FB.id}/queue-slots`]: [
          200,
          slots([{ weekday: 1, time: '09:00' }]),
        ],
      });
      renderApp(`/w/halden/compose/${POST_ID}`);
      expect(
        await screen.findByText(/^Every week on Monday and Wednesday at /),
      ).toBeInTheDocument();
      expect(screen.getByText(`Next: ${long(RULE.nextRunAt ?? '')}.`)).toBeInTheDocument();
      expect(screen.getByText(/saving changes here replaces the copies/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Change repeat' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Publish now' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add to queue' })).not.toBeInTheDocument();
    });

    it('the dialog starts from its rule; a new rule replaces it', async () => {
      const calls = mockServer({ ...repeating(), [`PUT ${POST}/recurrence`]: [200, RULE] });
      renderApp(`/w/halden/compose/${POST_ID}`);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Change repeat' }));
      expect(dialog().getByRole('combobox', { name: 'Repeat' })).toHaveTextContent('Weekly');
      expect(dialog().getByLabelText('Time')).toHaveValue('09:00');
      expect(dialog().getByRole('button', { name: 'Monday' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(dialog().getByRole('button', { name: 'Tuesday' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      await user.click(dialog().getByRole('button', { name: 'Friday' }));
      await user.click(dialog().getByRole('button', { name: 'Repeat post' }));
      await waitFor(() => {
        expect(sent(calls)).toEqual([`PUT ${POST}/recurrence`]);
      });
      expect(calls.find((c) => c.key === `PUT ${POST}/recurrence`)?.body).toMatchObject({
        weekdays: [1, 3, 5],
        startsOn: '2026-10-05',
      });
    });

    it('scheduling it once stops the repeat first', async () => {
      const at = '2026-10-06T09:00:00.000Z';
      const calls = mockServer({
        ...repeating(),
        [`DELETE ${POST}/recurrence`]: [204],
        [`POST ${POST}/schedule`]: [200, post({ at })],
      });
      renderApp(`/w/halden/compose/${POST_ID}`);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Change repeat' }));
      await user.click(dialog().getByRole('combobox', { name: 'Repeat' }));
      await user.click(await screen.findByRole('option', { name: 'Doesn’t repeat' }));
      await user.click(day('2026-10-06'));
      await user.click(dialog().getByRole('button', { name: 'Schedule' }));
      await waitFor(() => {
        expect(sent(calls)).toEqual([`DELETE ${POST}/recurrence`, `POST ${POST}/schedule`]);
      });
      expect(calls.find((c) => c.key === `POST ${POST}/schedule`)?.body).toEqual({ at });
    });

    it('Stop repeating asks first, then makes it a draft again', async () => {
      const calls = mockServer({ ...repeating(), [`DELETE ${POST}/recurrence`]: [204] });
      renderApp(`/w/halden/compose/${POST_ID}`);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Stop repeating' }));
      expect(dialog().getByText(/Copies that haven’t gone out are removed/)).toBeInTheDocument();
      expect(sent(calls)).toEqual([]);
      await user.click(dialog().getByRole('button', { name: 'Stop repeating' }));
      expect(await screen.findByText('Stopped repeating. It’s a draft again.')).toBeInTheDocument();
      expect(sent(calls)).toEqual([`DELETE ${POST}/recurrence`]);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Publish now' })).toBeInTheDocument();
      });
      expect(screen.queryByText(/saving changes here replaces/)).not.toBeInTheDocument();
    });
  });
});

describe('the queue', () => {
  it('is offered once the chosen account has posting times, and takes the post', async () => {
    const at = '2026-10-06T09:00:00.000Z';
    const calls = mockServer({
      ...base(),
      [`GET ${BASE}/accounts/${FB.id}/queue-slots`]: [200, slots([{ weekday: 2, time: '09:00' }])],
      [`POST ${POST}/queue`]: [200, post({ at })],
    });
    const { history } = renderApp('/w/halden/compose');
    // Nothing chosen yet: no queue to offer.
    await screen.findByRole('button', { name: 'Schedule' });
    expect(screen.queryByRole('button', { name: 'Add to queue' })).not.toBeInTheDocument();
    const user = await writePost();
    await user.click(await screen.findByRole('button', { name: 'Add to queue' }));
    expect(
      await screen.findByText(`Added to the queue. It goes out ${long(at)}.`),
    ).toBeInTheDocument();
    expect(sent(calls)).toEqual([`POST ${BASE}/posts`, `POST ${POST}/queue`]);
    await waitFor(() => {
      expect(history.location.pathname).toBe(`/w/halden/posts/${POST_ID}`);
    });
  });

  it('isn’t offered when no chosen account has posting times', async () => {
    const calls = mockServer(base());
    renderApp('/w/halden/compose');
    await writePost();
    await waitFor(() => {
      expect(calls.some((c) => c.key.endsWith('/queue-slots'))).toBe(true);
    });
    expect(screen.getByRole('button', { name: 'Schedule' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Add to queue' })).not.toBeInTheDocument();
  });

  it('says which account has no posting times when only some do', async () => {
    mockServer({
      ...base({ accounts: [FB, FB2] }),
      [`GET ${BASE}/accounts/${FB.id}/queue-slots`]: [200, slots([{ weekday: 2, time: '09:00' }])],
    });
    renderApp('/w/halden/compose');
    const user = await writePost();
    expect(await screen.findByRole('button', { name: 'Add to queue' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Halden Roastery, Facebook' }));
    expect(
      await screen.findByText(
        'Halden Roastery has no posting times yet, so the queue can’t take this post.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to queue' })).toBeDisabled();
    // Scheduling at a time still works.
    expect(screen.getByRole('button', { name: 'Schedule' })).toBeEnabled();
  });

  it('a full queue is explained', async () => {
    mockServer({
      ...base(),
      [`GET ${BASE}/accounts/${FB.id}/queue-slots`]: [200, slots([{ weekday: 2, time: '09:00' }])],
      [`POST ${POST}/queue`]: [
        422,
        { error: { code: 'NO_QUEUE_SLOTS', message: 'x', details: { accountIds: [FB.id] } } },
      ],
    });
    renderApp('/w/halden/compose');
    const user = await writePost();
    await user.click(await screen.findByRole('button', { name: 'Add to queue' }));
    expect(
      await screen.findByText(
        'Some accounts have no free posting time in the queue. Schedule the post at a time instead.',
      ),
    ).toBeInTheDocument();
  });
});
