import type { NetworkId, Post } from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import {
  contentFor,
  draftReducer,
  emptyDraft,
  fromPost,
  selectedNetworks,
  toPostBody,
  type Draft,
  type DraftAction,
} from '../draft';

const NETWORK: Record<string, NetworkId> = {
  fb1: 'facebook_page',
  fb2: 'facebook_page',
  ig: 'instagram',
};
const networkOf = (id: string) => NETWORK[id];
const run = (...actions: DraftAction[]) => actions.reduce(draftReducer, emptyDraft());

describe('draft', () => {
  it('a network tab starts from the shared content and only changes that network', () => {
    const d = run(
      { type: 'accounts', accountIds: ['fb1', 'ig'] },
      { type: 'text', network: null, text: 'Fresh roast today' },
      { type: 'text', network: 'instagram', text: 'Fresh roast ☕ #coffee' },
    );
    expect(contentFor(d, 'facebook_page').text).toBe('Fresh roast today');
    expect(contentFor(d, 'instagram')).toMatchObject({
      text: 'Fresh roast ☕ #coffee',
      textOverridden: true,
      mediaOverridden: false,
    });
    // Editing the shared text afterwards leaves Instagram's own text alone.
    const later = draftReducer(d, { type: 'text', network: null, text: 'Roast day' });
    expect(contentFor(later, 'instagram').text).toBe('Fresh roast ☕ #coffee');
    expect(contentFor(later, 'facebook_page').text).toBe('Roast day');
  });

  it('reset removes just that part, and an empty override goes away', () => {
    const d = run(
      { type: 'text', network: 'instagram', text: 'own' },
      { type: 'media', network: 'instagram', mediaIds: ['m1'] },
      { type: 'reset', network: 'instagram', part: 'text' },
    );
    expect(d.overrides.instagram).toEqual({ mediaIds: ['m1'] });
    const cleared = draftReducer(d, { type: 'reset', network: 'instagram', part: 'media' });
    expect(cleared.overrides).toEqual({});
  });

  it('attaching skips files already there, on the shared media or a network’s own', () => {
    const d = run(
      { type: 'attach', network: null, mediaIds: ['m1', 'm2'] },
      { type: 'attach', network: null, mediaIds: ['m2', 'm3'] },
    );
    expect(d.mediaIds).toEqual(['m1', 'm2', 'm3']);
    // A network's first attach starts from the shared files.
    const ig = draftReducer(d, { type: 'attach', network: 'instagram', mediaIds: ['m4', 'm1'] });
    expect(contentFor(ig, 'instagram').mediaIds).toEqual(['m1', 'm2', 'm3', 'm4']);
    expect(ig.mediaIds).toEqual(['m1', 'm2', 'm3']);
  });

  it('feed is the default Instagram format: choosing it again leaves no option behind', () => {
    const reel = run({ type: 'format', format: 'reel' });
    expect(reel.overrides.instagram).toEqual({ options: { instagram: { format: 'reel' } } });
    expect(contentFor(reel, 'instagram').format).toBe('reel');
    expect(draftReducer(reel, { type: 'format', format: 'feed' }).overrides).toEqual({});
  });

  it('the body gives every account its network’s override, and drops unselected networks', () => {
    const d = run(
      { type: 'accounts', accountIds: ['fb1', 'fb2'] },
      { type: 'text', network: null, text: 'Hello' },
      { type: 'text', network: 'facebook_page', text: 'Hello Facebook' },
      { type: 'text', network: 'instagram', text: 'left over' },
      { type: 'link', link: '  https://halden.test/beans  ' },
      { type: 'firstComment', firstComment: '   ' },
      { type: 'labels', labelIds: ['l2', 'l1'] },
    );
    const body = toPostBody(d, networkOf);
    expect(body).toEqual({
      text: 'Hello',
      mediaIds: [],
      link: 'https://halden.test/beans',
      firstComment: null,
      labelIds: ['l2', 'l1'],
      targets: [
        { accountId: 'fb1', override: { text: 'Hello Facebook' } },
        { accountId: 'fb2', override: { text: 'Hello Facebook' } },
      ],
    });
  });

  it('networks come once each, in the order first picked', () => {
    const d: Draft = { ...emptyDraft(), accountIds: ['ig', 'fb1', 'fb2'] };
    expect(selectedNetworks(d, networkOf)).toEqual(['instagram', 'facebook_page']);
  });

  it('a saved post comes back as the same draft (cancelled deliveries left out)', () => {
    const target = (
      id: string,
      network: NetworkId,
      override: object | null,
      status = 'pending',
    ) => ({
      id: `t-${id}`,
      account: { id, network, displayName: id, username: null, avatarUrl: null, status: 'active' },
      override,
      status,
      scheduledAt: null,
      externalPostId: null,
      permalink: null,
      attempts: 0,
      lastError: null,
      publishedAt: null,
    });
    const post = {
      id: 'p',
      status: 'draft',
      text: 'Hello',
      mediaIds: ['m1'],
      link: null,
      firstComment: 'First!',
      labelIds: ['l1'],
      author: null,
      createdAt: '2026-09-28T10:00:00.000Z',
      updatedAt: '2026-09-28T10:00:00.000Z',
      targets: [
        // A cancelled delivery's old override must not become Facebook's text.
        target('fb2', 'facebook_page', { text: 'old' }, 'cancelled'),
        target('fb1', 'facebook_page', null),
        target('ig', 'instagram', { text: 'IG', options: { instagram: { format: 'reel' } } }),
      ],
    } as unknown as Post;
    const d = fromPost(post);
    expect(d).toEqual({
      accountIds: ['fb1', 'ig'],
      text: 'Hello',
      mediaIds: ['m1'],
      link: '',
      firstComment: 'First!',
      overrides: { instagram: { text: 'IG', options: { instagram: { format: 'reel' } } } },
      labelIds: ['l1'],
    });
    expect(toPostBody(d, networkOf).targets).toEqual([
      { accountId: 'fb1', override: null },
      { accountId: 'ig', override: { text: 'IG', options: { instagram: { format: 'reel' } } } },
    ]);
  });
});
