/** @jsxRuntime automatic @jsxImportSource react */
// Notification emails (P2-B12): one design per kind. Each lists what happened and why, never the
// post's content or anything secret, and links to the page that fixes it. index.ts adds subjects.
import { Section, Text } from '@react-email/components';

import { Action, EmailLayout, Heading, Paragraph } from './layout';

const muted = '#656d76';
const border = '#e4e7eb';
const danger = '#b42318';

const SETTINGS = 'You can choose which emails you get in your notification settings on Socioboard.';

/** One row of a list: a bold name, a small line under it. */
function Row({
  name,
  detail,
  detailColor,
}: {
  name: string;
  detail: string;
  detailColor?: string;
}) {
  return (
    <Section style={{ borderTop: `1px solid ${border}`, padding: '12px 0' }}>
      <Text style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1f2328' }}>{name}</Text>
      <Text
        style={{
          fontSize: '14px',
          lineHeight: '20px',
          margin: '2px 0 0',
          color: detailColor ?? muted,
        }}
      >
        {detail}
      </Text>
    </Section>
  );
}

export interface PublishFailedProps {
  workspace: string;
  /** Each delivery of the post that failed for good: where, and the network's reason. */
  failures: { account: string; network: string; reason: string }[];
  /** The post's page. */
  url: string;
}

export function PublishFailed({ workspace, failures, url }: PublishFailedProps) {
  const one = failures.length === 1 ? failures[0] : undefined;
  return (
    <EmailLayout
      preview={
        one ? `${one.network}: ${one.reason}` : `${String(failures.length)} accounts didn't get it`
      }
      footer={`You're receiving this because you wrote this post or manage ${workspace}. ${SETTINGS}`}
    >
      <Heading>A post couldn't be published</Heading>
      <Paragraph>
        {one
          ? `In ${workspace}, ${one.account} on ${one.network} didn't get it. Here's what ${one.network} said:`
          : `In ${workspace}, ${String(failures.length)} accounts didn't get it. Here's what each network said:`}
      </Paragraph>
      {failures.map((f, i) => (
        <Row key={i} name={`${f.account} on ${f.network}`} detail={f.reason} detailColor={danger} />
      ))}
      <Paragraph>
        Open the post to fix it and try again. Accounts that did get it aren't affected.
      </Paragraph>
      <Action href={url} label="Open the post" />
    </EmailLayout>
  );
}

export interface AccountsNeedReconnectingProps {
  workspace: string;
  accounts: { name: string; network: string; reason: string }[];
  /** The accounts page. */
  url: string;
}

export function AccountsNeedReconnecting({
  workspace,
  accounts,
  url,
}: AccountsNeedReconnectingProps) {
  const one = accounts.length === 1 ? accounts[0] : undefined;
  return (
    <EmailLayout
      preview={
        one ? one.reason : `${String(accounts.length)} accounts in ${workspace} stopped posting`
      }
      footer={`You're receiving this because you manage ${workspace}. ${SETTINGS}`}
    >
      <Heading>
        {one
          ? `${one.name} needs reconnecting`
          : `${String(accounts.length)} accounts need reconnecting`}
      </Heading>
      <Paragraph>
        {`Socioboard can't post to ${one ? 'this account' : 'these accounts'} in ${workspace} until someone reconnects ${one ? 'it' : 'them'}. Scheduled posts to ${one ? 'it' : 'them'} will fail at their time.`}
      </Paragraph>
      {accounts.map((a, i) => (
        <Row key={i} name={`${a.name} on ${a.network}`} detail={a.reason} />
      ))}
      <Paragraph>
        Reconnecting takes a minute: sign in to the network again from Accounts.
      </Paragraph>
      <Action href={url} label={one ? 'Reconnect the account' : 'Reconnect accounts'} />
    </EmailLayout>
  );
}

export interface DigestWorkspace {
  name: string;
  /** Last 7 days. */
  published: number;
  failed: number;
  /** Next 7 days. */
  scheduled: number;
  needsReconnecting: number;
  /** The workspace's calendar. */
  url: string;
}

export interface WeeklyDigestProps {
  name: string;
  workspaces: DigestWorkspace[];
}

const plural = (n: number, one: string, many: string) => `${String(n)} ${n === 1 ? one : many}`;

export function WeeklyDigest({ name, workspaces }: WeeklyDigestProps) {
  return (
    <EmailLayout
      preview="What went out last week and what's coming up"
      footer={`You're receiving this weekly summary because you turned it on. ${SETTINGS}`}
    >
      <Heading>Your week on Socioboard</Heading>
      <Paragraph>Hi {name}, here's what went out in the last 7 days and what's next.</Paragraph>
      {workspaces.map((w, i) => (
        <Section key={i} style={{ borderTop: `1px solid ${border}`, padding: '12px 0' }}>
          <Text style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px', color: '#1f2328' }}>
            {w.name}
          </Text>
          <Text style={{ fontSize: '14px', lineHeight: '22px', margin: 0, color: '#1f2328' }}>
            {`${plural(w.published, 'post', 'posts')} published, ${plural(w.scheduled, 'post', 'posts')} scheduled for the next 7 days.`}
          </Text>
          {w.failed > 0 ? (
            <Text style={{ fontSize: '14px', lineHeight: '22px', margin: 0, color: danger }}>
              {`${plural(w.failed, 'post', 'posts')} couldn't be published.`}
            </Text>
          ) : null}
          {w.needsReconnecting > 0 ? (
            <Text style={{ fontSize: '14px', lineHeight: '22px', margin: 0, color: danger }}>
              {`${plural(w.needsReconnecting, 'account needs', 'accounts need')} reconnecting.`}
            </Text>
          ) : null}
          <Text style={{ fontSize: '14px', margin: '6px 0 0' }}>
            <a href={w.url} style={{ color: '#1d4ed8' }}>
              Open the calendar
            </a>
          </Text>
        </Section>
      ))}
    </EmailLayout>
  );
}
