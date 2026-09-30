// One-time Facebook sign-in for the Meta end-to-end tests (support/meta.ts). Opens a browser at
// Facebook; sign in yourself (your password goes only to Facebook). Once signed in, the session
// cookies are saved in e2e/.auth (git-ignored) and the browser closes. Run again when a test
// says the session has expired.
//
//   pnpm --filter @socioboard/web e2e:meta:login          the main account  → facebook.json
//   pnpm --filter @socioboard/web e2e:meta:login second   a second account  → facebook-2.json
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const which = process.argv[2] ?? 'main';
if (which !== 'main' && which !== 'second') {
  console.error('Usage: e2e:meta:login [main|second]');
  process.exit(1);
}
const file = which === 'second' ? 'facebook-2.json' : 'facebook.json';
const target = fileURLToPath(new URL(`.auth/${file}`, import.meta.url));
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('https://www.facebook.com/login');
console.log(
  `Sign in to Facebook (${which === 'second' ? 'the second account' : 'the main account'}) in the browser window. Waiting up to 5 minutes…`,
);

const deadline = Date.now() + 5 * 60_000;
let signedIn = false;
while (Date.now() < deadline) {
  const cookies = await context.cookies('https://www.facebook.com');
  // Facebook sets c_user once a person is signed in.
  if (cookies.some((c) => c.name === 'c_user')) {
    signedIn = true;
    break;
  }
  await page.waitForTimeout(1_500);
}

if (signedIn) {
  mkdirSync(dirname(target), { recursive: true });
  await context.storageState({ path: target });
  console.log(`Facebook session saved to ${target}.`);
} else {
  console.error('Not signed in within 5 minutes; nothing saved.');
  process.exitCode = 1;
}
await browser.close();
