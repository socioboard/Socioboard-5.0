import {
  textLength,
  type Network,
  type NetworkId,
  type ValidatePostResponse,
  type ValidationIssue,
} from '@socioboard/contracts';

import { contentFor, type Draft, type NetworkOf } from './draft';

/** One problem as the composer shows it: for the post, a network, or one account of it. */
export interface ComposerIssue {
  /** Stable across re-checks, for React keys. */
  key: string;
  severity: ValidationIssue['severity'];
  code: string;
  field: ValidationIssue['field'];
  /** Null: the post as a whole (no accounts chosen). */
  network: NetworkId | null;
  /** Set when the issue is about one account (disconnected, paused…), not the network's content. */
  accountId: string | null;
  mediaId: string | null;
  params: Record<string, string | number>;
  /** The server's English wording, used when the composer has no words for the code. */
  fallback: string;
}

/**
 * Codes the composer checks as the user types, the same way the server does. For these the
 * instant result always wins, so the panel never lags behind a keystroke; the server's check
 * (500 ms after typing stops) adds everything else.
 */
export const CLIENT_CODES = new Set([
  'NO_ACCOUNTS',
  'TEXT_TOO_LONG',
  'TOO_MANY_MEDIA',
  'MEDIA_REQUIRED',
  'LINK_INVALID',
]);

/** http(s) addresses only, as the API accepts. */
export function isWebAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const make = (
  i: Omit<ComposerIssue, 'key' | 'accountId' | 'mediaId' | 'params' | 'fallback'> &
    Partial<Pick<ComposerIssue, 'accountId' | 'mediaId' | 'params' | 'fallback'>>,
): ComposerIssue => ({
  accountId: null,
  mediaId: null,
  params: {},
  fallback: '',
  ...i,
  key: [i.network ?? 'post', i.accountId ?? '', i.code, i.mediaId ?? ''].join(':'),
});

/** The quick checks: what can be known without the server, from the networks' own rules. */
export function clientIssues(
  draft: Draft,
  networks: NetworkId[],
  rulesOf: (n: NetworkId) => Network['rules'] | undefined,
): ComposerIssue[] {
  const out: ComposerIssue[] = [];
  if (draft.accountIds.length === 0) {
    out.push(make({ severity: 'error', code: 'NO_ACCOUNTS', field: 'account', network: null }));
  }
  const link = draft.link.trim();
  if (link !== '' && !isWebAddress(link)) {
    out.push(make({ severity: 'error', code: 'LINK_INVALID', field: 'link', network: null }));
  }
  for (const network of networks) {
    const rules = rulesOf(network);
    if (!rules) continue;
    const content = contentFor(draft, network);
    // Instagram reels and stories have their own limits (one file; stories have no text): the
    // server checks those.
    const feed = network !== 'instagram' || content.format === 'feed';
    const length = textLength(content.text);
    if (feed && length > rules.maxChars) {
      out.push(
        make({
          severity: 'error',
          code: 'TEXT_TOO_LONG',
          field: 'text',
          network,
          params: { max: rules.maxChars, actual: length },
        }),
      );
    }
    if (feed && content.mediaIds.length > rules.media.maxItems) {
      out.push(
        make({
          severity: 'error',
          code: 'TOO_MANY_MEDIA',
          field: 'media',
          network,
          params: { max: rules.media.maxItems, actual: content.mediaIds.length },
        }),
      );
    }
    if (rules.media.required && content.mediaIds.length === 0) {
      out.push(make({ severity: 'error', code: 'MEDIA_REQUIRED', field: 'media', network }));
    }
  }
  return out;
}

/**
 * The server's answer as composer issues. Content issues come once per network (every account
 * of a network gets the same content); account issues stay per account.
 */
export function serverIssues(result: ValidatePostResponse, networkOf: NetworkOf): ComposerIssue[] {
  const out = new Map<string, ComposerIssue>();
  for (const i of result.issues) {
    const issue = make({
      severity: i.severity,
      code: i.code,
      field: i.field,
      network: null,
      mediaId: i.mediaId,
      params: i.params ?? {},
      fallback: i.message,
    });
    out.set(issue.key, issue);
  }
  for (const target of result.targets) {
    const network = networkOf(target.accountId) ?? target.network;
    for (const i of target.issues) {
      const issue = make({
        severity: i.severity,
        code: i.code,
        field: i.field,
        network,
        accountId: i.field === 'account' ? target.accountId : null,
        mediaId: i.mediaId,
        params: i.params ?? {},
        fallback: i.message,
      });
      if (!out.has(issue.key)) out.set(issue.key, issue);
    }
  }
  return [...out.values()];
}

/**
 * What the panel shows: the quick checks as they are now, plus the server's other findings.
 * The server's copies of the quick checks are dropped: they may be a keystroke old.
 */
export function mergeIssues(client: ComposerIssue[], server: ComposerIssue[]): ComposerIssue[] {
  return [...client, ...server.filter((i) => !CLIENT_CODES.has(i.code))];
}

/** Networks with an error: publishing to them is blocked until it's fixed. */
export function blockedNetworks(issues: ComposerIssue[]): Set<NetworkId> {
  return new Set(issues.flatMap((i) => (i.severity === 'error' && i.network ? [i.network] : [])));
}

/** "4:5", "1.91:1", "9:16": a width ÷ height ratio as people write it. */
export function formatRatio(ratio: number): string {
  const known: [number, string][] = [
    [0.8, '4:5'],
    [0.5625, '9:16'],
    [1, '1:1'],
    [1.25, '5:4'],
    [16 / 9, '16:9'],
  ];
  const hit = known.find(([r]) => Math.abs(r - ratio) < 0.005);
  if (hit) return hit[1];
  return ratio >= 1
    ? `${String(Number(ratio.toFixed(2)))}:1`
    : `1:${String(Number((1 / ratio).toFixed(2)))}`;
}
