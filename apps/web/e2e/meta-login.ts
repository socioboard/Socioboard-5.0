// One-time Facebook (or Instagram, or Threads) sign-in for the Meta end-to-end tests (support/meta.ts) and the
// App Review recordings (app-review/record-meta.ts). Opens a browser at the network;
// sign in yourself (your password goes only to them). Once signed in, the session
// cookies are saved in e2e/.auth (git-ignored) and the browser closes. Run again when a test
// says the session has expired.
//
//   pnpm --filter @socioboard/web e2e:meta:login          the main account  → facebook.json
//   pnpm --filter @socioboard/web e2e:meta:login second   a second account  → facebook-2.json
//   pnpm --filter @socioboard/web e2e:meta:login instagram  Instagram         → instagram.json
//   pnpm --filter @socioboard/web e2e:meta:login threads    Threads           → threads.json
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

/** Where each session signs in, and the cookie that's set once it has. */
const SESSIONS = {
  main: {
    label: 'Facebook (the main account)',
    file: 'facebook.json',
    site: 'https://www.facebook.com',
    login: '/login',
    cookie: 'c_user',
  },
  second: {
    label: 'Facebook (the second account)',
    file: 'facebook-2.json',
    site: 'https://www.facebook.com',
    login: '/login',
    cookie: 'c_user',
  },
  instagram: {
    label: 'Instagram',
    file: 'instagram.json',
    site: 'https://www.instagram.com',
    login: '/accounts/login/',
    cookie: 'sessionid',
  },
  threads: {
    label: 'Threads',
    file: 'threads.json',
    site: 'https://www.threads.com',
    login: '/login',
    cookie: 'sessionid',
  },
} as const;

const which = process.argv[2] ?? 'main';
if (!Object.hasOwn(SESSIONS, which)) {
  console.error('Usage: e2e:meta:login [main|second|instagram|threads]');
  process.exit(1);
}
const {
  label,
  file,
  site,
  login,
  cookie: signedInCookie,
} = SESSIONS[which as keyof typeof SESSIONS];
const target = fileURLToPath(new URL(`.auth/${file}`, import.meta.url));
const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`${site}${login}`);
console.log(`Sign in to ${label} in the browser window. Waiting up to 5 minutes…`);

const deadline = Date.now() + 5 * 60_000;
let signedIn = false;
while (Date.now() < deadline) {
  const cookies = await context.cookies(site);
  if (cookies.some((c) => c.name === signedInCookie)) {
    signedIn = true;
    break;
  }
  await page.waitForTimeout(1_500);
}

if (signedIn) {
  mkdirSync(dirname(target), { recursive: true });
  await context.storageState({ path: target });
  console.log(`${label} session saved to ${target}.`);
} else {
  console.error('Not signed in within 5 minutes; nothing saved.');
  process.exitCode = 1;
}
await browser.close();
