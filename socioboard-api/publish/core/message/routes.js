const routes = require("express").Router();
const messageController = require('./controllers/messageController');

/**
* @swagger
* definitions:
*   message:
*     properties:
*       messageType:
*         type: string
*         description: "To specify type of the message such as Text, Image, Video."
*       media:
*         type: string
*         description: "To Specify the message's media url."
*       recipientId:
*         type: string
*         description: "To Specify the recipientId."
*       text:
*         type: string
*         description: "To Specify the text of the message."
*       senderAccountId:
*         type: string
*         description: "To Specify the sender account Id."
*
*     example:
*       messageType: "Text"
*       media: ""
*       recipientId: 23
*       text: "Hello!"
*       senderAccountId: 1
*
* /v1/message/twitter:
*   post:
*     operationId: secured_message_twitter
*     summary: Secured
*     security:
*     - AccessToken: []
*     tags:
*       - Message
*     description: To send a twitter message to a particular twitter user
*     produces:
*       - application/json
*     parameters:
*       - name: messageDetails
*         description: Specify message details
*         in: body
*         required: true
*         schema:
*            $ref: "#/definitions/message"
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.post("/twitter", messageController.twitterDirectMessage);


module.exports = routes;