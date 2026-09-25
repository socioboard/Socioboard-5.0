/** @jsxRuntime automatic @jsxImportSource react */
// The pragma makes the JSX transform explicit: tools that load this package from another
// workspace (tsx in apps/api dev) apply that app's tsconfig, not this one.
// Account and workspace emails (phase 0). index.ts adds the subject and renders them to HTML and
// plain text.
import { Action, EmailLayout, Heading, Paragraph } from './layout';

const IGNORE = "If you didn't ask for this, you can ignore this email.";

export function VerifyEmail({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout
      preview="Confirm your email address to finish setting up Socioboard"
      footer={`You're receiving this because this address was used to sign up for Socioboard. ${IGNORE}`}
    >
      <Heading>Verify your email</Heading>
      <Paragraph>Hi {name}, confirm your email address to finish setting up Socioboard.</Paragraph>
      <Action href={url} label="Verify email" />
    </EmailLayout>
  );
}

export function ResetPassword({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout
      preview="Choose a new password for Socioboard"
      footer={`You're receiving this because a password reset was requested for your account. ${IGNORE} Your password stays the same.`}
    >
      <Heading>Reset your password</Heading>
      <Paragraph>
        Hi {name}, use the button below to choose a new password. The link expires in 1 hour.
      </Paragraph>
      <Action href={url} label="Reset password" />
    </EmailLayout>
  );
}

export function MagicLink({ url }: { url: string }) {
  return (
    <EmailLayout
      preview="Your sign-in link for Socioboard"
      footer={`You're receiving this because a sign-in link was requested for this address. ${IGNORE}`}
    >
      <Heading>Sign in to Socioboard</Heading>
      <Paragraph>
        Use the button below to sign in. The link expires in 10 minutes and works once.
      </Paragraph>
      <Action href={url} label="Sign in" />
    </EmailLayout>
  );
}

export interface InvitationProps {
  inviter: string;
  workspace: string;
  role: string;
  url: string;
}

export function Invitation({ inviter, workspace, role, url }: InvitationProps) {
  return (
    <EmailLayout
      preview={`${inviter} invited you to ${workspace} on Socioboard`}
      footer="You're receiving this because someone invited this address to a Socioboard workspace. If you weren't expecting it, you can ignore this email."
    >
      <Heading>Join {workspace} on Socioboard</Heading>
      <Paragraph>
        {inviter} invited you to join <strong>{workspace}</strong> as {article(role)}{' '}
        <strong>{role}</strong>. The invitation expires in 7 days.
      </Paragraph>
      <Action href={url} label="Accept invitation" />
    </EmailLayout>
  );
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
