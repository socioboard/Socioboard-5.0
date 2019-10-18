const insightController = require('./controllers/insightController');
const routes = require('express').Router();

/**
 * @swagger
 * responses:
 *   unauthorizedError:
 *     description: Accesstoken is missing or invalid
 *     headers:
 *       x-access-token:
 *         type: string
 *         description: Access denied for your requested url, please provide proper x-access-token with the request
 * /v1/insights/twtInsights:
 *   put:
 *     operationId: secured_Insights_twtInsights
 *     summary: Secured - Admin Only
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Insights
 *     description: To fetch twitter Insights
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
routes.put('/twtInsights', insightController.twtInsights);


/**
* @swagger
* /v1/report/updateTeamReport:
*   put:
*     operationId: secured_report_updateTeamReport
*     summary: Secured - Admin Only
*     security:
*     - AccessToken: []
*     tags:
*       - Insights
*     description: To update TeamReports
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
routes.put('/updateTeamReport', insightController.updateTeamReport);


module.exports = routes;
