import { describe, expect, it } from 'vitest';

import {
  invitation,
  magicLink,
  notificationEmail,
  resetPassword,
  verifyEmail,
  type RenderedEmail,
} from '../index';

const url = 'https://app.example.com/api/auth/verify-email?token=abc&callbackURL=%2Fhome';
const cases: [string, () => Promise<RenderedEmail>, string][] = [
  ['verify email', () => verifyEmail({ name: 'Ana', url }), 'Verify your email for Socioboard'],
  ['reset password', () => resetPassword({ name: 'Ana', url }), 'Reset your Socioboard password'],
  ['magic link', () => magicLink({ url }), 'Your Socioboard sign-in link'],
  [
    'invitation',
    () => invitation({ inviter: 'Ana', workspace: 'Acme', role: 'editor', url }),
    'Ana invited you to Acme on Socioboard',
  ],
  [
    'notification',
    () =>
      notificationEmail({
        workspace: 'Acme',
        items: [{ title: 'A post couldn’t be published', body: 'Facebook: Session expired' }],
        url,
      }),
    'A post couldn’t be published',
  ],
];

describe.each(cases)('%s', (_name, build, subject) => {
  it('has the subject, an HTML button and a plain-text version with the link', async () => {
    const email = await build();
    expect(email.subject).toBe(subject);
    expect(email.html).toMatch(/^<!DOCTYPE html/);
    // In the HTML the & is escaped; the link still resolves to the same URL.
    expect(email.html).toContain(`href="${url.replaceAll('&', '&amp;')}"`);
    expect(email.text).toContain(url);
    expect(email.text).not.toContain('<');
  });
});

describe('user-supplied text', () => {
  it('is escaped in the HTML', async () => {
    const email = await invitation({
      inviter: '<img src=x onerror=alert(1)>',
      workspace: '<script>alert(1)</script>',
      role: 'viewer',
      url,
    });
    expect(email.html).not.toContain('<script>');
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;script&gt;');
  });

  it('reads naturally in the invitation', async () => {
    const admin = await invitation({ inviter: 'Ana', workspace: 'Acme', role: 'admin', url });
    expect(admin.text).toContain('Ana invited you to join Acme as an admin.');
    const editor = await invitation({ inviter: 'Ana', workspace: 'Acme', role: 'editor', url });
    expect(editor.text).toContain('as an editor.');
    const viewer = await invitation({ inviter: 'Ana', workspace: 'Acme', role: 'viewer', url });
    expect(viewer.text).toContain('as a viewer.');
  });
});

describe('notification email', () => {
  it('a burst becomes one email that lists each, with a subject saying how many more', async () => {
    const email = await notificationEmail({
      workspace: 'Acme',
      items: [
        { title: 'Halden Coffee needs reconnecting', body: 'Priya no longer has permission' },
        { title: 'halden.coffee needs reconnecting', body: 'Instagram refused the sign-in' },
      ],
      url,
    });
    expect(email.subject).toBe('Halden Coffee needs reconnecting (and 1 more)');
    expect(email.text).toContain('Priya no longer has permission');
    expect(email.text).toContain('halden.coffee needs reconnecting');
    expect(email.text).toContain('Instagram refused the sign-in');
    expect(email.text).toContain('in Acme on Socioboard');
  });

  it('escapes text that came from a network or a person', async () => {
    const email = await notificationEmail({
      workspace: null,
      items: [{ title: 'Failed', body: '<script>alert(1)</script>' }],
      url,
    });
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
  });
});
