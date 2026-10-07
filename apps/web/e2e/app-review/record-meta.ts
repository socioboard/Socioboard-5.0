// Records the Meta App Review screencasts (P1-R1, docs/developer-apps.md#screencasts): one
// captioned video per sign-in route, from signing in to Socioboard to the published post on the
// network, naming each permission where it's used. It publishes for real, to the Page and
// Instagram account in E2E_META_PAGE / E2E_META_INSTAGRAM.
//
//   pnpm --filter @socioboard/web app-review:record facebook    Facebook Login for Business
//   pnpm --filter @socioboard/web app-review:record instagram   Instagram API with Instagram Login
//   … --dry-run   stops before "Publish now": checks the flow and captions without posting
//
// Before recording: a Facebook (or Instagram) session from `e2e:meta:login [instagram]`, and a
// Socioboard sign-in on the app being recorded (REVIEW_EMAIL / REVIEW_PASSWORD in .env, or sign in
// yourself when the browser asks). The browser is visible: if Facebook or Instagram shows a screen
// the script doesn't know, click through it yourself and the recording carries on. Videos and a
// chapter list land in e2e/app-review/out (git-ignored), with an MP4 copy (H.264, what Meta's
// upload takes) when an ffmpeg with libx264 is found: REVIEW_FFMPEG, or `ffmpeg` on the PATH.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { chromium, expect, type Page } from '@playwright/test';

try {
  process.loadEnvFile(fileURLToPath(new URL('../../../../.env', import.meta.url)));
} catch {
  // No .env: everything comes from the environment.
}

const route = process.argv[2];
if (route !== 'facebook' && route !== 'instagram') {
  console.error('Usage: app-review:record facebook|instagram');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');
/** Thrown to end a dry run before anything is published. */
class DryRunStop extends Error {}
const APP = (process.env.REVIEW_APP_URL ?? 'https://app-dev.socioboard.ai').replace(/\/$/, '');
// The Page and Instagram account to post to: REVIEW_META_* when the review uses other accounts
// than the end-to-end tests, else the tests' E2E_META_*.
const PAGE_NAME = process.env.REVIEW_META_PAGE ?? process.env.E2E_META_PAGE ?? '';
const IG_NAME = process.env.REVIEW_META_INSTAGRAM ?? process.env.E2E_META_INSTAGRAM ?? '';
const SESSION = fileURLToPath(
  new URL(`../.auth/${route === 'facebook' ? 'facebook' : 'instagram'}.json`, import.meta.url),
);
const OUT = fileURLToPath(new URL('./out/', import.meta.url));
const IMAGE = fileURLToPath(new URL('../fixtures/square-1080.png', import.meta.url));
const SIZE = { width: 1280, height: 1000 };

if (!PAGE_NAME && route === 'facebook') throw new Error('Set E2E_META_PAGE in .env');
if (!IG_NAME) throw new Error('Set E2E_META_INSTAGRAM in .env');
if (!existsSync(SESSION)) {
  throw new Error(
    `No ${route} session: run pnpm --filter @socioboard/web e2e:meta:login${route === 'instagram' ? ' instagram' : ''}`,
  );
}

const FACEBOOK_PERMISSIONS = [
  'pages_show_list',
  'business_management',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_engagement',
  'pages_read_user_content',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
];
const INSTAGRAM_PERMISSIONS = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_comments',
];

// ------------------------------------------------------------------------------------- captions

interface Caption {
  /** Full-screen title or end card instead of the bottom bar. */
  card?: boolean;
  step?: string;
  title: string;
  body?: string;
  permissions?: string[];
}

const BADGE =
  route === 'facebook'
    ? 'Socioboard · Meta App Review · Facebook Login for Business'
    : 'Socioboard · Meta App Review · Instagram API with Instagram Login';

/**
 * Draws the caption, the badge and a visible mouse pointer (videos don't show the real one) into
 * the page. Set through the DOM and CSSOM only, so it works on Facebook's and Instagram's pages too.
 */
function drawOverlay(state: { caption: Caption | null; badge: string }) {
  const w = window as unknown as { __sbOverlay?: boolean };
  const css = (el: HTMLElement, s: Partial<CSSStyleDeclaration>) => Object.assign(el.style, s);
  const get = (id: string, make: () => HTMLElement) => {
    let el = document.getElementById(id);
    if (!el) {
      el = make();
      el.id = id;
      document.documentElement.appendChild(el);
    }
    return el;
  };
  const font = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  // Pointer and click ripple, once per document.
  if (!w.__sbOverlay) {
    w.__sbOverlay = true;
    const dot = get('sb-pointer', () => document.createElement('div'));
    css(dot, {
      position: 'fixed',
      left: '-40px',
      top: '-40px',
      width: '22px',
      height: '22px',
      marginLeft: '-11px',
      marginTop: '-11px',
      borderRadius: '50%',
      background: 'rgba(255, 92, 53, 0.35)',
      border: '2px solid rgba(255, 92, 53, 0.95)',
      boxShadow: '0 0 0 3px rgba(255,255,255,0.7)',
      zIndex: '2147483647',
      pointerEvents: 'none',
      transition: 'transform 120ms ease',
    });
    document.addEventListener(
      'mousemove',
      (e) => {
        css(dot, { left: `${String(e.clientX)}px`, top: `${String(e.clientY)}px` });
      },
      true,
    );
    document.addEventListener(
      'mousedown',
      (e) => {
        css(dot, { transform: 'scale(0.7)' });
        const ring = document.createElement('div');
        css(ring, {
          position: 'fixed',
          left: `${String(e.clientX - 20)}px`,
          top: `${String(e.clientY - 20)}px`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 92, 53, 0.9)',
          zIndex: '2147483646',
          pointerEvents: 'none',
          transition: 'transform 450ms ease-out, opacity 450ms ease-out',
        });
        document.documentElement.appendChild(ring);
        requestAnimationFrame(() => {
          css(ring, { transform: 'scale(1.8)', opacity: '0' });
        });
        setTimeout(() => {
          ring.remove();
        }, 500);
      },
      true,
    );
    document.addEventListener(
      'mouseup',
      () => {
        css(dot, { transform: 'scale(1)' });
      },
      true,
    );
  }

  const badge = get('sb-badge', () => document.createElement('div'));
  badge.textContent = state.badge;
  css(badge, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    padding: '5px 10px',
    borderRadius: '999px',
    background: 'rgba(17, 20, 28, 0.82)',
    color: '#fff',
    font: `600 12px/1.3 ${font}`,
    zIndex: '2147483645',
    pointerEvents: 'none',
  });

  const bar = get('sb-caption', () => document.createElement('div'));
  const c = state.caption;
  if (!c) {
    css(bar, { display: 'none' });
    return;
  }
  bar.replaceChildren();
  const line = (text: string, s: Partial<CSSStyleDeclaration>) => {
    const el = document.createElement('div');
    el.textContent = text;
    css(el, s);
    bar.appendChild(el);
  };
  css(
    bar,
    c.card
      ? {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
          position: 'fixed',
          inset: '0',
          left: '0',
          right: '0',
          bottom: '0',
          padding: '60px',
          borderRadius: '0',
          background: 'linear-gradient(135deg, #11141c 0%, #2a1d3d 100%)',
          color: '#fff',
          zIndex: '2147483644',
          pointerEvents: 'none',
        }
      : {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          gap: '6px',
          position: 'fixed',
          inset: 'auto',
          left: '16px',
          right: '16px',
          bottom: '16px',
          padding: '14px 18px',
          borderRadius: '14px',
          background: 'rgba(17, 20, 28, 0.9)',
          color: '#fff',
          zIndex: '2147483644',
          pointerEvents: 'none',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        },
  );
  if (c.step) {
    line(c.step, {
      font: `700 12px/1.2 ${font}`,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#ff8a65',
    });
  }
  line(c.title, { font: `700 ${c.card ? '34px' : '19px'}/1.25 ${font}` });
  if (c.body) {
    line(c.body, {
      font: `400 ${c.card ? '18px' : '15px'}/1.45 ${font}`,
      color: 'rgba(255,255,255,0.88)',
      maxWidth: c.card ? '900px' : 'none',
    });
  }
  if (c.permissions?.length) {
    const chips = document.createElement('div');
    css(chips, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '4px',
      justifyContent: c.card ? 'center' : 'flex-start',
    });
    for (const p of c.permissions) {
      const chip = document.createElement('span');
      chip.textContent = p;
      css(chip, {
        font: `600 13px/1 ui-monospace, "Cascadia Mono", Consolas, monospace`,
        padding: '5px 8px',
        borderRadius: '6px',
        background: 'rgba(124, 92, 255, 0.35)',
        border: '1px solid rgba(160, 140, 255, 0.8)',
        color: '#fff',
      });
      chips.appendChild(chip);
    }
    bar.appendChild(chips);
  }
}

/** Converts the WebM recording to an MP4 next to it, if an ffmpeg that can is available. */
function toMp4(base: string) {
  const ffmpeg = process.env.REVIEW_FFMPEG ?? 'ffmpeg';
  try {
    execFileSync(
      ffmpeg,
      [
        ...['-y', '-loglevel', 'error', '-i', `${base}.webm`],
        ...['-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p'],
        ...['-movflags', '+faststart', `${base}.mp4`],
      ],
      { stdio: 'inherit' },
    );
    console.log(`Saved ${base}.mp4`);
  } catch {
    console.log('No MP4: set REVIEW_FFMPEG to an ffmpeg with libx264 (the WebM is kept).');
  }
}

// --------------------------------------------------------------------------------------- script

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: false, slowMo: 120 });
const context = await browser.newContext({
  storageState: SESSION,
  viewport: SIZE,
  recordVideo: { dir: OUT, size: SIZE },
});
// Signed in to Instagram too, when there's a session: Instagram covers a post with a sign-in
// prompt for visitors, and the video ends on the post and its comment.
const INSTAGRAM_SESSION = fileURLToPath(new URL('../.auth/instagram.json', import.meta.url));
if (route === 'facebook' && existsSync(INSTAGRAM_SESSION)) {
  const state = JSON.parse(readFileSync(INSTAGRAM_SESSION, 'utf8')) as {
    cookies: Parameters<typeof context.addCookies>[0];
  };
  await context.addCookies(state.cookies.filter((c) => (c.domain ?? '').endsWith('instagram.com')));
}
const page = await context.newPage();
const started = Date.now();
const chapters: string[] = [];
let current: Caption | null = null;

const redraw = () =>
  page.evaluate(drawOverlay, { caption: current, badge: BADGE }).catch(() => undefined);
page.on('domcontentloaded', () => void redraw());
page.on('load', () => void redraw());

const stamp = () => {
  const s = Math.floor((Date.now() - started) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const hold = (ms: number) => page.waitForTimeout(ms);

/** Shows a caption (and notes it in the chapter list), then gives the viewer time to read it. */
async function say(caption: Caption, readMs = 4_500) {
  current = caption;
  chapters.push(
    `${stamp()}  ${caption.step ? `${caption.step}: ` : ''}${caption.title}${
      caption.permissions?.length ? `  [${caption.permissions.join(', ')}]` : ''
    }`,
  );
  await redraw();
  await hold(readMs);
}

const slowType = (locator: ReturnType<Page['getByRole']>, text: string) =>
  locator.pressSequentially(text, { delay: 28 });

/**
 * On Facebook's or Instagram's screens: clicks through the approval steps, slowly enough to read,
 * until the browser is back in Socioboard. A screen the pattern doesn't know waits for a person.
 */
async function approveOnNetwork(buttons: RegExp) {
  const deadline = Date.now() + 5 * 60_000;
  while (!page.url().startsWith(APP)) {
    if (Date.now() > deadline) throw new Error('Not back in Socioboard within 5 minutes');
    const button = page.getByRole('button', { name: buttons }).first();
    if (await button.isVisible().catch(() => false)) {
      await hold(2_500);
      await button.click({ timeout: 5_000 }).catch(() => undefined);
    }
    await hold(1_200);
  }
  await redraw();
}

async function signInToSocioboard() {
  await page.goto(`${APP}/login`);
  await redraw();
  const email = process.env.REVIEW_EMAIL;
  const password = process.env.REVIEW_PASSWORD;
  if (email && password) {
    await slowType(page.getByRole('textbox', { name: 'Email', exact: true }), email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await hold(800);
    await page.getByRole('button', { name: 'Sign in' }).click();
  } else {
    console.log('Sign in to Socioboard in the browser window (waiting up to 5 minutes)…');
  }
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 5 * 60_000 });
}

async function newWorkspace() {
  await page.goto(`${APP}/onboarding`);
  await redraw();
  const name = `Meta review ${new Date().toISOString().slice(0, 10)}`;
  await slowType(page.getByLabel('Workspace name'), name);
  await page.getByRole('button', { name: 'Create workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Connect your first account' })).toBeVisible({
    timeout: 30_000,
  });
}

/** Ticks only these accounts in Socioboard's asset picker and adds them. */
async function addOnly(names: string[]) {
  await expect(page.getByRole('heading', { name: 'Choose what to add' })).toBeVisible({
    timeout: 60_000,
  });
  const ticked = page.getByRole('checkbox', { checked: true, disabled: false });
  while ((await ticked.count()) > 0) await ticked.first().click();
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const name of names) {
    await page.getByRole('checkbox', { name: new RegExp(`^${esc(name)}\\b`) }).check();
    await hold(700);
  }
  await hold(1_200);
  await page.getByRole('button', { name: /^Add \d+ accounts?$/ }).click();
}

async function compose(
  accounts: { name: string; network: string }[],
  text: string,
  comment: string,
) {
  await expect(page.getByRole('heading', { name: 'Write your first post' })).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole('link', { name: 'Write a post' }).click();
  for (const a of accounts) {
    await page.getByRole('button', { name: `${a.name}, ${a.network}` }).click();
    await hold(600);
  }
  await slowType(page.getByRole('textbox', { name: 'Text' }), text);
  await page.getByTestId('composer-file-input').setInputFiles(IMAGE);
  await expect(page.getByRole('list', { name: 'Media' }).locator('img[src]')).toBeVisible({
    timeout: 90_000,
  });
  await page.getByRole('button', { name: 'Add a first comment' }).click();
  await slowType(page.getByRole('textbox', { name: 'First comment' }), comment);
  await expect(page.getByText('Ready to publish')).toBeVisible({ timeout: 30_000 });
}

/** Publishes and waits on the post page for each network's link; returns them. */
async function publish(networks: string[]) {
  if (DRY_RUN) throw new DryRunStop();
  await page.getByRole('button', { name: 'Publish now' }).click();
  await expect(page).toHaveURL(/\/posts\/[0-9a-f-]+$/, { timeout: 30_000 });
  const links: Record<string, string> = {};
  for (const n of networks) {
    const link = page.getByRole('link', { name: `View on ${n}` });
    await expect(link).toBeVisible({ timeout: 240_000 });
    links[n] = (await link.getAttribute('href')) ?? '';
  }
  return links;
}

/** Opens a link in this tab (a new tab would be a separate video) and lets it be seen. */
async function show(url: string, readMs: number) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await redraw();
  await hold(4_000);
  // Facebook opens the post in a scrolling dialog with the comments below the photo: scroll it, in
  // steps the viewer can follow (the wheel goes to what's under the pointer). Instagram's post page
  // already shows the comments beside the photo, and scrolling would leave it.
  if (new URL(url).hostname.endsWith('facebook.com')) {
    await page.mouse.move(SIZE.width / 2, SIZE.height / 2, { steps: 12 });
    for (let i = 0; i < 6; i += 1) {
      await page.mouse.wheel(0, 160);
      await hold(250);
    }
  }
  await hold(readMs);
}

const when = new Date().toISOString().slice(0, 16).replace('T', ' ');
const text = `Fresh roast today! Posted with Socioboard for Meta App Review (${when} UTC).`;
const comment = '#coffee #socioboard (first comment, posted by Socioboard)';

try {
  if (route === 'facebook') {
    await page.goto(`${APP}/login`);
    await say(
      {
        card: true,
        step: 'Socioboard · open-source social media management',
        title: 'Facebook Login for Business: how Socioboard uses each permission',
        body: 'A person connects their Facebook Page and its linked Instagram professional account, writes a post with an image and a first comment, and publishes it to both. Every permission requested appears where it is used.',
        permissions: FACEBOOK_PERMISSIONS,
      },
      9_000,
    );
    await say({
      step: 'Step 1',
      title: 'The person signs in to Socioboard',
      body: `${APP.replace(/^https?:\/\//, '')} is the app under review.`,
    });
    await signInToSocioboard();
    await say({
      step: 'Step 2',
      title: 'They create a workspace for their brand',
      body: 'A workspace holds the social accounts a team posts to.',
    });
    await newWorkspace();
    await say({
      step: 'Step 3',
      title: 'Connect Facebook',
      body: 'Socioboard sends the person to Facebook Login for Business to grant access to their Pages and Instagram accounts.',
    });
    await page.getByRole('button', { name: 'Connect an account' }).click();
    await hold(1_500);
    await page
      .getByRole('dialog', { name: 'Connect an account' })
      .getByRole('button', { name: /^Facebook/ })
      .click();
    await page.waitForURL(/facebook\.com/, { timeout: 30_000 });
    await say(
      {
        step: 'Step 4 · on Facebook',
        title: 'Facebook asks the person to approve Socioboard’s access',
        body: 'They choose the Pages and Instagram accounts to share, and approve the permissions below.',
        permissions: FACEBOOK_PERMISSIONS,
      },
      3_000,
    );
    await approveOnNetwork(
      /^(continue( as .+)?|save|got it|ok|done|reconnect|opt in to (all )?current (and future )?(pages|businesses))$/i,
    );
    await say(
      {
        step: 'Step 5 · back in Socioboard',
        title: 'Socioboard lists the Pages and Instagram accounts the person can post to',
        body: 'Pages come from me/accounts (pages_show_list; business_management includes Pages owned through a business portfolio). Each Page’s linked Instagram professional account — name, username and picture — comes from instagram_basic.',
        permissions: ['pages_show_list', 'business_management', 'instagram_basic'],
      },
      9_000,
    );
    await addOnly([PAGE_NAME, IG_NAME]);
    await say({
      step: 'Step 6',
      title: 'The person writes a post for the Page and the Instagram account',
      body: 'Text, an image and a first comment, with a live preview for each network.',
    });
    await compose(
      [
        { name: PAGE_NAME, network: 'Facebook' },
        { name: IG_NAME, network: 'Instagram' },
      ],
      text,
      comment,
    );
    await say(
      {
        step: 'Step 6',
        title: 'The first comment is posted right after the post',
        body: 'On the Page with pages_manage_engagement and pages_read_user_content, on Instagram with instagram_manage_comments.',
        permissions: [
          'pages_manage_engagement',
          'pages_read_user_content',
          'instagram_manage_comments',
        ],
      },
      6_000,
    );
    await say(
      {
        step: 'Step 7',
        title: 'Publish now',
        body: 'Socioboard publishes the photo post to the Page ({page}/photos, pages_manage_posts) and creates and publishes the Instagram media ({ig-user}/media and media_publish, instagram_content_publish).',
        permissions: ['pages_manage_posts', 'instagram_content_publish'],
      },
      6_000,
    );
    const links = await publish(['Facebook', 'Instagram']);
    await say(
      {
        step: 'Step 8',
        title: 'Published: Socioboard shows where each post went',
        body: 'The link to the Page post is read from the post (permalink_url, pages_read_engagement); the Instagram link from the published media (instagram_content_publish).',
        permissions: ['pages_read_engagement', 'instagram_content_publish'],
      },
      8_000,
    );
    await say(
      {
        step: 'Step 9 · on Facebook',
        title: 'The post on the Facebook Page, with Socioboard’s first comment',
        body: 'Published with pages_manage_posts; the first comment with pages_manage_engagement and pages_read_user_content.',
        permissions: ['pages_manage_posts', 'pages_manage_engagement', 'pages_read_user_content'],
      },
      500,
    );
    await show(links.Facebook ?? '', 9_000);
    await say(
      {
        step: 'Step 10 · on Instagram',
        title: 'The same post on Instagram, with its first comment',
        body: 'Published with instagram_content_publish; the first comment with instagram_manage_comments.',
        permissions: ['instagram_content_publish', 'instagram_manage_comments'],
      },
      500,
    );
    await show(links.Instagram ?? '', 9_000);
  } else {
    await page.goto(`${APP}/login`);
    await say(
      {
        card: true,
        step: 'Socioboard · open-source social media management',
        title: 'Instagram API with Instagram Login: how Socioboard uses each permission',
        body: 'A person connects an Instagram professional account directly (no Facebook Page needed), writes a post with an image and a first comment, and publishes it. Every permission requested appears where it is used.',
        permissions: INSTAGRAM_PERMISSIONS,
      },
      9_000,
    );
    await say({
      step: 'Step 1',
      title: 'The person signs in to Socioboard',
      body: `${APP.replace(/^https?:\/\//, '')} is the app under review.`,
    });
    await signInToSocioboard();
    await say({ step: 'Step 2', title: 'They create a workspace for their brand' });
    await newWorkspace();
    await say({
      step: 'Step 3',
      title: 'Connect Instagram, signing in with Instagram',
      body: 'For professional accounts that aren’t linked to a Facebook Page.',
    });
    await page.getByRole('button', { name: 'Connect an account' }).click();
    await hold(1_500);
    const dialog = page.getByRole('dialog', { name: 'Connect an account' });
    await dialog.getByRole('button', { name: /^Instagram/ }).click();
    await hold(2_500);
    await dialog.getByRole('button', { name: /^Continue with Instagram/ }).click();
    await page.waitForURL(/instagram\.com/, { timeout: 30_000 });
    await say(
      {
        step: 'Step 4 · on Instagram',
        title: 'Instagram asks the person to allow Socioboard’s access',
        permissions: INSTAGRAM_PERMISSIONS,
      },
      3_000,
    );
    await approveOnNetwork(/^(allow( all)?|continue( as .+)?|not now|ok)$/i);
    await say(
      {
        step: 'Step 5 · back in Socioboard',
        title: 'The account that signed in, ready to add',
        body: 'Its id, name, username and picture come from /me (instagram_business_basic).',
        permissions: ['instagram_business_basic'],
      },
      8_000,
    );
    await addOnly([IG_NAME]);
    await say({
      step: 'Step 6',
      title: 'The person writes a post with an image and a first comment',
      body: 'The first comment is posted right after the post (instagram_business_manage_comments).',
      permissions: ['instagram_business_manage_comments'],
    });
    await compose([{ name: IG_NAME, network: 'Instagram' }], text, comment);
    await say(
      {
        step: 'Step 7',
        title: 'Publish now',
        body: 'Socioboard creates the media container and publishes it ({ig-user}/media and media_publish, instagram_business_content_publish).',
        permissions: ['instagram_business_content_publish'],
      },
      6_000,
    );
    const links = await publish(['Instagram']);
    await say(
      {
        step: 'Step 8',
        title: 'Published: Socioboard links to the post on Instagram',
        permissions: ['instagram_business_content_publish'],
      },
      7_000,
    );
    await say(
      {
        step: 'Step 9 · on Instagram',
        title: 'The post on Instagram, with Socioboard’s first comment',
        body: 'Published with instagram_business_content_publish; the comment with instagram_business_manage_comments.',
        permissions: ['instagram_business_content_publish', 'instagram_business_manage_comments'],
      },
      500,
    );
    await show(links.Instagram ?? '', 9_000);
  }
  await page.goto(`${APP}/login`, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
  await say(
    {
      card: true,
      step: 'End of screencast',
      title: 'Socioboard only posts what the person writes, to the accounts they choose',
      body: 'Access can be removed at any time by disconnecting the account in Socioboard (its tokens are deleted) or in the network’s settings.',
    },
    7_000,
  );
} catch (err) {
  if (!(err instanceof DryRunStop)) throw err;
  console.log('Dry run: stopped before publishing.');
} finally {
  const video = page.video();
  await context.close();
  const name = `meta-review-${route}${DRY_RUN ? '-dry-run' : ''}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`;
  if (video) {
    await video.saveAs(`${OUT}${name}.webm`);
    await video.delete();
  }
  writeFileSync(`${OUT}${name}-chapters.txt`, `${chapters.join('\n')}\n`);
  await browser.close();
  console.log(`Saved ${OUT}${name}.webm and its chapter list.`);
  toMp4(`${OUT}${name}`);
}
