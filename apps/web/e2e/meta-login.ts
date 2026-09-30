// One-time Facebook sign-in for the Meta end-to-end test (support/meta.ts). Opens a browser at
// Facebook; sign in yourself (your password goes only to Facebook). Once signed in, the session
// cookies are saved to e2e/.auth/facebook.json (git-ignored) and the browser closes. Run again
// when the test says the session has expired.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const target = fileURLToPath(new URL('.auth/facebook.json', import.meta.url));
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('https://www.facebook.com/login');
console.log('Sign in to Facebook in the browser window. Waiting up to 5 minutes…');

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
