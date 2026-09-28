import type { Browser, BrowserContext } from '@playwright/test';

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
export function browserFor(browser: Browser): Promise<BrowserContext> {
  const octet = () => Math.floor(Math.random() * 250) + 1;
  return browser.newContext({
    extraHTTPHeaders: { 'X-Forwarded-For': `10.${octet()}.${octet()}.${octet()}` },
  });
}
