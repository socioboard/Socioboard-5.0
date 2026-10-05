/** @jsxRuntime automatic @jsxImportSource react */
// Alerts for platform admins (docs/backend/modules/admin.md#alerts-p2-i1): something is wrong
// across the whole install, not in one workspace. Says what was seen and links to the console.
import { Action, EmailLayout, Heading, Paragraph } from './layout';
import { Row } from './notifications';

export interface OpsAlertProps {
  /** "Publishing is failing", "A queue is backed up". */
  title: string;
  /** One sentence: what was seen, and over what time. */
  summary: string;
  /** The details, one per row (a network and its failures, a queue and its backlog). */
  rows: { name: string; detail: string }[];
  /** The admin console page to look at. */
  url: string;
  actionLabel: string;
}

export function OpsAlert({ title, summary, rows, url, actionLabel }: OpsAlertProps) {
  return (
    <EmailLayout
      preview={summary}
      footer="You're receiving this because you're a platform admin of this Socioboard install. The same alert stays quiet for an hour."
    >
      <Heading>{title}</Heading>
      <Paragraph>{summary}</Paragraph>
      {rows.map((r, i) => (
        <Row key={i} name={r.name} detail={r.detail} />
      ))}
      <Action href={url} label={actionLabel} />
    </EmailLayout>
  );
}
