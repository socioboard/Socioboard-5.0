// P3-B2: the X adapters against the provider contract, with X's documented answers
// (__fixtures__/x, README there).
import { describeLoginContract, describeNetworkContract, withReplay } from '../../testing/contract';
import { fixture } from '../../testing/replay';
import type { PublishInput } from '../../types';
import { createXAdapters } from '../index';

const tokens = {
  accessToken: 'x-access',
  refreshToken: 'x-refresh',
  expiresAt: null,
  scopes: ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access'],
};
const x = (fetch: typeof globalThis.fetch) =>
  createXAdapters({ x: { clientId: 'client', clientSecret: 'secret' }, fetch });

describeLoginContract(
  'X login',
  withReplay((fetch) => {
    const [login] = x(fetch).logins;
    if (!login) throw new Error('x login missing');
    return login;
  }),
  {
    tokens,
    identity: fixture('x', 'me'),
    assets: fixture('x', 'me'),
    invalidToken: fixture('x', 'error-invalid-token'),
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
  'X',
  withReplay((fetch) => {
    const [network] = x(fetch).networks;
    if (!network) throw new Error('x network missing');
    return network;
  }),
  {
    account: {
      externalId: '1700000000000000001',
      accessToken: 'x-access',
      meta: { username: 'haldencoffee' },
    },
    input: text,
    publish: fixture('x', 'tweet-created'),
    errors: {
      auth: fixture('x', 'error-expired-token'),
      rate_limited: fixture('x', 'error-rate-limit'),
      content: fixture('x', 'error-duplicate'),
      retryable: fixture('x', 'error-server'),
    },
  },
);
