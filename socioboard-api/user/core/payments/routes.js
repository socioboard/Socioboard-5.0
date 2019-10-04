const routes = require('express').Router();
const paymentControllers = require('./controllers/paymentControllers');

/**
 * @swagger
 * /v1/payment/getPaymentRedirectUrl:
 *   get:
 *     operationId: secured_team_getPaymentRedirectUrl
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Payment
 *     description: To get the payment redirect url for application supported modes
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide user new plan id
 *         name: newPlanId
 *         type: integer
 *       - in: query
 *         description: Specify Payment mode either 0-Paypal or 1-PayUMoney
 *         name: paymentMode
 *         type: integer
 *         default: 0
 *         enum: [0,1]
 *       - in: query
 *         description: Enter coupon code if any
 *         name: couponCode
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getPaymentRedirectUrl', paymentControllers.getPaymentRedirectUrl);

/**
 * @swagger
 * /v1/payment/paypalPaymentSuccess:
 *   get:
 *     operationId: secured_team_paypalPaymentSuccess
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Payment
 *     description: To get the payment response details of paypal
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Provide Token of PayPal from PayPal response
 *         name: token
 *         type: string
 *       - in: query
 *         description: Provide PayerId of PayPal from PayPal response
 *         name: payerId
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/paypalPaymentSuccess', paymentControllers.paypalPaymentSuccess);


/**
 * @swagger
 * definitions:
 *   payuMoneyResponse:
 *     properties:
 *       key:
 *         type: string
 *         description: ""
 *       txnid:
 *         type: string
 *         description: ""
 *       amount:
 *         type: string
 *         description: ""
 *       productinfo:
 *         type: string
 *         description: ""
 *       firstname:
 *         type: string
 *         description: ""
 *       email:
 *         type: string
 *         description: ""
 *       mihpayid:
 *         type: string
 *         description: ""
 *       status:
 *         type: string
 *         description: ""
 *       hash:
 *         type: string
 *         description: ""
 *       cardnum:
 *         type: string
 *         description: ""
 *       phone: 
 *         type: string
 *         description: ""
 *       pg_type:
 *         type: string
 *         description: ""
 *       addedon:
 *         type: string
 *         description: ""
 *       udf1:
 *         type: string
 *         description: ""
 *       udf2:
 *         type: string
 *         description: ""
 *     example:
 *       key: "mfgnhgY"
 *       txnid: "Sociogfd3350847"
 *       amount: "6868.00"
 *       productinfo: "Platinum"
 *       firstname: "socio"
 *       email: "socio@socioboard.in"
 *       mihpayid: "404071"
 *       status: "success"
 *       hash: "d4b207grjyjgfg1db5fd40a453aae8074523c72ca8e82477762edb96f5f7a220c2c81ab6a7ee869ebbcef837b5d8ed1927"
 *       cardnum: "401200XXXXXXXXX"
 *       phone: "45678162198"
 *       pg_type: "AXISPG"
 *       addedon: "2019-07-17 13:38:31"
 *       udf1: "2"
 *       udf2: "7"
 */


/**
 * @swagger
 * /v1/payment/payUMoneyPaymentSuccess:
 *   post:
 *     operationId: secured_team_payUMoneyPaymentSuccess
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Payment
 *     description: To get the payment response details for payumoney 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         description: Provide transactionDetails
 *         name: transactionDetails
 *         schema:
 *            type: object
 *            properties:
 *              PaymentDetails:
 *                $ref: "#/definitions/payuMoneyResponse"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/payUMoneyPaymentSuccess', paymentControllers.payUMoneyPaymentSuccess);


/**
 * @swagger
 * /v1/payment/getMyLastPaymentInfo:
 *   get:
 *     operationId: secured_payment_getMyLastPaymentInfo
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Payment
 *     description: To get the last payment details of an user 
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
routes.get('/getMyLastPaymentInfo', paymentControllers.getMyLastPaymentInfo);


/**
 * @swagger
 * /v1/payment/getFullPaymentHistory:
 *   get:
 *     operationId: secured_payment_getFullPaymentHistory
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Payment
 *     description: To get full payment history of an user
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
routes.get('/getFullPaymentHistory', paymentControllers.getFullPaymentHistory);


/**
 * @swagger
 * /v1/payment/paymentInvoiceDownloader:
 *   get:
 *     operationId: secured_payment_paymentInvoiceDownloader
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Payment
 *     description: To get payment invoice of an user
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
routes.get('/paymentInvoiceDownloader', paymentControllers.paymentInvoiceDownloader);

routes.get('/paypalNotify', paymentControllers.paypalNotify);

module.exports = routes;