const routes = require("express").Router();
const unauthorizedUserController = require('./controllers/usercontroller');


// Module Definitions for user services
/**
 * @swagger
 * responses:
 *   unauthorizedError:
 *     description: Accesstoken is missing or invalid
 *     headers:
 *       x-access-token:
 *         type: string
 *         description: Access denied for your requested url, please provide proper x-access-token with the request
 * definitions:
 *   userDetails:
 *     properties:
 *       userName:
 *         type: string
 *         description: "To specify the username with minimum 4 to 32 characters, also which allows only alphanumeric characters."
 *       email:
 *         type: string
 *         description: "To specify the user's email with maximum 32 characters."
 *       password:
 *         type: string
 *         format: password
 *         description: "To specify the user's password with minimum 8 to 20 characters, also which should have atleast one digit, one uppercase letter, one lowercase letter,and any one special character of #$^+=!*()@%&"
 *       firstName:
 *         type: string
 *         description: "To specify the user's first name with minimum 2 to 15 characters, also which allows only alpha characters."
 *       lastName:
 *          type: string
 *          description: "To specify the user's last name with minimum 2 to 15 characters, also which allows only alpha characters."
 *       dateOfBirth:
 *          type: string
 *          description: "To specify the user's date of birth, only date without time."
 *          format: date
 *       profilePicture:
 *          type: string       
 *          description: "To specify the user's profile picture url, also which should not be more than 100 characters as well as valid url format."
 *          default: "NA"
 *       phoneCode:
 *          type: string
 *          description: "To specify the user's phone code and should not be more than 10 characters."
 *          default: "0"
 *       phoneNo:
 *          type: string
 *          description: "To specify the user's phone code, also which should be valid numberic characters with maximum length of 15 digits."
 *          default: "0"
 *       country:
 *          type: string
 *          description: "To specify the user's country and should not be more than 20 characters."
 *          default: "NA"
 *       timeZone:
 *          type: string
 *          description: "To specify the user's timezone and should not be more than 10 characters."
 *          default: "NA"
 *       aboutMe:
 *          type: string
 *          description: "To specify about user's information."
 *          default: null
 *     example:
 *       userName: "socioboard"
 *       email: "socioboard@socioboard.com"
 *       password: "SocIo@123~"
 *       firstName: "socio"
 *       lastName: "board"
 *       dateOfBirth: "1997-09-07"
 *       profilePicture: "https://www.socioboard.com/contents/socioboard/images/Socioboard.png"
 *       phoneCode: "+91"
 *       phoneNo: "1324575248"
 *       country: "India"
 *       timeZone: "+5:30"
 *       aboutMe: "A business person"
 * 
 *   userRewards:
 *     properties:
 *       eWalletValue:
 *          type: number
 *          format: float
 *          default: 0.0
 *       isAdsEnabled:
 *          type: boolean
 *          default: false
 *       referedBy:
 *          type: string
 *          default: "NA"
 *       referalStatus:
 *          type: boolean
 *          default: false
 * 
 *   userActivations:
 *     properties:
 *       activationStatus:
 *          type: integer
 *          description: 0-InActive, 1-Active
 *          default: 0
 *       paymentType:
 *          type: integer
 *          description: 0-Paypal, 1-PayUMoney
 *          default: 0
 *       paymentStatus:
 *          type: integer
 *          description: 0-UnPaid, 1-Paid
 *          default: 0
 *       IsTwoStepVerify:
 *          type: boolean
 *          default: false
 *       signupType:
 *          type: integer
 *          description: 0-Manually, 1-Google, 2-Facebook
 *          default: 0
 *       userPlan:
 *          type: integer
 *          description: 0-Basic,1-Standard,2-Premium,3-Deluxe,4-Topaz,5-Ruby,6-Gold,7-Platinum
 *          default: 0
 *       expireDate:
 *          type: string
 *          format: date-time
 * 
 *          
 */


/**
 * @swagger
 * /v1/checkUserNameAvailability:
 *   get:
 *     tags:
 *       - Open
 *     description: To check userName availability
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: enter userName
 *         name: userName
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404: 
 *         description: Not Found, Followed by ErrorMessage
 */
routes.get("/checkUserNameAvailability", unauthorizedUserController.checkUserNameAvailability);

/**
 * @swagger
 * /v1/checkEmailAvailability:
 *   get:
 *     tags:
 *       - Open
 *     description: To check email availability
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: enter email
 *         name: email
 *         type: string
 *         example: "socioboard@socioboard.com"
 *     responses:
 *       200:
 *         description: Success
 *       404: 
 *         description: Not Found, Followed by ErrorMessage
 */
routes.get("/checkEmailAvailability", unauthorizedUserController.checkEmailAvailability);

/**
 * @swagger
 * /v1/register:
 *   put:
 *     tags:
 *       - Open
 *     description: To register the user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userDetails
 *         description: Provide user's personal information
 *         in: body
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              user:
 *                $ref: "#/definitions/userDetails"
 *     responses:
 *       200:
 *         description: User has been created!
 *       400: 
 *         description: User hasn't created, Followed by ErrorMessage
 */
routes.put("/register", unauthorizedUserController.register);

/**
 * @swagger
 * /v1/login:
 *   post:
 *     tags:
 *       - Open
 *     description: To login with user
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         description: Provide user’s email or username and password
 *         name: userDetails
 *         schema:
 *            type: object
 *            properties:
 *              user:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       200:
 *         description: Return user's access token!
 *       404: 
 *         description: Not Found, Followed by ErrorMessage
 */
routes.post("/login", unauthorizedUserController.login);

/**
 * @swagger
 * /v1/Sociallogin:
 *   get:
 *     tags:
 *       - Open
 *     description: To login with social network 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Specify the network, either facebook or google
 *         name: network
 *         type: string
 *         default: "facebook"
 *         enum: ["facebook","google"]
 *     responses:
 *       200:
 *         description: Success
 *       404: 
 *         description: Not Found, Followed by ErrorMessage
 */
routes.get("/Sociallogin", unauthorizedUserController.socialLogin);

routes.get("/auth/facebook/callback", unauthorizedUserController.facebookCallback);
routes.get("/auth/google/callback", unauthorizedUserController.googleCallback);

routes.get("/paypal/successDetails/", unauthorizedUserController.paypalSuccess);

/**
 * @swagger
 * /v1/verifyEmail:
 *   get:
 *     tags:
 *       - Open
 *     description: To verify email with token
 *     summary: This is automated executer with the link of Email, Here no need to test.
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide user's email 
 *         name: email
 *         type: string
 *       - in: query
 *         description: Provide email activation token
 *         name: activationToken
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 */
routes.get('/verifyEmail', unauthorizedUserController.verifyEmail);

/**
 * @swagger
 * /v1/forgotPassword:
 *   get:
 *     tags:
 *       - Open
 *     description: To request for getting activation token to reset the password
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide user's email 
 *         name: email
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 */
routes.get('/forgotPassword', unauthorizedUserController.forgotPassword);

/**
 * @swagger
 * /v1/verifyPasswordToken:
 *   get:
 *     tags:
 *       - Open
 *     description: To verify activation token with user to reset the password
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provied user's email 
 *         name: email
 *         type: string
 *       - in: query
 *         description: Provide email activation token
 *         name: activationToken
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 */
routes.get('/verifyPasswordToken', unauthorizedUserController.verifyPasswordToken);

/**
 * @swagger
 * /v1/resetPassword:
 *   post:
 *     tags:
 *       - Open
 *     description: To request for reset the password 
 *     summary: NOTE  It should run only when /v1/verifyPasswordToken return success
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Provide user's email 
 *         name: email
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
 */
routes.post('/resetPassword', unauthorizedUserController.resetPassword);

/**
 * @swagger
 * /v1/getMailActivationLink:
 *   get:
 *     tags:
 *       - Open
 *     description: To get activationLink to Mail
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide registered userEmail
 *         name: userEmail
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404: 
 *         description: Not Found, Followed by ErrorMessage
 */
routes.get("/getMailActivationLink", unauthorizedUserController.getActivationLink);

routes.get('/twoStepLogin', unauthorizedUserController.twoStepLogin);

/**
 * @swagger
 * /v1/twoStepLoginSuccess:
 *   post:
 *     tags:
 *       - Open
 *     description: To request for validating 2 step
 *     summary: NOTE  It should run only when otp verified successfully (old one)
 *     deprecated : true
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide csrf value 
 *         name: csrf
 *         type: string
 *       - in: query
 *         description: Enter verification Code
 *         name: code
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 */
routes.post('/twoStepLoginSuccess', unauthorizedUserController.twoStepLoginSuccess);

/**
 * @swagger
 * /v1/twoStepLoginValidate:
 *   post:
 *     tags:
 *       - Open
 *     description: To request for verifying the user OTP's
 *     summary: NOTE  It should run only when otp entered
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide email
 *         name: email
 *         type: string
 *       - in: query
 *         description: Enter email verification Code
 *         name: emailtoken
 *         type: number
 *       - in: query
 *         description: Enter mobile verification Code
 *         name: mobiletoken
 *         type: number
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 */
routes.post('/twoStepLoginValidate', unauthorizedUserController.twoStepLoginValidate);

routes.post("/payuMoneySuccess", unauthorizedUserController.payuMoneySuccess);
routes.post("/payuMoneyCancel", unauthorizedUserController.payuMoneySuccess);

module.exports = routes;