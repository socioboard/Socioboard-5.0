import type { MailMessage } from '../../platform';

// Plain first versions of the auth emails. P0-B13 replaces them with React Email templates in
// @socioboard/emails; the functions and their inputs stay the same.

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${String(c.charCodeAt(0))};`);

function message(to: string, subject: string, intro: string, action: string, url: string) {
  return {
    to,
    subject,
    text: `${intro}\n\n${action}: ${url}\n\nIf you didn't ask for this, you can ignore this email.`,
    html: `<p>${escape(intro)}</p><p><a href="${escape(url)}">${escape(action)}</a></p><p>If you didn't ask for this, you can ignore this email.</p>`,
  } satisfies MailMessage;
}

export const verifyEmail = (to: string, name: string, url: string) =>
  message(
    to,
    'Verify your email for Socioboard',
    `Hi ${name}, confirm your email address to finish setting up Socioboard.`,
    'Verify email',
    url,
  );

export const resetPassword = (to: string, name: string, url: string) =>
  message(
    to,
    'Reset your Socioboard password',
    `Hi ${name}, use the link below to choose a new password. It expires in 1 hour.`,
    'Reset password',
    url,
  );

export const magicLink = (to: string, url: string) =>
  message(
    to,
    'Your Socioboard sign-in link',
    'Use the link below to sign in to Socioboard. It expires in 10 minutes.',
    'Sign in',
    url,
  );

export const invitation = (
  to: string,
  inviter: string,
  workspace: string,
  role: string,
  url: string,
) =>
  message(
    to,
    `${inviter} invited you to ${workspace} on Socioboard`,
    `${inviter} invited you to join ${workspace} as ${role}. The invitation expires in 7 days.`,
    'Accept invitation',
    url,
  );
