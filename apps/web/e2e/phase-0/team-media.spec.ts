// P0-Q1: phase 0's "done when" (docs/stages/phase-0.md). A new user signs up, verifies their
// email, creates a workspace, uploads an image and invites a teammate, who signs up from the
// invitation, verifies, joins with the role they were given, and sees the same image. Along the
// way the owner skips onboarding's steps 2–3 (the calendar then lists them), opens Accounts and the composer (phase 1, nothing connected yet), saves a draft
// and finds it under Posts, and every screen
// is checked for the right cursors (support/cursors.ts).
import { fileURLToPath } from 'node:url';

import { expect, test, type Page } from '@playwright/test';

import { expectRightCursors } from '../support/cursors';
import { linkIn, waitForEmail } from '../support/mailpit';
import { browserFor, person } from '../support/people';

const IMAGE = fileURLToPath(new URL('../fixtures/socioboard-logo.png', import.meta.url));

async function signUp(page: Page, who: ReturnType<typeof person>) {
  await page.getByLabel('Your name').fill(who.name);
  // By role: the dev build's router devtools also have a label mentioning "email".
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(who.email);
  await page.getByLabel('Password', { exact: true }).fill(who.password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
}

/** Opens the verification link from the email, as if clicked in a mail app, then continues. */
async function verifyByEmail(page: Page, who: ReturnType<typeof person>) {
  const email = await waitForEmail(who.email, 'Verify your email');
  await page.goto(linkIn(email, '/verify-email'));
  await expect(page.getByRole('heading', { name: 'Email verified' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
}

test('a team forms around a workspace and shares its media', async ({ browser }) => {
  const owner = person('owner');
  const teammate = person('teammate');
  const workspaceName = `E2E ${owner.name.split(' ')[1] ?? ''}`;

  // --- The owner signs up, verifies, and creates a workspace. ---
  const ownerContext = await browserFor(browser);
  const ownerPage = await ownerContext.newPage();
  await ownerPage.goto('/signup');
  await expect(ownerPage.getByRole('button', { name: 'Create account' })).toBeVisible();
  await expectRightCursors(ownerPage, 'sign-up');
  await signUp(ownerPage, owner);
  await verifyByEmail(ownerPage, owner);

  await expect(ownerPage).toHaveURL(/\/onboarding$/);
  await expectRightCursors(ownerPage, 'onboarding');
  await ownerPage.getByLabel('Workspace name').fill(workspaceName);
  await ownerPage.getByRole('button', { name: 'Create workspace' }).click();
  // Steps 2–3 (connect an account, first post) can be skipped; the calendar keeps a checklist.
  await expect(ownerPage).toHaveURL(/\/w\/[a-z0-9-]+\/welcome$/);
  const slug = new URL(ownerPage.url()).pathname.split('/')[2] ?? '';
  await expect(
    ownerPage.getByRole('heading', { name: 'Connect your first account' }),
  ).toBeVisible();
  await expectRightCursors(ownerPage, 'onboarding step 2');
  await ownerPage.getByRole('link', { name: 'Skip for now' }).click();
  await expect(ownerPage.getByRole('heading', { name: 'Write your first post' })).toBeVisible();
  await expectRightCursors(ownerPage, 'onboarding step 3');
  await ownerPage.getByRole('link', { name: 'Skip for now' }).click();
  await expect(ownerPage).toHaveURL(new RegExp(`/w/${slug}/calendar$`));
  await expect(ownerPage.getByRole('region', { name: 'Get started' })).toContainText('1 of 3 done');
  await expectRightCursors(ownerPage, 'calendar with getting started');

  // --- The owner uploads an image, and it finishes processing. ---
  await ownerPage.getByRole('link', { name: 'Media' }).first().click();
  await ownerPage.getByTestId('media-file-input').setInputFiles(IMAGE);
  const tile = ownerPage.getByRole('button', { name: /^socioboard-logo\.png/ });
  // Dimensions appear once the worker has made the thumbnail.
  await expect(tile).toContainText('520 × 126', { timeout: 30_000 });
  await expectRightCursors(ownerPage, 'media');

  // --- Accounts and the composer (phase 1) open, with nothing connected yet. ---
  await ownerPage.getByRole('link', { name: 'Accounts' }).first().click();
  await expect(ownerPage.getByText('No accounts yet')).toBeVisible();
  await expectRightCursors(ownerPage, 'accounts');
  await ownerPage.getByRole('button', { name: 'Connect account' }).first().click();
  await expect(ownerPage.getByRole('dialog', { name: 'Connect an account' })).toBeVisible();
  await expectRightCursors(ownerPage, 'network chooser');
  await ownerPage.keyboard.press('Escape');
  await ownerPage.goto(`/w/${slug}/compose`);
  await expect(ownerPage.getByRole('textbox', { name: 'Text' })).toBeVisible();
  await expectRightCursors(ownerPage, 'composer');
  // A saved draft shows up under Posts, and opens to its details.
  await ownerPage.getByRole('textbox', { name: 'Text' }).fill('Autumn menu draft');
  await ownerPage.getByRole('button', { name: 'Save draft' }).click();
  await expect(ownerPage.getByText(/^Saved at/)).toBeVisible();
  await ownerPage.getByRole('link', { name: 'Posts' }).first().click();
  await ownerPage.getByRole('link', { name: 'Drafts' }).click();
  const draftRow = ownerPage.getByRole('row', { name: /Autumn menu draft/ });
  await expect(draftRow).toContainText('Draft');
  await expectRightCursors(ownerPage, 'posts');
  await draftRow.click();
  await expect(ownerPage.getByRole('heading', { name: 'Post', exact: true })).toBeVisible();
  await expect(ownerPage.getByText('No accounts chosen yet.', { exact: false })).toBeVisible();
  await expectRightCursors(ownerPage, 'post details');

  // --- The owner invites a teammate as an editor. ---
  await ownerPage.getByRole('link', { name: 'Settings' }).first().click();
  await ownerPage.getByRole('link', { name: 'Members' }).click();
  await expectRightCursors(ownerPage, 'members');
  await ownerPage.getByRole('button', { name: 'Invite people' }).click();
  const invite = ownerPage.getByRole('dialog');
  await expectRightCursors(ownerPage, 'invite dialog');
  await invite.getByRole('textbox', { name: 'Email', exact: true }).fill(teammate.email);
  await invite.getByRole('radio', { name: 'Editor' }).check();
  await invite.getByRole('button', { name: 'Send invitation' }).click();
  // Exact: the "Invitation sent" toast also mentions the address.
  await expect(ownerPage.getByText(teammate.email, { exact: true })).toBeVisible();

  // --- The teammate opens the invitation, signs up from it and verifies. ---
  const invitation = await waitForEmail(teammate.email, 'invited you');
  const teammateContext = await browserFor(browser);
  const page = await teammateContext.newPage();
  await page.goto(linkIn(invitation, '/invite/'));
  await expect(page.getByRole('heading', { name: `Join ${workspaceName}` })).toBeVisible();
  await expectRightCursors(page, 'invitation');
  await page.getByRole('link', { name: 'Create an account' }).click();
  await signUp(page, teammate);
  await verifyByEmail(page, teammate);

  // The verification link carried the invitation along, so it opens again to be accepted.
  await expect(page.getByRole('heading', { name: `Join ${workspaceName}` })).toBeVisible();
  await page.getByRole('button', { name: 'Accept invitation' }).click();
  await expect(page).toHaveURL(new RegExp(`/w/${slug}/calendar$`));

  // --- The teammate sees the owner's image and their own role. ---
  await page.getByRole('link', { name: 'Media' }).first().click();
  await expect(page.getByRole('button', { name: /^socioboard-logo\.png/ })).toContainText(
    '520 × 126',
  );

  await page.getByRole('link', { name: 'Settings' }).first().click();
  await expect(page).toHaveURL(new RegExp(`/w/${slug}/settings/members$`));
  const row = page.getByRole('row').filter({ hasText: teammate.email });
  await expect(row).toContainText('Editor');

  // --- And the owner's member list shows them too. ---
  await ownerPage.reload();
  await expect(ownerPage.getByRole('row').filter({ hasText: teammate.email })).toContainText(
    'Editor',
  );

  await ownerContext.close();
  await teammateContext.close();
});
