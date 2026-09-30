// The Meta end-to-end test (P1-Q1) against real Facebook and Instagram accounts. Facebook's
// sign-in isn't scripted: `pnpm --filter @socioboard/web e2e:meta:login` opens a browser, you sign
// in to Facebook yourself once, and only the session is saved (in e2e/.auth, never committed).
// The test reuses it to approve Socioboard's connect screen.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { expect, type Page } from '@playwright/test';

/** Facebook's cookies after the one-time sign-in (git-ignored). */
export const FACEBOOK_SESSION = fileURLToPath(new URL('../.auth/facebook.json', import.meta.url));

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
