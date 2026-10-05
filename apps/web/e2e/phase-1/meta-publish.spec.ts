// P1-Q1: phase 1's "done when" against real Meta accounts (docs/stages/phase-1.md). A new user
// creates a workspace, connects a Facebook Page (and its Instagram account) in onboarding step 2,
// writes an image post with a live preview, publishes it, and sees each network's link. The post
// is taken back off Facebook afterwards (Instagram has no delete API: it stays).
//
// It publishes for real, so it has its own Playwright project, run only by `pnpm --filter
// @socioboard/web e2e:meta` (never by `pnpm e2e`). It needs E2E_META_PAGE (and optionally
// E2E_META_INSTAGRAM) in .env, a Facebook session from `pnpm --filter @socioboard/web
// e2e:meta:login`, and storage the networks can fetch from (S3 with STORAGE_PUBLIC_URL or
// MEDIA_PUBLIC_URL).
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { expectRightCursors } from '../support/cursors';
import {
  approveFacebookConnect,
  FACEBOOK_SESSION,
  metaSkipReason,
  metaTarget,
} from '../support/meta';
import { browserFor, person, signUp, verifyByEmail } from '../support/people';

const IMAGE = fileURLToPath(new URL('../fixtures/square-1080.png', import.meta.url));
const API_DIR = fileURLToPath(new URL('../../../api', import.meta.url));
const APP_ORIGIN = 'http://localhost:5173';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Facebook sign-in, the upload, processing and two networks publishing take a while.
test.setTimeout(6 * 60_000);

test('connect a Page, publish an image post, see where it went', async ({ browser }) => {
  const skip = metaSkipReason();
  test.skip(skip !== null, skip ?? '');

  const owner = person('meta');
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const text = `Socioboard 6.0 end-to-end test (${stamp} UTC). Please ignore; it's deleted after the test.`;
  const context = await browserFor(browser, { storageState: FACEBOOK_SESSION });
  const page = await context.newPage();

  // --- A new workspace; onboarding step 2 connects the accounts. ---
  await page.goto('/signup');
  await signUp(page, owner);
  await verifyByEmail(page, owner);
  await page.getByLabel('Workspace name').fill(`Meta E2E ${owner.name.split(' ')[1] ?? ''}`);
  await page.getByRole('button', { name: 'Create workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Connect your first account' })).toBeVisible();
  const slug = new URL(page.url()).pathname.split('/')[2] ?? '';
  await page.getByRole('button', { name: 'Connect an account' }).click();
  await page
    .getByRole('dialog', { name: 'Connect an account' })
    .getByRole('button', { name: /^Facebook/ })
    .click();

  // Facebook: the saved session signs in; the test approves Socioboard's request.
  await page.waitForURL(/facebook\.com/, { timeout: 30_000 });
  await approveFacebookConnect(page, APP_ORIGIN);

  // Back in Socioboard: tick only the Page (and Instagram account) under test.
  await expect(page.getByRole('heading', { name: 'Choose what to add' })).toBeVisible();
  // Untick what's ticked (new accounts start ticked), one at a time: the set shrinks as it goes.
  const ticked = page.getByRole('checkbox', { checked: true, disabled: false });
  while ((await ticked.count()) > 0) await ticked.first().click();
  for (const name of [metaTarget.page, metaTarget.instagram].filter(Boolean)) {
    await page.getByRole('checkbox', { name: new RegExp(`^${escapeRegExp(name)}\\b`) }).check();
  }
  await expectRightCursors(page, 'asset picker');
  await page.getByRole('button', { name: /^Add \d+ accounts?$/ }).click();

  // The connect ends on onboarding step 3, which opens the composer.
  await expect(page.getByRole('heading', { name: 'Write your first post' })).toBeVisible();
  await page.getByRole('link', { name: 'Write a post' }).click();

  // --- Compose: accounts, text, an image; the preview follows. ---
  await page.getByRole('button', { name: `${metaTarget.page}, Facebook` }).click();
  if (metaTarget.instagram) {
    await page.getByRole('button', { name: `${metaTarget.instagram}, Instagram` }).click();
  }
  await page.getByRole('textbox', { name: 'Text' }).fill(text);
  await page.getByTestId('composer-file-input').setInputFiles(IMAGE);
  const strip = page.getByRole('list', { name: 'Media' });
  // Uploaded to storage and processed: the real thumbnail replaces the placeholder.
  await expect(strip.locator('img[src]')).toBeVisible({ timeout: 90_000 });
  const preview = page.getByRole('complementary', { name: 'Preview' });
  await expect(preview).toContainText(text.slice(0, 40));
  await expect(preview.locator('img[src]').last()).toBeVisible();
  await expect(page.getByText('Ready to publish')).toBeVisible({ timeout: 30_000 });
  await expectRightCursors(page, 'composer, ready to publish');

  // --- Publish: the post page shows each network's link once it's out. ---
  await page.getByRole('button', { name: 'Publish now' }).click();
  await expect(page).toHaveURL(new RegExp(`/w/${slug}/posts/[0-9a-f-]+$`), { timeout: 30_000 });
  const postId = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  const facebookLink = page.getByRole('link', { name: 'View on Facebook' });
  await expect(facebookLink).toBeVisible({ timeout: 180_000 });
  expect(await facebookLink.getAttribute('href')).toMatch(/^https:\/\/(www\.)?facebook\.com\//);
  if (metaTarget.instagram) {
    const instagramLink = page.getByRole('link', { name: 'View on Instagram' });
    await expect(instagramLink).toBeVisible({ timeout: 180_000 });
    expect(await instagramLink.getAttribute('href')).toMatch(/^https:\/\/(www\.)?instagram\.com\//);
  }
  await expect(page.getByText('Published', { exact: true }).first()).toBeVisible();
  await expectRightCursors(page, 'published post');

  // --- Live (P2-F5): the news came over the socket. While it's live the bell never asks the
  // server on a timer, so the "your post is live" notification can only have arrived as an event.
  await expect(page.locator('html')).toHaveAttribute('data-live', 'live');
  const [bell] = await page.getByRole('button', { name: /^Notifications/ }).all();
  if (!bell) throw new Error('No bell');
  await expect(bell).toHaveAccessibleName(/Notifications, \d+ unread/, { timeout: 20_000 });

  // --- Clean up: take the post back off Facebook. ---
  const workspaceId = await page.evaluate(async (s) => {
    const me = (await (await fetch('/api/v1/me')).json()) as {
      memberships: { workspace: { id: string; slug: string } }[];
    };
    return me.memberships.find((m) => m.workspace.slug === s)?.workspace.id ?? '';
  }, slug);
  const report = execFileSync('pnpm', ['delete-network-post', workspaceId, postId], {
    cwd: API_DIR,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  console.log(report.trim());
  expect(report).toMatch(/facebook_page .+: deleted\./);

  await context.close();
});
