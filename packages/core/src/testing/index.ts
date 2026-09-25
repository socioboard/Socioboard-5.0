// Shared test utilities (Mailpit, TOTP, a full test app). Only tests import this folder.
import { createHmac } from 'node:crypto';

/** Latest email Mailpit received for `to` (polls briefly: auth emails are sent in the background). */
export async function latestEmail(to: string, uiPort = process.env.MAILPIT_UI_PORT ?? '8025') {
  const base = `http://localhost:${uiPort}/api/v1`;
  for (let i = 0; i < 40; i++) {
    const res = await fetch(`${base}/search?query=${encodeURIComponent(`to:"${to}"`)}&limit=1`);
    const body = (await res.json()) as { messages: { ID: string; Subject: string }[] };
    const first = body.messages[0];
    if (first) {
      const msg = (await (await fetch(`${base}/message/${first.ID}`)).json()) as { Text: string };
      return { subject: first.Subject, text: msg.Text };
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`No email for ${to}`);
}

/** Deletes every Mailpit message for `to`, so the next latestEmail() sees only new mail. */
export async function clearEmails(to: string, uiPort = process.env.MAILPIT_UI_PORT ?? '8025') {
  await fetch(
    `http://localhost:${uiPort}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
    { method: 'DELETE' },
  );
}

/** First http(s) link in an email body, as path + query (to replay against the test app). */
export function linkPath(text: string): string {
  const match = /https?:\/\/\S+/.exec(text);
  if (!match) throw new Error('No link in email');
  const url = new URL(match[0]);
  return url.pathname + url.search;
}

/** RFC 6238 TOTP (SHA-1, 6 digits, 30 s) for a base32 secret, as an authenticator app would. */
export function totp(base32Secret: string, now = Date.now()): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of base32Secret.replace(/=+$/, '').toUpperCase()) {
    bits += alphabet.indexOf(c).toString(2).padStart(5, '0');
  }
  const bytes = Buffer.from((bits.match(/.{8}/g) ?? []).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 1000 / 30)));
  const hmac = createHmac('sha1', bytes).update(counter).digest();
  const offset = (hmac[hmac.length - 1] ?? 0) & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, '0');
}

export { createTestApp } from './app';
