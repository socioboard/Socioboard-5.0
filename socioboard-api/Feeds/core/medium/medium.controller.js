import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import MEDIUM_CONSTANTS from '../../../Common/Constants/medium.constants.js';
import {
  SuccessResponse,
  CatchResponse,
} from '../../../Common/Shared/response.shared.js';
import {
  mediumBasicSchema,
  mediumCreatePostSchema,
  mediumCreatePostUnderPublicationsSchema,
  mediumGetPostsSchema,
} from './medium.validate.js';
import mediumService from './medium.service.js';

/**
 * TODO To Fetch the Medium Feeds
 * Function to Fetch the Medium Feeds
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @return {object} Returns Medium Feeds
 */
class MediumController {
  async getUserDetails(req, res) {
    /* #swagger.tags = ['Medium Feeds']
       #swagger.summary = 'Getting the authenticated user’s details'
       #swagger.description = 'Returns details of the user who has granted permission to the application.'
    */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Medium account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { accountId, teamId } = await mediumBasicSchema.validateAsync(req.query);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        MEDIUM_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const { data: mediumUserDetails } = await mediumService.getProfileDetails(accessToken);

      SuccessResponse(res, mediumUserDetails);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getPublications(req, res) {
    /* #swagger.tags = ['Medium Feeds']
       #swagger.summary = 'Listing the user’s publications'
       #swagger.description = 'Returns a full list of publications that the user is related to in some way:
                               This includes all publications the user is subscribed to, writes to, or edits.'
    */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Medium account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { accountId, teamId } = await mediumBasicSchema.validateAsync(req.query);

      const { access_token: accessToken, social_id: userId } = await userTeamAccounts.getSocialAccount(
        MEDIUM_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const { data: userPublications } = await mediumService.getPublications(accessToken, userId);

      SuccessResponse(res, userPublications);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async getPosts(req, res) {
    /* #swagger.tags = ['Medium Feeds']
       #swagger.summary = 'Returns a full list of posts that the user is created'
    */
    /* #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Medium account id',
        required: true
       }
       #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
       }
       #swagger.parameters['limit'] = {
        in: 'query',
        description: 'The number of posts to return per page,
                      up to a maximum of 25. Defaults to 10.',
        required: false
       }
       #swagger.parameters['cursor'] = {
        in: 'query',
        description: 'Next page cursor token',
        required: false
       }
       #swagger.requestBody = {
        hidden: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const {
        accountId,
        teamId,
        ...pagination
      } = await mediumGetPostsSchema.validateAsync(req.query);

      const { user_name } = await userTeamAccounts.getSocialAccount(
        MEDIUM_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const userId = await mediumService.getUserId(user_name);

      const getFeeds = await mediumService.getFeeds({ userId, ...pagination });

      const result = await mediumService.completePosts(getFeeds);

      SuccessResponse(res, result);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async createPost(req, res) {
    /* #swagger.tags = ['Medium Feeds']
       #swagger.summary = 'Creates a post on the authenticated user’s profile.'
    */
    /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Example request',
          schema: {
            $accountId: 1,
            $teamId: 1,
            $article: {
              $title: "Liverpool FC",
              $contentFormat: "html",
              $content: "<h1>Liverpool FC</h1><p>You’ll never walk alone.</p>",
              $canonicalUrl: "http://jamietalbot.com/posts/liverpool-fc",
              $tags: ["football", "sport", "Liverpool"],
              $publishStatus: "public"
            }
          }
       }
    */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { accountId, teamId, article } = await mediumCreatePostSchema.validateAsync(req.body);

      const { access_token: accessToken, social_id: authorId } = await userTeamAccounts.getSocialAccount(
        MEDIUM_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const { data: createdPost } = await mediumService.createPost(accessToken, authorId, article);

      SuccessResponse(res, createdPost);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async createPostUnderPublication(req, res) {
    /* #swagger.tags = ['Medium Feeds']
       #swagger.summary = 'Creating a post under a publication'
       #swagger.description = 'This API allows creating a post and associating it with a publication on Medium.
                               The request also shows this association, considering posts a collection of resources under a publication.'
    */
    /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Example request',
          schema: {
            $accountId: 1,
            $teamId: 1,
            $publicationId: 'demo-publication-id',
            $article: {
              $title: "Liverpool FC",
              $contentFormat: "html",
              $content: "<h1>Liverpool FC</h1><p>You’ll never walk alone.</p>",
              $canonicalUrl: "http://jamietalbot.com/posts/liverpool-fc",
              $tags: ["football", "sport", "Liverpool"],
              $publishStatus: "public"
            }
          }
       }
    */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const {
        accountId, teamId, publicationId, article,
      } = await mediumCreatePostUnderPublicationsSchema.validateAsync(req.body);

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        MEDIUM_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.body.userScopeId,
        teamId,
      );

      const { data: createdPost } = await mediumService.createPostUnderPublication(accessToken, publicationId, article);

      SuccessResponse(res, createdPost);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  async uploadImage(req, res) {
    /* #swagger.tags = ['Medium Feeds']
       #swagger.summary = 'Uploading an image'
       #swagger.description = 'Support extensions: png, jpg, jpeg. The file size must be specified in the configs: medium_feeds.fileSize. Default file size 5mb.
                               Most integrations will not need to use this resource.
                               Medium will automatically side-load any images specified by the src attribute on an <img> tag in post content when creating a post.
                               However, if you are building a desktop integration and have local image files that you wish to send, you may use the images endpoint.'
    */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    let commonFilePath = '';

    try {
      const { accountId, teamId } = await mediumBasicSchema.unknown().validateAsync(req.body);
      const { file } = req;
      const { path } = file;

      commonFilePath = path;

      const { access_token: accessToken } = await userTeamAccounts.getSocialAccount(
        MEDIUM_CONSTANTS.ACCOUNT_TYPE,
        accountId,
        req.userScope.userScopeId,
        teamId,
      );

      const uploadedImage = await mediumService.uploadImage(accessToken, file);

      mediumService.deleteFile(path);

      SuccessResponse(res, uploadedImage);
    } catch (error) {
      mediumService.deleteFile(commonFilePath);

      CatchResponse(res, error.message);
    }
  }
}

export default new MediumController();
