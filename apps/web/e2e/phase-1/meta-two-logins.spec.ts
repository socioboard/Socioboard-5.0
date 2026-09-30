// P1-Q3 (docs/stages/phase-1.md): two different Facebook logins in one workspace, each bringing its
// own Page. One post goes to both Pages; then the first login is reconnected, and the second
// keeps working (its accounts stay active and it publishes again). Every Facebook post is deleted
// afterwards.
//
// It publishes for real: the 'meta' Playwright project (`pnpm --filter @socioboard/web e2e:meta`),
// with E2E_META_PAGE and E2E_META_PAGE_2 in .env and both Facebook sessions saved
// (`e2e:meta:login` and `e2e:meta:login second`).
import { existsSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { expectRightCursors } from '../support/cursors';
import {
  addOnly,
  approveFacebookConnect,
  deleteFromNetworks,
  FACEBOOK_SESSION,
  FACEBOOK_SESSION_2,
  metaSkipReason,
  metaTarget,
  secondPage,
  useFacebookSession,
  workspaceIdOf,
} from '../support/meta';
import { browserFor, person, signUp, verifyByEmail } from '../support/people';

const APP_ORIGIN = 'http://localhost:5173';

test.setTimeout(8 * 60_000);

function skipReason(): string | null {
  const base = metaSkipReason();
  if (base) return base;
  if (!secondPage) return 'Set E2E_META_PAGE_2 to a Page the second Facebook account manages.';
  if (!existsSync(FACEBOOK_SESSION_2)) {
    return 'No second Facebook session: run `pnpm --filter @socioboard/web e2e:meta:login second`.';
  }
  return null;
}

/** Publishes the composer's post and waits for every Page's link; returns the post's id. */
async function publishAndWait(page: Page, links: number): Promise<string> {
  await expect(page.getByText('Ready to publish')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Publish now' }).click();
  await expect(page).toHaveURL(/\/posts\/[0-9a-f-]+$/, { timeout: 30_000 });
  await expect(page.getByRole('link', { name: 'View on Facebook' })).toHaveCount(links, {
    timeout: 180_000,
  });
  return new URL(page.url()).pathname.split('/').at(-1) ?? '';
}

test('two Facebook logins in one workspace: both publish, reconnecting one leaves the other', async ({
  browser,
}) => {
  const skip = skipReason();
  test.skip(skip !== null, skip ?? '');

  const owner = person('meta2');
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const context = await browserFor(browser);
  await useFacebookSession(context, FACEBOOK_SESSION);
  const page = await context.newPage();
  const published: string[] = [];

  await page.goto('/signup');
  await signUp(page, owner);
  await verifyByEmail(page, owner);
  await page.getByLabel('Workspace name').fill(`Two logins ${owner.name.split(' ')[1] ?? ''}`);
  await page.getByRole('button', { name: 'Create workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Connect your first account' })).toBeVisible();
  const slug = new URL(page.url()).pathname.split('/')[2] ?? '';
  const workspaceId = await workspaceIdOf(page, slug);

  try {
    // --- First login: the main account's Page. ---
    await page.getByRole('button', { name: 'Connect an account' }).click();
    await page
      .getByRole('dialog', { name: 'Connect an account' })
      .getByRole('button', { name: /^Facebook/ })
      .click();
    await page.waitForURL(/facebook\.com/, { timeout: 30_000 });
    await approveFacebookConnect(page, APP_ORIGIN);
    // Who the first login is, as the picker says it ("Signed in to Facebook as Priya Raman.").
    const signedIn = await page.getByText(/^Signed in to Facebook as /).textContent();
    const firstLogin = (signedIn ?? '')
      .replace(/^Signed in to Facebook as /, '')
      .replace(/\.$/, '');
    expect(firstLogin).not.toBe('');
    await addOnly(page, [metaTarget.page]);
    await expect(page.getByRole('heading', { name: 'Write your first post' })).toBeVisible();

    // --- Second login: switch who's signed in to Facebook, then "Connect another". ---
    await useFacebookSession(context, FACEBOOK_SESSION_2);
    await page.goto(`/w/${slug}/accounts`);
    await page.getByRole('button', { name: 'Connect another Facebook account' }).click();
    const tip = page.getByRole('dialog', { name: 'Adding another Facebook account?' });
    await expectRightCursors(page, 'switch-account tip');
    await tip.getByRole('button', { name: 'Continue to Facebook' }).click();
    await page.waitForURL(/facebook\.com/, { timeout: 30_000 });
    await approveFacebookConnect(page, APP_ORIGIN);
    await expect(page.getByText(/^Signed in to Facebook as /)).toBeVisible();
    await addOnly(page, [secondPage]);

    // Accounts: two logins, one Page each.
    await expect(page).toHaveURL(new RegExp(`/w/${slug}/accounts$`));
    const manage = page.getByRole('button', { name: /^Manage .+’s Facebook login$/ });
    await expect(manage).toHaveCount(2);
    await expect(page.getByRole('button', { name: new RegExp(metaTarget.page) })).toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(secondPage) })).toBeVisible();
    await expectRightCursors(page, 'accounts with two logins');

    // --- One post to both Pages. ---
    await page.goto(`/w/${slug}/compose`);
    await page.getByRole('button', { name: `${metaTarget.page}, Facebook` }).click();
    await page.getByRole('button', { name: `${secondPage}, Facebook` }).click();
    await page
      .getByRole('textbox', { name: 'Text' })
      .fill(`Socioboard 6.0 two-login test (${stamp} UTC). Please ignore; deleted after the test.`);
    published.push(await publishAndWait(page, 2));

    // --- Reconnect the first login only. ---
    await useFacebookSession(context, FACEBOOK_SESSION);
    await page.goto(`/w/${slug}/accounts`);
    await page.getByRole('button', { name: `Manage ${firstLogin}’s Facebook login` }).click();
    const drawer = page.getByRole('dialog');
    await drawer.getByRole('button', { name: 'Reconnect' }).click();
    await page.waitForURL(/facebook\.com/, { timeout: 30_000 });
    await approveFacebookConnect(page, APP_ORIGIN);
    await expect(page.getByText(/^Reconnected .+’s Facebook login/)).toBeVisible();

    // The second login is untouched: still active, and it publishes again.
    await page.goto(`/w/${slug}/accounts`);
    await expect(page.getByText('Reconnect', { exact: true })).toHaveCount(0);
    await page.goto(`/w/${slug}/compose`);
    await page.getByRole('button', { name: `${secondPage}, Facebook` }).click();
    await page
      .getByRole('textbox', { name: 'Text' })
      .fill(`Socioboard 6.0 two-login test, after reconnecting the other login (${stamp} UTC).`);
    published.push(await publishAndWait(page, 1));
  } finally {
    // --- Clean up every Facebook post this run made. ---
    for (const postId of published) {
      const report = deleteFromNetworks(workspaceId, postId);
      console.log(report.trim());
    }
    await context.close();
  }
  expect(published).toHaveLength(2);
});
