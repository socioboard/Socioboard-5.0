// P0-Q1: phase 0's "done when" (docs/stages/phase-0.md). A new user signs up, verifies their
// email, creates a workspace, uploads an image and invites a teammate, who signs up from the
// invitation, verifies, joins with the role they were given, and sees the same image.
import { fileURLToPath } from 'node:url';

import { expect, test, type Page } from '@playwright/test';

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
  await signUp(ownerPage, owner);
  await verifyByEmail(ownerPage, owner);

  await expect(ownerPage).toHaveURL(/\/onboarding$/);
  await ownerPage.getByLabel('Workspace name').fill(workspaceName);
  await ownerPage.getByRole('button', { name: 'Create workspace' }).click();
  await expect(ownerPage).toHaveURL(/\/w\/[a-z0-9-]+\/calendar$/);
  const slug = new URL(ownerPage.url()).pathname.split('/')[2] ?? '';

  // --- The owner uploads an image, and it finishes processing. ---
  await ownerPage.getByRole('link', { name: 'Media' }).first().click();
  await ownerPage.getByTestId('media-file-input').setInputFiles(IMAGE);
  const tile = ownerPage.getByRole('button', { name: /^socioboard-logo\.png/ });
  // Dimensions appear once the worker has made the thumbnail.
  await expect(tile).toContainText('520 × 126', { timeout: 30_000 });

  // --- The owner invites a teammate as an editor. ---
  await ownerPage.getByRole('link', { name: 'Settings' }).first().click();
  await ownerPage.getByRole('link', { name: 'Members' }).click();
  await ownerPage.getByRole('button', { name: 'Invite people' }).click();
  const invite = ownerPage.getByRole('dialog');
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
