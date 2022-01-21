import swaggerAutogen from 'swagger-autogen';
const swagger = swaggerAutogen();
import config from 'config';

const doc = {
  info: {
    version: '5.0', // by default: "1.0.0"
    title: 'SB publish Service', // by default: "REST API"
    description: 'Documentation', // by default: ""
  },
  host: config.get('swagger_host_url'), // by default: "localhost:3000"
  basePath: '/', // by default: "/"
  schemes: ['http', 'https'], // by default: ['http']
  consumes: ['application/json'],
  produces: ['application/json'],
  securityDefinitions: {
    AccessToken: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description:
        'Please provide the valid access token, if you dont have please login and get the token as response!',
    },
  },
  definitions: {
    // by default: empty object
    PublishModel: {
      postType: 'Text',
      message: '#newPost',
      mediaPaths: [''],
      link: '',
      accountIds: ['3'],
      postStatus: 1,
      pinBoards: [
        {
          accountId: 0,
          boardId: [''],
        },
      ],
    },
    postScheduler: {
      postInfo: {
        postType: 'Text',
        description: 'Hey there!',
        mediaUrl: ['/images/1563348724.jpg'],
        mediaSelectionType: 0,
        shareLink: 'string',
        isInsta: 'false',
        postingSocialIds: [{accountType: 4, accountId: 12}],
        pinBoards: [{accountId: 0, boardId: ['string']}],
        scheduleCategory: 0,
        teamId: 0,
        moduleName: 'string',
        moduleValues: ['string'],
        scheduleStatus: 1,
        normalScheduleDate: '2021-04-12T13:23:31.594Z',
        daywiseScheduleTimer: [
          {dayId: 0, timings: ['2021-04-12T13:23:31.594Z']},
        ],
      },
    },
    editScheduler: {
      postInfo: {
        postType: 'Text',
        description: 'Hey there!',
        mediaUrl: ['/images/1563348724.jpg'],
        mediaSelectionType: 0,
        shareLink: 'string',
        postingSocialIds: [{accountType: 4, accountId: 12}],
        pinBoards: [{accountId: 0, boardId: ['string']}],
        scheduleCategory: 0,
        moduleName: 'string',
        moduleValues: ['string'],
        normalScheduleDate: '2021-04-12T13:23:31.594Z',
        daywiseScheduleTimer: [
          {dayId: 0, timings: ['2021-04-12T13:23:31.594Z']},
        ],
      },
    },
    draftPost: {
      draftPost: [
        {
          mediaUrl: [''],
          postType: 'Text',
          description: '#newPost',
          shareLink: '',
          ownerId: 1,
          teamId: 1,
        },
      ],
    },
    draftIds: {
      id: ['606c5c816dbd6217308ae3a6'],
    },
    postDetails: {
      postDetails: {
        mediaUrls: ['videos/1620365963.mp4'],
        postType: 0,
        resource: {
          snippet: {
            title: 'title',
            description: 'description',
            tags: ['tags'],
            categoryId: 24,
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en',
          },
          status: {
            privacyStatus: 'private',
            publishAt: '2021-06-21T13:23:31.594Z',
          },
        },
        thumbnailUrl: '/images/1626692584.jpg',
      },
    },
    mediaDetails: {
      mediaDetails: {
        media: 'string',
      },
    },
    searchImage: {
      SocialImageInfo: {
        rating: ['1', '2'],
        imagePrivacyType: ['0', '1'],
        imageTitle: 'imageTitle',
      },
    },
    searchPublishedPost: {
      searchPublishedPostInfo: {
        accountId: ['1', '2'],
        fullPublishContentId: [],
        postCategory: 'Direct Post',
        publishedContentDetails: 'message',
        publishedMediaCount: 0,
        postShareUrl: '',
        PublishedUrl: '',
      },
    },
  },
};

const outputFile = './resources/views/swagger-api-view.json';
const endpointsFiles = ['./resources/routes/public.routes.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

await swagger(outputFile, endpointsFiles, doc);
