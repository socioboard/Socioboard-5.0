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
    else if (path === `${BASE}/posts`) body = { items: [post], nextCursor: null };
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
