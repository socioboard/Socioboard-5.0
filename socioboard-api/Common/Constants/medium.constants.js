import { getEnvDefault, getEnvStrict } from '../Shared/config.shared.js';
import { getEnvironment } from './constants.js';

const API_URL = 'https://api.medium.com/v1';

const MEDIUM_URL = 'https://medium.com';

const TEST_API_URL = getEnvStrict('test_url');

const MediumConstants = {
  PRODUCTION: {
    API_URI: {
      GET_USER_DETAILS: `${API_URL}/me`,
      MEDIUM_USER_URI: `${API_URL}/users`,
      MEDIUM_PUBLICATIONS_URI: `${API_URL}/publications`,
      FEED: `${MEDIUM_URL}/feed`,
      UPLOAD_IMAGE: `${API_URL}/images`,
      GRAPHQL_URI: `${MEDIUM_URL}/_/graphql`,
      RSS_JSON_URI: 'https://api.rss2json.com/v1/api.json',
    },
  },
  DEVELOPMENT: {
    API_URI: {
      GET_USER_DETAILS: `${API_URL}/me`,
      MEDIUM_USER_URI: `${API_URL}/users`,
      MEDIUM_PUBLICATIONS_URI: `${API_URL}/publications`,
      FEED: `${MEDIUM_URL}/feed`,
      UPLOAD_IMAGE: `${API_URL}/images`,
      GRAPHQL_URI: `${MEDIUM_URL}/_/graphql`,
      RSS_JSON_URI: 'https://api.rss2json.com/v1/api.json',
    },
  },
  TEST: {
    API_URI: {
      GET_USER_DETAILS: `${TEST_API_URL}/v1/demo/medium/me`,
      MEDIUM_USER_URI: `${TEST_API_URL}/v1/demo/medium/users`,
      MEDIUM_PUBLICATIONS_URI: `${TEST_API_URL}/v1/demo/medium/publications`,
      FEED: `${TEST_API_URL}/v1/demo/medium/feed`,
      UPLOAD_IMAGE: `${TEST_API_URL}/v1/demo/medium/images`,
      GRAPHQL_URI: `${TEST_API_URL}/v1/demo/medium/graphql`,
      RSS_JSON_URI: `${TEST_API_URL}/v1/demo/medium/rss-api-json`,
    },
  },
};

const commonBitlyConstants = {
  ACCOUNT_DETAILS: {
    ID: 'demo-medium-id',
    USERNAME: 'demo-medium-username',
    NAME: 'demo-medium-name',
    URL: 'localhost/demo-medium',
    IMAGE_URL: 'localhost/demo-medium',
    ACCESS_TOKEN: 'demo-medium-access-token',
    PUBLICATION_ID: 'demo-publication-id',
  },
  ERROR_MESSAGES: {
    INVALID_FILE_EXTENSION: 'Invalid file extension!',
  },
  DEMO_POST_URI: `${TEST_API_URL}/v1/demo/medium/post`,
  ACCOUNT_TYPE: 14,
  PUBLICATION_LICENSES: ['all-rights-reserved', 'cc-40-by', 'cc-40-by-sa', 'cc-40-by-nd', 'cc-40-by-nc', 'cc-40-by-nc-nd', 'cc-40-by-nc-sa', 'cc-40-zero', 'public-domain'],
  PUBLISH_STATUSES: ['public', 'draft', 'unlisted'],
  CONTENT_FORMATS: ['html', 'markdown'],
  FILE_SIZE: getEnvDefault('medium_feeds.fileSize', 5000000),
  FILE_EXTENSIONS: ['jpeg', 'jpg', 'png'],
  QRAPHQL_QUERIES: {
    GET_USER_POSTS: 'query UserStreamLatest($userId: ID!, $pagingOptions: PagingOptions) {\n  user(id: $userId) {\n    id\n    latestStreamConnection(paging: $pagingOptions) {\n      ...commonStreamConnection\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment commonStreamConnection on StreamConnection {\n  stream {\n    ...StreamItemList_streamItem\n    __typename\n  }\n  pagingInfo {\n    next {\n      limit\n      page\n      source\n      to\n      ignoredIds\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemList_streamItem on StreamItem {\n  ...StreamItem_streamItem\n  __typename\n}\n\nfragment StreamItem_streamItem on StreamItem {\n  itemType {\n    __typename\n    ... on StreamItemHeading {\n      ...StreamItemHeading_streamItemHeading\n      __typename\n    }\n    ... on StreamItemPostPreview {\n      ...StreamItemPostPreview_streamItemPostPreview\n      __typename\n    }\n    ... on StreamItemSeriesHeroCarousel {\n      ...StreamItemSeriesHeroCarousel_streamItemSeriesHeroCarousel\n      __typename\n    }\n    ... on StreamItemSeriesGridCard {\n      ...StreamItemSeriesGridCard_streamItemSeriesGridCard\n      __typename\n    }\n    ... on StreamItemQuotePreview {\n      ...StreamItemQuotePreview_streamItemQuotePreview\n      __typename\n    }\n    ... on StreamItemQuoteList {\n      ...StreamItemQuoteList_streamItemQuoteList\n      __typename\n    }\n    ... on StreamItemCompressedPostList {\n      ...StreamItemCompressedPostList_streamItemCompressedPostList\n      __typename\n    }\n    ... on StreamItemSequence {\n      ...StreamItemSequence_streamItemSequence\n      __typename\n    }\n  }\n  __typename\n}\n\nfragment StreamItemHeading_streamItemHeading on StreamItemHeading {\n  text\n  heading {\n    ...Heading_heading\n    __typename\n  }\n  __typename\n}\n\nfragment Heading_heading on Heading {\n  headingType {\n    __typename\n    ... on HeadingBasic {\n      title\n      __typename\n    }\n    ... on HeadingWithLink {\n      title\n      linkText\n      linkUrl\n      __typename\n    }\n  }\n  __typename\n}\n\nfragment StreamItemPostPreview_streamItemPostPreview on StreamItemPostPreview {\n  post {\n    id\n    createdAt\n    mediumUrl\n    previewContent {\n      bodyModel {\n        ...PostBody_bodyModel\n        __typename\n      }\n      __typename\n    }\n    inResponseToPostResult {\n      ...InResponseToPostPreview_postResult\n      __typename\n    }\n    isLocked\n    clapCount\n    responsesCount\n    ...PostActions_post\n    ...PostByline_post\n    ...PostPresentationTracker_post\n    ...BookmarkButton_post\n    ...MultiVote_post\n    __typename\n  }\n  postSuggestionReasons {\n    ...getFirstPostFeedReason_postSuggestionReason\n    __typename\n  }\n  __typename\n}\n\nfragment InResponseToPostPreview_postResult on PostResult {\n  __typename\n  ... on Post {\n    id\n    title\n    mediumUrl\n    creator {\n      id\n      name\n      __typename\n    }\n    clapCount\n    responsesCount\n    __typename\n  }\n}\n\nfragment PostActions_post on Post {\n  id\n  creator {\n    id\n    __typename\n  }\n  __typename\n}\n\nfragment PostBody_bodyModel on RichText {\n  sections {\n    name\n    startIndex\n    textLayout\n    imageLayout\n    backgroundImage {\n      id\n      originalHeight\n      originalWidth\n      __typename\n    }\n    videoLayout\n    backgroundVideo {\n      videoId\n      originalHeight\n      originalWidth\n      previewImageId\n      __typename\n    }\n    __typename\n  }\n  paragraphs {\n    ...normalizedBodyModel_paragraph\n    ...PostBodySection_paragraphs\n    __typename\n  }\n  __typename\n}\n\nfragment normalizedBodyModel_paragraph on Paragraph {\n  ...getParagraphHighlights_paragraph\n  ...getParagraphPrivateNotes_paragraph\n  __typename\n}\n\nfragment getParagraphHighlights_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment getParagraphPrivateNotes_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment PostBodySection_paragraphs on Paragraph {\n  name\n  ...PostBodyParagraph_paragraph\n  __typename\n}\n\nfragment PostBodyParagraph_paragraph on Paragraph {\n  name\n  type\n  ...ImageParagraph_paragraph\n  ...TextParagraph_paragraph\n  ...IframeParagraph_paragraph\n  ...MixtapeParagraph_paragraph\n  __typename\n}\n\nfragment IframeParagraph_paragraph on Paragraph {\n  iframe {\n    mediaResource {\n      id\n      iframeSrc\n      iframeHeight\n      iframeWidth\n      title\n      __typename\n    }\n    __typename\n  }\n  layout\n  ...Markups_paragraph\n  __typename\n}\n\nfragment Markups_paragraph on Paragraph {\n  name\n  text\n  hasDropCap\n  dropCapImage {\n    ...MarkupNode_data_dropCapImage\n    __typename\n  }\n  markups {\n    type\n    start\n    end\n    href\n    anchorType\n    userId\n    linkMetadata {\n      httpStatus\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment MarkupNode_data_dropCapImage on ImageMetadata {\n  ...DropCap_image\n  __typename\n}\n\nfragment DropCap_image on ImageMetadata {\n  id\n  originalHeight\n  originalWidth\n  __typename\n}\n\nfragment ImageParagraph_paragraph on Paragraph {\n  href\n  layout\n  metadata {\n    id\n    originalHeight\n    originalWidth\n    focusPercentX\n    focusPercentY\n    alt\n    __typename\n  }\n  ...InteractiveMarkups_paragraph\n  ...Markups_paragraph\n  ...PostAnnotationsMarker_paragraph\n  __typename\n}\n\nfragment InteractiveMarkups_paragraph on Paragraph {\n  ...Markups_paragraph\n  __typename\n}\n\nfragment PostAnnotationsMarker_paragraph on Paragraph {\n  ...PostViewNoteCard_paragraph\n  __typename\n}\n\nfragment PostViewNoteCard_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment TextParagraph_paragraph on Paragraph {\n  type\n  hasDropCap\n  ...InteractiveMarkups_paragraph\n  ...Markups_paragraph\n  ...ParagraphRefsMapContext_paragraph\n  __typename\n}\n\nfragment ParagraphRefsMapContext_paragraph on Paragraph {\n  name\n  __typename\n}\n\nfragment MixtapeParagraph_paragraph on Paragraph {\n  text\n  type\n  mixtapeMetadata {\n    href\n    thumbnailImageId\n    mediaResourceId\n    __typename\n  }\n  markups {\n    start\n    end\n    type\n    href\n    __typename\n  }\n  __typename\n}\n\nfragment PostByline_post on Post {\n  id\n  isPublished\n  mediumUrl\n  firstPublishedAt\n  readingTime\n  statusForCollection\n  isLocked\n  visibility\n  collection {\n    name\n    id\n    slug\n    ...collectionUrl_collection\n    __typename\n  }\n  creator {\n    name\n    username\n    id\n    bio\n    isFollowing\n    ...UserAvatar_user\n    __typename\n  }\n  __typename\n}\n\nfragment UserAvatar_user on User {\n  username\n  id\n  name\n  imageId\n  mediumMemberAt\n  __typename\n}\n\nfragment collectionUrl_collection on Collection {\n  id\n  domain\n  slug\n  __typename\n}\n\nfragment PostPresentationTracker_post on Post {\n  id\n  visibility\n  previewContent {\n    isFullContent\n    __typename\n  }\n  collection {\n    id\n    __typename\n  }\n  __typename\n}\n\nfragment BookmarkButton_post on Post {\n  ...SusiClickable_post\n  ...WithSetReadingList_post\n  __typename\n}\n\nfragment SusiClickable_post on Post {\n  ...SusiContainer_post\n  __typename\n}\n\nfragment SusiContainer_post on Post {\n  id\n  __typename\n}\n\nfragment WithSetReadingList_post on Post {\n  ...ReadingList_post\n  __typename\n}\n\nfragment ReadingList_post on Post {\n  id\n  readingList\n  __typename\n}\n\nfragment MultiVote_post on Post {\n  id\n  clapCount\n  creator {\n    id\n    ...SusiClickable_user\n    __typename\n  }\n  viewerClapCount\n  isPublished\n  ...SusiClickable_post\n  collection {\n    id\n    slug\n    __typename\n  }\n  ...MultiVoteCount_post\n  __typename\n}\n\nfragment SusiClickable_user on User {\n  ...SusiContainer_user\n  __typename\n}\n\nfragment SusiContainer_user on User {\n  ...SignInContainer_user\n  ...SignUpOptions_user\n  __typename\n}\n\nfragment SignInContainer_user on User {\n  ...SignInOptions_user\n  __typename\n}\n\nfragment SignInOptions_user on User {\n  id\n  name\n  __typename\n}\n\nfragment SignUpOptions_user on User {\n  id\n  name\n  __typename\n}\n\nfragment MultiVoteCount_post on Post {\n  id\n  ...PostVotersNetwork_post\n  __typename\n}\n\nfragment PostVotersNetwork_post on Post {\n  voterCount\n  viewerClapCount\n  recommenders {\n    name\n    __typename\n  }\n  __typename\n}\n\nfragment getFirstPostFeedReason_postSuggestionReason on PostSuggestionReason {\n  reason\n  __typename\n}\n\nfragment StreamItemSeriesHeroCarousel_streamItemSeriesHeroCarousel on StreamItemSeriesHeroCarousel {\n  cards {\n    ...SeriesCarouselHeroCard_seriesCarouselHeroCard\n    __typename\n  }\n  __typename\n}\n\nfragment SeriesCarouselHeroCard_seriesCarouselHeroCard on SeriesCarouselHeroCard {\n  post {\n    ...SeriesTitleCard_post\n    __typename\n  }\n  __typename\n}\n\nfragment SeriesTitleCard_post on Post {\n  id\n  title\n  previewContent {\n    bodyModel {\n      paragraphs {\n        metadata {\n          id\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemSeriesGridCard_streamItemSeriesGridCard on StreamItemSeriesGridCard {\n  post {\n    ...SeriesTitleCard_post\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemQuotePreview_streamItemQuotePreview on StreamItemQuotePreview {\n  quote {\n    ...Quote_quote\n    __typename\n  }\n  __typename\n}\n\nfragment Quote_quote on Quote {\n  quoteId\n  userId\n  post {\n    id\n    title\n    mediumUrl\n    creator {\n      id\n      username\n      name\n      __typename\n    }\n    __typename\n  }\n  startOffset\n  endOffset\n  paragraphs {\n    text\n    type\n    markups {\n      anchorType\n      end\n      href\n      rel\n      start\n      title\n      type\n      userId\n      __typename\n    }\n    ...TextParagraph_paragraph\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemQuoteList_streamItemQuoteList on StreamItemQuoteList {\n  heading {\n    ...Heading_heading\n    __typename\n  }\n  items {\n    quote {\n      ...Quote_quote\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemCompressedPostList_streamItemCompressedPostList on StreamItemCompressedPostList {\n  heading {\n    ...Heading_heading\n    __typename\n  }\n  items {\n    post {\n      id\n      title\n      mediumUrl\n      creator {\n        id\n        username\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment StreamItemSequence_streamItemSequence on StreamItemSequence {\n  sequence {\n    slug\n    eyebrow\n    title\n    subtitle\n    description\n    updatedAt\n    featuredUserTitle\n    featuredUserCustomBio\n    color\n    bgColor\n    hideIndex\n    postIds\n    ...SequenceCoverImage_sequence\n    __typename\n  }\n  __typename\n}\n\nfragment SequenceCoverImage_sequence on Sequence {\n  title\n  coverImage {\n    id\n    __typename\n  }\n  __typename\n}\n',
  },
};

const enviroment = getEnvironment(process.env.NODE_ENV);

export default Object.assign(MediumConstants[enviroment], commonBitlyConstants);
