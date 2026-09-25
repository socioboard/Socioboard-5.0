import type { MailMessage } from '../../platform';

// Plain first version; P0-B13 moves it to a React Email template in @socioboard/emails.
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${String(c.charCodeAt(0))};`);

export function invitationEmail(input: {
  to: string;
  inviter: string;
  workspace: string;
  role: string;
  url: string;
}): MailMessage {
  const intro = `${input.inviter} invited you to join ${input.workspace} on Socioboard as ${input.role}. The invitation expires in 7 days.`;
  return {
    to: input.to,
    subject: `${input.inviter} invited you to ${input.workspace} on Socioboard`,
    text: `${intro}\n\nAccept invitation: ${input.url}\n\nIf you weren't expecting this, you can ignore this email.`,
    html: `<p>${escape(intro)}</p><p><a href="${escape(input.url)}">Accept invitation</a></p><p>If you weren't expecting this, you can ignore this email.</p>`,
  };
}
