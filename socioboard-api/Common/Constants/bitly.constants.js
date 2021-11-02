import { getEnv, getEnvStrict } from '../Shared/config.shared.js';
import { getEnvironment } from './constants.js';

const API_URL = 'https://api-ssl.bitly.com';

const BITLY_URL = 'https://bitly.com';

const TEST_API_URL = getEnvStrict('test_url');

const BitlyConstants = {
  PRODUCTION: {
    CLIENT_ID: getEnv('bitly_api.client_id'),
    CLIENT_SECRET: getEnv('bitly_api.client_secret'),
    REDIRECT_URI: getEnv('bitly_api.redirect_uri'),
    API_URI: {
      AUTHORIZATION: `${BITLY_URL}/oauth/authorize`,
      GET_USER_DETAILS: `${API_URL}/v4/user`,
      GET_ACCESS_TOKEN: `${API_URL}/oauth/access_token`,
      GET_GROUPS: `${API_URL}/v4/groups`,
      GET_PLATFORM_LIMITS: `${API_URL}/v4/user/platform_limits`,
      SHORTEN_LINK: `${API_URL}/v4/shorten`,
      BITLY_GROUP_LINK: `${API_URL}/v4/groups`,
      UPDATE_BITLINK: `${API_URL}/v4/bitlinks`,
    },
  },
  DEVELOPMENT: {
    CLIENT_ID: getEnv('bitly_api.client_id'),
    CLIENT_SECRET: getEnv('bitly_api.client_secret'),
    REDIRECT_URI: getEnv('bitly_api.redirect_uri'),
    API_URI: {
      AUTHORIZATION: `${BITLY_URL}/oauth/authorize`,
      GET_USER_DETAILS: `${API_URL}/v4/user`,
      GET_ACCESS_TOKEN: `${API_URL}/oauth/access_token`,
      GET_GROUPS: `${API_URL}/v4/groups`,
      GET_PLATFORM_LIMITS: `${API_URL}/v4/user/platform_limits`,
      SHORTEN_LINK: `${API_URL}/v4/shorten`,
      BITLY_GROUP_LINK: `${API_URL}/v4/groups`,
      UPDATE_BITLINK: `${API_URL}/v4/bitlinks`,
    },
  },
  TEST: {
    CLIENT_ID: 'demo-bitly-client-id',
    CLIENT_SECRET: 'demo-bitly-client-secret',
    REDIRECT_URI: `${TEST_API_URL}/v1/demo/bitly/callback`,
    API_URI: {
      AUTHORIZATION: `${TEST_API_URL}/v1/demo/bitly/oauth/authorize`,
      GET_USER_DETAILS: `${TEST_API_URL}/v1/demo/bitly/user`,
      GET_ACCESS_TOKEN: `${TEST_API_URL}/v1/demo/bitly/access_token`,
      GET_GROUPS: `${TEST_API_URL}/v1/demo/bitly/groups`,
      GET_PLATFORM_LIMITS: `${TEST_API_URL}/v1/demo/bitly/user/platform_limits`,
      SHORTEN_LINK: `${TEST_API_URL}/v1/demo/bitly/shorten`,
      BITLY_GROUP_LINK: `${TEST_API_URL}/v1/demo/bitly/groups`,
      UPDATE_BITLINK: `${TEST_API_URL}/v1/demo/bitly/bitlinks`,
    },
  },
};

const commonBitlyConstants = {
  ACCOUNT_TYPE: 13,
  ACCOUNT_DETAILS: {
    NAME: 'demo-name',
    EMAIL: 'demo-email@email.com',
    LOGIN: 'demo-bitly-login',
    DEFAULT_GROUP: 'demo-default-group',
    ACCESS_TOKEN: 'demo-bitly-access-token',
    CODE: 'demo-bitly-code',
  },
  ERROR_MESSAGES: {
    ALREADY_A_BITLY_LINK: 'ALREADY_A_BITLY_LINK',
  },
  GROUP_GUID_VALID: 'demo-group-guid',
  GROUP_GUID_FORBIDDEN: 'demo-group-guid-forbidden',
  ACCESS_TOKEN_FORBIDDEN: 'demo-bitly-access-token-forbidden',
  BITLINK: 'demo-bitlink',
  BITLINK_FORBIDDEN: 'demo-bitlink-forbidden',
};

const enviroment = getEnvironment(process.env.NODE_ENV);

export default Object.assign(BitlyConstants[enviroment], commonBitlyConstants);
