import type { Network, NetworkId, ValidatePostResponse } from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import { draftReducer, emptyDraft, type Draft, type DraftAction } from '../draft';
import {
  blockedNetworks,
  clientIssues,
  formatRatio,
  mergeIssues,
  serverIssues,
} from '../validation';

const rules = (maxChars: number, required: boolean, maxItems = 10) =>
  ({
    maxChars,
    maxHashtags: 30,
    maxMentions: null,
    media: {
      required,
      maxItems,
      kinds: ['image', 'video'],
      mixKinds: true,
      maxImageBytes: 8,
      imageAspectRatio: null,
      video: null,
    },
    links: 'card',
  }) as Network['rules'];
const RULES: Partial<Record<NetworkId, Network['rules']>> = {
  facebook_page: rules(63206, false),
  instagram: rules(2200, true),
};
const rulesOf = (n: NetworkId) => RULES[n];
const NETWORK: Record<string, NetworkId> = {
  fb: 'facebook_page',
  fb2: 'facebook_page',
  ig: 'instagram',
};
const networkOf = (id: string) => NETWORK[id];
const run = (...actions: DraftAction[]): Draft => actions.reduce(draftReducer, emptyDraft());

describe('quick checks', () => {
  it('no accounts, a link that isn’t a web address, too long, too many files, media required', () => {
    const empty = clientIssues(run({ type: 'link', link: 'halden.coffee' }), [], rulesOf);
    expect(empty.map((i) => i.code)).toEqual(['NO_ACCOUNTS', 'LINK_INVALID']);

    const d = run(
      { type: 'accounts', accountIds: ['fb', 'ig'] },
      { type: 'text', network: null, text: 'x'.repeat(2201) },
      {
        type: 'media',
        network: 'facebook_page',
        mediaIds: Array.from({ length: 11 }, (_, i) => `m${String(i)}`),
      },
    );
    const issues = clientIssues(d, ['facebook_page', 'instagram'], rulesOf);
    expect(issues.map((i) => [i.network, i.code, i.params])).toEqual([
      ['facebook_page', 'TOO_MANY_MEDIA', { max: 10, actual: 11 }],
      ['instagram', 'TEXT_TOO_LONG', { max: 2200, actual: 2201 }],
      ['instagram', 'MEDIA_REQUIRED', {}],
    ]);
  });

  it('counts each network’s own text, and leaves reel and story limits to the server', () => {
    const d = run(
      { type: 'accounts', accountIds: ['ig'] },
      { type: 'text', network: null, text: 'x'.repeat(3000) },
      { type: 'text', network: 'instagram', text: 'short' },
    );
    expect(clientIssues(d, ['instagram'], rulesOf).map((i) => i.code)).toEqual(['MEDIA_REQUIRED']);
    const story = run(
      { type: 'accounts', accountIds: ['ig'] },
      { type: 'text', network: null, text: 'x'.repeat(3000) },
      { type: 'options', network: 'instagram', key: 'instagram', values: { format: 'story' } },
    );
    expect(clientIssues(story, ['instagram'], rulesOf).map((i) => i.code)).toEqual([
      'MEDIA_REQUIRED',
    ]);
  });
});

describe('the server’s answer', () => {
  const issue = (code: string, field: string, severity = 'error') => ({
    severity,
    code,
    message: `${code} in English`,
    field,
    mediaId: null,
  });
  const result = {
    issues: [],
    targets: [
      {
        accountId: 'fb',
        network: 'facebook_page',
        issues: [issue('LINK_CARD_DROPPED', 'link', 'warning')],
      },
      {
        accountId: 'fb2',
        network: 'facebook_page',
        issues: [issue('LINK_CARD_DROPPED', 'link', 'warning'), issue('ACCOUNT_PAUSED', 'account')],
      },
      { accountId: 'ig', network: 'instagram', issues: [issue('TEXT_TOO_LONG', 'text')] },
    ],
  } as unknown as ValidatePostResponse;

  it('content issues come once per network; account issues stay per account', () => {
    const issues = serverIssues(result, networkOf);
    expect(issues.map((i) => [i.network, i.accountId, i.code])).toEqual([
      ['facebook_page', null, 'LINK_CARD_DROPPED'],
      ['facebook_page', 'fb2', 'ACCOUNT_PAUSED'],
      ['instagram', null, 'TEXT_TOO_LONG'],
    ]);
    expect(issues[0]?.fallback).toBe('LINK_CARD_DROPPED in English');
  });

  it('the quick checks win for their codes (the server’s may be a keystroke old)', () => {
    const merged = mergeIssues([], serverIssues(result, networkOf));
    expect(merged.map((i) => i.code)).not.toContain('TEXT_TOO_LONG');
    expect(blockedNetworks(merged)).toEqual(new Set(['facebook_page']));
  });
});

describe('formatRatio', () => {
  it('writes ratios as people do', () => {
    expect(formatRatio(0.8)).toBe('4:5');
    expect(formatRatio(1.91)).toBe('1.91:1');
    expect(formatRatio(0.5625)).toBe('9:16');
    expect(formatRatio(0.5)).toBe('1:2');
  });
});
