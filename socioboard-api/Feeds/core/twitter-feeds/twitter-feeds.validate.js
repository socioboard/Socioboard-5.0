import Joi from 'joi';

class FeedsValidator {
  // User-defined function to validate the username
  validateAccountIdTeamId(user) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
      pageId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(user);
  }

  validateAccountIdTweetId(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
      tweetId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateCommentData(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
      tweetId: Joi.string().required(),
      comment: Joi.string().required(),
      username: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  validateFetchTweet(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      accountId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  twitterGetTrendsSchema = Joi.object({
    country: Joi.string().min(1).max(128).required(),
  }).unknown();

  userNameSchema = Joi.string().min(1).max(128).required();

  twitterBasicSchema = Joi.object({
    accountId: Joi.number().integer().min(1).required(),
    teamId: Joi.number().integer().min(1).required(),
  });

  paginationSchema = Joi.object({
    skip: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).default(20),
  });

  paginationUnknownSchema = this.paginationSchema.unknown();

  twitterBasicUnknownSchema = Joi.object({
    accountId: Joi.number().integer().min(1).required(),
    teamId: Joi.number().integer().min(1).required(),
  }).unknown();

  twitterSearchUsers = Joi.object({
    query: Joi.string().min(1).max(256).required(),
    page: Joi.number().min(1).default(1),
    count: Joi.number().min(1).max(20).default(20),
  }).unknown();

  getFollowersSchema = Joi.object({
    page: Joi.number().min(0).default(0),
    count: Joi.number().min(1).max(200).default(20),
  }).unknown();

  getFriendsSchema = Joi.object({
    cursor: Joi.number().unsafe().default(-1),
    count: Joi.number().min(1).max(200).default(200),
  }).unknown();

  getUserTweetsSchema = Joi.object({
    count: Joi.number().min(1).max(200).default(20),
  }).unknown();

  followSchema = Joi.object({
    screen_name: Joi.string().min(1).max(512).optional(),
    user_id: Joi.number().integer().min(1).optional(),
  }).xor('screen_name', 'user_id')
    .rename('screenName', 'screen_name')
    .rename('userId', 'user_id')
    .required()
    .unknown();
}
export default new FeedsValidator();
