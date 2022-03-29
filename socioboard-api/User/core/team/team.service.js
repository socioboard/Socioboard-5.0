import lodash from 'lodash';
import config from 'config';
import TeamLibs from '../../../Common/Models/team.model.js';
import validate from './team.validate.js';
import {
  SuccessResponse,
  ValidateErrorResponse,
  ErrorResponse,
  CatchResponse,
} from '../../../Common/Shared/response.shared.js';
import SendEmailServices from '../../../Common/Services/mail-base.services.js';
const teamLibs = new TeamLibs();

class TeamController {
  constructor() {
    this.sendEmailServices = new SendEmailServices(config.get('mailService'));
  }

  async getSocialProfiles(req, res, next) {
    try {
      const response = await teamLibs.getSocialProfiles(req.body.userScopeId);

      if (response.length == 0)
        return ErrorResponse(res, "User don't have any social Accounts!");
      SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getSocialProfilesById(req, res, next) {
    try {
      const {accountId} = req.query;
      const {value, error} = await validate.addOtherTeamSocialProfilesById({
        accountId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const response = await teamLibs.getSocialProfilesById(
        req.body.userScopeId,
        req.query.accountId
      );

      if (response.length == 0)
        return ErrorResponse(res, "User don't have any social Accounts!");
      SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async updateRatings(req, res, next) {
    // accountId
    try {
      const socialAccount = await teamLibs.getSocialAccount(
        req.body.userScopeId,
        req.query.accountId
      );
      if (socialAccount.length == 0)
        return ErrorResponse(
          res,
          'No account or user dont have access to account'
        );
      const response = await teamLibs.updateRatings(
        req.query.accountId,
        req.query.rating
      );
      if (response.length === 0)
        return ErrorResponse(res, "User don't have any social Accounts!");

      return SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async lockProfiles(req, res, next) {
    try {
      const accounts = await teamLibs.getSocialAccount(
        req.body.userScopeId,
        req.body
      );

      if (accounts.length == 0)
        return ErrorResponse(
          res,
          'Sorry, either accounts not found or you dont have access of those accounts!'
        );
      const response = await teamLibs.lockProfile(accounts);
      const updatedProfiles = [];

      accounts.map(t => updatedProfiles.push(String(t.account_id)));
      const errorProfiles = lodash.pullAll(req.body, updatedProfiles);
      const data = {updatedProfiles, errorProfiles};

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async unlockProfiles(req, res, next) {
    try {
      const accounts = await teamLibs.getSocialAccount(
        req.body.userScopeId,
        req.body
      );

      if (accounts.length == 0)
        return ErrorResponse(
          res,
          'Sorry, either accounts not found or you dont have access of those accounts!'
        );
      const response = await teamLibs.unlockProfiles(accounts);
      const updatedProfiles = [];

      accounts.map(t => updatedProfiles.push(String(t.account_id)));
      const erroredProfiles = lodash.pullAll(req.body, updatedProfiles);
      const data = {updatedProfiles, errorProfiles: erroredProfiles};

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
    // res.send(req.body)
  }

  async getProfileRedirectUrl(req, res, next) {
    return teamLibs
      .getProfileRedirectUrl(
        req.body.userScopeId,
        req.query.teamId,
        req.query.network,
        req.headers['x-access-token'],
        req.body.userScopeAvailableNetworks
      )
      .then(result => {
        res.status(200).json(result);
      })
      .catch(error => {
        res
          .status(200)
          .json({code: 403, status: 'failed', error: error.message});
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
    return teamLibs
      .addSocialProfile(
        req.body.userScopeId,
        req.body.userScopeName,
        req.query,
        req.body.userScopeMaxAccountCount,
        req.body.userScopeAvailableNetworks
      )
      .then(result => {
        res.status(200).json(result);
      })
      .catch(error => {
        res
          .status(200)
          .json({code: 403, status: 'failed', message: error.message});
      });
  }

  async updateFeedsCron(req, res, next) {
    try {
      const socialAccount = await teamLibs.getSocialAccount(
        req.body.userScopeId,
        req.query.accountId
      );

      if (socialAccount.length == 0)
        return ErrorResponse(
          res,
          "No account or user don't have access to account"
        );
      const response = await teamLibs.updateCrons(
        req.query.accountId,
        req.query.cronvalue
      );

      if (response.length == 0)
        return ErrorResponse(res, "User don't have any social Accounts!");
      SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getDetails(req, res, next) {
    try {
      let filteredTeams;
      let teamMemberDetails;
      let memberProfileDetails;
      const teamInformation = await teamLibs.teamForUser(req.body.userScopeId);

      if (!teamInformation)
        return ErrorResponse(res, "User don't have any team");
      filteredTeams = teamInformation;
      const teamSocialAccount = await teamLibs.teamSocialAccount(
        teamInformation
      );
      const teamMembers = await teamLibs.teamMembers(teamInformation);

      teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers);
      memberProfileDetails = await teamLibs.memberProfileDetails(
        req.body.userScopeId
      );
      const data = {
        teamSocialAccountDetails: teamSocialAccount,
        teamMembers,
        memberProfileDetails: teamMemberDetails,
        socialAccounts: memberProfileDetails,
      };
      this.updateSocialAccountStats(memberProfileDetails);
      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getTeamDetails(req, res) {
    try {
      let filteredTeams;
      let teamMemberDetails;
      let memberProfileDetails;
      const teamInformation = await teamLibs.teamForUserSpecific(
        req.body.userScopeId,
        req.query.teamId
      );
      if (!teamInformation)
        return ErrorResponse(res, "User don't have any team");
      filteredTeams = teamInformation;
      const teamSocialAccount = await teamLibs.teamSocialAccount(
        teamInformation
      );
      const teamMembers = await teamLibs.teamMembers(teamInformation);
      teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers);
      memberProfileDetails = await teamLibs.memberProfileDetails(
        req.body.userScopeId
      );
      let teamMemberDetail = [];
      teamMembers[0]?.map(y => {
        teamMemberDetails[0]?.map(x => {
          if (x.user_id == y.user_id)
            teamMemberDetail.push({
              ...x,
              invitation_accepted: y.invitation_accepted,
              left_from_team: y.left_from_team,
              permission: y.permission,
            });
        });
      });
      const SocialAccountStats = await teamLibs.socialAccountStats(
        req.body.userScopeId
      );
      const pinterestAccountDetails = await teamLibs.getTeamBoard(
        req.body.userScopeId,
        req.query.teamId
      );
      const data = {
        teamSocialAccountDetails: teamSocialAccount[0],
        SocialAccountStats,
        teamMembers: teamMembers[0],
        memberProfileDetails: teamMemberDetail,
        socialAccounts: memberProfileDetails[0],
        pinterestAccountDetails,
      };
      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async createTeam(req, res, next) {
    try {
      const {value, error} = validate.createTeam(req.body.TeamInfo);

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const teamInfo = await teamLibs.getTeamInfo(
        req.body.userScopeId,
        req.body.TeamInfo.name
      );

      if (teamInfo)
        return ErrorResponse(res, 'User has already team with same name!');
      const response = await teamLibs.createTeam(
        req.body.userScopeId,
        req.body.TeamInfo
      );

      return SuccessResponse(res, response);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async editTeam(req, res, next) {
    try {
      const {value, error} = validate.createTeam(req.body.TeamInfo);

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      const teamInfo = await teamLibs.getTeamInfoId(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!teamInfo)
        return ErrorResponse(res, 'Team not found or access denied!');

      const teamName = await teamLibs.getTeamInfo(
        req.body.userScopeId,
        req.body.TeamInfo.name
      );

      if (teamName && teamName.team_id != req.query.teamId)
        return ErrorResponse(res, 'User has already team with same name!');

      const result = await teamLibs.editTeam(
        req.body.TeamInfo,
        req.query.teamId
      );

      if (result) return SuccessResponse(res, result);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async deleteTeam(req, res, next) {
    try {
      // const { value, error } = validate.deleteTeam(req.query.teamId)
      // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)
      const teamInfo = await teamLibs.getTeamInfoId(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!teamInfo)
        return ErrorResponse(res, 'Team not found or access denied!');
      if (teamInfo.is_default_team)
        return ErrorResponse(res, "Sorry, You can't delete default team.");
      const usersTeam = await teamLibs.getAllTeamOfUser(req.body.userScopeId);
      const usersTeamIds = [];

      usersTeam.forEach(element => {
        usersTeamIds.push(String(element.team_id));
      });
      const teamsAccount = await teamLibs.getAllteamsAccount(usersTeamIds);

      if (teamsAccount && teamsAccount.length > 0) {
        const availableAccounts = [];
        const deleteAccounts = [];
        const currentTeamAccounts = [];

        teamsAccount.forEach(element => {
          if (element.team_id == req.query.teamId) {
            currentTeamAccounts.push(element.account_id);
          }
          availableAccounts.push(element.account_id);
        });
        if (availableAccounts.length > 0) {
          const countWiseArray = lodash.countBy(availableAccounts, Math.floor);
          const uniqueAccountList = lodash.uniq(availableAccounts);

          uniqueAccountList.forEach(element => {
            const availableCount = countWiseArray[element];

            if (availableCount == 1) {
              deleteAccounts.push(element);
            }
          });
          const filteredDeleteAccounts = lodash.intersection(
            currentTeamAccounts,
            deleteAccounts
          );

          if (filteredDeleteAccounts.length > 0) {
            const socialAccounts = await teamLibs.deleteSocialAccount(
              filteredDeleteAccounts
            );
            let deleteTeam;

            if (socialAccounts)
              deleteTeam = await teamLibs.deleteTeam(req.query.teamId);
            if (deleteTeam) return SuccessResponse(res, teamInfo);
          }
          const deleteTeam = await teamLibs.deleteTeam(req.query.teamId);

          if (deleteTeam) return SuccessResponse(res, teamInfo);
        }
        const deleteTeam = await teamLibs.deleteTeam(req.query.teamId);

        if (deleteTeam) return SuccessResponse(res, teamInfo);
      } else {
        const deleteTeam = await teamLibs.deleteTeam(req.query.teamId);

        if (deleteTeam) return SuccessResponse(res, teamInfo);
      }
      //  let result = await teamLibs.editTeam(req.body.TeamInfo, req.query.teamId)
      //  if (result) return responseformat(res, 200, null, "success")
      return SuccessResponse(res, usersTeamIds);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async inviteTeam(req, res) {
    // Check team is there or not
    try {
      const {teamId, Email, Permission} = req.query;
      const {error} = await validate.inviteTeam({
        teamId,
        Email,
        Permission,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const teamInfo = await teamLibs.isValidTeam(
        req.body.userScopeId,
        req.query.teamId
      );
      if (!teamInfo)
        return ErrorResponse(res, 'Team not found or access denied!');
      if (req.body.userScopeEmail == req.query.Email)
        return ErrorResponse(res, 'Already member of the team');

      const checkUserDetails = await teamLibs.isUserRegistered(req.query.Email);

      if (!checkUserDetails) {
        await teamLibs.addTeamDetails(
          teamId,
          req.query.name ?? '',
          req.body.userScopeId,
          Email,
          Permission
        );
        const htmlContent = this.sendEmailServices.template.invite_team_user
          .replace('[FirstName]', `${req.query.name ?? ''}`)
          .replace(
            '[RegisterLink]',
            `${config.get('user_socioboard.mail_url')}/register`
          )
          .replace('[teamname]', `${teamInfo.team_name ?? ''}`)
          .replace('[inviteduser]', `${req.body.userScopeName}`);
        let emailDetails = {
          subject: `SocioBoard Team Invitation By ${req.body.userScopeName}`,
          toMail: Email,
          htmlContent,
        };
        await this.sendEmailServices.sendMails(
          config.get('mailService.defaultMailOption'),
          emailDetails
        );
        return SuccessResponse(
          res,
          `User not found in SocioBoard. Sent a invitation mail to join your team.`
        );
      }

      if (checkUserDetails?.Activations?.activation_status === 0)
        return ErrorResponse(res, `User's email not activated.`);

      const count = await teamLibs.getTotalTeamMember(req.body.userScopeId);
      const availableMemberCount = req.body.userScopeMaxAccountCount - count;

      if (availableMemberCount <= 0)
        return ErrorResponse(
          res,
          "Sorry, As per your plan, you can't invite any more user."
        );

      // Checking that, we already invited the same user or not
      const checkUserAlreadyAdded = await teamLibs.checkUserAlreadyAdded(
        checkUserDetails.user_id,
        req.query.teamId
      );

      if (checkUserAlreadyAdded)
        return ErrorResponse(res, 'Same user already invited or left the team');

      await teamLibs.addTeamMember(
        checkUserDetails.user_id,
        req.query.teamId,
        req.body.userScopeId,
        req.query.Permission
      );
      // notification part

      if (config.get('notification_socioboard.status') == 'on') {
        await teamLibs.sendUserNotification(
          `${req.body.userScopeName} invited to join ${teamInfo.team_name} Team.`,
          teamInfo.team_name,
          'team_invite',
          req.body.userScopeName,
          'success',
          checkUserDetails.user_id,
          checkUserDetails.user_id
        );
      }

      return SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async unlockTeam(req, res, next) {
    // Check team is there or not
    try {
      const teams = await teamLibs.getTeamDetails(
        req.body.userScopeId,
        req.body
      );

      if (teams == 0)
        return ErrorResponse(
          res,
          "Sorry, either team not found or you dont have access of those accounts!"
        );
      const response = await teamLibs.unlockTeam(teams);
      const updatedProfiles = [];

      teams.map(t => updatedProfiles.push(String(t.team_id)));
      const erroredProfiles = lodash.pullAll(req.body, updatedProfiles);
      const data = {updatedTeam: updatedProfiles, errorTeam: erroredProfiles};

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async lockTeam(req, res, next) {
    try {
      const teams = await teamLibs.getTeamDetails(
        req.body.userScopeId,
        req.body
      );

      if (teams == 0)
        return ErrorResponse(
          res,
          'Sorry, either team not found or you dont have access of those accounts!'
        );
      const response = await teamLibs.lockTeam(teams);
      const updatedProfiles = [];

      teams.map(t => updatedProfiles.push(String(t.team_id)));
      const erroredProfiles = lodash.pullAll(req.body, updatedProfiles);
      const data = {updatedTeam: updatedProfiles, errorTeam: erroredProfiles};

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getTeamInvitations(req, res, next) {
    try {
      let invitationData = [];
      const teamInformation = await teamLibs.teamInformation(
        req.body.userScopeId
      );
      const list = await teamInformation.Team.map(i =>
        teamLibs.teamDetails(i.team_id)
      );
      const data = await Promise.all(list);

      if (data) {
        const listTeam = data.map(i =>
          teamLibs.teamUser(i[0].team_admin_id, i[0])
        );

        invitationData = await Promise.all(listTeam);
      }

      return SuccessResponse(res, invitationData);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async acceptInvitation(req, res, next) {
    try {
      const userTeamJoinTableInfo = await teamLibs.userTeamJoinTableInfo(
        req.body.userScopeId,
        req.query.teamId,
        req.body.userScopeName
      );

      if (!userTeamJoinTableInfo)
        return ErrorResponse(res, "You don't have invitation for this team!");
      const response = await teamLibs.acceptTeam(
        req.body.userScopeId,
        req.query.teamId
      );
      const teamDetails = await teamLibs.teamInfoResponse(req.query.teamId);

      if (response[0] != 0) {
        const acceptedTeam = await teamLibs.userTeamJoinTableInfo(
          req.body.userScopeId,
          req.query.teamId,
          req.body.userScopeName
        );
        // notification part

        if (config.get('notification_socioboard.status') == 'on') {
          await teamLibs.sendUserNotification(
            `${req.body.userScopeName} accepted your invitation for ${teamDetails.team_name} team.`,
            teamDetails.team_name,
            'team_accept',
            req.body.userScopeName,
            'success',
            userTeamJoinTableInfo.invited_by,
            userTeamJoinTableInfo.invited_by
          );
        }

        return SuccessResponse(res, acceptedTeam);
      }

      return ErrorResponse(res, 'Sorry! Something went wrong.');
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async declineTeamInvitation(req, res, next) {
    try {
      const userTeamJoinTableInfo = await teamLibs.userTeamJoinTableDecline(
        req.body.userScopeId,
        req.query.teamId,
        req.body.userScopeName
      );

      if (!userTeamJoinTableInfo)
        return ErrorResponse(
          res,
          "You don't have invitation for this team or You already a member of this team!"
        );
      const declineTeam = await teamLibs.declineTeam(
        req.body.userScopeId,
        req.query.teamId
      );
      const teamDetails = await teamLibs.teamInfoResponse(req.query.teamId);

      if (config.get('notification_socioboard.status') == 'on') {
        await teamLibs.sendUserNotification(
          `${req.body.userScopeName} declined your invitation for joining a ${teamDetails.team_name} team.`,
          teamDetails.team_name,
          'team_decline',
          req.body.userScopeName,
          'success',
          userTeamJoinTableInfo.invited_by,
          userTeamJoinTableInfo.invited_by
        );
      }

      return SuccessResponse(res, declineTeam);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async withdrawInvitation(req, res, next) {
    try {
      const {value, error} = await validate.withdrawTeam(req.query);

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const teamInfo = await teamLibs.getTeamInfoId(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!teamInfo)
        return ErrorResponse(res, 'Team not found or access denied!');
      const checkUserDetails = await teamLibs.isUserRegistered(req.query.Email);

      if (!checkUserDetails)
        return ErrorResponse(
          res,
          `No such email registered with ${config.get('applicationName')}!`
        );
      const withDraw = await teamLibs.withDraw(
        checkUserDetails.user_id,
        req.query.teamId
      );

      if (withDraw == 0)
        return ErrorResponse(
          res,
          'No more invitation are present to withdraw or You already a member of the team!'
        );

      return SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async removeTeamMember(req, res, next) {
    try {
      const {teamId, memberId} = req.query;
      const {value, error} = await validate.removeTeamMember({
        teamId,
        memberId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const teamInfo = await teamLibs.checkTeamDetails(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!teamInfo) return ErrorResponse(res, 'Not found or access denied!');
      const user = await teamLibs.getUser(memberId);

      if (!user)
        return ErrorResponse(
          res,
          `No such member registered with ${config.get('applicationName')}!`
        );
      const removeFromTeam = await teamLibs.removeFromTeam(
        teamId,
        user.user_id,
        req.body.userScopeId
      );

      if (removeFromTeam == 0)
        return ErrorResponse(res, 'Already removed from your team.');
      // notification part
      if (config.get('notification_socioboard.status') == 'on') {
        await teamLibs.sendUserNotification(
          `You have been removed from team(${teamInfo.team_name})`,
          teamInfo.team_name,
          'team_removeTeamMember',
          req.body.userScopeName,
          'success',
          user.user_id,
          user.user_id
        );
      }

      return SuccessResponse(
        res,
        null,
        `Successfully removed member(${memberId}) from team(${teamId})`
      );
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
      const {teamId} = req.query;
      const {userScopeId, userScopeName} = req.body;
      const {value, error} = validate.deleteTeam({teamId});

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const checkTeam = await teamLibs.checkTeamUser(userScopeId, teamId);

      if (!checkTeam)
        return ErrorResponse(
          res,
          'No such team or you are not a part of team!'
        );
      if (checkTeam.left_from_team)
        return ErrorResponse(res, 'You are not a part of team!');

      const teamInfoResponse = await teamLibs.teamInfoResponse(teamId);

      if (teamInfoResponse.team_admin_id == userScopeId)
        return ErrorResponse(
          res,
          "Admin can't leave the leave, rather delete the team!"
        );
      const targetTeamsId = [];

      targetTeamsId.push(teamId);
      const leaveFromTeam = await teamLibs.leaveFromTeam(teamId, userScopeId);

      if (config.get('notification_socioboard.status') == 'on') {
        await teamLibs.sendTeamNotifications(
          `${userScopeName} left from ${teamInfoResponse.team_name} team.`,
          teamInfoResponse.team_name,
          'team_leave',
          userScopeName,
          'success',
          targetTeamsId,
          teamId
        );
      }
      // if (!leaveFromTeam) return responseformat(res, 400, null, "No such team or you are not a part of team!", null)
      // notification part
      return SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async editTeamMemberPermission(req, res, next) {
    try {
      const {teamId, memberId, Permission} = req.query;
      // const { userScopeId, userScopeName } = req.body
      const {value, error} = await validate.editTeamMemberPermission({
        teamId,
        memberId,
        Permission,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const teamInfo = await teamLibs.checkTeamDetails(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!teamInfo) return ErrorResponse(res, 'Not found or access denied!');
      const checkTeam = await teamLibs.checkTeamUser(memberId, teamId);

      if (!checkTeam) return ErrorResponse(res, 'No such member found!');
      if (checkTeam.left_from_team)
        return ErrorResponse(res, 'You are not a part of team!');
      const updatePermission = await teamLibs.updatePermission(
        teamId,
        memberId,
        Permission
      );

      if (config.get('notification_socioboard.status') == 'on') {
        await teamLibs.sendUserNotification(
          `Team Admin has changed your Team permission to ${
            Permission == 1
              ? 'fullPermission'
              : Permission == 2
              ? 'admin'
              : 'approvalNeeded'
          } `,
          teamInfo.team_name,
          'team_editMemberPermission',
          req.body.userScopeName,
          'success',
          memberId,
          memberId
        );
      }

      return SuccessResponse(res, updatePermission);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async addOtherTeamSocialProfiles(req, res, next) {
    try {
      const {accountId, teamId} = req.query;
      const {error} = await validate.addOtherTeamSocialProfiles({
        accountId,
        teamId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      await teamLibs.otherTeamDetails(req.body.userScopeId, teamId);

      let addTeam;
      const socialAcc = await teamLibs.getSocialaAccDetails(accountId);

      if (socialAcc)
        addTeam = await teamLibs.addTeams(
          req.body.userScopeId,
          teamId,
          accountId
        );

      return SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async deleteTeamSocialProfile(req, res, next) {
    try {
      let status;
      const {accountId, teamId} = req.query;
      const {userScopeId} = req.body;
      const {value, error} = validate.deleteTeamSocialProfile({
        accountId,
        teamId,
        userScopeId,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);

      await teamLibs.otherTeamDetails(req.body.userScopeId, teamId);

      const socialAcc = await teamLibs.getSocialaAccDetails(accountId);

      if (!socialAcc)
        return ErrorResponse(
          res,
          "Not found or You aren't an admin for an account!",
          402
        );
      status = await teamLibs.removeAccount(teamId, accountId);

      return SuccessResponse(res, status, 'success');
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getAvailableTeamMembers(req, res, next) {
    try {
      let teamMemberDetails;
      const teamInformation = await teamLibs.teamForUser(req.body.userScopeId);

      if (!teamInformation)
        return ErrorResponse(res, "User don't have any team");
      const teamMembers = await teamLibs.teamMembers(teamInformation);
      const updatedProfiles = [];

      teamMembers.map(teamResponse =>
        teamResponse.map(t => {
          if (t.invitation_accepted) updatedProfiles.push(String(t.user_id));
        })
      );
      const unique = [...new Set(updatedProfiles)];

      teamMemberDetails = await teamLibs.getAvailableTeamMember(unique);

      return SuccessResponse(res, teamMemberDetails);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getAvailableInvitedMembers(req, res, next) {
    try {
      let teamMemberDetails;
      const teamInformation = await teamLibs.teamForUser(req.body.userScopeId);

      if (!teamInformation)
        return ErrorResponse(res, "User don't have any team");
      const teamMembers = await teamLibs.teamMembers(teamInformation);
      const updatedProfiles = [];
      const invitedMember = [];

      teamMembers.map(teamResponse =>
        teamResponse.map(t => {
          if (t.invitation_accepted) updatedProfiles.push(String(t.user_id));
          else invitedMember.push(String(t.user_id));
        })
      );
      const unique = [...new Set(updatedProfiles)];
      const uniqueInvited = [...new Set(invitedMember)];
      const difference = [
        ...new Set(uniqueInvited.filter(x => !unique.includes(x))),
      ];
      const data = {unique, uniqueInvited, difference};

      teamMemberDetails = await teamLibs.getAvailableTeamMember(difference);

      return SuccessResponse(res, teamMemberDetails);
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
      const teamInformation = await teamLibs.teamForUser(req.body.userScopeId);

      if (!teamInformation)
        return ErrorResponse(res, "User don't have any team");
      filteredTeams = teamInformation;
      const teamSocialAccount = await teamLibs.teamSocialAccount(
        teamInformation
      );
      const updatedProfiles = [];
      // teamSocialAccount.map(teamResponse => teamResponse.map(social-account => social-account.map(t => {
      //     updatedProfiles.push(String(t.account_id))
      // }))
      // )

      teamSocialAccount.map(teamResponse =>
        teamResponse.map(te =>
          te.SocialAccount.map(t => updatedProfiles.push(String(t.account_id)))
        )
      );
      const unique = [...new Set(updatedProfiles)];
      const teamMembers = await teamLibs.teamMembers(teamInformation);

      teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers);
      memberProfileDetails = await teamLibs.memberProfileDetails(
        req.body.userScopeId
      );
      // let data = { teamSocialAccountDetails: teamSocialAccount, teamMembers: teamMembers, memberProfileDetails: teamMemberDetails, socialAccounts: memberProfileDetails }

      return SuccessResponse(res, memberProfileDetails);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getTeamSocialAccount(req, res, next) {
    // Check team is there or not
    try {
      const checkUserAlreadyAdded = await teamLibs.checkUserAlreadyAdded(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!checkUserAlreadyAdded)
        return ErrorResponse(
          res,
          "Sorry, either team not found or you dont have access of those accounts!"
        );
      const teamsSocialAccount = await teamLibs.getTeamsSocialAccount(
        req.query.teamId
      );
      const socialAccountId = [];

      teamsSocialAccount.map(t => {
        socialAccountId.push(t.account_id);
      });
      const socialAccount = await teamLibs.getTeamSocialAccount(
        socialAccountId,
        req.query.network
      );
      const account_ids = [];

      socialAccount.map(x => account_ids.push(x.account_id));
      const SocialAccountStats = await teamLibs.socialAccountStatsForTeam(
        req.body.userScopeId,
        account_ids
      );
      const lockedAccounts = await teamLibs.getLockedAccountsForTeam(
        account_ids
      );

      return SuccessResponse(res, {
        socialAccount,
        SocialAccountStats,
        lockedAccounts,
      });
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async getSocialAccountCount(req, res, next) {
    // Check team is there or not
    try {
      const checkUserAlreadyAdded = await teamLibs.checkUserAlreadyAdded(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!checkUserAlreadyAdded)
        return ErrorResponse(
          res,
          "Sorry, either team not found or you dont have access of those accounts!"
        );
      const teamsSocialAccount = await teamLibs.getTeamsSocialAccount(
        req.query.teamId
      );
      const socialAccountId = [];

      teamsSocialAccount.map(t => {
        socialAccountId.push(t.account_id);
      });
      const socialAccount = await teamLibs.getTeamSocialAccountCount(
        socialAccountId
      );

      return SuccessResponse(res, socialAccount);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async searchTeam(req, res, next) {
    // Check team is there or not
    try {
      let filteredTeams;
      let teamMemberDetails;
      let memberProfileDetails;
      const teamInformation = await teamLibs.teamForUserSearch(
        req.body.userScopeId,
        req.query.teamName
      );

      if (!teamInformation)
        return ErrorResponse(res, "User don't have any team");
      filteredTeams = teamInformation;
      const teamSocialAccount = await teamLibs.teamSocialAccount(
        teamInformation
      );
      const teamMembers = await teamLibs.teamMembers(teamInformation);

      teamMemberDetails = await teamLibs.teamMemberDetails(teamMembers);
      memberProfileDetails = await teamLibs.memberProfileDetails(
        req.body.userScopeId
      );
      const data = {
        totalSearchResult: teamSocialAccount.length,
        teamSocialAccountDetails: teamSocialAccount,
        teamMembers,
        memberProfileDetails: teamMemberDetails,
        socialAccounts: memberProfileDetails,
      };

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async searchSocialAccounts(req, res, next) {
    try {
      const teamInformation = await teamLibs.teamForUserSpecific(
        req.body.userScopeId,
        req.query.teamId
      );

      if (!teamInformation)
        return ErrorResponse(res, "User don't have any team");
      const teamSocialAccount = await teamLibs.searchTeamSocialAccount(
        teamInformation,
        req.body.SocialAccountInfo
      );
      const SocialAccountStats = await teamLibs.searchSocialAccountStats(
        req.body.userScopeId,
        teamSocialAccount[0]
      );
      const pinterestAccountDetails = await teamLibs.getTeamBoard(
        req.body.userScopeId,
        req.query.teamId
      );
      const data = {
        teamSocialAccountDetails: teamSocialAccount[0],
        SocialAccountStats,
        pinterestAccountDetails,
      };

      return SuccessResponse(res, data);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To check social account stats and update
   * Function To check social account stats and update
   * @param  {object} data -Account details.
   */
  async updateSocialAccountStats(data) {
    data?.map(async x => {
      await teamLibs.socialAccountDetails(x.account_id);
    });
  }
}

export default new TeamController();
