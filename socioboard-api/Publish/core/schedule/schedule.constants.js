import CoreServices from '../../../Common/Services/core.services.js';

import {getEnvDefault} from '../../../Common/Shared/config.shared.js';

import {getEnvironment} from '../../../Common/Constants/constants.js';

const {networks} = new CoreServices();

const ScheduleConstants = {
  PRODUCTION: {
    CHARACTER_LIMITS: {
      [networks.Facebook]: 5000,
      [networks.Instagram]: 2200,
      [networks.LinkedIn]: 700,
      [networks.Twitter]: 280,
    },
    IMAGE_LIMITS: {
      [networks.Facebook]: 4,
      [networks.Instagram]: 1,
      [networks.LinkedIn]: 1,
      [networks.Twitter]: 4,
    },
  },
  DEVELOPMENT: {
    CHARACTER_LIMITS: {
      [networks.Facebook]: 5000,
      [networks.Instagram]: 2200,
      [networks.LinkedIn]: 700,
      [networks.Twitter]: 280,
    },
    IMAGE_LIMITS: {
      [networks.Facebook]: 4,
      [networks.Instagram]: 1,
      [networks.LinkedIn]: 1,
      [networks.Twitter]: 4,
    },
  },
  TEST: {
    CHARACTER_LIMITS: {
      [networks.Facebook]: 50,
      [networks.Instagram]: 22,
      [networks.LinkedIn]: 7,
      [networks.Twitter]: 10,
    },
    IMAGE_LIMITS: {
      [networks.Facebook]: 1,
      [networks.Instagram]: 1,
      [networks.LinkedIn]: 1,
      [networks.Twitter]: 1,
    },
  },
};

const CommonScheduleConstants = {
  FILE_FIELDS: {
    DATE_AND_TIME: 'Date and Time',
    MESSAGE: 'Message',
    IMAGE_URL: 'Image URL',
    VIDEO_URL: 'Video URL',
    LINK: 'Link',
  },
  FILE_SIZE: getEnvDefault('schedule_configs.fileSize', 1000000),
  FILE_EXTENSIONS: getEnvDefault('schedule_configs.fileMimetypes', ['csv', 'vnd.ms-excel']),
  CSV_SEPARATOR: ';',
  PARSE_FILE_TIMEOUT: 30000,
  VIDEO_LIMITS: {
    [networks.Facebook]: 4,
    [networks.Instagram]: 1,
    [networks.LinkedIn]: 1,
  },
  ERROR_MESSAGES: {
    CANNOT_USE_IMAGE_AND_VIDEO_BOTH: 'Can not use an image and a video both.',
    PARSE_FILE_TIMEOUT_ERROR: 'Parse file timeout error.',
    POSTS_IS_REQUIRED: 'Posts array is required.',
    CANNOT_USE_SCHEDULE_MORE_POSTS: 'Sorry, As per your plan you can\'t schedule any more posts.',
    DUPLICATE_SOCIAL_ACCOUNTS: 'Duplicate social accounts.',
    SOCIAL_ACCOUNT_NOT_FOUND: 'Social account not found.',
    INVALID_TEAM_IDS: 'Invalid team ids!',
    INVALID_DATE_FORMAT: 'Invalid date format.',
    FILE_IS_NOT_SELECTED: 'No file selected.',
    CANNOT_ABLE_TO_FETCH_THE_TEAM_ADMINS: 'Error: Cant able to fetch the team admin\'s!',
    NOT_FOUND_OR_YOU_DONT_HAVE_ACCESS_TO_DELETE: 'Not found or you don\'t have a access to delete',
    CANNOT_READ_PROPERTY_DAYID_OR_UNDEFINED: 'Cannot read property \'dayId\' of undefined',
  },
  SUCCESS_MESSAGES: {
    SUBMITTED_REQUEST_TO_ADMIN_FOR_SCHEDULE_POST: 'Submitted a request to admin for schedule a post!',
    SCHEDULE_SAVE_AS_DRAFT: 'Schedule details are save as draft!',
    SCHEDULE_STATUS_HAS_BEEN_UPDATED_SUCCESSFULLY: 'Schedule status has been updated successfully!',
    SCHEDULE_STATUS_HAS_BEEN_CANCELLED_SUCCESSFULLY: 'Schedule has been cancelled successfully!',
    DELETED_SUCCESSFULLY: 'Deleted successfully',
    SCHEDULE_DETAILS_ARE_EDIT_SUCCESSFULLY: 'schedule details are edit successfully',
  },
  SCHEDULE_TYPES: {
    ONETIME: 0,
    DAYWISE: 1,
  },
  SCHEDULE_STATUSES: {
    READY: 1,
    WAIT: 2,
    APPROVAL_PENDING: 3,
    REJECTED: 4,
    DRAFT: 5,
    DONE: 6,
    SCHEDULE_HAS_BEEN_CANCELLED_SUCCESSFULLY: 'Schedule has been cancelled successfully!',
  },
};

const enviroment = getEnvironment(process.env.NODE_ENV);

export default Object.freeze(
  Object.assign(ScheduleConstants[enviroment], CommonScheduleConstants),
);
