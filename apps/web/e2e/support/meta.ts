// The Meta end-to-end test (P1-Q1) against real Facebook and Instagram accounts. Facebook's
// sign-in isn't scripted: `pnpm --filter @socioboard/web e2e:meta:login` opens a browser, you sign
// in to Facebook yourself once, and only the session is saved (in e2e/.auth, never committed).
// The test reuses it to approve Socioboard's connect screen.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { expect, type BrowserContext, type Page } from '@playwright/test';

/** Facebook's cookies after the one-time sign-in (git-ignored): the main account… */
export const FACEBOOK_SESSION = fileURLToPath(new URL('../.auth/facebook.json', import.meta.url));
/** …and a second, different Facebook account (`e2e:meta:login second`), for two logins in one workspace. */
export const FACEBOOK_SESSION_2 = fileURLToPath(
  new URL('../.auth/facebook-2.json', import.meta.url),
);

/**
 * What the test posts to, by the names Facebook shows: the Page is required, the Instagram account
 * (linked to a Page) optional.
 */
export const metaTarget = {
  page: process.env.E2E_META_PAGE ?? '',
  instagram: process.env.E2E_META_INSTAGRAM ?? '',
};

/** Why the test can't run, or null when it can. */
export function metaSkipReason(): string | null {
  if (!metaTarget.page) return 'Set E2E_META_PAGE to the Facebook Page to post to.';
  if (!existsSync(FACEBOOK_SESSION)) {
    return 'No Facebook session: run `pnpm --filter @socioboard/web e2e:meta:login` first.';
  }
  return null;
}

/**
 * On Facebook's Login for Business screens: approves each step ("Continue as …", the Pages and
 * permissions it asks about, "Save", "Got it") until Facebook sends the browser back to the app.
 * The Pages and Instagram accounts to add are chosen in Socioboard afterwards.
 */
export async function approveFacebookConnect(page: Page, appOrigin: string) {
  const approve =
    /^(continue( as .+)?|save|got it|ok|done|reconnect|opt in to (all )?current (and future )?(pages|businesses))$/i;
  await expect(async () => {
    if (page.url().startsWith(appOrigin)) return;
    const button = page.getByRole('button', { name: approve }).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 5_000 }).catch(() => undefined);
    }
    expect(page.url()).toContain(appOrigin);
  }).toPass({ timeout: 120_000, intervals: [1_000, 2_000] });
}

/** The second account's Page (E2E_META_PAGE_2), for two logins in one workspace. */
export const secondPage = process.env.E2E_META_PAGE_2 ?? '';

/**
 * Makes `context` signed in to Facebook as the account saved in `sessionFile` (and nobody else):
 * how the tests switch between two Facebook accounts in one browser.
 */
export async function useFacebookSession(context: BrowserContext, sessionFile: string) {
  await context.clearCookies({ domain: /(^|\.)facebook\.com$/ });
  const state = JSON.parse(readFileSync(sessionFile, 'utf8')) as {
    cookies: Parameters<BrowserContext['addCookies']>[0];
  };
  await context.addCookies(state.cookies.filter((c) => (c.domain ?? '').endsWith('facebook.com')));
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** On Socioboard's account picker: ticks exactly these accounts (by name) and adds them. */
export async function addOnly(page: Page, names: string[]) {
  await expect(page.getByRole('heading', { name: 'Choose what to add' })).toBeVisible();
  // Untick what's ticked (new accounts start ticked), one at a time: the set shrinks as it goes.
  const ticked = page.getByRole('checkbox', { checked: true, disabled: false });
  while ((await ticked.count()) > 0) await ticked.first().click();
  for (const name of names) {
    await page.getByRole('checkbox', { name: new RegExp(`^${escapeRegExp(name)}\\b`) }).check();
  }
  await page.getByRole('button', { name: /^Add \d+ accounts?$/ }).click();
}

/** Takes a published post back off the networks (the dev tool in apps/api); returns its report. */
export function deleteFromNetworks(workspaceId: string, postId: string): string {
  return execFileSync('pnpm', ['delete-network-post', workspaceId, postId], {
    cwd: fileURLToPath(new URL('../../../api', import.meta.url)),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
}

/** The id of the workspace with this address, as the signed-in person sees it. */
export function workspaceIdOf(page: Page, slug: string): Promise<string> {
  return page.evaluate(async (s) => {
    const me = (await (await fetch('/api/v1/me')).json()) as {
      memberships: { workspace: { id: string; slug: string } }[];
    };
    return me.memberships.find((m) => m.workspace.slug === s)?.workspace.id ?? '';
  }, slug);
}
