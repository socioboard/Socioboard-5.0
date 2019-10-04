const routes = require('express').Router();
const boardController = require('./controllers/boardControllers');


/**
 * @swagger
 * /v1/boards/create:
 *   put:
 *     operationId: secured_boards_create
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Boards
 *     description: To create a board 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide Board name
 *         name: boardName
 *         type: string  
 *       - in: query
 *         description: Provide keyword
 *         name: keyword
 *         type: string  
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
routes.put('/create', boardController.create);

/**
 * @swagger
 * /v1/boards/getAllBoards:
 *   get:
 *     operationId: secured_boards_getAllBoards
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Boards
 *     description: To fetch all the board respective with team id 
 *     produces:
 *       - application/json
 *     parameters: 
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
routes.get('/getAllBoards', boardController.getAllBoards);


/**
 * @swagger
 * /v1/boards/update:
 *   put:
 *     operationId: secured_boards_update
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Boards
 *     description: To update a board's keyword
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide Board id
 *         name: boardId
 *         type: integer  
 *       - in: query
 *         description: Provide team id
 *         name: teamId
 *         type: integer  
 *       - in: query
 *         description: Provide keyword
 *         name: keyword
 *         type: string  
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/update', boardController.update);


/**
 * @swagger
 * /v1/boards/delete:
 *   delete:
 *     operationId: secured_boards_delete
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Boards
 *     description: To delete a board 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide Board id
 *         name: boardId
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
routes.delete('/delete', boardController.delete);



module.exports = routes;