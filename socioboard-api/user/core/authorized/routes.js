const routes = require("express").Router();

const authorizedUserController = require('./controllers/usercontroller');

/**
 * @swagger
 * definitions:
 *   UpdateUser:
 *     properties:
 *       firstName:
 *         type: string
 *         description: "To specify the user's first name with minimum 2 to 15 characters, also which allows only alpha characters."
 *       lastName:
 *         type: string
 *         description: "To specify the user's last name with minimum 2 to 15 characters, also which allows only alpha characters."
 *       DateOfBirth:
 *         type: string
 *         description: "To specify the user's date of birth, only date without time."
 *         format: date
 *       profilePicture:
 *         type: string
 *         description: "To specify the user's profile picture url, also which should not be more than 100 characters as well as valid url format."
 *         default: "NA"
 *       phoneCode:
 *         type: string
 *         description: "To specify the user's phone code and should not be more than 10 characters."
 *         default: "NA"
 *       phoneNumber:
 *         type: string
 *         description: "To specify the user's phone code, also which should be valid numberic characters with maximum length of 15 digits."
 *         default: "0"
 *       aboutMe:
 *         type: string
 *         description: "To specify about user's information."
 *         default: null
 * /v1/user/changePassword:
 *   post:
 *     operationId: secured_changePassword
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To request for change the current password    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: User's current password 
 *         name: currentPassword
 *         type: string
 *       - in: query
 *         description: Enter the new password
 *         name: newPassword
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/changePassword',authorizedUserController.changePassword);


/**
 * @swagger
 * /v1/user/changePlan:
 *   get:
 *     operationId: secured_changePlan
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To request for changing the current user plan    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: User's current plan 
 *         name: currentPlan
 *         type: integer
 *       - in: query
 *         description: User's new plan
 *         name: newPlan
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/changePlan',authorizedUserController.changePlan);

/**
 * @swagger
 * /v1/user/changePaymentType:
 *   get:
 *     operationId: secured_changePaymentType
 *     summary: Secured, Please update the access token after current route executed successfully 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To request for changing the current user payment type 
 *     deprecated: true   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: User's current payment type 
 *         name: currentPaymentType
 *         type: integer
 *       - in: query
 *         description: User's new payment type
 *         name: newPaymentType
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/changePaymentType',authorizedUserController.changePaymentType);



/**
 * @swagger
 * /v1/user/changeTwoStepOptions:
 *   get:
 *     operationId: secured_changeTwoStepOptions
 *     summary: Secured 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To request for changing the two step activation options    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Two step activate 
 *         name: twoStepActivate
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/changeTwoStepOptions',authorizedUserController.change2StepOptions);


/**
 * @swagger
 * /v1/user/getUserInfo:
 *   get:
 *     operationId: secured_getUserInfo
 *     summary: Secured 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To request for getting new user details   
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
routes.get('/getUserInfo',authorizedUserController.getUserInfo);


/**
 * @swagger
 * /v1/user/updateProfileDetails:
 *   post:
 *     operationId: secured_updateProfileDetails
 *     summary: Secured 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To request for changing profile information of the user  
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userDetails
 *         description: User's profile details
 *         in: body
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              user:
 *                $ref: "#/definitions/UpdateUser"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/updateProfileDetails',authorizedUserController.UpdateProfileDetails);

module.exports = routes;