const routes = require('express').Router();
const adminController = require('./controller/adminController');


/**
 * @swagger
 * definitions:
 *  coupons:
 *     properties:
 *       coupon_code:
 *          type: string
 *          description: To specify the coupon code upto 32 characters
 *       start_date:
 *          type: string
 *          description: To specify the conpon's start date
 *          format: date-time
 *       end_date:
 *          type: string
 *          description: To specify the conpon's end date
 *          format: date-time
 *       discount:
 *          type: integer
 *          description: To specify the discount percentage upto 100
 *       max_use:
 *          type: integer
 *          description: To specify maximum number user can use this coupon 
 */

/**
* @swagger
* /v1/admin/getAppUserStats:
*   get:
*     operationId: secured_getAppUserStats
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To get application overall details.
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
routes.get('/getAppUserStats', adminController.getAppUserStats);


/**
* @swagger
* /v1/admin/getMonthlyUserStats:
*   get:
*     operationId: secured_getMonthlyUserStats
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To get application stat per particular month.
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: month 
*         name: month
*         type: integer
*       - in: query
*         description: year
*         name: year
*         type: integer
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.get('/getMonthlyUserStats', adminController.getMonthlyUserStats);

/**
* @swagger
* /v1/admin/getUsers:
*   get:
*     operationId: secured_getUsers
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To get user full Information.
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: FilterType ( 0-AllUsers, 1-UserPlan, 2-paymentStatus, 3-NameOrEmail )
*         name: filterType
*         type: integer
*         default: 0
*         enum: [0,1,2,3]
*       - in: query
*         description: provide any valid planId - Only valid if filterType is 1-UserPlan
*         name: planId
*         type: integer
*       - in: query
*         description: Specify paymentStatus ( 0-unpaid, 1-paid ) - Only valid if filterType is 2-paymentStatus
*         name: paymentStatus 
*         type: integer
*         default: 0
*         enum: [0,1]
*       - in: query
*         description: Specify any substring of name Or email - Only valid if filterType is 3-NameOrEmail
*         name: nameOrEmail
*         type: string
*       - in: query
*         description: Pagination Id 
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
routes.get('/getUsers', adminController.getUsers);


/**
* @swagger
* /v1/admin/getRecentSignup:
*   get:
*     operationId: secured_getRecentSignup
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To get recent signed up users.
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: FilterType ( 1-today, 2-yesterday, 3-currentWeek, 4-currentMonth, 5-customDates )
*         name: filterType
*         type: integer
*         default: 0
*         enum: [1,2,3,4,5]
*       - in: query
*         description : StartDate format(YYYY-MM-DD)
*         name: startDate
*         type: string
*       - in: query
*         description : EndDate format(YYYY-MM-DD)
*         name: endDate
*         type: string
*       - in: query
*         description : Pagination Id
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
routes.get('/getRecentSignup', adminController.getRecentSignup);


/**
* @swagger
* /v1/admin/getUserPaymentHistory:
*   get:
*     operationId: secured_getUserPaymentHistory
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To get user payment history.
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: userId 
*         name: userId
*         type: integer
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.get('/getUserPaymentHistory', adminController.getUserPaymentHistory);


/**
* @swagger
* /v1/admin/updateUserlock:
*   put:
*     operationId: secured_updateUserlock
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To lock and unlock the user from an application
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: Enter userId 
*         name: userId
*         type: integer
*       - in: query
*         description: Specify the locking option either 0-unlock or 1-lock 
*         name: options
*         type: integer
*         enum: [0,1]
*         default: 0
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.put('/updateUserlock', adminController.updateUserlock);


/**
* @swagger
* /v1/admin/updatePlanForTrail:
*   put:
*     operationId: secured_updatePlanForTrail
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To provide the access to user for trial for a specific plan
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: Enter userId 
*         name: userId
*         type: integer
*       - in: query
*         description: Enter planId 
*         name: planId
*         type: integer
*       - in: query
*         description: Specify the dayCount 
*         name: dayCount
*         type: integer
*         enum: [1,2,3]
*         default: 1
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.put('/updatePlanForTrail', adminController.updatePlanForTrail);



/**
* @swagger
* /v1/admin/updateTwoStepOptions:
*   put:
*     operationId: secured_updateTwoStepOptions
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To update two step enable options for a user.
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: enter userId 
*         name: userId
*         type: integer
*         required: true
*       - in: query
*         description: Two step login  0-disable or 1-enable 
*         name: options
*         type: integer
*         enum: [0,1]
*         default: 0
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.put('/updateTwoStepOptions', adminController.updateTwoStepOptions);


/**
* @swagger
* /v1/admin/getPackages:
*   get:
*     operationId: secured_getPackages
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To get full package details.
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
routes.get('/getPackages', adminController.getPackages);



/**
 * @swagger
 * definitions:
 *   packageDetails:
 *     properties:
 *       plan_name:
 *          type: string
 *          description: "To specify the plan_name with maximum 32 characters."
 *       account_count:
 *          type: integer
 *          description: "To specify the available_network so user can access."
 *       plan_price: 
 *          type: integer
 *          description: "To specify the available_network so user can access."
 *       member_count: 
 *          type: integer
 *          description: "To specify the member_count that how many team members you allowing."
 *       available_network: 
 *          type: string
 *          description: "To specify the available_network so user can access."
 *       browser_extension: 
 *          type: integer
 *          description: "To specify the browser_extension so that user can use browser extensions."
 *          default: 0
 *       scheduling_posting:
 *          type: integer    
 *          description: "To specify the scheduling_posting that how much user can schedule."
 *          default: 0
 *       mobile_apps:
 *          type: integer
 *          description: "To specify the mobile_apps that these can use in mobile or not."
 *          default: 0
 *       support_24_7:
 *          type: integer
 *          description: "To specify the support_24_7 that user can have 24x7 service."
 *          default: 0
 *       crm:
 *          type: integer
 *          description: "To specify the crm that user is having crm feature available or not."
 *          default: 0
 *       calendar:
 *          type: integer
 *          description: "To specify the calendar that user is having calendar feature or not."
 *          default: 0
 *       rss_feeds:
 *          type: integer
 *          description: "To specify the rss_feeds that user is having rss_feeds feature or not."
 *          default: 0
 *       social_report:
 *          type: integer
 *          description: "To specify the social_report that user is having social_report feature or not."
 *          default: 0
 *       discovery:
 *          type: integer
 *          description: "To specify the discovery that user is having discovery feature or not."
 *          default: 0
 *       twitter_engagement:
 *          type: integer
 *          description: "To specify the twitter_engagement that user is having twitter_engagement feature or not."
 *          default: 0
 *       link_shortening:
 *          type: integer
 *          description: "To specify the link_shortening that user is having link_shortening feature or not."
 *          default: 0
 *       shareathon:
 *          type: integer
 *          description: "To specify the shareathon that user is having shareathon feature or not."
 *          default: 0
 *       content_studio:
 *          type: integer
 *          description: "To specify the content_studio that user is having content_studio feature or not."
 *          default: 0
 *       team_report:
 *          type: integer
 *          description: "To specify the team_report that user is having team_report feature or not."
 *          default: 0
 *       board_me:
 *          type: integer
 *          description: "To specify the board_me that user is having board_me feature or not."
 *          default: 0
 *       share_library:
 *          type: integer
 *          description: "To specify the share_library that user is having share_library feature or not."
 *          default: 0
 *       custom_report:
 *          type: integer
 *          description: "To specify the custom_report that user is having custom_report feature or not."
 *          default: 0
 *       maximum_schedule:
 *          type: integer
 *          description: "To specify the maximum_schedule that user can make maximum schedule count."
 *          default: 3
 *       maximum_referal_count:
 *          type: integer
 *          description: "To specify the calendar that user is having calendar feature or not."
 *          default : 5
 *        
 */

/**
 * @swagger
 * /v1/admin/addPackage:
 *   post:
 *     operationId: secured_addPackage
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To register the package
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: packageDetails
 *         description: to create new package.
 *         in: body
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              package:
 *                $ref: "#/definitions/packageDetails"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/addPackage', adminController.addPackage);

/**
 * @swagger
 * /v1/admin/editPackage:
 *   put:
 *     operationId: secured_editPackage
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To register the package
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: enter planId 
 *         name: planId
 *         type: integer
 *         required : true
 *       - name: packageDetails
 *         description: to edit package.
 *         in: body
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              package:
 *                $ref: "#/definitions/packageDetails"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/editPackage', adminController.editPackage);


/**
* @swagger
* /v1/admin/updatePackageActivations:
*   put:
*     operationId: secured_updatePackageActivations
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Admin
*     description: To update package activate or deactivate options for a admin.
*     produces:
*       - application/json
*     parameters:
*       - in: query
*         description: enter planId 
*         name: planId
*         type: integer
*         required: true
*       - in: query
*         description: Package activation 0-deactivate or 1-activate 
*         name: options
*         type: integer
*         enum: [0,1]
*         default: 0
*     responses:
*       200:
*         description: Return success!
*       404: 
*         description: Return Not Found or ErrorMessage
*       401:
*         $ref: "#/responses/unauthorizedError"
*/
routes.put('/updatePackageActivations', adminController.updatePackageActivations);


/**
 * @swagger
 * /v1/admin/createcoupons:
 *   post:
 *     operationId: secured_admin_createcoupons
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To request to create a coupon   
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: couponDetails
 *         description: Conpon's information
 *         in: body
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              CouponInfo:
 *                $ref: "#/definitions/coupons"
 *     responses:
 *       200:
 *         description: Return success!
 *       400: 
 *         description: Return ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/createcoupons', adminController.createCoupon);


/**
 * @swagger
 * /v1/admin/changeCouponStatus:
 *   post:
 *     operationId: secured_changeCouponState
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To change coupon status
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: enter couponCode 
 *         name: couponCode
 *         type: string
 *         required : true
 *       - in: query
 *         description: enter coupon status ( 0-deactive, 1-active)
 *         name: status
 *         type: integer
 *         enum : [0, 1]
 *         required : true
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/changeCouponStatus', adminController.changeCouponStatus);

/**
 * @swagger
 * /v1/admin/getCoupons:
 *   get:
 *     operationId: secured_getCoupons
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To get coupons
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
routes.get('/getCoupons', adminController.getCoupons);

/**
 * @swagger
 * /v1/admin/getCouponInfo:
 *   post:
 *     operationId: secured_getCouponInfo
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To get specified user used coupons information
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Enter userId/email/firstname 
 *         name: user
 *         type: string
 *         default: null
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/getCouponInfo', adminController.getCouponInfo);

/**
 * @swagger
 * /v1/admin/getUnverifiedPayments:
 *   get:
 *     operationId: secured_getUnverifiedPayments
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To get unverified payment details
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Enter paymentMode
 *         name: paymentMode
 *         enum: [0,1]
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getUnverifiedPayments', adminController.getUnverifiedPayments);

/**
 * @swagger
 * /v1/admin/verifyPayment:
 *   put:
 *     operationId: secured_verifyPayment
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Admin
 *     description: To verify the payment
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Enter paymentId 
 *         name: paymentId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/verifyPayment', adminController.verifyPayment);




module.exports = routes;