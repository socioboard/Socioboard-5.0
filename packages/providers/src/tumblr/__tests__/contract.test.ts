// P3-B7: the Tumblr adapters against the provider contract, with Tumblr's documented answers
// (__fixtures__/tumblr, README there).
import {
  describeContractCoverage,
  describeLoginContract,
  describeNetworkContract,
  withReplay,
} from '../../testing/contract';
import { fixture } from '../../testing/replay';
import type { PublishInput } from '../../types';
import { createTumblrAdapters } from '../index';

const tokens = {
  accessToken: 'tumblr-access',
  refreshToken: 'tumblr-refresh',
  expiresAt: null,
  scopes: ['basic', 'write', 'offline_access'],
};
const tumblr = (fetch: typeof globalThis.fetch) =>
  createTumblrAdapters({ tumblr: { clientId: 'client', clientSecret: 'secret' }, fetch });

describeLoginContract(
  'Tumblr login',
  withReplay((fetch) => {
    const [login] = tumblr(fetch).logins;
    if (!login) throw new Error('tumblr login missing');
    return login;
  }),
  {
    tokens,
    identity: fixture('tumblr', 'user-info'),
    assets: fixture('tumblr', 'user-info'),
    invalidToken: fixture('tumblr', 'error-login-invalid-token'),
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
  'Tumblr',
  withReplay((fetch) => {
    const [network] = tumblr(fetch).networks;
    if (!network) throw new Error('tumblr network missing');
    return network;
  }),
  {
    account: {
      externalId: 'haldenroasters',
      accessToken: 'tumblr-access',
      meta: { blogName: 'haldenroasters', url: 'https://haldenroasters.tumblr.com/' },
    },
    input: text,
    publish: fixture('tumblr', 'post-created'),
    errors: {
      auth: fixture('tumblr', 'error-invalid-token'),
      rate_limited: fixture('tumblr', 'error-rate-limit'),
      content: fixture('tumblr', 'error-content'),
      retryable: fixture('tumblr', 'error-server'),
    },
  },
);

describeContractCoverage(
  'Tumblr',
  tumblr(() => Promise.reject(new Error('no calls here'))),
);
