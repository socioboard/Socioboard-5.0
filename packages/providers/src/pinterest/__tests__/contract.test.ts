// P3-B4: the Pinterest adapters against the provider contract, with Pinterest's documented answers
// (__fixtures__/pinterest, README there).
import {
  describeContractCoverage,
  describeLoginContract,
  describeNetworkContract,
  withReplay,
} from '../../testing/contract';
import { fixture } from '../../testing/replay';
import type { PublishInput } from '../../types';
import { createPinterestAdapters } from '../index';

const tokens = {
  accessToken: 'pina-access',
  refreshToken: 'pinr-refresh',
  expiresAt: null,
  scopes: ['user_accounts:read', 'boards:read', 'boards:write', 'pins:read', 'pins:write'],
};
const pinterest = (fetch: typeof globalThis.fetch) =>
  createPinterestAdapters({ pinterest: { clientId: 'client', clientSecret: 'secret' }, fetch });

describeLoginContract(
  'Pinterest login',
  withReplay((fetch) => {
    const [login] = pinterest(fetch).logins;
    if (!login) throw new Error('pinterest login missing');
    return login;
  }),
  {
    tokens,
    identity: fixture('pinterest', 'user-account'),
    assets: fixture('pinterest', 'user-account'),
    invalidToken: fixture('pinterest', 'error-invalid-token'),
  },
);

/** One photo pinned to a board, with a title and a link: the pin `pin-created` records. */
const pin: PublishInput = {
  text: 'Fresh roast today (Kenya) #coffee',
  media: [
    {
      id: 'm1',
      kind: 'image',
      mime: 'image/jpeg',
      sizeBytes: 12,
      width: 1000,
      height: 1500,
      durationSec: null,
      altText: null,
      readUrl: 'https://storage.test/media/m1.jpg',
      publicUrl: null,
    },
  ],
  link: 'https://example.com/kenya',
  firstComment: null,
  options: { pinterest: { boardId: '549755885175', title: 'Kenya AA, light roast' } },
};

describeNetworkContract(
  'Pinterest',
  withReplay((fetch) => {
    const network = pinterest(fetch).networks.find((n) => n.id === 'pinterest');
    if (!network) throw new Error('pinterest network missing');
    return network;
  }),
  {
    account: { externalId: '2783136121146311751', accessToken: 'pina-access', meta: {} },
    input: pin,
    publish: fixture('pinterest', 'pin-created'),
    errors: {
      auth: fixture('pinterest', 'error-pin-expired-token'),
      rate_limited: fixture('pinterest', 'error-pin-rate-limit'),
      content: fixture('pinterest', 'error-pin-board-not-found'),
      retryable: fixture('pinterest', 'error-pin-server'),
    },
  },
);

describeContractCoverage(
  'Pinterest',
  pinterest(() => Promise.reject(new Error('no calls here'))),
);
