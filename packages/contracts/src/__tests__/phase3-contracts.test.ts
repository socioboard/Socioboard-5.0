import { describe, expect, it } from 'vitest';

import {
  AccountOptionChoices,
  apiRoutes,
  optionsApplyTo,
  OPTIONS_NETWORKS,
  NetworkId,
  ShortenLinkBody,
  TargetOptions,
  TargetOverride,
  type RouteDefinition,
} from '../index';

describe('network options', () => {
  it('takes each network’s settings, every field optional so drafts can be unfinished', () => {
    const full = {
      instagram: { format: 'reel' },
      pinterest: { boardId: '549755885175', title: 'Autumn menu' },
      youtube: { title: 'Autumn menu', privacy: 'unlisted', tags: ['food'], madeForKids: false },
      tiktok: {
        privacy: 'followers',
        allowComments: true,
        allowDuets: false,
        allowStitches: false,
        commercial: { yourBrand: true, brandedContent: false },
      },
    };
    expect(TargetOptions.parse(full)).toEqual(full);
    expect(TargetOptions.parse({ pinterest: {}, youtube: {}, tiktok: {} })).toEqual({
      pinterest: {},
      youtube: {},
      tiktok: {},
    });
    expect(TargetOverride.parse({ options: { tiktok: { commercial: null } } })).toEqual({
      options: { tiktok: { commercial: null } },
    });
  });

  it('refuses values no network has', () => {
    const bad = [
      { instagram: { format: 'carousel' } },
      { pinterest: { boardId: '' } },
      { youtube: { privacy: 'friends' } },
      { youtube: { tags: [''] } },
      { youtube: { title: 'x'.repeat(501) } },
      { tiktok: { privacy: 'PUBLIC_TO_EVERYONE' } },
      { tiktok: { commercial: { yourBrand: true } } },
    ];
    for (const options of bad) {
      expect(TargetOptions.safeParse(options).success, JSON.stringify(options)).toBe(false);
    }
  });

  it('names the networks each key applies to, and nothing else', () => {
    expect(Object.keys(OPTIONS_NETWORKS).sort()).toEqual(Object.keys(TargetOptions.shape).sort());
    for (const networks of Object.values(OPTIONS_NETWORKS)) {
      for (const n of networks) expect(NetworkId.options).toContain(n);
    }
    expect(optionsApplyTo('instagram', 'instagram')).toBe(true);
    expect(optionsApplyTo('instagram', 'facebook_page')).toBe(false);
    expect(optionsApplyTo('tiktok', 'tiktok')).toBe(true);
    expect(optionsApplyTo('toString', 'tiktok')).toBe(false);
    expect(optionsApplyTo('linkedin', 'linkedin_person')).toBe(false);
  });
});

describe('account option choices', () => {
  it('Pinterest lists boards; TikTok its creator info; YouTube its privacy levels', () => {
    const answers = [
      { network: 'pinterest', boards: [{ id: '1', name: 'Menus', privacy: 'public' }] },
      {
        network: 'tiktok',
        creator: { nickname: 'Café', username: 'cafe', avatarUrl: null },
        privacyLevels: ['everyone', 'only_me'],
        turnedOff: { comments: false, duets: true, stitches: true },
        maxVideoSec: 600,
        unavailableReason: null,
      },
      { network: 'youtube', privacyLevels: ['private'] },
    ];
    for (const a of answers) expect(AccountOptionChoices.parse(a)).toEqual(a);
  });

  it('other networks answer with their network only', () => {
    for (const network of ['facebook_page', 'instagram', 'x', 'linkedin_org', 'tumblr']) {
      expect(AccountOptionChoices.parse({ network })).toEqual({ network });
    }
  });

  it('a network with choices must give them', () => {
    for (const network of ['pinterest', 'tiktok', 'youtube']) {
      expect(AccountOptionChoices.safeParse({ network }).success, network).toBe(false);
    }
    expect(AccountOptionChoices.safeParse({ network: 'youtube', privacyLevels: [] }).success).toBe(
      false,
    );
  });
});

describe('shortlinks', () => {
  it('shortens http(s) addresses only', () => {
    expect(ShortenLinkBody.safeParse({ url: 'https://example.com/menu?x=1' }).success).toBe(true);
    for (const url of ['ftp://example.com', 'javascript:alert(1)', 'example.com', '']) {
      expect(ShortenLinkBody.safeParse({ url }).success, url).toBe(false);
    }
  });

  it('routes: settings for managers, shortening for anyone who writes posts', () => {
    const routes = apiRoutes.shortlinks as Record<string, RouteDefinition>;
    expect(
      Object.fromEntries(Object.entries(routes).map(([k, r]) => [k, `${r.method} ${r.access}`])),
    ).toEqual({
      getShortener: 'GET member',
      connectShortener: 'POST accounts:connect',
      updateShortener: 'PATCH accounts:manage',
      disconnectShortener: 'DELETE accounts:manage',
      shortenLink: 'POST posts:create',
    });
  });
});
