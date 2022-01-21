import PublishService from './publish.service.js';
import PublisherLibs from '../../../Common/Models/publish.model.js';
import bitlyCluster from '../../../Common/Cluster/bitly.cluster.js';
import TeamLibs from '../../../Common/Models/team.model.js';
import BITLY_CONSTANTS from '../../../Common/Constants/bitly.constants.js';
import {CatchResponse} from '../../../Common/Shared/response.shared.js';

const teamLibs = new TeamLibs();

class PublishController {
  async publishPost(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'To publish the posts on social networks' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
            #swagger.parameters['postDetails'] = {
                in: 'body',
                description: 'Post type should be Text,Image,Link,Video',
                required: true,
                schema: { $ref: "#/definitions/PublishModel" }
                } */
    return await PublishService.publishPost(req, res, next);
  }

  async getDraftedPosts(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'To get the drafted posts of an user inside the particular team' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
            #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'pagination id'
                } */
    return await PublishService.getDraftedPosts(req, res, next);
  }

  async getDraftPostById(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'To get the drafted posts of an user with id' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['id'] = {
                in: 'query',
                description: 'Enter draft post id',
                } */
    return await PublishService.getDraftPostById(req, res, next);
  }

  async updateDraftPostById(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'Edit the drafted posts of an user with id' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['id'] = {
                in: 'query',
                description: 'Enter draft post id',
                }
                #swagger.parameters['draftPost'] = {
                in: 'body',
                description: 'Post type should be Text,Image,Link,Video',
                required: true,
                schema: { $ref: "#/definitions/draftPost" }
                } */
    return await PublishService.updateDraftPostById(req, res, next);
  }

  async deleteDraftPostById(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'delete the drafted posts of an user with id' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['id'] = {
                in: 'body',
                description: 'drafted id credentials.',
                required: true,
                schema: { $ref: "#/definitions/draftIds" }
                } */
    return await PublishService.deleteDraftPostById(req, res, next);
  }

  async deleteApprovalPostById(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'delete the drafted posts of an user with id' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['id'] = {
                in: 'body',
                description: 'drafted id credentials.',
                required: true,
                schema: { $ref: "#/definitions/draftIds" }
                } */
    return await PublishService.deleteApprovalPostById(req, res, next);
  }

  async getApprovalPostById(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'To get the drafted posts of an user with id' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['id'] = {
                in: 'query',
                description: 'Enter draft post id',
                } */
    return await PublishService.getApprovalPostById(req, res, next);
  }

  async getApprovalPostStatus(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'To get the admin approval pending post of an user inside the particular team' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
            #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'pagination id'
                } */
    return await PublishService.getApprovalPostStatus(req, res, next);
  }

  async getPublishedPosts(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'To get all published posts' */
    /* #swagger.security = [{
               "AccessToken": []
            }] */
    /*   #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
            #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'pagination id'
                } */
    return await PublishService.getPublishedPosts(req, res, next);
  }

  async startPublish(postDetails, teamId, socialAccountIds) {
    const publishLibs = new PublisherLibs();
    // Call directly to publish a post to any social networks

    return publishLibs.startPublish(postDetails, teamId, socialAccountIds);
  }

  async publishPostMiddleware(req, res, next) {
    try {
      const {link, userScopeId: userId} = req.body;

      req.body.link = link && (await this.shortenPostLinkByBitly(link, userId));

      return next();
    } catch (error) {
      const errorMessage = error?.error?.message;

      if (
        errorMessage === BITLY_CONSTANTS.ERROR_MESSAGES.ALREADY_A_BITLY_LINK
      ) {
        return next();
      }

      if (errorMessage) {
        return CatchResponse(res, errorMessage);
      }

      return CatchResponse(res, error.message);
    }
  }

  async shortenPostLinkByBitly(link, userId) {
    const foundBitlyAccount = await this.findBitlyAccount(userId);

    if (foundBitlyAccount) {
      return this.shortenLink(link, foundBitlyAccount);
    }

    return link;
  }

  async findBitlyAccount(userId) {
    const foundUserAccounts = await teamLibs.getSocialProfiles(userId);

    return foundUserAccounts.find(
      ({dataValues}) => dataValues.account_type === BITLY_CONSTANTS.ACCOUNT_TYPE
    );
  }

  async shortenLink(longUrl, account) {
    const {
      dataValues: {access_token: accessToken},
    } = account;

    const {link} = await bitlyCluster.shortenLink(accessToken, {
      long_url: longUrl,
    });

    return link;
  }

  async filterPublishedPosts(req, res, next) {
    /* 	#swagger.tags = ['Publish']
            #swagger.description = 'To get all published posts' */
    /* #swagger.security = [{
               "AccessToken": []
            }] */
    /*   #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
            #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'pagination id'
                }
                 #swagger.parameters['publishedStatus'] = {
                in: 'query',
                description: 'pagination id'
                }
                #swagger.parameters['criteria'] = {
                in: 'body',
                description: 'Criteria to filter',
                required: true,
                schema: { $ref: "#/definitions/searchPublishedPost" }
                }
                #swagger.parameters['filterPeriod'] = {
                in: 'query',
                description: 'Filter Period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range',
                enum: [1,2,3,4,5,6,7]
                }
                #swagger.parameters['since'] = {
                in: 'query',
                description: 'Custom since range in YYYY-MM-DD format'
                }
                #swagger.parameters['until'] = {
                in: 'query',
                description: 'Custom until range in YYYY-MM-DD format'
                } 
                #swagger.parameters['publishedStatus'] = {
                in: 'query',
                description: 'Success or failed',
                enum: ['Success','Failed']
                } */
    return await PublishService.filterPublishedPosts(req, res, next);
  }
}
export default new PublishController();
