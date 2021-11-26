import config from 'config';

export const SERVER = config.has('feed_socioboard.host_url') ? config.get('feed_socioboard.host_url') : 'http://localhost:5001';

export const GET_BITLY_ACCOUNT_DETAILS = '/v1/feeds/get-bitly-account-details';

export const GET_BITLY_PLATFORM_LIMITS = '/v1/feeds/get-bitly-platform-limits';

export const GET_BITLY_GROUP_LINKS = '/v1/feeds/get-bitly-group-links';

export const BITLY_SHORTEN_LINK = '/v1/feeds/bitly-shorten-link';

export const BITLY_ARCHIVE_LINK = '/v1/feeds/bitly-archive-link';
