import {getEnv, getEnvStrict, getEnvDefault} from '../Shared/config.shared.js';
import {getEnvironment} from './constants.js';

const API_URL = 'https://open-api.tiktok.com';

const TEST_API_URL = getEnvStrict('test_url');

const TikTokConstants = {
  PRODUCTION: {
    CLIENT_KEY: getEnv('tiktok_api.client_key'),
    CLIENT_SECRET: getEnv('tiktok_api.client_secret'),
    CALLBACK_URL: getEnv('tiktok_api.callback_url'),
    API_URI: {
      RESPONSE_URL: `${API_URL}/platform/oauth/connect`,
      GET_ACCESS_TOKEN: `${API_URL}/oauth/access_token`,
      GET_REFRESH_TOKEN: `${API_URL}/oauth/refresh_token`,
      GET_VIDEO_LIST: `${API_URL}/video/list`,
      GET_AUTH_USER_INFO: `${API_URL}/oauth/userinfo`,
      GET_USER_INFO: `${API_URL}/user/info/`,
      UPLOAD_VIDEO: `${API_URL}/share/video/upload`,
      UPLOAD_AUDIO: `${API_URL}/share/sound/upload`,
    },
    VIDEO_SIZE: getEnvDefault('tiktok_api.videoFileSize', 50000000),
    AUDIO_SIZE: getEnvDefault('tiktok_api.audioFileSize', 50000000),
  },
  DEVELOPMENT: {
    CLIENT_KEY: getEnv('tiktok_api.client_key'),
    CLIENT_SECRET: getEnv('tiktok_api.client_secret'),
    CALLBACK_URL: getEnv('tiktok_api.callback_url'),
    API_URI: {
      RESPONSE_URL: `${API_URL}/platform/oauth/connect`,
      GET_ACCESS_TOKEN: `${API_URL}/oauth/access_token`,
      GET_REFRESH_TOKEN: `${API_URL}/oauth/refresh_token`,
      GET_VIDEO_LIST: `${API_URL}/video/list`,
      GET_AUTH_USER_INFO: `${API_URL}/oauth/userinfo`,
      GET_USER_INFO: `${API_URL}/user/info/`,
      UPLOAD_VIDEO: `${API_URL}/share/video/upload`,
      UPLOAD_AUDIO: `${API_URL}/share/sound/upload`,
    },
    VIDEO_SIZE: getEnvDefault('tiktok_api.videoFileSize', 50000000),
    AUDIO_SIZE: getEnvDefault('tiktok_api.audioFileSize', 50000000),
  },
  TEST: {
    CLIENT_KEY: 'demo-client-key',
    CLIENT_SECRET: 'demo-client-secret',
    CALLBACK_URL: 'demo-callback-url',
    API_URI: {
      RESPONSE_URL: `${TEST_API_URL}/v1/demo/tiktok/connect`,
      GET_ACCESS_TOKEN: `${TEST_API_URL}/v1/demo/tiktok/access_token`,
      GET_REFRESH_TOKEN: `${TEST_API_URL}/v1/demo/tiktok/refresh_token`,
      GET_VIDEO_LIST: `${TEST_API_URL}/v1/demo/tiktok/video/list`,
      GET_AUTH_USER_INFO: `${TEST_API_URL}/v1/demo/tiktok/auth/userinfo`,
      GET_USER_INFO: `${TEST_API_URL}/v1/demo/tiktok/userinfo`,
      UPLOAD_VIDEO: `${TEST_API_URL}/v1/demo/tiktok/video/upload`,
      UPLOAD_AUDIO: `${TEST_API_URL}/v1/demo/tiktok/audio/upload`,
    },
    VIDEO_SIZE: 1000000,
    AUDIO_SIZE: 300000,
  },
};

const commonTikTokConstants = {
  ACCOUNT_TYPE: 18,
  DEMO_OPEN_ID: 'demo-open-id',
  DEMO_ACCESS_TOKEN: 'demo-access_token',
  EXPECTED_FORM_DATA_KEYS: {
    UPLOAD_VIDEO: 'video',
    UPLOAD_AUDIO: 'sound_file',
  },
  REMOTE_ERROR_CODES: {
    UNAUTHORIZED_EXCEPTION: 10008,
    INVALID_OPEN_ID: 10016,
  },
  REMOTE_ERRORS: {
    20000: 'Invalid access token!',
    10008: 'Invalid access token!',
    6007055: 'Invalid request params!',
    10002: 'Open id is not provided',
    10016: 'Invalid open id',
    CERT_HAS_EXPIRED: 'Certificate has expired.',
    ENOTFOUND: 'Invalid URL.',
  },
  ERROR_MESSAGES: {
    INVALID_FILE_EXTENSION: 'Invalid file extension!',
    INVALID_ACCOUNT_IDS: 'Invalid account ids!',
    UPLOAD_VIDEO_ERROR: 'Video upload error.',
    UPLOAD_AUDIO_ERROR: 'Audio upload error.',
  },
  VIDEO_MIMETYPES: ['mp4', 'webm', 'octet-stream'],
  AUDIO_MIMETYPES: ['mpeg', 'wave', 'wav', 'octet-stream'],
  RESPONSE_VIDEO_FIELDS: [
    'id',
    'title',
    'create_time',
    'cover_image_url',
    'share_url',
    'video_description',
    'duration',
    'width',
    'height',
    'like_count',
    'share_count',
    'comment_count',
    'view_count',
  ],
  RESPONSE_USER_INFO_FIELDS: ['display_name', 'avatar_url', 'avatar_large_url'],
};

const enviroment = getEnvironment(process.env.NODE_ENV);

export default Object.freeze(
  Object.assign(TikTokConstants[enviroment], commonTikTokConstants)
);
