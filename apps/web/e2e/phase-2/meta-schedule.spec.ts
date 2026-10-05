// P2-Q3 (docs/stages/phase-2.md): schedule → appears on the calendar → drag to a new time →
// publishes at the new time, against a real Facebook Page. A new owner connects the Page, writes
// a post and schedules it about half an hour ahead; on the week calendar the card is dragged to a
// quarter hour a few minutes ahead (earlier, so the run stays short and the old time is the one
// that must never fire). It goes out then, once, and is taken back off Facebook.
//
// It publishes for real, so it runs only in the Meta project (`pnpm --filter @socioboard/web
// e2e:meta`), Facebook only: Instagram posts can't be deleted.
import { expect, test, type Page } from '@playwright/test';

import { expectRightCursors } from '../support/cursors';
import {
  addOnly,
  approveFacebookConnect,
  deleteFromNetworks,
  FACEBOOK_SESSION,
  metaSkipReason,
  metaTarget,
  workspaceIdOf,
} from '../support/meta';
import { browserFor, person, signUp, verifyByEmail } from '../support/people';

const APP_ORIGIN = 'http://localhost:5173';
const MINUTE = 60_000;
const QUARTER = 15 * MINUTE;

// Signing in to Facebook, then up to about 20 minutes until the new time comes round.
test.setTimeout(30 * 60_000);

/**
 * A timezone where it's around midday now, so the post's first and new times are on the same day
 * and both on screen in the week grid, whenever the test runs. The browser runs in it, so the new
 * workspace takes it.
 */
function middayZone(): string {
  const zones = [
    'Pacific/Honolulu',
    'America/Los_Angeles',
    'America/New_York',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];
  const hourIn = (zone: string) =>
    Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: zone,
        hour: 'numeric',
        hourCycle: 'h23',
      }).format(Date.now()),
    );
  return zones.reduce((best, z) =>
    Math.abs(hourIn(z) - 12) < Math.abs(hourIn(best) - 12) ? z : best,
  );
}

/** The next quarter hour at least `minutes` from now. */
const quarterAfter = (minutes: number) =>
  Math.ceil((Date.now() + minutes * MINUTE) / QUARTER) * QUARTER;

/** An instant on the workspace's clock: its date (YYYY-MM-DD), hour and minute. */
function onClock(instant: number, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year ?? ''}-${parts.month ?? ''}-${parts.day ?? ''}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/**
 * The point in a day's column of the week grid for a time (the middle of its quarter hour), as
 * the grid is scrolled now: the caller scrolls the card into view, and the new time is near it.
 */
async function laneAt(page: Page, at: { date: string; hour: number; minute: number }) {
  const lane = page.locator(`.sb-calendar-lane[data-date="${at.date}"]`).last();
  const box = await lane.boundingBox();
  if (!box) throw new Error(`No column for ${at.date}`);
  const fraction = (at.hour * 60 + at.minute + 7) / (24 * 60);
  return { x: box.x + box.width / 2, y: box.y + box.height * fraction };
}

interface Delivery {
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  permalink: string | null;
  history: { outcome: string }[];
}

test('schedule, see it on the calendar, drag it, and it goes out at the new time', async ({
  browser,
}) => {
  const skip = metaSkipReason();
  test.skip(skip !== null, skip ?? '');

  const owner = person('meta-schedule');
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const text = `Socioboard 6.0 scheduling test (${stamp} UTC). Please ignore; it's deleted after the test.`;
  const zone = middayZone();
  const context = await browserFor(browser, { storageState: FACEBOOK_SESSION, timezoneId: zone });
  const page = await context.newPage();

  // --- A new workspace with the Facebook Page connected. ---
  await page.goto('/signup');
  await signUp(page, owner);
  await verifyByEmail(page, owner);
  await page.getByLabel('Workspace name').fill(`Meta Schedule ${owner.name.split(' ')[1] ?? ''}`);
  await page.getByRole('button', { name: 'Create workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Connect your first account' })).toBeVisible();
  const slug = new URL(page.url()).pathname.split('/')[2] ?? '';
  await page.getByRole('button', { name: 'Connect an account' }).click();
  await page
    .getByRole('dialog', { name: 'Connect an account' })
    .getByRole('button', { name: /^Facebook/ })
    .click();
  await page.waitForURL(/facebook\.com/, { timeout: 30_000 });
  await approveFacebookConnect(page, APP_ORIGIN);
  await addOnly(page, [metaTarget.page]);
  await expect(page.getByRole('heading', { name: 'Write your first post' })).toBeVisible();
  const workspaceId = await workspaceIdOf(page, slug);
  const timeZone = await page.evaluate(async (s) => {
    const me = (await (await fetch('/api/v1/me')).json()) as {
      memberships: { workspace: { slug: string; timezone: string } }[];
    };
    return me.memberships.find((m) => m.workspace.slug === s)?.workspace.timezone ?? 'UTC';
  }, slug);

  // The first time, about half an hour ahead: the one that must never fire. The new time is
  // picked just before the drag (the next quarter hour at least 3 minutes away, so the drop still
  // leaves the 2 minutes' notice); this is near what it will be, for the week check.
  const firstAt = quarterAfter(33);
  const from = onClock(firstAt, timeZone);
  const roughly = onClock(quarterAfter(5), timeZone);
  // Around midday in the workspace's zone: both times on the same day, so in one column.
  expect(roughly.date).toBe(from.date);

  // --- Compose and schedule it for the first time (the calendar's way in: ?at=). ---
  await page.goto(`/w/${slug}/compose?at=${encodeURIComponent(new Date(firstAt).toISOString())}`);
  await page.getByRole('button', { name: `${metaTarget.page}, Facebook` }).click();
  await page.getByRole('textbox', { name: 'Text' }).fill(text);
  await expect(page.getByText('Ready to publish')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Schedule', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Schedule post' });
  await expect(dialog).toBeVisible();
  await expectRightCursors(page, 'schedule dialog');
  await dialog.getByRole('button', { name: 'Schedule', exact: true }).click();
  await expect(page.getByText(/^Scheduled for /).first()).toBeVisible({ timeout: 30_000 });
  // Scheduled: the post's page.
  await expect(page).toHaveURL(new RegExp(`/w/${slug}/posts/[0-9a-f-]+$`));
  const postId = new URL(page.url()).pathname.split('/').at(-1) ?? '';

  const delivery = () =>
    page.evaluate(
      async ({ w, p }) => {
        const res = await fetch(`/api/v1/workspaces/${w}/posts/${p}`);
        const post = (await res.json()) as { targets: (Delivery & { id: string })[] };
        return post.targets[0];
      },
      { w: workspaceId, p: postId },
    );

  // From here a real post is waiting to go out: whatever happens, it's cleaned up (finally).
  try {
    const scheduled = await delivery();
    expect(scheduled?.status).toBe('scheduled');
    expect(scheduled?.scheduledAt).toBe(new Date(firstAt).toISOString());
    const targetId = scheduled?.id ?? '';

    // --- On the week calendar at its time; dragged to the new time. ---
    await page.goto(`/w/${slug}/calendar?view=week&date=${from.date}`);
    const card = page.locator(`[data-calendar-target="${targetId}"]`);
    await expect(card).toBeVisible();
    await expect(card).toContainText(text.slice(0, 30));
    await expectRightCursors(page, 'week calendar with the scheduled post');
    // Centred, so the new time half an hour above it is on screen too.
    await card.evaluate((el) => {
      el.scrollIntoView({ block: 'center' });
    });
    const moveTo = quarterAfter(3);
    expect(moveTo).toBeLessThan(firstAt);
    const target = await laneAt(page, onClock(moveTo, timeZone));
    const start = await card.boundingBox();
    if (!start) throw new Error('No card');
    await page.mouse.move(start.x + start.width / 2, start.y + 10);
    await page.mouse.down();
    await page.mouse.move((start.x + target.x) / 2, (start.y + target.y) / 2, { steps: 10 });
    await page.mouse.move(target.x, target.y, { steps: 10 });
    await expect(page.locator('.sb-calendar-drag-label')).toContainText('Move to');
    await page.mouse.up();
    await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();

    // Moved: a new time and a new version; the old time's job finds nothing to do.
    await expect
      .poll(async () => (await delivery())?.scheduledAt)
      .toBe(new Date(moveTo).toISOString());
    expect((await delivery())?.status).toBe('scheduled');

    // --- It goes out at the new time, once. ---
    await expect
      .poll(async () => (await delivery())?.status, {
        timeout: moveTo - Date.now() + 5 * MINUTE,
        intervals: [10_000],
      })
      .toBe('published');
    const sent = await delivery();
    const publishedAt = new Date(sent?.publishedAt ?? 0).getTime();
    // Not before its time; within a minute and a half after (the worker picks it up at once,
    // then Facebook answers).
    expect(publishedAt).toBeGreaterThanOrEqual(moveTo);
    expect(publishedAt - moveTo).toBeLessThan(90_000);
    expect(sent?.history.map((h) => h.outcome)).toEqual(['published']);
    expect(sent?.permalink).toMatch(/^https:\/\/(www\.)?facebook\.com\//);

    // The calendar shows it published at the new time (live: the socket brought the change).
    await expect(card).toContainText('Published', { timeout: 20_000 });
    await expect(page.locator('html')).toHaveAttribute('data-live', 'live');
  } finally {
    // --- Clean up: still waiting (the test failed first), unscheduled; out, off Facebook. ---
    const last = await delivery().catch(() => undefined);
    if (last?.status === 'scheduled') {
      await page.evaluate(
        ({ w, p }) => fetch(`/api/v1/workspaces/${w}/posts/${p}/unschedule`, { method: 'POST' }),
        { w: workspaceId, p: postId },
      );
    }
    if (last?.status === 'published') {
      const report = deleteFromNetworks(workspaceId, postId);
      console.log(report.trim());
      expect(report).toMatch(/facebook_page .+: deleted\./);
    }
    await context.close();
  }
});
