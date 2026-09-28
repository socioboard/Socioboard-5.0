// Reads the emails the app sends, from Mailpit's API (docker/compose.dev.yml), so tests can follow
// verification and invitation links like a person would.
import { expect } from '@playwright/test';

const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025';

interface Summary {
  ID: string;
  Subject: string;
}

/** Waits for the newest email to `to` whose subject contains `subject`, and returns its text. */
export async function waitForEmail(to: string, subject: string): Promise<string> {
  let text = '';
  await expect
    .poll(
      async () => {
        const query = encodeURIComponent(`to:"${to}"`);
        const res = await fetch(`${MAILPIT}/api/v1/search?query=${query}`);
        const { messages } = (await res.json()) as { messages: Summary[] };
        const match = messages.find((m) => m.Subject.includes(subject));
        if (!match) return false;
        const message = (await (await fetch(`${MAILPIT}/api/v1/message/${match.ID}`)).json()) as {
          Text: string;
        };
        text = message.Text;
        return true;
      },
      { message: `an email to ${to} about "${subject}"`, timeout: 30_000 },
    )
    .toBe(true);
  return text;
}

/** The first link in an email's text that contains `part` (e.g. "/verify-email", "/invite/"). */
export function linkIn(text: string, part: string): string {
  const link = text.match(/https?:\/\/[^\s)>\]"]+/g)?.find((url) => url.includes(part));
  if (!link) throw new Error(`No link containing "${part}" in:\n${text}`);
  return link;
}
