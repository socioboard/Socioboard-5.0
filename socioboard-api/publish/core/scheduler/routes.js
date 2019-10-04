const routes = require("express").Router();
const schedulerController = require('./controllers/schedulerControllers');

/**
 * @swagger
 * definitions:
 *   daywiseTimingDefinition:
 *     properties:
 *       dayId:
 *          type: integer
 *          description: "Provide the dayId by  0-sunday, 1-monday ,... 6-saturday"
 *       timings:
 *         type: array
 *         description: "Provide the running time for each day."
 *         items:
 *          type: string
 *          format: date-time 
 *   boardsDefinition:
 *     properties:
 *       accountId:
 *          type: integer
 *          description: "Provide the pinterest accountId"
 *       boardId:
 *         type: array
 *         description: "Provide the board ids."
 *         items:
 *          type: string
 *          format: string
 *   socialIdDefinition:
 *     properties:
 *       accountType:
 *          type: integer
 *          description: "To specify the account type"
 *       accountId:
 *          type: integer
 *          description: "To specify the account id"
 *   postScheduler:
 *     properties:
 *       postType:
 *          type: string
 *          description: "To specify the post type as Text,Image,Video,Link"
 *       description:
 *          type: string
 *          description: "To specify the post description"
 *       mediaUrl:
 *         type: array
 *         description: "To specify the post media url"
 *         items:
 *           type: string
 *       mediaSelectionType:
 *          type: integer
 *          description: "To specify the media selection type, 1-All, 2-Single, 3-Random"         
 *       shareLink:
 *          type: string
 *          description: "To specify the share link, this will work only if post type should be Link"
 *       postingSocialIds:
 *         type: array
 *         items:
 *          $ref: "#/definitions/socialIdDefinition"
 *       pinBoards:
 *         description: Provide the pinterest board details.
 *         items:
 *              type: array     
 *              $ref: '#/definitions/boardsDefinition'
 *       scheduleCategory:
 *          type: integer
 *          description: "To specify the schedule category 0-normalSchedulePost, 1-daywiseSchedulePost"
 *       teamId:
 *          type: integer
 *          description: "To Specify the team id"
 *       moduleName:
 *          type: string
 *          description: "To specify specify the module name"
 *       moduleValues:
 *         type: array
 *         description: "To specify the module values"
 *         items:
 *           type: string
 *       scheduleStatus:
 *          type: integer
 *          description: "To specify the schedule status 1=ready queue, 2=wait(pause) state, 3= approvalpending, 4=rejected, 5=draft, 6=done"
 *       normalScheduleDate:
 *          type: string
 *          description: "To specify the date time when post get publish"
 *          format: date-time
 *       daywiseScheduleTimer:
 *         type: array
 *         items:
 *          $ref: "#/definitions/daywiseTimingDefinition"
 *     example:
 *       postType: "Text"
 *       description: "Hey there!"
 *       mediaUrl: [ "/images/1563348724.jpg" ]
 *       mediaSelectionType: 0
 *       shareLink: "string"
 *       postingSocialIds: [ { "accountType": 4,  "accountId": 12 } ]
 *       pinBoards: [ { "accountId": 0, "boardId": [  "string" ] } ]
 *       scheduleCategory: 0
 *       teamId: 0
 *       moduleName: "string"
 *       moduleValues: ["string" ]
 *       scheduleStatus: 1
 *       normalScheduleDate: "2019-09-17T07:42:53.890Z"
 *       "daywiseScheduleTimer": [  {  "dayId": 0,  "timings": [  "2019-07-17T07:42:53.890Z" ] } ]
 *        
 * 
 *   rssScheduler:
 *     properties:
 *       name:
 *          type: string
 *          description: "To specify the Rss feeds title name"
 *       rss_feed_url:
 *          type: string
 *          description: "To specify the Rss feed urls"
 *       custom_interval:
 *          type: integer
 *          description: "To specify the publishing intervals in minutes"
 *       start_date:
 *          type: string
 *          description: "To specify the publishing start date"
 *          format: date-time
 *       end_date:
 *          type: string
 *          description: "To specify the publishing end date"
 *          format: date-time     
 *       account_ids:
 *         type: array
 *         items:
 *              $ref: "#/definitions/socialIdDefinition"
 * 
 *   editrssScheduler:
 *     properties:
 *       custom_interval:
 *          type: integer
 *          description: "To specify the publishing intervals in minutes"
 *       start_date:
 *          type: string
 *          description: "To specify the publishing start date"
 *          format: date-time
 *       end_date:
 *          type: string
 *          description: "To specify the publishing end date"
 *          format: date-time     
 *        
 *   editScheduler:
 *     properties:
 *       postType:
 *          type: string
 *          description: "To specify the post type as Text,Image,Video,Link"
 *       description:
 *          type: string
 *          description: "To specify the post description"
 *       mediaUrl:
 *         type: array
 *         description: "To specify the post media url"
 *         items:
 *           type: string
 *       shareLink:
 *          type: string
 *          description: "To specify the share link, this will work only if post type should be Link"
 *       postingSocialIds:
 *         type: array
 *         items:
 *          $ref: "#/definitions/socialIdDefinition"
 *       pinBoards:
 *         description: Provide the pinterest board details.
 *         items:
 *              type: array     
 *              $ref: '#/definitions/boardsDefinition'
 *       scheduleCategory:
 *          type: integer
 *          description: "To specify the schedule category 0-normalSchedulePost, 1-daywiseSchedulePost"
 *       moduleName:
 *          type: string
 *          description: "To specify specify the module name"
 *       moduleValues:
 *         type: array
 *         description: "To specify the module values"
 *         items:
 *           type: string
 *       normalScheduleDate:
 *          type: string
 *          description: "To specify the date time when post get publish"
 *          format: date-time
 *       daywiseScheduleTimer:
 *         type: array
 *         items:
 *          $ref: "#/definitions/daywiseTimingDefinition"
 *     example:
 *       postType: "Text"
 *       description: "Hey there!"
 *       mediaUrl: [ "/images/1563348724.jpg" ]
 *       mediaSelectionType: 0
 *       shareLink: "string"
 *       postingSocialIds: [ { "accountType": 4,  "accountId": 12 } ]
 *       pinBoards: [ { "accountId": 0, "boardId": [  "string" ] } ]
 *       scheduleCategory: 0
 *       moduleName: "string"
 *       moduleValues: ["string" ]
 *       normalScheduleDate: "2019-09-17T07:42:53.890Z"
 *       "daywiseScheduleTimer": [  {  "dayId": 0,  "timings": [  "2019-07-17T07:42:53.890Z" ] } ]
 *        
 * 
 * 
 * 
 * /v1/schedule/create:
 *   post:
 *     operationId: secured_scheduler_create
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To schedule the post 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: postDetails
 *         schema:
 *            type: object
 *            properties:
 *              postInfo:
 *                $ref: "#/definitions/postScheduler"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post("/create", schedulerController.create);


/**
 * @swagger
 * /v1/schedule/getScheduleDetails:
 *   get:
 *     operationId: secured_schedule_getScheduleDetails
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To get the schedule details of the user
 *     parameters:
 *       - in: query
 *         description: Provide paginationId
 *         name: fetchPageId
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getScheduleDetails', schedulerController.getScheduleDetails);


/**
 * @swagger
 * /v1/schedule/getParticularScheduleDetails:
 *   get:
 *     operationId: secured_schedule_getParticularScheduleDetails
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To get the schedule details of a particular schedule
 *     parameters:
 *       - in: query
 *         description: Provide scheduleId
 *         name: scId
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getParticularScheduleDetails', schedulerController.getParticularScheduleDetails);

/**
 * @swagger
 * /v1/schedule/getFilteredScheduleDetails:
 *   get:
 *     operationId: secured_schedule_getFilteredScheduleDetails
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To get the schedule details of the user using schedule status filter
 *     parameters:
 *       - in: query
 *         description: Provide schedule status
 *         name: scheduleStatus
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: fetchPageId
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getFilteredScheduleDetails', schedulerController.getFilteredScheduleDetails);



/**
 * @swagger
 * /v1/schedule/getScheduleDetailsByCategories:
 *   get:
 *     operationId: secured_schedule_getScheduleDetailsByCategories
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To get the schedule details of the user by category
 *     parameters:
 *       - in: query
 *         description: Provide schedule status
 *         name: scheduleStatus
 *         type: integer
 *       - in: query
 *         description: Specify schedule category either 0-Normal or 1-daywise
 *         name: scheduleCategory
 *         type: integer
 *       - in: query
 *         description: Provide pagination id
 *         name: fetchPageId
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getScheduleDetailsByCategories', schedulerController.getScheduleDetailsByCategories);


/**
 * @swagger
 * /v1/schedule/changeScheduleStatus:
 *   put:
 *     operationId: secured_schedule_changeScheduleStatus
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To change the scheduled status
 *     parameters:
 *       - in: query
 *         description: Provide schedule id
 *         name: scheduleId
 *         type: integer
 *       - in: query
 *         description: Specify schedule status(1-6) to update
 *         name: scheduleStatus
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/changeScheduleStatus', schedulerController.changeScheduleStatus);



/**
 * @swagger
 * /v1/schedule/cancel:
 *   put:
 *     operationId: secured_schedule_cancel
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To cancel a scheduled post job   
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide schedule id 
 *         name: scheduleId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/cancel', schedulerController.cancel);

/**
 * @swagger
 * /v1/schedule/delete:
 *   delete:
 *     operationId: secured_schedule_delete
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To delete a scheduled post job   
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide schedule id 
 *         name: scheduleId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/delete', schedulerController.delete);




/**
 * @swagger
 * /v1/schedule/edit:
 *   put:
 *     operationId: secured_schedule_edit
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To edit the scheduled post details 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide schedule id 
 *         name: scheduleId
 *         type: integer
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - in: body
 *         name: postDetails
 *         schema:
 *            type: object
 *            properties:
 *              postInfo:
 *                $ref: "#/definitions/editScheduler"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/edit', schedulerController.edit);

/**
 * @swagger
 * /v1/schedule/createAutomatedRss:
 *   post:
 *     operationId: secured_schedule_createAutomatedRss
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To create a automated rss feeds
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - in: body
 *         name: rssDetails
 *         schema:
 *            type: object
 *            properties:
 *              postInfo:
 *                $ref: "#/definitions/rssScheduler"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/createAutomatedRss', schedulerController.createRssSchedule);

/**
 * @swagger
 * /v1/schedule/getAutomatedRss:
 *   get:
 *     operationId: secured_schedule_getAutomatedRss
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To get automated rss feeds of a team
 *     deprecated : true
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide pageId
 *         name: pageId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getAutomatedRss', schedulerController.getAutomatedRss);

/**
 * @swagger
 * /v1/schedule/updateAutomatedRss:
 *   put:
 *     operationId: secured_schedule_updateAutomatedRss
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To update a automated rss feeds of particular team
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide schedule id
 *         name: scheduleId
 *         type: integer
 *       - in: body
 *         name: rssDetails
 *         schema:
 *            type: object
 *            properties:
 *              postInfo:
 *                $ref: "#/definitions/editrssScheduler"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/updateAutomatedRss', schedulerController.updateAutomatedRss);

/**
 * @swagger
 * /v1/schedule/deleteAutomatedRss:
 *   delete:
 *     operationId: secured_schedule_deleteAutomatedRss
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Scheduler
 *     description: To create a automated rss feeds
 *     deprecated : true
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Provide rss mongo id 
 *         name: rssId
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/deleteAutomatedRss', schedulerController.deleteAutomatedRss);

module.exports = routes;