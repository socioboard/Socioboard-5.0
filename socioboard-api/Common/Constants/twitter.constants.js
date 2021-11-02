import { getEnv, getEnvStrict } from '../Shared/config.shared.js';
import { getEnvironment } from './constants.js';

const API_URL = 'https://api.twitter.com/1.1';

const TEST_API_URL = getEnvStrict('test_url');

const TwitterConstants = {
  PRODUCTION: {
    API_KEY: getEnv('twitter_api.api_key'),
    API_SECRET: getEnv('twitter_api.secret_key'),
    BEARER_TOKEN: getEnv('twitter_api.bearer_token'),
    REDIRECT_URL: getEnv('twitter_api.redirect_url'),
  },
  DEVELOPMENT: {
    API_KEY: getEnv('twitter_api.api_key'),
    API_SECRET: getEnv('twitter_api.secret_key'),
    BEARER_TOKEN: getEnv('twitter_api.bearer_token'),
    REDIRECT_URL: getEnv('twitter_api.redirect_url'),
  },
  TEST: {
    API_KEY: 'demo-api-key',
    API_SECRET: 'demo-api-secret',
    BEARER_TOKEN: 'demo-bearer-token',
    REDIRECT_URL: `${TEST_API_URL}/v1/demo/twitter/callback`,
  },
};

const commonTwitterConstants = {
  ACCESS_TOKEN: 'demo-twitter-access-token',
  ERROR_MESSAGE: {
    COUNTRY_NOT_FOUND: 'Country not found!',
    INVALID_BEARER_TOKEN: 'Invalid bearer token!',
    TRENDS_NOT_FOUND: 'Trends not found!',
  },
  DEMO_TWITTER_ACCOUNT_ID: '1234',
  DEMO_COUNTRY: 'demo country',
  DEMO_WOEID: 12345,
  COUNTRY_CODE: 12,
  ACCOUNT_TYPE: 4,
};

const enviroment = getEnvironment(process.env.NODE_ENV);

const TWITTER_API_URL = enviroment !== 'TEST' ? API_URL : `${TEST_API_URL}/v1/demo/twitter`;

export default Object.assign(
  TwitterConstants[enviroment], commonTwitterConstants, { TWITTER_API_URL },
);
