// P3-B4: the Pinterest adapters against the provider contract, with Pinterest's documented answers
// (__fixtures__/pinterest, README there). The `pinterest` network joins when it's built.
import {
  describeContractCoverage,
  describeLoginContract,
  withReplay,
} from '../../testing/contract';
import { fixture } from '../../testing/replay';
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

describeContractCoverage(
  'Pinterest',
  pinterest(() => Promise.reject(new Error('no calls here'))),
);
