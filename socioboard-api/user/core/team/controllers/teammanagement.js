const config = require('config');
const configruation = require('../../../config/configuration');
const TeamLibs = require('../utils/teamlibs');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const analyticsServices = new AnalyticsServices(config.get('analytics'));
const teamLibs = new TeamLibs();
const logger = require('../../../utils/logger');

class TeamController {
    getDetails(req, res) {
        return teamLibs.getTeams(req.body.userScopeId)
            .then(function (result) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_all_team.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', teamSocialAccountDetails: result.teamSocialAccountDetails, teamMembers: result.teamMembers, memberProfileDetails: result.memberProfileDetails, socialAccounts: result.socialAccounts });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_all_team_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    getTeamDetails(req, res) {

        return teamLibs.getTeamDetails(req.body.userScopeId, req.query.TeamId)
            .then(function (result) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_team.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', teamSocialAccountDetails: result.teamSocialAccountDetails, SocialAccountStats: result.SocialAccountStats, teamMembers: result.teamMembers, memberProfileDetails: result.memberProfileDetails, pinterestBoards: result.pinterestBoards });
            })
            .catch(function (error) {
                if (error.isNoTeam) {
                    res.status(200).json({ code: 404, status: "failed", error: error.message });
                } else {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Teams,
                        label: configruation.user_service_events.team_event_label.fetch_team_failed.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    });
                    res.status(200).json({ code: 404, status: "failed", error: error.message });
                }
            });
    }

    getSocialProfiles(req, res) {

        return teamLibs.getSocialProfiles(req.body.userScopeId)
            .then((accounts) => {
                if (accounts.length == 0) {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Teams,
                        label: configruation.user_service_events.team_event_label.fetch_profiles.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    });
                    throw new Error("You don't have any accounts!");
                }
                else {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Teams,
                        label: configruation.user_service_events.team_event_label.fetch_profiles_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    });
                    res.status(200).json({ code: 200, status: 'success', profiles: accounts });
                }
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_profiles_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getSocialProfilesById(req, res) {
        return teamLibs.getSocialProfilesById(req.body.userScopeId, req.query.accountId)
            .then((account) => {
                if (!account) {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Teams,
                        label: configruation.user_service_events.team_event_label.fetch_profiles_byId.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId),
                    });
                    throw new Error("Sorry, Specified account was not found!");
                }
                else {
                    analyticsServices.registerEvents({
                        category: req.body.userScopeEmail,
                        action: configruation.user_service_events.event_action.Teams,
                        label: configruation.user_service_events.team_event_label.fetch_profiles_byId_failed.replace('{{user}}', req.body.userScopeName).replace('{{accountId}}', req.query.accountId).replace('{{id}}', req.body.userScopeId),
                    });
                    res.status(200).json({ code: 200, status: 'success', profile: account });
                }
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_profiles_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    createTeam(req, res) {

        return teamLibs.createTeam(req.body.userScopeId, req.body.TeamInfo)
            .then((teamDetails) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.create_team.replace("{{teamId}}", teamDetails.team_id).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', teamDetails: teamDetails });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.create_team_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    editTeam(req, res) {
        return teamLibs.editTeam(req.body.userScopeId, req.query.TeamId, req.body.TeamInfo)
            .then((teamDetails) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.edit_team.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', teamDetails: teamDetails });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.edit_team_failed.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    deleteTeam(req, res) {

        return teamLibs.deleteTeam(req.body.userScopeId, req.query.TeamId)
            .then((teamDetails) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.delete_team.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 200, status: 'success', teamDetails: teamDetails });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.delete_team_failed.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId)
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    inviteTeam(req, res) {

        return teamLibs.inviteTeam(req.body.userScopeId, req.body.userScopeName, req.query.TeamId, req.query.Email, req.query.Permission, req.body.userScopeMaxMemberCount)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.invite_team.replace("{{teamId}}", req.query.TeamId).replace("{{email}}", req.query.Email).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', message: "Invitation sent!" });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.invite_team_failed.replace("{{teamId}}", req.query.TeamId).replace("{{email}}", req.query.Email).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getTeamInvitations(req, res) {

        return teamLibs.getTeamInvitations(req.body.userScopeId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_team_invitation.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', teamDetails: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_team_invitation_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    acceptTeamInvitation(req, res) {

        return teamLibs.acceptTeamInvitation(req.body.userScopeId, req.query.TeamId, req.body.userScopeName)
            .then((acceptResponse) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.accept_team_invitation.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', message: acceptResponse });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.accept_team_invitation_failed.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    declineTeamInvitation(req, res) {

        return teamLibs.declineTeamInvitation(req.body.userScopeId, req.query.TeamId, req.body.userScopeName)
            .then((deleteInfo) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.decline_team_invitation.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', message: deleteInfo });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.decline_team_invitation_failed.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    withdrawInvitation(req, res) {

        return teamLibs.withdrawInvitation(req.body.userScopeId, req.query.TeamId, req.query.EmailId)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.withdraw_team_invitation.replace("{{teamId}}", req.query.TeamId).replace("{{email}}", req.query.EmailId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 200, status: 'success' });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.withdraw_team_invitation_failed.replace("{{teamId}}", req.query.TeamId).replace("{{email}}", req.query.EmailId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    removeTeamMember(req, res) {

        return teamLibs.removeTeamMember(req.body.userScopeId, req.query.userScopeName, req.query.TeamId, req.query.memberId)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.remove_team_member.replace("{{teamId}}", req.query.TeamId).replace("{{memberId}}", req.query.memberId).replace("{{user}}", req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', response: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.remove_team_member_failed.replace("{{teamId}}", req.query.TeamId).replace("{{memberId}}", req.query.memberId).replace("{{user}}", req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getTeamMembers(req, res) {

        return teamLibs.getTeamMembers(req.body.userScopeId, req.query.category)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_invited_list.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', teamDetails: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.fetch_invited_list_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 404, status: "failed", error: error.message });
            });
    }

    getProfileRedirectUrl(req, res) {

        return teamLibs.getProfileRedirectUrl(req.body.userScopeId, req.query.teamId, req.query.network, req.headers['x-access-token'], req.body.userScopeAvailableNetworks)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.profile_redirect_url.replace("{{url}}", req.query.network).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.profile_redirect_url_failed.replace("{{url}}", req.query.network).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 403, status: "failed", error: error.message });
            });
    }

    addSocialProfile(req, res) {
        logger.info(`User body : ${JSON.stringify(req.body)}`);

        return teamLibs.addSocialProfile(req.body.userScopeId, req.body.userScopeName, req.query, req.body.userScopeMaxAccountCount, req.body.userScopeAvailableNetworks)
            .then((result) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.add_social_profile.replace("{{profileId}}", req.body.userScopeId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json(result);
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.add_social_profile_failed.replace("{{profileId}}", req.body.userScopeId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 403, status: "failed", message: error.message });
            });
    }

    addBulkSocialProfiles(req, res) {


        return teamLibs.addBulkSocialProfiles(req.body.userScopeId, req.query.TeamId, req.body, req.body.userScopeMaxAccountCount, req.body.userScopeAvailableNetworks)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.bulk_add_social_profile.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),

                });
                res.status(200).json({ code: 200, status: 'success', teamDetails: response.teamDetails, profileDetails: response.profileDetails, errorProfileId: response.errorProfileId });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.bulk_add_social_profile_failed.replace("{{teamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    deleteSocialProfile(req, res) {

        return teamLibs.deleteSocialProfile(req.body.userScopeId, req.query.AccountId)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.delete_social_profile.replace("{{profileId}}", req.query.AccountId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.AccountId
                });
                res.status(200).json({ code: 200, status: "success", message: "Account has been deleted." });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.delete_social_profile_failed.replace("{{profileId}}", req.query.AccountId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.AccountId
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });

    }

    addOtherTeamSocialProfiles(req, res) {

        return teamLibs.addOtherTeamSocialProfiles(req.body.userScopeId, req.query.TeamId, req.query.AccountId)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.add_other_team_social_profile.replace("{{profileId}}", req.query.AccountId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 200, status: 'success', message: "Added to the team." });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.add_other_team_social_profile_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    deleteTeamSocialProfile(req, res) {

        return teamLibs.deleteTeamSocialProfile(req.body.userScopeId, req.query.TeamId, req.query.AccountId, req.body.userScopeName)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.delete_current_team_social_profile.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 200, status: 'success', message: "Removed the account from the team." });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.delete_current_team_social_profile_failed.replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    leaveFromTeam(req, res) {

        return teamLibs.leaveFromTeam(req.body.userScopeId, req.query.TeamId, req.body.userScopeName)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.leave_team.replace("{{TeamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 200, status: 'success', message: "Successfully left from the team." });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.leave_team_failed.replace("{{TeamId}}", req.query.TeamId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    editTeamMemberPermission(req, res) {


        return teamLibs.editTeamMemberPermission(req.body.userScopeId, req.query.TeamId, req.query.MemberId, req.query.Permission)
            .then(() => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.edit_permission.replace("{{user1}}", req.query.MemberId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 200, status: 'success', message: "Updated Permission!" });
            })
            .catch(function (error) {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.edit_permission_failed.replace("{{user1}}", req.query.MemberId).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.query.TeamId
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    lockProfiles(req, res) {


        return teamLibs.lockProfiles(req.body.userScopeId, req.body)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.lock_profiles.replace("{{accounts}}", req.body).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.body
                });
                res.status(200).json({ code: 200, status: 'success', message: "Accounts are locked successfully.", updatedProfiles: response.updatedProfiles, errorProfiles: response.errorProfiles });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.lock_profiles_failed.replace("{{accounts}}", req.body).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.body
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    unlockProfiles(req, res) {
        return teamLibs.unlockProfiles(req.body.userScopeId, req.body, req.body.userScopeMaxAccountCount)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.unlock_profiles.replace("{{accounts}}", req.body).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.body
                });
                res.status(200).json({ code: 200, status: 'success', message: "Accounts are unlocked successfully.", updatedProfiles: response.updatedProfiles, errorProfiles: response.errorProfiles });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.unlock_profiles_failed.replace("{{accounts}}", req.body).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.body
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    getTeamInsights(req, res) {
        return teamLibs.getTeamInsights(req.query.TeamId, req.body.userScopeId, req.body.userScopeName)
            .then((response) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.unlock_profiles.replace("{{accounts}}", req.body).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.body
                });
                res.status(200).json({ code: 200, status: 'success', TeamInsights: response });
            })
            .catch((error) => {
                analyticsServices.registerEvents({
                    category: req.body.userScopeEmail,
                    action: configruation.user_service_events.event_action.Teams,
                    label: configruation.user_service_events.team_event_label.unlock_profiles_failed.replace("{{accounts}}", req.body).replace('{{user}}', req.body.userScopeName).replace('{{id}}', req.body.userScopeId),
                    value: req.body
                });
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
}



module.exports = new TeamController();