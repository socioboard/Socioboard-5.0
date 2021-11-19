import TeamService from './team.service.js';

class TeamController {
  async getDetails(req, res, next) {
    /* 	#swagger.tags = ['Team']
                #swagger.description = 'Details of users with team information'
                #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
            }] */
    return await TeamService.getDetails(req, res, next);
  }

  async getSocialProfiles(req, res, next) {
    /* 	#swagger.tags = ['Team']
                #swagger.description = 'Get All social account by user'
                #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await TeamService.getSocialProfiles(req, res, next);
  }

  async getSocialProfilesById(req, res, next) {
    /* 	#swagger.tags = ['Team']
                #swagger.description = 'Get All social account by user By account Id'
                #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['accountId'] = {
               in: 'query',
               description: 'Enter account id',
               required: false,
               }
       } */
    return await TeamService.getSocialProfilesById(req, res, next);
  }

  async updateRatings(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Update Ratings for a social account'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Enter account id',
                required: true,
                }
            #swagger.parameters['rating'] = {
                in: 'query',
                description: 'Provide rating',
                required: true,
                }
        } */
    return await TeamService.updateRatings(req, res, next);
  }

  async lockProfiles(req, res, next) {
    /* #swagger.tags = ['Team']
           #swagger.description = 'Lock a social profiles'
           #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['lockprofile'] = {
                in: 'body',
                description: 'User credentials.',
                required: true,
                schema: { $ref: "#/definitions/lockProfile" }
        } */
    return await TeamService.lockProfiles(req, res, next);
  }

  async unlockProfiles(req, res, next) {
    /*  #swagger.tags = ['Team']
            #swagger.description = 'Unlock a social account'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['unlockprofile'] = {
                in: 'body',
                description: 'User credentials.',
                required: true,
                schema: { $ref: "#/definitions/lockProfile" }
        } */
    return await TeamService.unlockProfiles(req, res, next);
  }

  async getProfileRedirectUrl(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = To get profile redirectUrl for specified Network
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['teamId'] = {
            in: 'query',
            require:true
        }
            #swagger.parameters['network'] = {
                in: 'query',
                default: 'Facebook',
            enum: ["Facebook", "FacebookPage","FacebookGroup", "Twitter", "LinkedIn", "LinkedInCompany", "Youtube", "GoogleAnalytics", "Instagram","InstagramBusiness" ,"Pinterest"]

        } */
    return await TeamService.getProfileRedirectUrl(req, res, next);
  }

  async updateFeedsCron(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Update cron running times for feeds fetching per day default 1 you can set to 2'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Enter account id',
                required: true,
                }
            #swagger.parameters['cronvalue'] = {
                in: 'query',
                description: 'Daily how many times feeds cron runs',
                required: true,
                default: '1',
                enum:["1","2"]

                }
        } */
    return await TeamService.updateFeedsCron(req, res, next);
  }

  async createTeam(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Create a team'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['TeamInfo'] = {
                in: 'body',
                description: 'User team information',
                required: true,
                schema: { $ref: "#/definitions/teamDetails" }
        } */
    return await TeamService.createTeam(req, res, next);
  }

  async editTeam(req, res, next) {
    /*  #swagger.tags = ['Team']
            #swagger.description = 'Edit a team details'
            #swagger.auto = false */
    /*  #swagger.security = [{
           "AccessToken": []
            }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            }
            #swagger.parameters['TeamInfo'] = {
            in: 'body',
            description: 'User team to edit',
            required: true,
            schema: { $ref: "#/definitions/teamDetails" }
        } */

    return await TeamService.editTeam(req, res, next);
  }

  async deleteTeam(req, res, next) {
    /*  #swagger.tags = ['Team']
            #swagger.description = 'Delete a team'
            #swagger.auto = false */
    /*  #swagger.security = [{
           "AccessToken": []
            }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            }
        } */
    return await TeamService.deleteTeam(req, res, next);
  }

  async inviteTeam(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Invite a user to a team'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            }
            #swagger.parameters['Email'] = {
            in: 'query',
            description: 'Email',
            required: false,
            }
            #swagger.parameters['name'] = {
            in: 'query',
            description: 'Name',
            required: false,
            }
            #swagger.parameters['Permission'] = {
            in: 'query',
            description: 'description: Permission 2- Admin, 1- full permission , 0 - Approval required',
            default: '1',
               enum:["0","1","2"]
            } */
    return await TeamService.inviteTeam(req, res, next);
  }

  async getTeamInvitations(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Get all team invite '
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await TeamService.getTeamInvitations(req, res, next);
  }

  async acceptInvitation(req, res, next) {
    /* #swagger.tags = ['Team']
           #swagger.description = 'Accept team Invitation'
           #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            } */
    return await TeamService.acceptInvitation(req, res, next);
  }

  async declineTeamInvitation(req, res, next) {
    /* #swagger.tags = ['Team']
           #swagger.description = 'Decline team invitation'
           #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            } */
    return await TeamService.declineTeamInvitation(req, res, next);
  }

  async withdrawInvitation(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Withdraw a invite'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            }
            #swagger.parameters['Email'] = {
            in: 'query',
            description: 'Email',
            required: false,
            } */
    return await TeamService.withdrawInvitation(req, res, next);
  }

  async removeTeamMember(req, res, next) {
    /*  #swagger.tags = ['Team']
            #swagger.description = 'Remove a member from team'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            }
            #swagger.parameters['memberId'] = {
            in: 'query',
            description: 'memberId',
            required: false,
            } */
    return await TeamService.removeTeamMember(req, res, next);
  }

  async leaveFromTeam(req, res, next) {
    /*  #swagger.tags = ['Team']
            #swagger.description = 'Leave from a team'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            } */
    return await TeamService.leaveFromTeam(req, res, next);
  }

  async editTeamMemberPermission(req, res, next) {
    /* #swagger.tags = ['Team']
           #swagger.description = 'Edit a member permission'
           #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            }
            #swagger.parameters['memberId'] = {
            in: 'query',
            description: 'memberId',
            required: false,
            }
            #swagger.parameters['Permission'] = {
            in: 'query',
            description: 'description: Permission 2- Admin, 1- full permission , 0 - Approval required',
            default: '1',
            enum:["0","1","2"]
          } */
    return await TeamService.editTeamMemberPermission(req, res, next);
  }

  async getTeamDetails(req, res, next) {
    /*  #swagger.tags = ['Team']
            #swagger.description = 'Get details of a team'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*  #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id.',
            required: true,
            } */
    return await TeamService.getTeamDetails(req, res, next);
  }

  async addOtherTeamSocialProfiles(req, res, next) {
    /* #swagger.tags = ['Team']
           #swagger.description = 'Add the others to TeamSocialProfiles'
           #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Enter account id',
                required: false,
                }
            #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter the Team Id',
                required: false,
                }
        } */
    return await TeamService.addOtherTeamSocialProfiles(req, res, next);
  }

  async deleteTeamSocialProfile(req, res, next) {
    /* 	#swagger.tags = ['Team']
             #swagger.description = 'Remove the SocialProfiles from Team ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Enter account id',
                required: false,
                }
            #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter the Team Id',
                required: false,
                }
        } */
    return await TeamService.deleteTeamSocialProfile(req, res, next);
  }

  async getAvailableTeamMembers(req, res, next) {
    /* #swagger.tags = ['Team']
           #swagger.description = 'Get Available Team Members '
           #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */

    return await TeamService.getAvailableTeamMembers(req, res, next);
  }

  async getAvailableInvitedMembers(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Get available Invited Member'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await TeamService.getAvailableInvitedMembers(req, res, next);
  }

  async getAvailableSocialAccounts(req, res, next) {
    /* #swagger.tags = ['Team']
           #swagger.description = 'Get Available Social Accounts to add to a team'
           #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await TeamService.getAvailableSocialAccounts(req, res, next);
  }

  async lockTeam(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Lock a team'
            #swagger.auto = false */
    /*  #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['lockTeam'] = {
                in: 'body',
                description: 'User team to lock',
                required: true,
                schema: { $ref: "#/definitions/lockProfile" }
        } */
    return await TeamService.lockTeam(req, res, next);
  }

  async unlockTeam(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Unlock a team'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['unlockTeam'] = {
                in: 'body',
                description: 'Team should unlock.',
                required: true,
                schema: { $ref: "#/definitions/lockProfile" }
        } */
    return await TeamService.unlockTeam(req, res, next);
  }

  async getTeamSocialAccount(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Unlock a team'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team id'
            }
             #swagger.parameters['network'] = {
                in: 'query',
                default: '0',
                description: '0-All,1-Facebook,2-FacebookPage,3-FacebookGroup,4-Twitter,5-Instagram,6-LinkedIn,7-LinkedInCompany,8-GooglePlus,9-Youtube,10-GoogleAnalytics,11-Pinterest,12-InstagramBusiness',
                enum: ["0","1", "2","3", "4", "5", "6", "7", "8", "9","10" ,"11","12"]
            } */
    return await TeamService.getTeamSocialAccount(req, res, next);
  }

  async getSocialAccountCount(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Unlock a team'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team id'
            } */
    return await TeamService.getSocialAccountCount(req, res, next);
  }

  async searchTeam(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Search a team by name'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['teamName'] = {
                in: 'query',
                description: 'Name of team'
            } */
    return await TeamService.searchTeam(req, res, next);
  }

  async searchSocialAccounts(req, res, next) {
    /* 	#swagger.tags = ['Team']
            #swagger.description = 'Search a team by name'
            #swagger.auto = false */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Id of team'
            }
            #swagger.parameters['criteria'] = {
            in: 'body',
            description: 'User team to edit',
            required: true,
            schema: { $ref: "#/definitions/searchSocialAccount" }
            } */
    return await TeamService.searchSocialAccounts(req, res, next);
  }
}
export default new TeamController();
