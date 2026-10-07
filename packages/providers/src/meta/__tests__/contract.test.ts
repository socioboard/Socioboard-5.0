// P1-B9: the Meta adapters against the provider contract. Reads (who signed in, Pages and linked
// Instagram accounts, a permalink, a refused token) replay real answers recorded from the
// Socioboard dev app and sanitized (__fixtures__/meta/recorded). Publishing calls follow Meta's
// documented shapes, since recording them would post for real.
import { fixture, type RecordedCall } from '../../testing/replay';
import {
  describeContractCoverage,
  describeLoginContract,
  describeNetworkContract,
  withReplay,
} from '../../testing/contract';
import type { PublishInput, PublishMedia } from '../../types';
import { createMetaAdapters } from '../index';

const G = 'https://graph.facebook.com/v25.0';
const IG_ID = '17841400000000001';
const tokens = {
  accessToken: 'EAA-user',
  refreshToken: null,
  expiresAt: null,
  scopes: ['pages_show_list', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'],
};
const meta = (fetch: typeof globalThis.fetch) =>
  createMetaAdapters({
    facebook: { appId: '1', appSecret: 's' },
    instagram: { appId: '2', appSecret: 'ig-s' },
    fetch,
    instagramOptions: { pollIntervalMs: 0, sleep: () => Promise.resolve() },
  });

/** A recorded error answer, as the network would give it at another endpoint. */
const at = (url: string, calls: RecordedCall[]): RecordedCall[] =>
  calls.map((c) => ({ ...c, method: 'POST', url }));

describeLoginContract(
  'Facebook Login',
  withReplay((fetch) => {
    const login = meta(fetch).logins.find((l) => l.id === 'facebook');
    if (!login) throw new Error('facebook login missing');
    return login;
  }),
  {
    tokens,
    identity: fixture('meta', 'recorded/me'),
    assets: fixture('meta', 'recorded/me-accounts'),
    invalidToken: fixture('meta', 'recorded/error-invalid-token'),
  },
);

describeLoginContract(
  'Instagram Login',
  withReplay((fetch) => {
    const login = meta(fetch).logins.find((l) => l.id === 'instagram');
    if (!login) throw new Error('instagram login missing');
    return login;
  }),
  {
    tokens: {
      accessToken: 'IGAA-long',
      refreshToken: null,
      expiresAt: null,
      scopes: ['instagram_business_basic', 'instagram_business_content_publish'],
    },
    // The login is the account: who signed in and its one asset come from the same call.
    identity: fixture('meta', 'instagram-login-me'),
    assets: fixture('meta', 'instagram-login-me'),
    invalidToken: fixture('meta', 'instagram-login-error-invalid-token'),
  },
);

const text: PublishInput = {
  text: 'Fresh roast today',
  media: [],
  link: null,
  firstComment: null,
  options: {},
};

describeNetworkContract(
  'Facebook Page',
  withReplay((fetch) => {
    const page = meta(fetch).networks.find((n) => n.id === 'facebook_page');
    if (!page) throw new Error('facebook page missing');
    return page;
  }),
  {
    account: { externalId: '101', accessToken: 'EAA-recorded-1', meta: {} },
    input: text,
    publish: [
      { method: 'POST', url: `${G}/101/feed`, status: 200, response: { id: '101_555' } },
      // The permalink lookup, as recorded.
      ...fixture('meta', 'recorded/permalink'),
    ],
    errors: {
      auth: fixture('meta', 'error-expired-token'),
      rate_limited: fixture('meta', 'error-rate-limit'),
      content: fixture('meta', 'error-content'),
      retryable: fixture('meta', 'error-server'),
    },
  },
);

const photo: PublishMedia = {
  id: 'm1',
  kind: 'image',
  mime: 'image/jpeg',
  sizeBytes: 300_000,
  width: 1080,
  height: 1080,
  durationSec: null,
  altText: null,
  readUrl: 'https://storage.test/a.jpg',
  publicUrl: 'https://media.test/a.jpg',
};
const media = `${G}/${IG_ID}/media`;

describeNetworkContract(
  'Instagram (through a Page)',
  withReplay((fetch) => {
    const ig = meta(fetch).networks.find((n) => n.id === 'instagram');
    if (!ig) throw new Error('instagram missing');
    return ig;
  }),
  {
    account: {
      externalId: IG_ID,
      accessToken: 'EAA-recorded-2',
      meta: { via: 'facebook', pageId: '102' },
    },
    input: { ...text, media: [photo] },
    publish: [
      { method: 'POST', url: media, status: 200, response: { id: 'c1' } },
      {
        method: 'GET',
        url: `${G}/c1`,
        status: 200,
        response: { status_code: 'FINISHED', id: 'c1' },
      },
      { method: 'POST', url: `${G}/${IG_ID}/media_publish`, status: 200, response: { id: 'm1' } },
      {
        method: 'GET',
        url: `${G}/m1`,
        status: 200,
        response: { permalink: 'https://www.instagram.com/p/Abc123/', id: 'm1' },
      },
    ],
    errors: {
      auth: at(media, fixture('meta', 'error-expired-token')),
      rate_limited: [
        { method: 'POST', url: media, status: 200, response: { id: 'c2' } },
        { method: 'GET', url: `${G}/c2`, status: 200, response: { status_code: 'FINISHED' } },
        ...fixture('meta', 'instagram-publish-limit'),
      ],
      content: at(media, fixture('meta', 'error-content')),
      retryable: at(media, fixture('meta', 'error-server')),
    },
  },
);

describeContractCoverage(
  'Meta',
  meta(() => Promise.reject(new Error('no calls here'))),
);
