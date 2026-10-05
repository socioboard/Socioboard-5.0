// P2-F2 browser checks: real calendar/drag engine and app, deterministic API answers. The
// schedule-to-real-publish acceptance test is P2-Q3; these checks never call a social network.
import { expect, test, type Page } from '@playwright/test';
import type { CalendarEntry, PostDetails } from '@socioboard/contracts';
import {
  BASE,
  ENTRY,
  FB,
  IG,
  NOW,
  POST,
  SECOND,
  WID,
} from '../../src/features/calendar/__tests__/fixtures';
import { expectRightCursors } from '../support/cursors';

// The workspace is on Kolkata time; the browser is not (nor is this machine or CI), so a day or
// time read on the browser's clock instead of the workspace's would land in the wrong place.
test.use({ timezoneId: 'America/Los_Angeles' });

async function calendarServer(page: Page, role = 'owner') {
  let entries: CalendarEntry[] = [
    ENTRY,
    SECOND,
    {
      ...ENTRY,
      targetId: '01a0d816-827a-74d6-a46e-409c7db35003',
      postId: '01a0d816-827a-74d6-a46e-409c7db34003',
      status: 'published',
      text: 'Behind the scenes at the roastery',
      at: '2026-10-05T03:30:00Z',
      permalink: 'https://www.facebook.com/example',
    },
    {
      ...ENTRY,
      targetId: '01a0d816-827a-74d6-a46e-409c7db35004',
      postId: '01a0d816-827a-74d6-a46e-409c7db34004',
      status: 'failed',
      text: 'Our weekend tasting notes',
      at: '2026-10-08T08:30:00Z',
      lastError: {
        kind: 'auth',
        networkCode: '190',
        message: 'Reconnect this account to publish.',
      },
    },
    {
      ...ENTRY,
      targetId: '01a0d816-827a-74d6-a46e-409c7db35005',
      postId: '01a0d816-827a-74d6-a46e-409c7db34005',
      recurring: true,
      text: 'Saturday slow mornings',
      at: '2026-10-10T03:30:00Z',
    },
  ];
  let post = structuredClone(POST);
  let fail: 'conflict' | 'review' | null = null;
  // Posting times: Facebook on Tuesday and Thursday at 11:00 Kolkata; Instagram has none yet.
  const queues: Record<
    string,
    {
      timezone: string;
      slots: { weekday: number; time: string }[];
      upcoming: { at: string; entries: CalendarEntry[] }[];
    }
  > = {
    [FB.id]: {
      timezone: 'Asia/Kolkata',
      slots: [
        { weekday: 2, time: '11:00' },
        { weekday: 4, time: '11:00' },
      ],
      upcoming: [
        { at: '2026-10-06T05:30:00.000Z', entries: [] },
        { at: '2026-10-08T05:30:00.000Z', entries: [ENTRY] },
      ],
    },
    [IG.id]: { timezone: 'Asia/Kolkata', slots: [], upcoming: [] },
  };
  const writes: { path: string; body: unknown }[] = [];
  const unknown: string[] = [];
  await page.clock.setFixedTime(NOW);
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    let body: unknown;
    let status = 200;
    if (path === '/api/v1/me')
      body = {
        user: {
          id: POST.author?.id ?? 'missing-author',
          email: 'calendar@example.test',
          emailVerified: true,
          name: 'Priya Raman',
          avatarUrl: null,
          timezone: 'Asia/Kolkata',
          locale: 'en',
          twoFactorEnabled: false,
          isPlatformAdmin: false,
          createdAt: '2026-09-28T10:00:00Z',
        },
        memberships: [
          {
            workspace: {
              id: WID,
              name: 'Halden Coffee',
              slug: 'halden',
              logoUrl: null,
              timezone: 'Asia/Kolkata',
            },
            role,
          },
        ],
        activeWorkspaceId: WID,
      };
    else if (path === '/api/v1/auth/options')
      body = { socialProviders: [], emailVerificationRequired: true };
    else if (path === '/api/v1/networks') body = { items: [] };
    else if (path === `${BASE}/accounts`) body = { items: [FB, IG] };
    else if (path === `${BASE}/labels`) body = { items: [] };
    else if (path.endsWith('/queue-slots')) {
      const id = path.split('/').at(-2) ?? '';
      const queue = queues[id];
      if (request.method() === 'PUT') {
        const change = request.postDataJSON() as {
          timezone: string;
          slots: { weekday: number; time: string }[];
        };
        writes.push({ path, body: change });
        if (queue) Object.assign(queue, change);
      }
      body = queue;
    } else if (path === `${BASE}/posts`) body = { items: [post], nextCursor: null };
    else if (path === `${BASE}/calendar`)
      body = {
        items: entries.filter(
          (e) =>
            Date.parse(e.at) >= Date.parse(url.searchParams.get('from') ?? '') &&
            Date.parse(e.at) < Date.parse(url.searchParams.get('to') ?? '') &&
            (!url.searchParams.has('status') || e.status === url.searchParams.get('status')) &&
            (!url.searchParams.has('accountId') ||
              e.account.id === url.searchParams.get('accountId')),
        ),
        truncated: false,
      };
    else if (request.method() === 'PATCH' && path.endsWith('/schedule')) {
      const change = request.postDataJSON() as { at: string; previousAt: string };
      writes.push({ path, body: change });
      const id = path.split('/').at(-2);
      if (fail === 'review') {
        status = 422;
        body = { error: { code: 'REVIEW_REQUIRED', message: 'Review first' } };
        fail = null;
      } else if (fail === 'conflict') {
        const serverAt = '2026-10-09T08:30:00.000Z';
        entries = entries.map((e) => (e.targetId === id ? { ...e, at: serverAt } : e));
        post = {
          ...post,
          targets: post.targets.map((x) => (x.id === id ? { ...x, scheduledAt: serverAt } : x)),
        };
        status = 409;
        body = { error: { code: 'SCHEDULE_CHANGED', message: 'Moved', details: { at: serverAt } } };
        fail = null;
      } else {
        entries = entries.map((e) => (e.targetId === id ? { ...e, at: change.at } : e));
        post = {
          ...post,
          targets: post.targets.map((x) => (x.id === id ? { ...x, scheduledAt: change.at } : x)),
        };
        body = post;
      }
    } else if (request.method() === 'DELETE' && path === `${BASE}/posts/${ENTRY.postId}`) {
      writes.push({ path, body: null });
      entries = entries.filter((entry) => entry.postId !== ENTRY.postId);
      status = 204;
    } else if (path === `${BASE}/posts/${ENTRY.postId}`) body = post;
    else {
      unknown.push(`${request.method()} ${path}`);
      status = 404;
      body = { error: { code: 'NOT_FOUND', message: path } };
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: status === 204 ? '' : JSON.stringify(body),
    });
  });
  return {
    writes,
    unknown,
    failNext: (value: 'conflict' | 'review') => {
      fail = value;
    },
    getPost: (): PostDetails => post,
  };
}

test('calendar: month, preview, a single-account drag, rollback, filters, week and mobile', async ({
  page,
}) => {
  const server = await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05');
  const calendar = page.getByRole('region', { name: 'Calendar', exact: true });
  const event = page.locator(`[data-calendar-target="${ENTRY.targetId}"]`);
  await expect(event).toBeVisible();
  await expect(event).toContainText(/2:00 PM|14:00/);
  await expect(page.getByRole('heading', { name: 'October 2026' })).toBeVisible();
  await expectRightCursors(page, 'month calendar');
  await page.screenshot({ path: 'test-results/calendar-month-light.png', fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: 'test-results/calendar-month-dark.png', fullPage: true });
  await event.click();
  const drawer = page.getByRole('dialog', { name: 'Post preview' });
  await expect(drawer).toContainText(SECOND.text);
  await expect(
    drawer.getByRole('button', { name: 'Reschedule Halden Coffee', exact: true }),
  ).toBeVisible();
  await expectRightCursors(page, 'calendar preview');
  await page.screenshot({ path: 'test-results/calendar-preview-dark.png', fullPage: true });
  await drawer.getByRole('button', { name: 'Reschedule Halden Coffee', exact: true }).click();
  const picker = page.getByRole('dialog', { name: 'Reschedule', exact: true });
  await picker.getByLabel('Time', { exact: true }).fill('15:00');
  await picker.getByRole('button', { name: 'Save time' }).click();
  await expect(picker).toBeHidden();
  expect(server.writes[0]?.body).toEqual({ at: '2026-10-06T09:30:00.000Z', previousAt: ENTRY.at });
  expect(server.getPost().targets[1]?.scheduledAt).toBe(SECOND.at);
  await page.keyboard.press('Escape');
  await page.getByRole('switch', { name: 'Show each account' }).click();
  await expect(event).toBeVisible();
  const start = await event.boundingBox();
  const day7 = await page
    .getByRole('button', { name: /Write a post for (7 Oct 2026|Oct 7, 2026)/ })
    .boundingBox();
  expect(start).not.toBeNull();
  expect(day7).not.toBeNull();
  if (!start || !day7) throw new Error('Calendar drag positions are missing');
  const x = start.x + start.width / 2;
  const y = start.y + start.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(day7.x + day7.width / 2, y, { steps: 20 });
  await page.mouse.up();
  await expect.poll(() => server.writes.length).toBe(2);
  expect(server.writes[1]?.body).toEqual({
    at: '2026-10-07T09:30:00.000Z',
    previousAt: '2026-10-06T09:30:00.000Z',
  });
  await event.click();
  server.failNext('conflict');
  await drawer.getByRole('button', { name: 'Reschedule Halden Coffee', exact: true }).click();
  await picker.getByLabel('Time', { exact: true }).fill('16:00');
  await picker.getByRole('button', { name: 'Save time' }).click();
  await expect(page.getByText(/Someone moved this delivery/)).toBeVisible();
  await expect(drawer).toContainText(/9 Oct 2026|Oct 9, 2026/);
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Status', exact: true }).click();
  await page.getByRole('option', { name: 'Published', exact: true }).click();
  await expect(calendar).toContainText('Behind the scenes at the roastery');
  await expect(event).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Status', exact: true }).click();
  await page.getByRole('option', { name: 'All statuses', exact: true }).click();
  await page.getByRole('button', { name: 'Week', exact: true }).click();
  await expect(calendar).toHaveAttribute('data-view', 'week');
  await expect(event).toBeVisible();
  await expectRightCursors(page, 'week calendar');
  await expect(event).toContainText(/2:00 PM|14:00/);
  await expect(event).toContainText('Scheduled');
  await expect(page.getByRole('heading', { name: 'October 5 – 11, 2026' })).toBeVisible();
  await page.getByText(/Someone moved this delivery/).waitFor({ state: 'hidden' });
  await page.screenshot({ path: 'test-results/calendar-week-dark.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('region', { name: 'Agenda' })).toBeVisible();
  await expect(event).toBeVisible();
  await expectRightCursors(page, 'mobile calendar');
  await page.screenshot({ path: 'test-results/calendar-mobile-dark.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(server.unknown).toEqual([]);
});

test('date button opens a composer with that workspace day and proposed time', async ({ page }) => {
  await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05');
  await page.getByRole('button', { name: /Write a post for (7 Oct 2026|Oct 7, 2026)/ }).click();
  await expect(page).toHaveURL(/at=2026-10-07T03%3A30%3A00/);
  await expect(page.getByText(/Proposed time:/)).toContainText(/Oct 7, 2026|7 Oct 2026/);
});

test('a past day opens a new post without proposing its time', async ({ page }) => {
  await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05');
  await page.getByRole('button', { name: /Write a post for (4 Oct 2026|Oct 4, 2026)/ }).click();
  await expect(page).toHaveURL(/\/w\/halden\/compose$/);
  await expect(page.getByText(/Proposed time:/)).toHaveCount(0);
});

test('deleting in the preview requires confirmation and removes all deliveries from the calendar', async ({
  page,
}) => {
  const server = await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05');
  const event = page.locator(`[data-calendar-target="${ENTRY.targetId}"]`);
  await event.click();
  const drawer = page.getByRole('dialog', { name: 'Post preview' });
  await drawer.getByRole('button', { name: 'Delete', exact: true }).click();
  expect(server.writes).toHaveLength(0);
  const confirmation = page.getByRole('dialog', { name: 'Delete this post?' });
  await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(server.writes).toHaveLength(0);
  await drawer.getByRole('button', { name: 'Delete', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(event).toHaveCount(0);
  expect(server.writes).toHaveLength(1);
  expect(server.unknown).toEqual([]);
});

test('viewer can preview but cannot compose, edit, delete, duplicate or reschedule', async ({
  page,
}) => {
  const server = await calendarServer(page, 'viewer');
  await page.goto('/w/halden/calendar?date=2026-10-05');
  await page.locator(`[data-calendar-target="${ENTRY.targetId}"]`).click();
  const drawer = page.getByRole('dialog', { name: 'Post preview' });
  await expect(drawer).toContainText(POST.text);
  for (const name of ['Reschedule Halden Coffee', 'Duplicate', 'Delete'])
    await expect(drawer.getByRole('button', { name, exact: true })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Edit post' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'New post', exact: true })).toHaveCount(0);
  await expectRightCursors(page, 'viewer preview');
  expect(server.writes).toHaveLength(0);
});

// ── Polish: hover, keys, Undo ────────────────────────────────────────────────────────────────

/** A point in a week column, at a wall-clock time on the workspace's (Kolkata) clock. */
async function laneAt(page: Page, day: string, hour: number, minute: number) {
  // The day's full-height column (the header has a short one with the same date).
  const lane = page.locator(`.sb-calendar-lane[data-date="${day}"]`).last();
  await lane.evaluate((el) => {
    el.scrollIntoView({ block: 'center' });
  });
  const box = await lane.boundingBox();
  if (!box) throw new Error(`No column for ${day}`);
  // Into the middle of the quarter hour, so rounding can't land on its neighbour.
  const fraction = (hour * 60 + minute + 7) / (24 * 60);
  return { x: box.x + box.width / 2, y: box.y + box.height * fraction };
}

test('week: hovering an empty slot offers a post at that quarter hour, never in the past', async ({
  page,
}) => {
  await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05&view=week');
  await expect(page.locator(`[data-calendar-target="${ENTRY.targetId}"]`)).toBeVisible();
  const later = await laneAt(page, '2026-10-07', 11, 15);
  await page.mouse.move(later.x, later.y, { steps: 4 });
  const ghost = page.locator('.sb-calendar-ghost');
  await expect(ghost).toContainText(/11:15 AM|11:15/);
  // NOW is 15:30 in Kolkata on Monday 5 October: that morning is past, so the ghost goes.
  const past = await laneAt(page, '2026-10-05', 7, 0);
  await page.mouse.move(past.x, past.y, { steps: 4 });
  await expect(ghost).toHaveCount(0);
  await page.mouse.move(later.x, later.y, { steps: 4 });
  await expect(ghost).toContainText(/11:15 AM|11:15/);
  await page.screenshot({ path: 'test-results/calendar-week-ghost.png' });
  await ghost.click();
  // 11:15 in Kolkata is 05:45 UTC.
  await expect(page).toHaveURL(/at=2026-10-07T05%3A45%3A00/);
  await expect(page.getByText(/Proposed time:/)).toBeVisible();
});

test('resting on a card shows a quick look; moving away hides it', async ({ page }) => {
  await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05');
  const failed = page.locator('[data-calendar-target="01a0d816-827a-74d6-a46e-409c7db35004"]');
  await failed.hover();
  const look = page.getByRole('dialog', { name: 'Quick look' });
  await expect(look).toContainText('Our weekend tasting notes');
  await expect(look).toContainText('Reconnect this account to publish.');
  await expectRightCursors(page, 'quick look');
  await page.screenshot({ path: 'test-results/calendar-quick-look.png' });
  await page.mouse.move(5, 5);
  await expect(look).toBeHidden();
  // Open from it: the full preview.
  await page.locator(`[data-calendar-target="${ENTRY.targetId}"]`).hover();
  await look.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('dialog', { name: 'Post preview' })).toContainText(ENTRY.text);
  await expect(look).toBeHidden();
});

test('keys: arrows change period, T today, W and M views, N a new post', async ({ page }) => {
  await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05');
  await expect(page.getByRole('heading', { name: 'October 2026' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { name: 'November 2026' })).toBeVisible();
  await page.keyboard.press('t');
  await expect(page.getByRole('heading', { name: 'October 2026' })).toBeVisible();
  await page.keyboard.press('w');
  await expect(page.getByRole('region', { name: 'Calendar', exact: true })).toHaveAttribute(
    'data-view',
    'week',
  );
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('heading', { name: /September 28 – October 4, 2026/ })).toBeVisible();
  await page.keyboard.press('m');
  await expect(page.getByRole('region', { name: 'Calendar', exact: true })).toHaveAttribute(
    'data-view',
    'month',
  );
  // Typing in a field isn't a shortcut.
  await page.getByRole('combobox', { name: 'Status', exact: true }).focus();
  await page.keyboard.press('n');
  await expect(page).toHaveURL(/\/calendar/);
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('n');
  await expect(page).toHaveURL(/\/w\/halden\/compose$/);
});

test('a drag shows where the card will land, and Undo moves it back', async ({ page }) => {
  const server = await calendarServer(page);
  await page.goto('/w/halden/calendar?view=week&separate=true');
  const event = page.locator(`[data-calendar-target="${ENTRY.targetId}"]`);
  await expect(event).toBeVisible();
  // Scroll first (finding the column scrolls the grid), then measure where the card is.
  const to = await laneAt(page, '2026-10-08', 16, 0);
  const start = await event.boundingBox();
  if (!start) throw new Error('No card');
  await page.mouse.move(start.x + start.width / 2, start.y + 10);
  await page.mouse.down();
  await page.mouse.move((start.x + to.x) / 2, (start.y + to.y) / 2, { steps: 12 });
  // The page re-renders mid-drag (T puts today's date in the address); the drag carries on.
  await page.keyboard.press('t');
  await expect(page).toHaveURL(/date=2026-10-05/);
  await page.mouse.move(to.x, to.y, { steps: 12 });
  const label = page.locator('.sb-calendar-drag-label');
  await expect(label).toContainText(/Move to Thu, Oct 8, 2026|Move to Thu, 8 Oct 2026/);
  await page.screenshot({ path: 'test-results/calendar-dragging.png' });
  await page.mouse.up();
  await expect.poll(() => server.writes.length).toBe(1);
  const moved = server.writes[0]?.body as { at: string; previousAt: string };
  expect(moved.previousAt).toBe(ENTRY.at);
  await page.screenshot({ path: 'test-results/calendar-landed.png' });
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect.poll(() => server.writes.length).toBe(2);
  expect(server.writes[1]?.body).toEqual({ at: ENTRY.at, previousAt: moved.at });
  await expect(page.getByText(/is back at/)).toBeVisible();
  // Undoing isn't itself undoable.
  await expect(page.getByRole('button', { name: 'Undo' })).toHaveCount(0);
});

// ── Queue (P2-F3) ─────────────────────────────────────────────────────────────────────────────

test('queue: an account’s next posting times, the free ones offered to write for', async ({
  page,
}) => {
  const server = await calendarServer(page);
  await page.goto('/w/halden/queue');
  const queue = page.getByRole('region', { name: 'Halden Coffee' });
  await expect(queue).toContainText('2 posting times a week');
  await expect(queue).toContainText('Free');
  // The slot with a post shows the post, linking to it.
  await expect(queue.getByRole('link', { name: /Autumn menu is here/ })).toBeVisible();
  await expectRightCursors(page, 'queue');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/queue.png' });
  expect(server.unknown).toEqual([]);
  await queue.getByRole('link', { name: /Write a post for/ }).click();
  await expect(page).toHaveURL(/compose\?at=2026-10-06T05%3A30%3A00\.000Z&account=/);
  // That account is already chosen.
  await expect(page.getByRole('button', { name: 'Halden Coffee, Facebook' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'halden.coffee, Instagram' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('posting times: start from a preset, change a day, copy it, save', async ({ page }) => {
  const server = await calendarServer(page);
  await page.goto(`/w/halden/queue?account=${IG.id}`);
  await expect(page.getByText('No posting times yet')).toBeVisible();
  await page.getByRole('button', { name: 'Set posting times' }).click();
  const dialog = page.getByRole('dialog', { name: 'Posting times' });
  await dialog.getByRole('button', { name: 'Start from' }).click();
  await page.getByRole('menuitem', { name: 'Weekdays at 09:00 and 15:00' }).click();
  await expect(dialog).toContainText('10 posting times a week.');
  // Monday: drop 15:00, add 18:30, then give every weekday Monday's times.
  await dialog.getByRole('button', { name: /Remove (3:00 PM|15:00) on Monday/ }).click();
  await dialog.getByRole('button', { name: 'Add a time on Monday' }).click();
  await dialog.getByLabel('New time on Monday').fill('18:30');
  await dialog.getByRole('button', { name: 'Add', exact: true }).click();
  // The account posts on Tokyo time.
  await dialog.getByRole('button', { name: /Time zone/ }).click();
  await page.getByRole('combobox', { name: 'Search time zones' }).fill('Tokyo');
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('button', { name: /Time zone/ })).toContainText('Tokyo');
  await dialog.getByRole('button', { name: 'Copy Monday’s times' }).click();
  await page.getByRole('menuitem', { name: 'Copy to weekdays' }).click();
  await expectRightCursors(page, 'posting times');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/posting-times.png' });
  await dialog.getByRole('button', { name: 'Save posting times' }).click();
  await expect(dialog).toBeHidden();
  const put = server.writes.find((w) => w.path.endsWith('/queue-slots'))?.body as {
    timezone: string;
    slots: { weekday: number; time: string }[];
  };
  expect(put.timezone).toBe('Asia/Tokyo');
  expect(put.slots).toEqual(
    [1, 2, 3, 4, 5].flatMap((weekday) => [
      { weekday, time: '09:00' },
      { weekday, time: '18:30' },
    ]),
  );
  await expect(page.getByText(/halden.coffee has 10 posting times a week/)).toBeVisible();
});

test('week view shows free posting times; one opens a post for that account and time', async ({
  page,
}) => {
  await calendarServer(page);
  await page.goto('/w/halden/calendar?date=2026-10-05&view=week');
  // Tuesday 11:00 is free; Thursday 11:00 has a post, so it isn't offered.
  const open = page.locator('[data-open-slot="2026-10-06T05:30:00.000Z"]');
  await expect(open).toContainText('Halden Coffee');
  await expect(page.locator('[data-open-slot="2026-10-08T05:30:00.000Z"]')).toHaveCount(0);
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/calendar-open-slot.png' });
  await open.click();
  await expect(page).toHaveURL(/at=2026-10-06T05%3A30%3A00\.000Z&account=/);
});

test('people who can’t manage accounts see the queue but can’t change posting times', async ({
  page,
}) => {
  await calendarServer(page, 'viewer');
  await page.goto('/w/halden/queue');
  await expect(page.getByRole('region', { name: 'Halden Coffee' })).toContainText('Free');
  await expect(page.getByRole('button', { name: 'Posting times' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Write a post for/ })).toHaveCount(0);
});
