import Router from 'express';
import InvitationController from './invitation.controller.js';

const router = Router();
  
  /**
 * TODO Invite Twitter Account  Member
 * Route Invite Twitter Account Member
 * @name post/invitation-add-social-profie
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} return the twitter added details
 */
  router.post('/invitation-add-social-profie', InvitationController.inviteTwitterMember);

export default router;
