import { describe, expect, it } from 'vitest';

import {
  accountsNeedReconnectingEmail,
  invitation,
  magicLink,
  notificationEmail,
  opsAlertEmail,
  publishFailedEmail,
  resetPassword,
  verifyEmail,
  weeklyDigestEmail,
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

describe('publish failed', () => {
  it('one delivery: its network in the subject, the account and reason in the body', async () => {
    const email = await publishFailedEmail({
      workspace: 'Acme',
      failures: [{ account: 'Halden Coffee', network: 'Facebook', reason: 'Session expired' }],
      url,
    });
    expect(email.subject).toBe("A post couldn't be published to Facebook");
    expect(email.text).toContain('In Acme, Halden Coffee on Facebook didn');
    expect(email.text).toContain('Session expired');
    expect(email.text).toContain(url);
  });

  it('several: counted in the subject, each with its own reason', async () => {
    const email = await publishFailedEmail({
      workspace: 'Acme',
      failures: [
        { account: 'Halden Coffee', network: 'Facebook', reason: 'Session expired' },
        { account: 'halden.coffee', network: 'Instagram', reason: 'Image too small' },
      ],
      url,
    });
    expect(email.subject).toBe("A post couldn't be published to 2 accounts");
    expect(email.text).toContain('halden.coffee on Instagram');
    expect(email.text).toContain('Image too small');
  });
});

describe('accounts need reconnecting', () => {
  it('names one account, or counts several, and says scheduled posts will fail', async () => {
    const one = await accountsNeedReconnectingEmail({
      workspace: 'Acme',
      accounts: [{ name: 'Halden Coffee', network: 'Facebook', reason: 'Priya lost access' }],
      url,
    });
    expect(one.subject).toBe('Halden Coffee needs reconnecting');
    expect(one.text).toContain('Scheduled posts to it will fail');
    const two = await accountsNeedReconnectingEmail({
      workspace: 'Acme',
      accounts: [
        { name: 'Halden Coffee', network: 'Facebook', reason: 'x' },
        { name: 'halden.coffee', network: 'Instagram', reason: 'y' },
      ],
      url,
    });
    expect(two.subject).toBe('2 accounts need reconnecting in Acme');
    expect(two.text).toContain('Reconnect accounts');
  });
});

describe('weekly digest', () => {
  it('totals in the subject, each workspace’s week, problems only when there are any', async () => {
    const email = await weeklyDigestEmail({
      name: 'Ana',
      workspaces: [
        { name: 'Acme', published: 12, failed: 1, scheduled: 5, needsReconnecting: 0, url },
        { name: 'Side', published: 1, failed: 0, scheduled: 0, needsReconnecting: 2, url },
      ],
    });
    expect(email.subject).toBe('Your week on Socioboard: 13 published, 1 failed');
    expect(email.text).toContain('12 posts published, 5 posts scheduled');
    expect(email.text).toContain("1 post couldn't be published.");
    expect(email.text).toContain('1 post published, 0 posts scheduled');
    expect(email.text).toContain('2 accounts need reconnecting.');
    expect(email.text).not.toContain('0 accounts');
    const quiet = await weeklyDigestEmail({
      name: 'Ana',
      workspaces: [
        { name: 'Acme', published: 2, failed: 0, scheduled: 1, needsReconnecting: 0, url },
      ],
    });
    expect(quiet.subject).toBe('Your week on Socioboard: 2 published');
  });
});

describe('ops alert', () => {
  it('says what was seen, lists each detail and links to the console', async () => {
    const email = await opsAlertEmail({
      title: 'Publishing is failing',
      summary: '23 deliveries failed for good in the last 15 minutes.',
      rows: [
        { name: 'facebook_page', detail: '20 failed' },
        { name: '<instagram>', detail: '3 failed' },
      ],
      url: 'https://app.example.com/admin/publishing',
      actionLabel: 'Open publishing',
    });
    expect(email.subject).toBe('Socioboard alert: Publishing is failing');
    expect(email.text).toContain('23 deliveries failed for good');
    expect(email.text).toContain('facebook_page');
    expect(email.text).toContain('https://app.example.com/admin/publishing');
    expect(email.html).toContain('Open publishing');
    expect(email.html).toContain('&lt;instagram&gt;');
  });
});
