// @socioboard/emails: React Email templates, rendered to HTML + plain text on the server.
// Senders (core) add the recipient and pass the result to the mailer. No JSX in this file, so
// the entry point is plain TypeScript; the templates are .tsx.
import { render } from '@react-email/components';
import { createElement, type ReactElement } from 'react';

import {
  AccountsNeedReconnecting,
  PublishFailed,
  WeeklyDigest,
  type AccountsNeedReconnectingProps,
  type PublishFailedProps,
  type WeeklyDigestProps,
} from './notifications';
import {
  Invitation,
  MagicLink,
  Notifications,
  ResetPassword,
  VerifyEmail,
  type InvitationProps,
  type NotificationEmailProps,
} from './templates';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

async function renderEmail(subject: string, element: ReactElement): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
  return { subject, html, text };
}

export const verifyEmail = (input: { name: string; url: string }) =>
  renderEmail('Verify your email for Socioboard', createElement(VerifyEmail, input));

export const resetPassword = (input: { name: string; url: string }) =>
  renderEmail('Reset your Socioboard password', createElement(ResetPassword, input));

export const magicLink = (input: { url: string }) =>
  renderEmail('Your Socioboard sign-in link', createElement(MagicLink, input));

export const invitation = (input: InvitationProps) =>
  renderEmail(
    `${input.inviter} invited you to ${input.workspace} on Socioboard`,
    createElement(Invitation, input),
  );

/** A burst of notifications of one kind, as one email (notifications module). */
export const notificationEmail = (input: NotificationEmailProps) => {
  const [first] = input.items;
  const title = first?.title ?? 'Something needs your attention';
  const subject =
    input.items.length > 1 ? `${title} (and ${String(input.items.length - 1)} more)` : title;
  return renderEmail(subject, createElement(Notifications, input));
};

export type { DigestWorkspace } from './notifications';

/** A post's deliveries that failed for good (notifications: publish_failed). */
export const publishFailedEmail = (input: PublishFailedProps) => {
  const [first] = input.failures;
  const subject =
    input.failures.length === 1 && first
      ? `A post couldn't be published to ${first.network}`
      : `A post couldn't be published to ${String(input.failures.length)} accounts`;
  return renderEmail(subject, createElement(PublishFailed, input));
};

/** Accounts that stopped posting until someone reconnects them (account_reauth_required). */
export const accountsNeedReconnectingEmail = (input: AccountsNeedReconnectingProps) => {
  const [first] = input.accounts;
  const subject =
    input.accounts.length === 1 && first
      ? `${first.name} needs reconnecting`
      : `${String(input.accounts.length)} accounts need reconnecting in ${input.workspace}`;
  return renderEmail(subject, createElement(AccountsNeedReconnecting, input));
};

/** The weekly summary (digest), for people who turned it on. */
export const weeklyDigestEmail = (input: WeeklyDigestProps) => {
  const total = (k: 'published' | 'failed') => input.workspaces.reduce((n, w) => n + w[k], 0);
  const failed = total('failed');
  const subject = `Your week on Socioboard: ${String(total('published'))} published${failed ? `, ${String(failed)} failed` : ''}`;
  return renderEmail(subject, createElement(WeeklyDigest, input));
};
