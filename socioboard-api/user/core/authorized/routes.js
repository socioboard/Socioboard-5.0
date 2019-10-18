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
 *         default: "0"
 *       phoneNumber:
 *         type: string
 *         description: "To specify the user's phone code, also which should be valid numberic characters with maximum length of 15 digits."
 *         default: "0"
 *       aboutMe:
 *         type: string
 *         description: "To specify about user's information."
 *         default: null
 *     example:
 *       firstName: "Socio"
 *       lastName: "Board"
 *       dateOfBirth: "1997-09-07"
 *       profilePicture: "https://www.socioboard.com/contents/socioboard/images/Socioboard.png"
 *       phoneCode: "+91"
 *       phoneNo: "8324575248"
 *       aboutMe: "A business person"
 * 
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
 *         description: Provide user's current password 
 *         name: currentPassword
 *         type: string
 *       - in: query
 *         description: Enter new password
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
routes.post('/changePassword', authorizedUserController.changePassword);


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
 *     description: To request for changing the current user plan from higher plan to lower plan  
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide user's current plan 
 *         name: currentPlan
 *         type: integer
 *       - in: query
 *         description: Enter user's new plan
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
routes.get('/changePlan', authorizedUserController.changePlan);

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
 *         description: Provide user's current payment type 
 *         name: currentPaymentType
 *         type: integer
 *       - in: query
 *         description: Provide user's new payment type
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
routes.get('/changePaymentType', authorizedUserController.changePaymentType);



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
 *         description: Specify Two step activate (0-for Non-Active, 1-for Mobile, 2-for Mobile & Email ) 
 *         name: twoStepActivate
 *         type: integer
 *         enum: [0, 1, 2]
 *         default: 1
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/changeTwoStepOptions', authorizedUserController.change2StepOptions);


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
 *     description: To request for getting user's updated details  
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
routes.get('/getUserInfo', authorizedUserController.getUserInfo);


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
 *         description: Provide user's profile details
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
routes.post('/updateProfileDetails', authorizedUserController.UpdateProfileDetails);


/**
 * @swagger
 * /v1/user/changeShortenStatus:
 *   put:
 *     operationId: secured_changeShortenStatus
 *     summary: Secured 
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To request for changing the shorten url status    
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Specify Two step activate (1-for Active, 0-for Non-Active) 
 *         name: status
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/changeShortenStatus', authorizedUserController.changeShortenStatus);

/**
 * @swagger
 * /v1/user/getShortenUrl:
 *   get:
 *     operationId: secured_getShortenUrl
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Users
 *     description: To fetch the shorten urls
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide long Url
 *         name: longurl
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getShortenUrl', authorizedUserController.getShortenUrl);

module.exports = routes;