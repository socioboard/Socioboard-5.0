import Router from 'express';
import teamController from './team.controller.js';

const router = Router();

router.get('/get-details', teamController.getDetails);
router.post('/get-team-social-accounts', teamController.getTeamSocialAccount);
router.post('/get-social-profiles', teamController.getSocialProfiles);
router.post('/get-social-profiles-by-id', teamController.getSocialProfilesById);
router.post('/search-social-accounts', teamController.searchSocialAccounts);
router.put('/update-ratings', teamController.updateRatings);
router.put('/lock-profiles', teamController.lockProfiles);
router.put('/unlock-profiles', teamController.unlockProfiles);
// router.get('/getProfileRedirectUrl', teamController.getProfileRedirectUrl);
// router.get('/addSocialProfile', teamController.addSocialProfile);
router.put('/update-feed-cron', teamController.updateFeedsCron);
router.post('/create', teamController.createTeam);
router.post('/edit', teamController.editTeam);
router.delete('/delete', teamController.deleteTeam);
router.post('/invite', teamController.inviteTeam);
router.get('/get-team-invitations', teamController.getTeamInvitations);
router.post('/accept-invitation', teamController.acceptInvitation);
router.post('/decline-team-invitation', teamController.declineTeamInvitation);
router.delete('/withdraw-invitation', teamController.withdrawInvitation);
router.delete('/remove-teamMember', teamController.removeTeamMember);
router.post('/leave', teamController.leaveFromTeam);
router.post('/edit-member-permission', teamController.editTeamMemberPermission);
router.get('/get-team-details', teamController.getTeamDetails);
router.post('/add-other-team-account', teamController.addOtherTeamSocialProfiles);
router.delete('/delete-team-social-profile', teamController.deleteTeamSocialProfile);
router.get('/get-available-team-members', teamController.getAvailableTeamMembers);
router.get('/get-available-invited-members', teamController.getAvailableInvitedMembers);
router.get('/get-available-social-accounts', teamController.getAvailableSocialAccounts);
router.put('/lock-team', teamController.lockTeam);
router.put('/unlock-team', teamController.unlockTeam);
router.post('/get-socialAccount-count', teamController.getSocialAccountCount);
router.post('/search-team', teamController.searchTeam);

// router.get('/logout', UserController.logout)

export default router;
