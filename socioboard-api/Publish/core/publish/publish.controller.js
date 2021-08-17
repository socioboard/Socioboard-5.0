import PublishService from './publish.service.js';
import PublisherLibs from '../../../Common/Models/publish.model.js'

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
                }*/
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
                }*/
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
                }*/
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
                }*/
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
                }*/
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
                }*/
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
                }*/
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
                }*/
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
                }*/
        return await PublishService.getPublishedPosts(req, res, next);
    }

    async startPublish(postDetails, teamId, socialAccountIds) {
        var publishLibs = new PublisherLibs();
        // Call directly to publish a post to any social networks
        return publishLibs.startPublish(postDetails, teamId, socialAccountIds);
    };

}
export default new PublishController();