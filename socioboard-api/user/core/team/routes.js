const routes = require("express").Router();

const teamManagementController = require('./controllers/teammanagement');

/**
 * @swagger
 * definitions:
 *   teamDetails:
 *     properties:
 *       name:
 *         type: string
 *         description: "To specify the name of the team with minimum 4 to 10 characters, also which allows only alphanumeric characters."
 *       description:
 *         type: string
 *         description: "Short note about the team activity."
 *       logoUrl:
 *         type: string
 *         description: "To specify the team's logo which should be a valid url."
 *   SocialAccounts:
 *     properties:
 *       account_type:
 *         type: string
 *         description: "To specify the account type 1-Facebook, 2-FacebookPage,3-FacebookGroup,4-Twitter,5-Instagram,6-Linkedin,7-LinkedinBusiness,8-GooglePlus,9-Youtube,10-GoogleAnalytics"
 *       user_name:
 *         type: string
 *         description: "To specify the username of the social profile."
 *       first_name:
 *         type: string
 *         description: "To specify the first name of the social profile with minimum 4 to 25 characters."
 *       last_name:
 *         type: string
 *         description: "To specify the last name of the social profile with minimum 4 to 25 characters."
 *       email:
 *         type: string
 *         description: "To specify the email of the social profile with maximum 20 characters."
 *       social_id:
 *         type: string
 *         description: "To specify the social Id of the social profile."
 *       profile_pic_url:
 *         type: string
 *         description: "To specify the profile picture url of the social profile."
 *       cover_pic_url:
 *         type: string
 *         description: "To specify the cover picture url of the social profile."
 *       profile_url:
 *         type: string
 *         description: "To specify the profile url of the social profile."
 *       access_token:
 *         type: string
 *         description: "To specify the access token of the social profile."
 *       refresh_token:
 *         type: string
 *         description: "To specify the refresh token of the social profile."
 *       friendship_counts:
 *         type: string
 *         description: "To specify the friendship count of the social profile, like follower count, following count in json."
 *       info:
 *         type: string
 *         description: "To specify the short note about the social profile."
 * /v1/team/getDetails:
 *   get:
 *     operationId: secured_teamGetDetails
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request for profile details of team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getDetails', teamManagementController.getDetails);



/**
 * @swagger
 * /v1/team/getTeamDetails:
 *   get:
 *     operationId: secured_team_GetTeamDetails
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request for profile details of team   
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getTeamDetails', teamManagementController.getTeamDetails);


/**
 * @swagger
 * /v1/team/getSocialProfiles:
 *   get:
 *     operationId: secured_team_getSocialProfiles
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request for profile details of team   
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
routes.get('/getSocialProfiles', teamManagementController.getSocialProfiles);


/**
 * @swagger
 * /v1/team/getSocialProfilesById:
 *   get:
 *     operationId: secured_team_getSocialProfilesById
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request for profile details by account id  
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Account id 
 *         name: accountId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getSocialProfilesById', teamManagementController.getSocialProfilesById);

/**
 * @swagger
 * /v1/team/create:
 *   post:
 *     operationId: secured_team_createTeam
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to create a team   
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: teamDetails
 *         description: Team's information
 *         in: body
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              TeamInfo:
 *                $ref: "#/definitions/teamDetails"
 *     responses:
 *       200:
 *         description: Return success!
 *       400: 
 *         description: Return ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/create', teamManagementController.createTeam);


/**
 * @swagger
 * /v1/team/edit:
 *   post:
 *     operationId: secured_team_editTeam
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to edit a team   
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *       - name: teamDetails
 *         description: Team's information
 *         in: body
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              TeamInfo:
 *                $ref: "#/definitions/teamDetails"
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/edit', teamManagementController.editTeam);


/**
 * @swagger
 * /v1/team/delete:
 *   delete:
 *     operationId: secured_team_deleteTeam
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to delete a team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/delete', teamManagementController.deleteTeam);


/**
 * @swagger
 * /v1/team/invite:
 *   post:
 *     operationId: secured_team_inviteTeam
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to invite a member to team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *       - in: query
 *         description: Email Id
 *         name: Email
 *         type: string
 *       - in: query
 *         description: Permission 1- full permission , 0 - Approval required
 *         name: Permission
 *         type: integer
 *         default: 1
 *         enum: [0,1]
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/invite', teamManagementController.inviteTeam);


/**
 * @swagger
 * /v1/team/declineTeamInvitation:
 *   post:
 *     operationId: secured_team_declineTeamInvitation
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to invite a member to team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/declineTeamInvitation', teamManagementController.declineTeamInvitation);


/**
 * @swagger
 * /v1/team/getTeamInvitations:
 *   get:
 *     operationId: secured_team_getTeamInvitations
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to getting team invitations   
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
routes.get('/getTeamInvitations', teamManagementController.getTeamInvitations);

/**
 * @swagger
 * /v1/team/acceptInvitation:
 *   post:
 *     operationId: secured_team_acceptTeamInvitation
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to invite a member to team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/acceptInvitation', teamManagementController.acceptTeamInvitation);
/**
 * @swagger
 * /v1/team/declineTeamInvitation:
 *   post:
 *     operationId: secured_team_declineTeamInvitation
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to invite a member to team
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404:
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/declineTeamInvitation', teamManagementController.declineTeamInvitation);

/**
 * @swagger
 * /v1/team/withdrawInvitation:
 *   delete:
 *     operationId: secured_team_withdrawInvitation
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to withdraw invitation from member to team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: User's Email
 *         name: EmailId
 *         type: string
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/withdrawInvitation', teamManagementController.withdrawInvitation);


/**
 * @swagger
 * /v1/team/removeTeamMember:
 *   delete:
 *     operationId: secured_team_removeTeamMember
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to remove team member  
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: member Id
 *         name: memberId
 *         type: string
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/removeTeamMember', teamManagementController.removeTeamMember);

/**
 * @swagger
 * /v1/team/getTeamMembers:
 *   get:
 *     operationId: secured_team_getInvitedList
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to get team members
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: category (0-all, 1-pending, 2-accepted, 3-left from team) 
 *         name: category
 *         type: integer
 *         enum : [0,1,2,3]
 *         default: 0
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getTeamMembers', teamManagementController.getTeamMembers);


/**
 * @swagger
 * /v1/team/getProfileRedirectUrl:
 *   get:
 *     operationId: secured_team_getProfileRedirectUrl
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to withdraw invitation from member to team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: teamId
 *         type: integer
 *       - in: query
 *         description: Network
 *         name: network
 *         type: string
 *         default: "Facebook"
 *         enum: ["Facebook", "FacebookPage","FacebookGroup", "Twitter", "LinkedIn", "LinkedInCompany", "Youtube", "GoogleAnalytics", "Instagram","InstagramBusiness" ,"Pinterest"]
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getProfileRedirectUrl', teamManagementController.getProfileRedirectUrl);





/**
 * @swagger
 * /v1/team/addSocialProfile:
 *   get:
 *     operationId: secured_team_addSocialProfile
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to add a new social profile to team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: User's State
 *         name: state
 *         type: string
 *       - in: query
 *         description: Verification Code of the network 
 *         name: code
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/addSocialProfile', teamManagementController.addSocialProfile);

/**
 * @swagger
 * /v1/team/addBulkSocialProfiles:
 *   post:
 *     operationId: secured_team_addBulkSocialProfiles
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to add your other team account 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         required: true
 *         name: TeamId
 *         type: integer
 *       - in: body
 *         required: true
 *         name: profileDetails
 *         description: Social profile details
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/SocialAccounts'
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/addBulkSocialProfiles', teamManagementController.addBulkSocialProfiles);



/**
 * @swagger
 * /v1/team/deleteSocialProfile:
 *   delete:
 *     operationId: secured_team_deleteSocialProfile
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to delete a social profile from all teams where it's belongs   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Account Id
 *         name: AccountId
 *         type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/deleteSocialProfile', teamManagementController.deleteSocialProfile);


/**
 * @swagger
 * /v1/team/addOtherTeamAccount:
 *   post:
 *     operationId: secured_team_addOtherTeamAccount
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to add your other team account 
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Account Id
 *         name: AccountId
 *         type: string
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/addOtherTeamAccount', teamManagementController.addOtherTeamSocialProfiles);

/**
 * @swagger
 * /v1/team/deleteTeamSocialProfile:
 *   delete:
 *     operationId: secured_team_deleteTeamSocialProfile
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request to delete a social profile to team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Account Id
 *         name: AccountId
 *         type: string
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.delete('/deleteTeamSocialProfile', teamManagementController.deleteTeamSocialProfile);


/**
 * @swagger
 * /v1/team/leave:
 *   post:
 *     operationId: secured_team_leaveFromTeam
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To request for leave from a particular team   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/leave', teamManagementController.leaveFromTeam);

/**
 * @swagger
 * /v1/team/editMemberPermission:
 *   post:
 *     operationId: secured_team_editTeamMemberPermission
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To edit a team member permission   
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         name: TeamId
 *         type: integer
 *       - in: query
 *         description: Member Id
 *         name: MemberId
 *         type: string
 *       - in: query
 *         description: Permission 1- full permission , 0 - Approval required
 *         name: Permission
 *         type: integer
 *         default: 1
 *         enum: [0,1]
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.post('/editMemberPermission', teamManagementController.editTeamMemberPermission);


/**
 * @swagger
 * /v1/team/lockProfiles:
 *   put:
 *     operationId: secured_team_lockProfiles
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To lock a set of social profiles 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         description: Array of account Ids
 *         name: addingSocialIds
 *         type: array
 *         items:
 *           type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/lockProfiles', teamManagementController.lockProfiles);


/**
 * @swagger
 * /v1/team/unlockProfiles:
 *   put:
 *     operationId: secured_team_unlockProfiles
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To unlock a set of social profiles 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         description: Array of account Ids
 *         name: addingSocialIds
 *         type: array
 *         items:
 *           type: string
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.put('/unlockProfiles', teamManagementController.unlockProfiles);


/**
 * @swagger
 * /v1/team/getTeamInsights:
 *   get:
 *     operationId: secured_team_getTeamInsights
 *     summary: Secured
 *     security:
 *     - AccessToken: []
 *     tags:
 *       - Team
 *     description: To fetch the team insights 
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         description: Team id 
 *         required: true
 *         name: TeamId
 *         type: integer
 *     responses:
 *       200:
 *         description: Return success!
 *       404: 
 *         description: Return Not Found or ErrorMessage
 *       401:
 *         $ref: "#/responses/unauthorizedError"
 */
routes.get('/getTeamInsights', teamManagementController.getTeamInsights);


module.exports = routes;