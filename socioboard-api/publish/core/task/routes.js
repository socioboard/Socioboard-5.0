const routes = require('express').Router();
const taskController = require('../task/controllers/taskcontrollers');

/**
 * @swagger
 * /v1/task/getTasks:
 *   get:
 *     operationId: secured_task_getTasks
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Task
 *     description: To get the task list for providing an approval to other requested user inside the particular team
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
routes.get("/getTasks", taskController.getTasks);

/**
 * @swagger
 * /v1/task/assignTask:
 *   put:
 *     operationId: secured_task_assignTask
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Task
 *     description: To assign the task to other team member
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide task id 
 *         name: taskId
 *         type: string
 *       - name: assigningUserId
 *         description: Provide assigning user id
 *         in: query
 *         type: integer
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put("/assignTask", taskController.assignTask);


/**
 * @swagger
 * /v1/task/updateTaskStatus:
 *   get:
 *     operationId: secured_task_updateTaskStatus
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Task
 *     description: To update the task status
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide task id 
 *         name: taskId
 *         type: string
 *       - name: status
 *         description: Specify task status
 *         in: query
 *         enum: ["Approved", "Rejected"]
 *         type: string
 *         default: "Approved"
 *       - in: query
 *         description: Provide team id 
 *         name: teamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get("/updateTaskStatus", taskController.updateTaskStatus);



module.exports = routes;