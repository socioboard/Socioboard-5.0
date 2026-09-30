import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test';

import { linkIn, waitForEmail } from './mailpit';

/** A made-up person with a unique address, so every run starts with new accounts. */
export function person(role: string) {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return {
    name: `${role[0]?.toUpperCase() ?? ''}${role.slice(1)} ${id}`,
    email: `e2e-${role}-${id}@example.test`,
    password: `quiet lantern ${id} harbor`,
  };
}

/**
 * A browser for one person, seen by the API as its own client IP. Rate limits count per IP (sign-up
 * is 5 an hour), and the dev API trusts X-Forwarded-For from the local proxy, so each run and each
 * person gets fresh limits without switching them off.
 */
export async function browserFor(
  browser: Browser,
  options: { storageState?: string } = {},
): Promise<BrowserContext> {
  const octet = () => Math.floor(Math.random() * 250) + 1;
  const ip = `10.${octet()}.${octet()}.${octet()}`;
  const context = await browser.newContext(options);
  // Only on requests to the app: sent to other sites (Facebook's sign-in and its file servers), a
  // custom header turns simple loads into cross-origin preflights they refuse.
  await context.route(/^http:\/\/localhost:5173\//, (route) =>
    route.continue({ headers: { ...route.request().headers(), 'x-forwarded-for': ip } }),
  );
  return context;
}

/** Fills in the sign-up form and sends it; the app then asks to verify the email. */
export async function signUp(page: Page, who: ReturnType<typeof person>) {
  await page.getByLabel('Your name').fill(who.name);
  // By role: the dev build's router devtools also have a label mentioning "email".
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(who.email);
  await page.getByLabel('Password', { exact: true }).fill(who.password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
}

/** Opens the verification link from the email, as if clicked in a mail app, then continues. */
export async function verifyByEmail(page: Page, who: ReturnType<typeof person>) {
  const email = await waitForEmail(who.email, 'Verify your email');
  await page.goto(linkIn(email, '/verify-email'));
  await expect(page.getByRole('heading', { name: 'Email verified' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
}
