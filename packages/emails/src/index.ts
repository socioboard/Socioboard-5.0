// @socioboard/emails: React Email templates, rendered to HTML + plain text on the server.
// Senders (core) add the recipient and pass the result to the mailer. No JSX in this file, so
// the entry point is plain TypeScript; the templates are .tsx.
import { render } from '@react-email/components';
import { createElement, type ReactElement } from 'react';

import {
  Invitation,
  MagicLink,
  ResetPassword,
  VerifyEmail,
  type InvitationProps,
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
