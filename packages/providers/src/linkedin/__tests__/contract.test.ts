// P3-B1: the LinkedIn adapters against the provider contract, with LinkedIn's documented answers
// (__fixtures__/linkedin, README there). The networks join as they're built.
import {
  describeContractCoverage,
  describeLoginContract,
  describeNetworkContract,
  withReplay,
} from '../../testing/contract';
import { fixture } from '../../testing/replay';
import type { PublishInput } from '../../types';
import { createLinkedInAdapters } from '../index';

const tokens = {
  accessToken: 'li-access',
  refreshToken: null,
  expiresAt: null,
  scopes: ['openid', 'profile', 'w_member_social'],
};
const linkedin = (fetch: typeof globalThis.fetch) =>
  createLinkedInAdapters({ linkedin: { clientId: 'client', clientSecret: 'secret' }, fetch });

describeLoginContract(
  'LinkedIn login',
  withReplay((fetch) => {
    const [login] = linkedin(fetch).logins;
    if (!login) throw new Error('linkedin login missing');
    return login;
  }),
  {
    tokens,
    identity: fixture('linkedin', 'userinfo'),
    assets: fixture('linkedin', 'userinfo'),
    invalidToken: fixture('linkedin', 'error-invalid-token'),
  },
);

const text: PublishInput = {
  text: 'Fresh roast today (Kenya) #coffee',
  media: [],
  link: null,
  firstComment: null,
  options: {},
};

describeNetworkContract(
  'LinkedIn profile',
  withReplay((fetch) => {
    const network = linkedin(fetch).networks.find((n) => n.id === 'linkedin_person');
    if (!network) throw new Error('linkedin_person missing');
    return network;
  }),
  {
    account: { externalId: '782bbtaQ', accessToken: 'li-access', meta: {} },
    input: text,
    publish: fixture('linkedin', 'post-created'),
    errors: {
      auth: fixture('linkedin', 'error-expired-token'),
      rate_limited: fixture('linkedin', 'error-rate-limit'),
      content: fixture('linkedin', 'error-duplicate'),
      retryable: fixture('linkedin', 'error-server'),
    },
  },
);

describeContractCoverage(
  'LinkedIn',
  linkedin(() => Promise.reject(new Error('no calls here'))),
);
