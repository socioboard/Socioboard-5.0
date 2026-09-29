import { describe, expect, it } from 'vitest';

import {
  apiRoutes,
  CreateLabelBody,
  CreatePostBody,
  ListPostsQuery,
  Network,
  StartConnectBody,
  textLength,
  UpdateLabelBody,
  UpdatePostBody,
  ValidatePostBody,
  type RouteDefinition,
} from '../index';

const A = '01890a5d-ac96-774b-bcce-b302099a8057';
const B = '01890a5d-ac96-774b-bcce-b302099a8058';

describe('networks', () => {
  it('counts text in code points, so an emoji is one character', () => {
    expect(textLength('hello')).toBe(5);
    expect(textLength('👋🏽 hi')).toBe(5); // wave + skin tone modifier + space + h + i
    expect(textLength('')).toBe(0);
  });

  it('a network needs at least one way to sign in', () => {
    const network = {
      id: 'instagram',
      displayName: 'Instagram',
      capabilities: { postTypes: ['image'], firstComment: true, altText: true },
      rules: {
        maxChars: 2200,
        maxHashtags: 30,
        maxMentions: 20,
        media: {
          required: true,
          maxItems: 10,
          kinds: ['image', 'video'],
          mixKinds: true,
          maxImageBytes: 8_000_000,
          imageAspectRatio: { min: 0.8, max: 1.91 },
          video: null,
        },
        links: 'not_clickable',
      },
      preview: {
        truncateAt: 125,
        captionPosition: 'below_media',
        mediaLayout: 'carousel',
        cropAspectRatio: { min: 0.8, max: 1.91 },
        linkCard: false,
      },
      logins: [{ provider: 'facebook', supportsAccountSelection: false }],
    };
    expect(Network.safeParse(network).success).toBe(true);
    expect(Network.safeParse({ ...network, logins: [] }).success).toBe(false);
  });
});

describe('connect flow', () => {
  it('connects through a login provider, not a posting network', () => {
    const route: RouteDefinition = apiRoutes.socialAccounts.startConnect;
    expect(route.params?.safeParse({ workspaceId: A, provider: 'facebook' }).success).toBe(true);
    expect(route.params?.safeParse({ workspaceId: A, provider: 'facebook_page' }).success).toBe(
      false,
    );
  });

  it('shows the account picker only when asked', () => {
    expect(StartConnectBody.parse({})).toEqual({ forceAccountSelection: false });
  });
});

describe('posts', () => {
  it('a draft can start empty', () => {
    expect(CreatePostBody.parse({})).toEqual({ text: '', mediaIds: [], labelIds: [], targets: [] });
  });

  it('labels: named colours, unique on a post, names of 1 to 40 characters', () => {
    expect(CreateLabelBody.safeParse({ name: 'Launch', color: 'violet' }).success).toBe(true);
    expect(CreateLabelBody.safeParse({ name: 'Launch', color: '#ff00aa' }).success).toBe(false);
    expect(CreateLabelBody.safeParse({ name: '  ', color: 'blue' }).success).toBe(false);
    expect(CreateLabelBody.safeParse({ name: 'x'.repeat(41), color: 'blue' }).success).toBe(false);
    expect(CreatePostBody.safeParse({ labelIds: [A, A] }).success).toBe(false);
    expect(UpdateLabelBody.safeParse({}).success).toBe(false);
  });

  it('refuses the same account or file twice', () => {
    const twice = CreatePostBody.safeParse({ targets: [{ accountId: A }, { accountId: A }] });
    expect(twice.success).toBe(false);
    expect(CreatePostBody.safeParse({ mediaIds: [A, A] }).success).toBe(false);
    expect(CreatePostBody.parse({ targets: [{ accountId: A }, { accountId: B }] }).targets).toEqual(
      [
        { accountId: A, override: null },
        { accountId: B, override: null },
      ],
    );
  });

  it('links must be http(s)', () => {
    expect(CreatePostBody.safeParse({ link: 'https://socioboard.com' }).success).toBe(true);
    expect(CreatePostBody.safeParse({ link: 'javascript:alert(1)' }).success).toBe(false);
  });

  it('overrides carry per-network options', () => {
    const body = {
      targets: [
        {
          accountId: A,
          override: { text: 'For Instagram', options: { instagram: { format: 'reel' } } },
        },
      ],
    };
    expect(CreatePostBody.safeParse(body).success).toBe(true);
    const bad = {
      targets: [{ accountId: A, override: { options: { instagram: { format: 'x' } } } }],
    };
    expect(CreatePostBody.safeParse(bad).success).toBe(false);
  });

  it('updates must change something', () => {
    expect(UpdatePostBody.safeParse({}).success).toBe(false);
    expect(UpdatePostBody.safeParse({ text: 'Hi' }).success).toBe(true);
  });

  it('validation takes the full content', () => {
    const body = { text: 'Hi', mediaIds: [], link: null, firstComment: null, targets: [] };
    expect(ValidatePostBody.safeParse(body).success).toBe(true);
    expect(ValidatePostBody.safeParse({ text: 'Hi' }).success).toBe(false);
  });

  it('list filters accept one status or several', () => {
    expect(ListPostsQuery.parse({ status: 'failed' }).status).toEqual(['failed']);
    expect(ListPostsQuery.parse({ status: ['published', 'partial'] }).status).toEqual([
      'published',
      'partial',
    ]);
    expect(ListPostsQuery.safeParse({ status: 'lost' }).success).toBe(false);
  });

  it('declares /posts/validate before /posts/:postId so it matches first', () => {
    const paths = Object.values(apiRoutes.posts).map((r: RouteDefinition) => r.path);
    expect(paths.indexOf('/api/v1/workspaces/:workspaceId/posts/validate')).toBeLessThan(
      paths.indexOf('/api/v1/workspaces/:workspaceId/posts/:postId'),
    );
  });
});
