// Networks for tests: the real Meta network adapters (rules, validation) behind fake logins
// whose people, Pages and failures the test controls. Nothing here calls a network.
import {
  createMetaAdapters,
  createRegistry,
  ProviderError,
  type LoginAdapter,
  type LoginIdentity,
  type ProviderAsset,
  type Registry,
  type TokenSet,
} from '@socioboard/providers';

/** Someone who can "sign in" on a fake network: the OAuth code the test sends names them. */
export interface FakePerson {
  identity: LoginIdentity;
  scopes: string[];
  assets: ProviderAsset[];
}

export interface FakeLogin extends LoginAdapter {
  /** People by the `code` the callback receives. */
  people: Map<string, FakePerson>;
  /** Set to make the next call of that kind fail. */
  failNext: { exchange?: ProviderError; listAssets?: ProviderError };
  /** The last auth URL's parameters, e.g. to read `state`. */
  lastAuthUrl: URL | null;
}

function fakeLogin(id: 'facebook' | 'instagram', supportsAccountSelection: boolean): FakeLogin {
  const people = new Map<string, FakePerson>();
  const failNext: FakeLogin['failNext'] = {};
  const personOf = (tokens: TokenSet) => {
    const person = people.get(tokens.accessToken.replace(/^token-/, ''));
    if (!person) throw new ProviderError({ kind: 'auth', message: 'Invalid token' });
    return person;
  };
  const login: FakeLogin = {
    id,
    networks: id === 'facebook' ? ['facebook_page', 'instagram'] : ['instagram'],
    supportsAccountSelection,
    usesPkce: false,
    requiredScopes: id === 'facebook' ? ['pages_show_list'] : ['instagram_business_basic'],
    people,
    failNext,
    lastAuthUrl: null,
    getAuthUrl({ state, redirectUri, forceAccountSelection }) {
      const url = new URL(`https://${id}.example.test/oauth`);
      url.searchParams.set('state', state);
      url.searchParams.set('redirect_uri', redirectUri);
      if (forceAccountSelection) url.searchParams.set('force', 'true');
      login.lastAuthUrl = url;
      return url.toString();
    },
    exchangeCode({ code }) {
      const err = failNext.exchange;
      delete failNext.exchange;
      if (err) return Promise.reject(err);
      const person = people.get(code);
      if (!person) return Promise.reject(new ProviderError({ kind: 'auth', message: 'Bad code' }));
      return Promise.resolve({
        accessToken: `token-${code}`,
        refreshToken: null,
        expiresAt: null,
        scopes: person.scopes,
      });
    },
    getIdentity: (tokens) => Promise.resolve(personOf(tokens).identity),
    listAssets(tokens) {
      const err = failNext.listAssets;
      delete failNext.listAssets;
      if (err) return Promise.reject(err);
      return Promise.resolve(personOf(tokens).assets);
    },
  };
  return login;
}

export interface FakeNetworks {
  registry: Registry;
  facebook: FakeLogin;
  instagram: FakeLogin;
}

export function createFakeNetworks(): FakeNetworks {
  const facebook = fakeLogin('facebook', false);
  const instagram = fakeLogin('instagram', true);
  const { networks } = createMetaAdapters({
    facebook: { appId: 'test', appSecret: 'test' },
    instagram: { appId: 'test', appSecret: 'test' },
    fetch: () => Promise.reject(new Error('tests never call Meta')),
  });
  return {
    registry: createRegistry({ logins: [facebook, instagram], networks }),
    facebook,
    instagram,
  };
}

/** A Facebook Page as the fake Facebook login lists it. */
export function fakePage(
  id: string,
  name: string,
  extra: Partial<ProviderAsset> = {},
): ProviderAsset {
  return {
    network: 'facebook_page',
    externalId: id,
    displayName: name,
    username: null,
    avatarUrl: `https://cdn.example.test/${id}.jpg`,
    token: { accessToken: `page-token-${id}`, expiresAt: null },
    meta: {},
    unavailableReason: null,
    ...extra,
  };
}
