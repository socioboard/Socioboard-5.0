import TeamLibs from '../../../Common/Models/team.model.js'
import lodash from 'lodash';
import validate from './team.validate.js'
import config from 'config';
import { Response, SuccessResponse, ValidateErrorResponse, ErrorResponse, CatchResponse, SocialCallbackResponse } from '../../../Common/Shared/response.shared.js'


const teamLibs = new TeamLibs()
class TeamController {
    constructor() {
    }


    async getSocialProfiles(req, res, next) {
        try {
            let response = await teamLibs.getSocialProfiles(req.body.userScopeId)
            if (response.length == 0) return ErrorResponse(res, "User don't have any social Accounts!")
            SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getSocialProfilesById(req, res, next) {
        try {
            const { accountId } = req.query;
            const { value, error } = await validate.addOtherTeamSocialProfilesById({ accountId })
            if (error) return ValidateErrorResponse(res, error.details[0].message);

            let response = await teamLibs.getSocialProfilesById(req.body.userScopeId, req.query.accountId)
            if (response.length == 0) return ErrorResponse(res, "User don't have any social Accounts!")
            SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async updateRatings(req, res, next) {
        // accountId 
        try {
            let socialAccount = await teamLibs.getSocialAccount(req.body.userScopeId, req.query.accountId)
            console.log(socialAccount.length)
            if (socialAccount.length == 0) return ErrorResponse(res, "No account or user dont have access to account")
            let response = await teamLibs.updateRatings(req.query.accountId, req.query.rating)
            console.log(response.length)
            if (response.length === 0) return ErrorResponse(res, "User don't have any social Accounts!")
            return SuccessResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async lockProfiles(req, res, next) {
        try {
            let accounts = await teamLibs.getSocialAccount(req.body.userScopeId, req.body)
            if (accounts.length == 0) return ErrorResponse(res, "Sorry, either accounts not found or you dont have access of those accounts!")
            let response = await teamLibs.lockProfile(accounts)
            let updatedProfiles = [];
            accounts.map(t => updatedProfiles.push(String(t.account_id)))
            let errorProfiles = lodash.pullAll(req.body, updatedProfiles);
            let data = { updatedProfiles: updatedProfiles, errorProfiles: errorProfiles }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async unlockProfiles(req, res, next) {
        try {
            let accounts = await teamLibs.getSocialAccount(req.body.userScopeId, req.body)
            if (accounts.length == 0) return ErrorResponse(res, "Sorry, either accounts not found or you dont have access of those accounts!")
            let response = await teamLibs.unlockProfiles(accounts)
            let updatedProfiles = [];
            accounts.map(t => updatedProfiles.push(String(t.account_id)))
            let erroredProfiles = lodash.pullAll(req.body, updatedProfiles);
            let data = { updatedProfiles: updatedProfiles, errorProfiles: erroredProfiles }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
        // res.send(req.body)
    }

    async getProfileRedirectUrl(req, res, next) {
        return teamLibs.getProfileRedirectUrl(req.body.userScopeId, req.query.teamId, req.query.network, req.headers['x-access-token'], req.body.userScopeAvailableNetworks)
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((error) => {
                res.status(200).json({ code: 403, status: "failed", error: error.message });
            });
    }

    async addSocialProfile(req, res) {
        /* 	#swagger.tags = ['Team']
            #swagger.description = To get profile redirectUrl for specified Network  
            #swagger.auto = false */
        /* #swagger.security = [{
                    "AccessToken": []
                    }] */
        /*	#swagger.parameters['state'] = {
                in: 'query',
                require:true
                }
            #swagger.parameters['code'] = {
                in: 'query'
            } */
        return teamLibs.addSocialProfile(req.body.userScopeId, req.body.userScopeName, req.query, req.body.userScopeMaxAccountCount, req.body.userScopeAvailableNetworks)
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((error) => {
                res.status(200).json({ code: 403, status: "failed", message: error.message });
            });
    }
    async updateFeedsCron(req, res, next) {
        try {
            let socialAccount = await teamLibs.getSocialAccount(req.body.userScopeId, req.query.accountId)
            if (socialAccount.length == 0) return ErrorResponse(res, "No account or user don't have access to account")
            let response = await teamLibs.updateCrons(req.query.accountId, req.query.cronvalue)
            if (response.length == 0) return ErrorResponse(res, "User don't have any social Accounts!")
            SuccessResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getDetails(req, res, next) {
        try {
            let filteredTeams;
            let teamMemberDetails;
            let memberProfileDetails;
            let teamInformation = await teamLibs.teamForUser(req.body.userScopeId)
            if (!teamInformation) return ErrorResponse(res, "User don't have any team")
            filteredTeams = teamInformation;
            let teamSocialAccount = await teamLibs.teamSocialAccount(teamInformation)
            let teamMembers = await teamLibs.teamMembers(teamInformation)
            teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers)
            memberProfileDetails = await teamLibs.memberProfileDetails(req.body.userScopeId)
            let data = { teamSocialAccountDetails: teamSocialAccount, teamMembers: teamMembers, memberProfileDetails: teamMemberDetails, socialAccounts: memberProfileDetails }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getTeamDetails(req, res, next) {
        try {
            let filteredTeams;
            let teamMemberDetails;
            let memberProfileDetails;
            let teamInformation = await teamLibs.teamForUserSpecific(req.body.userScopeId, req.query.teamId)
            if (!teamInformation) return ErrorResponse(res, "User don't have any team")
            filteredTeams = teamInformation;
            let teamSocialAccount = await teamLibs.teamSocialAccount(teamInformation)
            let teamMembers = await teamLibs.teamMembers(teamInformation)
            teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers)
            memberProfileDetails = await teamLibs.memberProfileDetails(req.body.userScopeId)
            let SocialAccountStats = await teamLibs.socialAccountStats(req.body.userScopeId)
            let data = { teamSocialAccountDetails: teamSocialAccount[0], SocialAccountStats, teamMembers: teamMembers[0], memberProfileDetails: teamMemberDetails[0], socialAccounts: memberProfileDetails[0] }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async createTeam(req, res, next) {
        try {
            const { value, error } = validate.createTeam(req.body.TeamInfo)
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let teamInfo = await teamLibs.getTeamInfo(req.body.userScopeId, req.body.TeamInfo.name)
            if (teamInfo) return ErrorResponse(res, "User has already team with same name!")
            let response = await teamLibs.createTeam(req.body.userScopeId, req.body.TeamInfo)
            return SuccessResponse(res, response)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }


    async editTeam(req, res, next) {
        try {
            const { value, error } = validate.createTeam(req.body.TeamInfo)
            if (error) return ValidateErrorResponse(res, error.details[0].message);

            let teamInfo = await teamLibs.getTeamInfoId(req.body.userScopeId, req.query.teamId)
            if (!teamInfo) return ErrorResponse(res, "Team not found or access denied!")

            let teamName = await teamLibs.getTeamInfo(req.body.userScopeId, req.body.TeamInfo.name)
            if (teamName && teamName.team_id != req.query.teamId) return ErrorResponse(res, "User has already team with same name!")

            let result = await teamLibs.editTeam(req.body.TeamInfo, req.query.teamId)
            if (result) return SuccessResponse(res, result)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async deleteTeam(req, res, next) {
        try {
            // const { value, error } = validate.deleteTeam(req.query.teamId)
            // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
            let teamInfo = await teamLibs.getTeamInfoId(req.body.userScopeId, req.query.teamId)
            if (!teamInfo) return ErrorResponse(res, "Team not found or access denied!")
            if (teamInfo.is_default_team) return ErrorResponse(res, "Sorry, You can't delete default team.")
            let usersTeam = await teamLibs.getAllTeamOfUser(req.body.userScopeId)
            let usersTeamIds = []
            usersTeam.forEach(element => {
                usersTeamIds.push(String(element.team_id));
            });
            let teamsAccount = await teamLibs.getAllteamsAccount(usersTeamIds)
            if (teamsAccount && teamsAccount.length > 0) {
                var availableAccounts = [];
                var deleteAccounts = [];
                var currentTeamAccounts = [];
                teamsAccount.forEach(element => {
                    if (element.team_id == req.query.teamId) {
                        currentTeamAccounts.push(element.account_id);
                    }
                    availableAccounts.push(element.account_id);
                });
                if (availableAccounts.length > 0) {
                    var countWiseArray = lodash.countBy(availableAccounts, Math.floor);
                    var uniqueAccountList = lodash.uniq(availableAccounts);
                    uniqueAccountList.forEach(element => {
                        var availableCount = countWiseArray[element];
                        if (availableCount == 1) {
                            deleteAccounts.push(element);
                        }
                    });
                    var filteredDeleteAccounts = lodash.intersection(currentTeamAccounts, deleteAccounts);
                    if (filteredDeleteAccounts.length > 0) {
                        let socialAccounts = await teamLibs.deleteSocialAccount(filteredDeleteAccounts)
                        let deleteTeam;
                        if (socialAccounts)
                            deleteTeam = await teamLibs.deleteTeam(req.query.teamId)
                        if (deleteTeam) return SuccessResponse(res, teamInfo)
                    }
                    let deleteTeam = await teamLibs.deleteTeam(req.query.teamId)
                    if (deleteTeam) return SuccessResponse(res, teamInfo)
                }
                let deleteTeam = await teamLibs.deleteTeam(req.query.teamId)
                if (deleteTeam) return SuccessResponse(res, teamInfo)
            }
            else {
                let deleteTeam = await teamLibs.deleteTeam(req.query.teamId)
                if (deleteTeam) return SuccessResponse(res, teamInfo)
            }
            //  let result = await teamLibs.editTeam(req.body.TeamInfo, req.query.teamId)
            //  if (result) return responseformat(res, 200, null, "success")
            return SuccessResponse(res, usersTeamIds)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async inviteTeam(req, res, next) {
        //Check team is there or not
        try {
            const { teamId, Email, Permission } = req.query;
            const { value, error } = await validate.inviteTeam({ teamId, Email, Permission })
            if (error) return ValidateErrorResponse(res, error.details[0].message);

            let teamInfo = await teamLibs.isValidTeam(req.body.userScopeId, req.query.teamId)
            if (!teamInfo) return ErrorResponse(res, "Team not found or access denied!")
            if (req.body.userScopeEmail == req.query.Email) return ErrorResponse(res, "Already member of the team")

            let checkUserDetails = await teamLibs.isUserRegistered(req.query.Email)
            if (!checkUserDetails) return ErrorResponse(res, `Please check following points, 1.May be email isn't registered with ${config.get('applicationName')}! or \n\r 2.User's email not activated.`)

            let count = await teamLibs.getTotalTeamMember(req.body.userScopeId)
            let availableMemberCount = req.body.userScopeMaxAccountCount - count;
            if (availableMemberCount <= 0) return ErrorResponse(res, `Sorry, As per your plan, you can't invite any more user.`)

            // Checking that, we already invited the same user or not
            let checkUserAlreadyAdded = await teamLibs.checkUserAlreadyAdded(checkUserDetails.user_id, req.query.teamId)
            if (checkUserAlreadyAdded) return ErrorResponse(res, `Same user already invited or left the team`)
            let addTeamMember = await teamLibs.addTeamMember(checkUserDetails.user_id, req.query.teamId, req.body.userScopeId, req.query.Permission)

            //notification part
            return SuccessResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async unlockTeam(req, res, next) {
        //Check team is there or not
        try {
            let teams = await teamLibs.getTeamDetails(req.body.userScopeId, req.body)
            if (teams == 0) return ErrorResponse(res, "Sorry, either team not found or you don't have access of those accounts!")
            let response = await teamLibs.unlockTeam(teams)
            let updatedProfiles = [];
            teams.map(t => updatedProfiles.push(String(t.team_id)))
            let erroredProfiles = lodash.pullAll(req.body, updatedProfiles);
            let data = { updatedTeam: updatedProfiles, errorTeam: erroredProfiles }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async lockTeam(req, res, next) {
        try {
            let teams = await teamLibs.getTeamDetails(req.body.userScopeId, req.body)
            if (teams == 0) return ErrorResponse(res, "Sorry, either team not found or you dont have access of those accounts!")
            let response = await teamLibs.lockTeam(teams)
            let updatedProfiles = [];
            teams.map(t => updatedProfiles.push(String(t.team_id)))
            let erroredProfiles = lodash.pullAll(req.body, updatedProfiles);
            let data = { updatedTeam: updatedProfiles, errorTeam: erroredProfiles }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async getTeamInvitations(req, res, next) {
        try {
            let invitationData = []
            let teamInformation = await teamLibs.teamInformation(req.body.userScopeId)
            let list = await teamInformation.Team.map(i => teamLibs.teamDetails(i.team_id))
            let data = await Promise.all(list)
            if (data) {
                let listTeam = data.map(i => teamLibs.teamUser(i[0].team_admin_id, i[0]))
                invitationData = await Promise.all(listTeam)
            }
            return SuccessResponse(res, invitationData)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async acceptInvitation(req, res, next) {
        try {
            let userTeamJoinTableInfo = await teamLibs.userTeamJoinTableInfo(req.body.userScopeId, req.query.teamId, req.body.userScopeName)
            if (!userTeamJoinTableInfo) return ErrorResponse(res, "You don't have invitation for this team!")
            let response = await teamLibs.acceptTeam(req.body.userScopeId, req.query.teamId)
            if (response[0] != 0) {
                let acceptedTeam = await teamLibs.userTeamJoinTableInfo(req.body.userScopeId, req.query.teamId, req.body.userScopeName)
                return SuccessResponse(res, acceptedTeam)
            }
            //notification part
            return ErrorResponse(res, "Sorry! Something went wrong.")
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async declineTeamInvitation(req, res, next) {
        try {
            let userTeamJoinTableInfo = await teamLibs.userTeamJoinTableDecline(req.body.userScopeId, req.query.teamId, req.body.userScopeName)
            if (!userTeamJoinTableInfo) return ErrorResponse(res, "You don't have invitation for this team or You already a member of this team!")
            let declineTeam = await teamLibs.declineTeam(req.body.userScopeId, req.query.teamId)
            return SuccessResponse(res, declineTeam)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async withdrawInvitation(req, res, next) {
        try {
            const { value, error } = await validate.withdrawTeam(req.query)
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let teamInfo = await teamLibs.getTeamInfoId(req.body.userScopeId, req.query.teamId)
            if (!teamInfo) return ErrorResponse(res, "Team not found or access denied!")
            let checkUserDetails = await teamLibs.isUserRegistered(req.query.Email)
            if (!checkUserDetails) return ErrorResponse(res, `No such email registered with ${config.get('applicationName')}!`)
            let withDraw = await teamLibs.withDraw(checkUserDetails.user_id, req.query.teamId)
            if (withDraw == 0) return ErrorResponse(res, `No more invitation are present to withdraw or You already a member of the team!`)
            return SuccessResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async removeTeamMember(req, res, next) {

        try {
            const { teamId, memberId } = req.query;
            const { value, error } = await validate.removeTeamMember({ teamId, memberId })
            if (error) return ValidateErrorResponse(res, error.details[0].message);

            let teamInfo = await teamLibs.checkTeamDetails(req.body.userScopeId, req.query.teamId)
            if (!teamInfo) return ErrorResponse(res, "Not found or access denied!")

            let user = await teamLibs.getUser(memberId)
            if (!user) return ErrorResponse(res, `No such member registered with ${config.get('applicationName')}!`)
            let removeFromTeam = await teamLibs.removeFromTeam(teamId, user.user_id, req.body.userScopeId)

            if (removeFromTeam == 0) return ErrorResponse(res, `Already removed from your team.`)

            return SuccessResponse(res, null, `Successfully removed member(${memberId}) from team(${teamId})`)
        } catch (err) {
            return CatchResponse(res, err.message);
        }


    }

    // async getTeamDetails(req, res, next) {
    //     try {
    //         const { teamId } = req.query;
    //         const { value, error } = await validate.deleteTeam({ teamId })
    //         if (error) return ValidateErrorResponse(res, error.details[0].message);

    //         let teamMemberDetails = null;
    //         let memberProfileDetails = null;
    //         let teamInformation = await teamLibs.UserTeam(req.body.userScopeId, req.query.teamId)
    //         if (!teamInformation) return ErrorResponse(res, "Team not found or access denied!")
    //         if (teamInformation.count == 0) return ErrorResponse(res, "User don't have any team!")
    //         let teamSocialAccounts = await teamLibs.teamSocialAccounts(teamInformation)
    //         let teamMembers = await teamLibs.teamMembers(teamInformation)
    //         teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers)
    //         memberProfileDetails = await teamLibs.memberProfileDetails(req.body.userScopeId)
    //         let data = { teamSocialAccountDetails: teamSocialAccounts, teamMembers: teamMembers, memberProfileDetails: teamMemberDetails, socialAccounts: memberProfileDetails }

    //         return SuccessResponse(res, data)
    //     } catch (err) {
    //         return CatchResponse(res, err.message);
    //     }
    // }


    async leaveFromTeam(req, res, next) {

        try {
            const { teamId } = req.query;
            const { userScopeId, userScopeName } = req.body
            const { value, error } = validate.deleteTeam({ teamId })
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let checkTeam = await teamLibs.checkTeamUser(userScopeId, teamId)
            if (!checkTeam) return ErrorResponse(res, "No such team or you are not a part of team!")
            if (checkTeam.left_from_team) return ErrorResponse(res, "You are not a part of team!")

            let teamInfoResponse = await teamLibs.teamInfoResponse(teamId)
            if (teamInfoResponse.team_admin_id == userScopeId) return ErrorResponse(res, "Admin can't leave the leave, rather delete the team!")

            let leaveFromTeam = await teamLibs.leaveFromTeam(teamId, userScopeId)
            // if (!leaveFromTeam) return responseformat(res, 400, null, "No such team or you are not a part of team!", null)
            //notification part
            return SuccessResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }

    }

    async editTeamMemberPermission(req, res, next) {
        try {
            const { teamId, memberId, Permission } = req.query;
            // const { userScopeId, userScopeName } = req.body
            const { value, error } = await validate.editTeamMemberPermission({ teamId, memberId, Permission })
            if (error) return ValidateErrorResponse(res, error.details[0].message);

            let teamInfo = await teamLibs.checkTeamDetails(req.body.userScopeId, req.query.teamId)
            if (!teamInfo) return ErrorResponse(res, "Not found or access denied!")
            let checkTeam = await teamLibs.checkTeamUser(memberId, teamId)
            if (!checkTeam) return ErrorResponse(res, "No such member found!")
            if (checkTeam.left_from_team) return ErrorResponse(res, "You are not a part of team!")

            let updatePermission = await teamLibs.updatePermission(teamId, memberId, Permission)
            return SuccessResponse(res, updatePermission)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }
    async addOtherTeamSocialProfiles(req, res, next) {
        try {
            const { accountId, teamId } = req.query;
            const { value, error } = await validate.addOtherTeamSocialProfiles({ accountId, teamId })
            if (error) return ValidateErrorResponse(res, error.details[0].message);

            let team = await teamLibs.getTeam(req.body.userScopeId, teamId)
            if (!team) return ErrorResponse(res, "You don't have access to add the profile to the team")

            let addTeam;
            let socialAcc = await teamLibs.getSocialaAccDetails(accountId)
            if (socialAcc && socialAcc.account_admin_id && socialAcc.account_admin_id == req.body.userScopeId)
                addTeam = await teamLibs.addTeams(req.body.userScopeId, teamId, accountId)
            else return ErrorResponse(res, "You aren't an admin for an account!")
            return SuccessResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }
    async deleteTeamSocialProfile(req, res, next) {
        try {
            let status
            const { accountId, teamId } = req.query;
            const { userScopeId } = req.body;
            const { value, error } = validate.deleteTeamSocialProfile({ accountId, teamId, userScopeId })
            if (error) return ValidateErrorResponse(res, error.details[0].message);
            let team = await teamLibs.getTeam(req.body.userScopeId, teamId)
            if (!team) return ErrorResponse(res, "You don't have access to add or remove the profile to the team")
            let socialAcc = await teamLibs.getSocialaAcc(userScopeId, accountId)
            if (!socialAcc) return ErrorResponse(res, "Not found or You aren't an admin for an account!", 402)
            status = await teamLibs.removeAccount(teamId, accountId)
            return SuccessResponse(res, status, "success")
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getAvailableTeamMembers(req, res, next) {
        try {
            let teamMemberDetails;
            let teamInformation = await teamLibs.teamForUser(req.body.userScopeId)
            if (!teamInformation) return ErrorResponse(res, "User don't have any team")
            let teamMembers = await teamLibs.teamMembers(teamInformation)
            let updatedProfiles = [];
            teamMembers.map(teamResponse => teamResponse.map(t => {
                if (t.invitation_accepted)
                    updatedProfiles.push(String(t.user_id))
            }))
            let unique = [...new Set(updatedProfiles)];
            teamMemberDetails = await teamLibs.getAvailableTeamMember(unique)
            return SuccessResponse(res, teamMemberDetails)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getAvailableInvitedMembers(req, res, next) {
        try {
            let teamMemberDetails;
            let teamInformation = await teamLibs.teamForUser(req.body.userScopeId)
            if (!teamInformation) return ErrorResponse(res, "User don't have any team")
            let teamMembers = await teamLibs.teamMembers(teamInformation)
            let updatedProfiles = [];
            let invitedMember = [];
            teamMembers.map(teamResponse => teamResponse.map(t => {
                if (t.invitation_accepted)
                    updatedProfiles.push(String(t.user_id))
                else
                    invitedMember.push(String(t.user_id))
            }))
            let unique = [...new Set(updatedProfiles)];
            let uniqueInvited = [...new Set(invitedMember)]
            let difference = [...new Set(
                uniqueInvited.filter(x => !unique.includes(x)))]
            let data = { unique, uniqueInvited, difference }
            teamMemberDetails = await teamLibs.getAvailableTeamMember(difference)
            return SuccessResponse(res, teamMemberDetails)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getAvailableSocialAccounts(req, res, next) {
        try {
            let filteredTeams;
            let teamDetails;
            let teamMemberDetails;
            let memberProfileDetails;
            let teamInformation = await teamLibs.teamForUser(req.body.userScopeId)
            if (!teamInformation) return ErrorResponse(res, "User don't have any team")
            filteredTeams = teamInformation;
            let teamSocialAccount = await teamLibs.teamSocialAccount(teamInformation)
            let updatedProfiles = [];
            // teamSocialAccount.map(teamResponse => teamResponse.map(socialAccount => socialAccount.map(t => {
            //     updatedProfiles.push(String(t.account_id))
            // }))
            // )
            teamSocialAccount.map(teamResponse => teamResponse.map(te => te.SocialAccount.map(t => updatedProfiles.push(String(t.account_id)))))
            let unique = [...new Set(updatedProfiles)];
            let teamMembers = await teamLibs.teamMembers(teamInformation)
            teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers)
            memberProfileDetails = await teamLibs.memberProfileDetails(req.body.userScopeId)
            //let data = { teamSocialAccountDetails: teamSocialAccount, teamMembers: teamMembers, memberProfileDetails: teamMemberDetails, socialAccounts: memberProfileDetails }

            return SuccessResponse(res, memberProfileDetails)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getTeamSocialAccount(req, res, next) {
        //Check team is there or not
        try {
            let checkUserAlreadyAdded = await teamLibs.checkUserAlreadyAdded(req.body.userScopeId, req.query.teamId)
            if (!checkUserAlreadyAdded) return ErrorResponse(res, "Sorry, either team not found or you don't have access of those accounts!")
            let teamsSocialAccount = await teamLibs.getTeamsSocialAccount(req.query.teamId)
            let socialAccountId = []
            teamsSocialAccount.map(t => { socialAccountId.push(t.account_id) })
            let socialAccount = await teamLibs.getTeamSocialAccount(socialAccountId, req.query.network)
            let account_ids = [];
            socialAccount.map(x => account_ids.push(x.account_id))
            let SocialAccountStats = await teamLibs.socialAccountStatsForTeam(req.body.userScopeId, account_ids)
            let lockedAccounts = await teamLibs.getLockedAccountsForTeam(account_ids)
            return SuccessResponse(res, { socialAccount, SocialAccountStats, lockedAccounts })
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async getSocialAccountCount(req, res, next) {
        //Check team is there or not
        try {
            let checkUserAlreadyAdded = await teamLibs.checkUserAlreadyAdded(req.body.userScopeId, req.query.teamId)
            if (!checkUserAlreadyAdded) return ErrorResponse(res, "Sorry, either team not found or you don't have access of those accounts!")
            let teamsSocialAccount = await teamLibs.getTeamsSocialAccount(req.query.teamId)
            let socialAccountId = []
            teamsSocialAccount.map(t => { socialAccountId.push(t.account_id) })
            let socialAccount = await teamLibs.getTeamSocialAccountCount(socialAccountId)

            return SuccessResponse(res, socialAccount)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async searchTeam(req, res, next) {
        //Check team is there or not
        try {
            let filteredTeams;
            let teamMemberDetails;
            let memberProfileDetails;
            let teamInformation = await teamLibs.teamForUserSearch(req.body.userScopeId, req.query.teamName)
            if (!teamInformation) return ErrorResponse(res, "User don't have any team")
            filteredTeams = teamInformation;
            let teamSocialAccount = await teamLibs.teamSocialAccount(teamInformation)
            let teamMembers = await teamLibs.teamMembers(teamInformation)
            teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers)
            memberProfileDetails = await teamLibs.memberProfileDetails(req.body.userScopeId)
            let data = { totalSearchResult: teamSocialAccount.length, teamSocialAccountDetails: teamSocialAccount, teamMembers: teamMembers, memberProfileDetails: teamMemberDetails, socialAccounts: memberProfileDetails }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async searchSocialAccounts(req, res, next) {
        try {
            let teamInformation = await teamLibs.teamForUserSpecific(req.body.userScopeId, req.query.teamId)
            if (!teamInformation) return ErrorResponse(res, "User don't have any team")
            let teamSocialAccount = await teamLibs.searchTeamSocialAccount(teamInformation, req.body.SocialAccountInfo)
            let SocialAccountStats = await teamLibs.searchSocialAccountStats(req.body.userScopeId, teamSocialAccount[0])
            let data = { teamSocialAccountDetails: teamSocialAccount[0], SocialAccountStats }
            return SuccessResponse(res, data)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

}

export default new TeamController()