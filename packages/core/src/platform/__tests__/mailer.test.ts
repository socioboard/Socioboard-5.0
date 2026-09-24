import { Writable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { createLogger } from '../logger';
import { createMailer } from '../mailer';

describe('mailer without SMTP', () => {
  it('logs the message instead of sending, so links stay reachable', async () => {
    const lines: Record<string, unknown>[] = [];
    const destination = new Writable({
      write(chunk: Buffer, _enc, cb) {
        lines.push(JSON.parse(chunk.toString()) as Record<string, unknown>);
        cb();
      },
    });
    const mailer = createMailer({
      smtpUrl: undefined,
      from: 'x@y.z',
      logger: createLogger({ level: 'info', destination }),
    });
    expect(await mailer.verify()).toBe(true);
    await mailer.send({
      to: 'a@b.c',
      subject: 'Verify',
      html: '<a>link</a>',
      text: 'https://app/verify?t=1',
    });
    expect(lines.at(-1)).toMatchObject({
      msg: 'email (not sent)',
      mail: { to: 'a@b.c', subject: 'Verify', text: 'https://app/verify?t=1' },
    });
  });
});
