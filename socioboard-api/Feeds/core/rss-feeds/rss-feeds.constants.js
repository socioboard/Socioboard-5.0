import config from 'config';

const RSS_FEEDS_CONSTANTS = {
  STATUS_CODE: {
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    DUPLICATE_LINKS: 11000,
  },
  BACKUP_CONFIGS: {
    AMOUNT: 1,
    UNIT: 'days',
    DATE_FORMAT: 'YYYY-MM-DD',
  },
  ERROR_MESSAGES: {
    CHANNEL_NOT_FOUND: 'Channel not found!',
    USER_DONT_HAVE_ACCESS_TO_THE_CHANNEL: 'User do not have access to the channel!',
    INVALID_LINKS_IDS: 'Invalid links ids!',
    LINKS_ALREADY_EXIST_IN_THE_CHANNEL: 'Links already exist in the channel!',
    INVALID_LINKS: 'Invalid links!',
    INVALID_FILE_EXTENSION: 'Invalid file extension!',
    DUPLICATE_LINKS: 'Duplicate links!',
    CHANNEL_ALREADY_EXIST: 'The channel already exist!',
    ARCHIVE_LINK_NOT_FOUND: 'Archive link not found!',
    INVALID_BACKUP_LINK_ID: 'Invalid backup link id!',
  },
  DOMAINS: {
    TIMES_OF_INDIA: 'https://timesofindia.indiatimes.com/rss.cms',
    ARCHIVE_NYTIMES: 'https://archive.nytimes.com/www.nytimes.com/services/xml/rss/index.html',
  },
  FILE_SIZE: config.has('rss_feeds.fileSize') ? config.get('rss_feeds.fileSize') : 5000000,
  FILE_EXTENSIONS: ['csv'],
};

export default Object.freeze(RSS_FEEDS_CONSTANTS);
