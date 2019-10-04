const routes = require("express").Router();
const accountController = require('./controllers/publishController');

/**
 * @swagger
 * definitions:
 *   PublishModel:
 *     properties:
 *       postType:
 *         type: string
 *         description: "To specify the post type, any one of Text,Image,Link,Video"
 *       message:
 *         type: string
 *         description: "Short note about your post."
 *       mediaPaths:
 *         description: Array of media Paths
 *         type: array
 *         items:
 *           type: string
 *       link:
 *         type: string
 *         description: "To specify the link which is going to share"
 *       accountIds:
 *         description: Array of account Ids
 *         type: array
 *         items:
 *           type: string
 *       postStatus:
 *         type: integer
 *         description: "Specify the post status 0-draft 1-active"
 *       pinBoards:
 *         description: Provide the pinterest board details.
 *         items:
 *              type: array     
 *              $ref: '#/definitions/boardsDefinition'
 *     example:
 *       postType: "Text"
 *       message: "#newPost"
 *       mediaPaths: [ "" ]   
 *       link: ""
 *       accountIds: [ "3" ]
 *       postStatus: 1
 *       pinBoards: [ {  "accountId": 0,  "boardId": [   ""  ] } ]
 * 
 * /v1/publish/publishPosts:
 *   post:
 *     operationId: secured_publish_publishPosts
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Publish
 *     description: To publish the posts on social networks
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - name: postDetails
 *         description: Specify Post type should be Text,Image,Link or Video
 *         in: body
 *         required: true
 *         schema:
 *            $ref: "#/definitions/PublishModel"
 * 
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post("/publishPosts", accountController.publishPost);

/**
 * @swagger
 * /v1/publish/getDraftedPosts:
 *   get:
 *     operationId: secured_publish_getDraftedPosts
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Publish
 *     description: To get the drafted posts of an user inside the particular team
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - name: pageId
 *         description: Provide pagination id
 *         in: query
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getDraftedPosts", accountController.getDraftedPosts);



/**
 * @swagger
 * /v1/publish/getApprovalPostStatus:
 *   get:
 *     operationId: secured_publish_getApprovalPostStatus
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Publish
 *     description: To get the admin approval pending post of an user inside the particular team
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - name: pageId
 *         description: Provide pagination id
 *         in: query
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/getApprovalPostStatus", accountController.getApprovalPostStatus);

module.exports = routes;