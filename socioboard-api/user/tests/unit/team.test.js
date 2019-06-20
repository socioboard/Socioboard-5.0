const TeamLibs = require('../../core/team/utils/teamlibs');
const matchers = require('../../../library/utility/unitTestLibs');
const teamLibs = new TeamLibs();
const userId = 1;
const config = require('config');
const accessToken = config.get('jest.access_token');

expect.extend(matchers.expect);

beforeAll(() => {
    return unitTestLibs.initialize(config.get('mongo'));
});

describe('getTeams', () => {
    test('getTeams_ShouldReturnSuccess_ValidUserId', () => {
        return teamLibs.getTeams(userId)
            .then((result) => {
                expect(result).toHaveProperty('memberProfileDetails');
            });
    });
    test('getTeams_ShouldReturnFailed_InvalidUserIdAsZero', () => {
        return teamLibs.getTeams(0)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });
    test('getTeams_ShouldReturnFailed_UnavailableUserId', () => {
        return teamLibs.getTeams(9999999)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Cant able to fetch the team for respective user!');
            });
    });
    test('getTeams_ShouldReturnFailed_MissingUserId', () => {
        return teamLibs.getTeams('')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });
    test('getTeams_ShouldReturnFailed_NullUserId', () => {
        return teamLibs.getTeams(null)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Invalid Inputs");
            });
    });
});

describe('getTeamDetails', () => {

    test('getTeamDetails_ShouldReturnSuccess_ValidInputs', () => {
        return teamLibs.getTeamDetails(userId, 1)
            .then((result) => {
                expect(result).toHaveProperty('teamSocialAccountDetails');
            });
    });
    test('getTeamDetails_ShouldReturnError_InvalidTeamId', () => {
        return teamLibs.getTeamDetails(userId, 9999999)
            .catch((error) => {
                expect(error.message).toMatch('Team not found!');
            });
    });
    test('getTeamDetails_ShouldReturnError_InvalidUserIdAsZero', () => {
        return teamLibs.getTeamDetails(0, 1)
            .catch((error) => {
                expect(error.message).toMatch('Invalid Inputs');
            });
    });
    test('getTeamDetails_ShouldReturnError_NullInputs', () => {
        return teamLibs.getTeamDetails(null, null)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });
    test('getTeamDetails_ShouldReturnError_MissingInputs', () => {
        return teamLibs.getTeamDetails('', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });
    test('getTeamDetails_ShouldReturnError_TeamIdNotBelongsToUserId', () => {
        return teamLibs.getTeamDetails(userId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Team not found!");
            });
    });
});

describe('getSocialProfile', () => {

    test('getSocialProfile_ShouldReturnSuccess_ValidUserId', () => {
        return teamLibs.getSocialProfiles(userId)
            .then((result) => {
                expect(result).toBeArray();
            });
    });

    test('getSocialProfile_ShouldReturnSuccess_ValidUserWithNoSocialAccount', () => {
        return teamLibs.getSocialProfiles(3)
            .then((result) => {
                expect(result).toBeArray();
            });
    });

    test('getSocialProfile_ShouldReturnSuccess_UnavailableUser', () => {
        return teamLibs.getSocialProfiles(9999999)
            .then((result) => {
                expect(result).toBeArray();
            });
    });

    test('getSocialProfile_ShouldReturnError_InvalidUserId', () => {
        return teamLibs.getSocialProfiles(0)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getSocialProfile_ShouldReturnError_MissingInputs', () => {
        return teamLibs.getSocialProfiles('')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getSocialProfile_ShouldReturnError_NullInputs', () => {
        return teamLibs.getSocialProfiles(null)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('team_create', () => {

    test('createTeam_editTeam_deleteTeam_ShouldReturnSuccess_ValidInputs', () => {

        var teamDescrition = {
            "name": "Unit Test : Create_Team",  // should change for create new one
            "description": "Its created while running unit test",
            "logoUrl": "https://scontent.fblr2-1.fna.fbcdn.net/v/t1.0-1/c0.9.50.50a/p50x50/10407171_1557826594469930_9127429714957434578_n.jpg?_nc_cat=108&_nc_ht=scontent.fblr2-1.fna&oh=34efe3fc84b45311999550114964b1a8&oe=5D2BB38C"
        };

        var teamId = null;

        return teamLibs.createTeam(userId, teamDescrition)
            .then((result) => {
                teamId = result.team_id;
                expect(result).toHaveProperty('team_id');
                return;
            })
            .then(() => {
                teamDescrition.name = "Unit Test : Create_Team(Edited)";
                return teamLibs.editTeam(userId, teamId, teamDescrition)
                    .then((result) => {
                        expect(result).toHaveProperty('team_name', 'Unit Test : Create_Team(Edited)');
                    });
            })
            .then(() => {
                return teamLibs.deleteTeam(userId, teamId)
                    .then((result) => {
                        expect(result).toHaveProperty('team_id', teamId);
                    });

            });
    });

    test('createTeam_ShouldReturnError_ExistingTeamName', () => {
        var teamDescrition = {
            "name": "Socioboard",  // should change for create new one
            "description": "Its created while running unit test",
            "logoUrl": "https://scontent.fblr2-1.fna.fbcdn.net/v/t1.0-1/c0.9.50.50a/p50x50/10407171_1557826594469930_9127429714957434578_n.jpg?_nc_cat=108&_nc_ht=scontent.fblr2-1.fna&oh=34efe3fc84b45311999550114964b1a8&oe=5D2BB38C"
        };
        return teamLibs.createTeam(userId, teamDescrition)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User has already team with same name!');
            });
    });

    test('createTeam_ShouldReturnError_MissingUser', () => {
        var teamDescrition = {
            "name": "string",
            "description": "string",
            "logoUrl": "www.string.com"
        };
        return teamLibs.createTeam('', teamDescrition)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Invalid Inputs");
            });
    });

    test('createTeam_ShouldReturnError_MissingTeamDescription', () => {
        return teamLibs.createTeam(userId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Invalid Inputs");
            });
    });

    test('createTeam_ShouldReturnError_MissingInputs', () => {
        return teamLibs.createTeam('', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Invalid Inputs");
            });
    });

    test('createTeam_ShouldReturnError_NullInputs', () => {
        return teamLibs.createTeam(null, null)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Invalid Inputs");
            });
    });

});

describe('team_edit', () => {

    test('editTeam_ShouldReturnError_NullTeamInfo', () => {
        return teamLibs.editTeam(userId, 1, null)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('editTeam_ShouldReturnError_InvalidTeamInfo', () => {
        var newTeamdescription = {
            "name": "Team Name",
            "description": "Team Description",
            "logoUrl": "invalidurl"
        };
        return teamLibs.editTeam(userId, 1, newTeamdescription)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('editTeam_ShouldReturnError_MissingUserId', () => {

        var teamDescription = {
            "name": "Socioboard",  // should change for create new one
            "description": "Its created while running unit test",
            "logoUrl": "https://scontent.fblr2-1.fna.fbcdn.net/v/t1.0-1/c0.9.50.50a/p50x50/10407171_1557826594469930_9127429714957434578_n.jpg?_nc_cat=108&_nc_ht=scontent.fblr2-1.fna&oh=34efe3fc84b45311999550114964b1a8&oe=5D2BB38C"
        };
        return teamLibs.editTeam('', 1, teamDescription)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('editTeam_ShouldReturnError_MissingTeamId', () => {
        var teamDescription = {
            "name": "Socioboard",  // should change for create new one
            "description": "Its created while running unit test",
            "logoUrl": "https://scontent.fblr2-1.fna.fbcdn.net/v/t1.0-1/c0.9.50.50a/p50x50/10407171_1557826594469930_9127429714957434578_n.jpg?_nc_cat=108&_nc_ht=scontent.fblr2-1.fna&oh=34efe3fc84b45311999550114964b1a8&oe=5D2BB38C"
        };
        return teamLibs.editTeam(userId, '', teamDescription)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('editTeam_ShouldReturnError_UnavailableTeamId', () => {
        var teamDescription = {
            "name": "Socioboard",  // should change for create new one
            "description": "Its created while running unit test",
            "logoUrl": "https://scontent.fblr2-1.fna.fbcdn.net/v/t1.0-1/c0.9.50.50a/p50x50/10407171_1557826594469930_9127429714957434578_n.jpg?_nc_cat=108&_nc_ht=scontent.fblr2-1.fna&oh=34efe3fc84b45311999550114964b1a8&oe=5D2BB38C"
        };
        return teamLibs.editTeam(userId, 9999999, teamDescription)
            .catch((error) => {
                expect(error.message).toMatch('Team not found or access denied!');
            });
    });

    test('editTeam_ShouldReturnError_TeamIdNotBelongsToUser', () => {
        var teamDescription = {
            "name": "Socioboard",  // should change for create new one
            "description": "Its created while running unit test",
            "logoUrl": "https://scontent.fblr2-1.fna.fbcdn.net/v/t1.0-1/c0.9.50.50a/p50x50/10407171_1557826594469930_9127429714957434578_n.jpg?_nc_cat=108&_nc_ht=scontent.fblr2-1.fna&oh=34efe3fc84b45311999550114964b1a8&oe=5D2BB38C"
        };
        return teamLibs.editTeam(2, 1, teamDescription)
            .catch((error) => {
                expect(error.message).toMatch('Team not found or access denied!');
            });
    });

});

describe('team_delete', () => {

    test('deleteTeam_ShouldReturnError_DeleteDefaultTeam', () => {
        return teamLibs.deleteTeam(1, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Sorry, You can't delete default team.");
            });
    });

    test('deleteTeam_ShouldReturnError_UnavailableTeam', () => {
        return teamLibs.deleteTeam(userId, 9999999)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Team not found or access denied!');
            });
    });

    test('deleteTeam_ShouldReturnError_MissingUserId', () => {
        return teamLibs.deleteTeam('', 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('deleteTeam_ShouldReturnError_MissingTeamId', () => {
        return teamLibs.deleteTeam(userId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('deleteTeam_ShouldReturnError_NullInputs', () => {
        return teamLibs.deleteTeam(null, null)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('deleteTeam_shouldReturnError_UnavailableUserId', () => {
        return teamLibs.deleteTeam(9999999, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Team not found or access denied!');
            });
    });

});


describe.skip('team_invite', () => {

    test('inviteTeam_shouldReturn_successForValidInput', () => {
        var userName = "admin";
        var teamId = 3;
        var email = 'testuser@socioboard.com';

        const result = teamLibs.inviteTeam(userId, userName, teamId, email, 1, 5);
        expect(result).resolves.toEqual('Invitation sent!');

    });

    test('inviteTeam_shouldReturn_errorForWrongInput', () => {
        var userName = "user";
        var teamId = 2;
        var email = '';
        return teamLibs.inviteTeam(userId, userName, teamId, email, 1, 5)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('inviteTeam_shouldReturn_errorForInvalidTeamId', () => {
        var userName = "user";
        var teamId = 24;
        var email = 'testuser@socioboard.com';
        return teamLibs.inviteTeam(userId, userName, teamId, email, 1, 5)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('inviteTeam_shouldReturn_errorForInvalidEmail', () => {
        var userName = "user";
        var teamId = 2;
        var email = 'str@gmial.com';
        return teamLibs.inviteTeam(userId, userName, teamId, email, 1, 5)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('inviteTeam_shouldReturn_errorForMaxInvitations', () => {
        var userName = "user";
        var teamId = 2;
        var email = 'testuser@socioboard.com';
        return teamLibs.inviteTeam(userId, userName, teamId, email, 1, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('inviteTeam_shouldReturn_errorForMissingInputs', () => {
        var userName = "suresh";
        var teamId = 14;
        return teamLibs.inviteTeam(userId, userName, '', '', 1, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('decline_invitation', () => {

    //     // 1st one response time error and remaining all are working properly.

    test('invitationDecline_shouldReturn_successForValidInput', () => {
        var teamId = 9;
        var userName = "Socioboard";

        const result = teamLibs.declineTeamInvitation(1, teamId, userName);
        expect(result).resolves.toEqual(1);
    });


    test('invitationDecline_shouldReturn_errorForInvalidInput', () => {
        var teamId = 21;
        var userName = "";
        return teamLibs.declineTeamInvitation(2, teamId, userName)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('invitationDecline_shouldReturn_errorForInvalidTeamId', () => {
        var teamId = 16;
        var userName = "Socioboard";
        const error = teamLibs.declineTeamInvitation(userId, teamId, userName);
        expect(error).rejects.toHaveProperty('message');
        // expect(error).toHaveProperty('message');

    });

});

describe.skip('getTeamMembers', () => {

    test('getTeamMembers_shouldReturn_successMessagForValidInputs', () => {
        var userId = 1;
        // var category = Math.floor(Math.random([0, 3]));
        var category = 1;
        return teamLibs.getTeamMembers(userId, Number(category))
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getTeamMembers_shouldReturn_errorMessageForInvalidInputs', () => {
        var userId = 4;
        var category = 1;
        return teamLibs.getTeamMembers(userId, Number(category))
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getTeamMembers_shouldReturn_errorMessageForMissingInputs', () => {
        var userId = 1;
        return teamLibs.getTeamMembers(userId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('getTeam_invitations', () => {

    test('getTeamInvitaions_shouldReturn_successForValidInputs', () => { // having error 
        return teamLibs.getTeamInvitations(2)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getTeamInvitaions_shouldReturn_failForinValidUserId', () => {
        return teamLibs.getTeamInvitations(22)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getTeamInvitaions_shouldReturn_errorForNullUser', () => {
        return teamLibs.getTeamInvitations("")
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

// // --------------------------

describe.skip('accept_invitaion', () => {

    //     //  we've to test the first two conditions -- success response time

    test('acceptInvitaion_shouldReturn_successMessage', () => {
        var teamId = 5;
        var name = "user";

        const result = teamLibs.acceptTeamInvitation(userId, teamId, name);
        expect(result).resolves.toEqual(1);
    });

    test('acceptInvitaion_shouldReturn_warningMessageForAlreadyAccepted', () => {
        var teamId = 7;
        var name = "user";
        const result = teamLibs.acceptTeamInvitation(userId, teamId, name);
        expect(result).rejects.toHaveProperty('message');
    });

    test('acceptInvitaion_shouldReturn_failedMessageForInvalidUserId', () => {
        var teamId = 2;
        var name = "socioboard";
        return teamLibs.acceptTeamInvitation('', teamId, name)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('acceptInvitaion_shouldReturn_failedMessageForInvalidTeamId', () => {
        var teamId = 20;
        var name = "socioboard";
        const error = teamLibs.acceptTeamInvitation(userId, teamId, name);
        expect(error).rejects.toHaveProperty('message');

    });

    test('acceptInvitaion_shouldReturn_failedMessageForNullInputs', () => {
        var teamId = 20;
        var name = "socioboard";
        return teamLibs.acceptTeamInvitation('', '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('acceptInvitaion_shouldReturn_failedMessageForInvalidInputs', () => {
        var teamId = 25;
        var name = "socioboard";
        return teamLibs.acceptTeamInvitation(userId, teamId, name)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('removeTeamMember', () => {

    test('removeTeamMember_shouldReturn_successMessageForValidInpts.', () => {
        var teamId = 5;
        var memberId = 2;
        return teamLibs.removeTeamMember(userId, teamId, memberId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('removeTeamMember_shouldReturn_errorMessageForInvalidInputs.', () => {
        return teamLibs.removeTeamMember(userId, 4, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('removeTeamMember_shouldReturn_errorMessageForMissingInputs.', () => {
        return teamLibs.removeTeamMember(userId, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('withdraw_invitation', () => {

    test('invitaionWithdraw_shouldReturn_successMessageForValidInputs', () => {
        var teamId = 8;
        var email = "testuser@socioboard.com";
        return teamLibs.withdrawInvitation(1, teamId, email)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });

    test('invitaionWithdraw_shouldReturn_errorMessageForInValidInputs', () => {
        var teamId = 16;
        var email = "testadmin@socioboard.com";
        return teamLibs.withdrawInvitation(userId, teamId, email)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('invitaionWithdraw_shouldReturn_errorMessageForNullInputs', () => {
        var teamId = 17;
        var email = "string1@gmial.com";
        return teamLibs.withdrawInvitation('', '', email)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('getProfileRedirectUrl', () => {

    test('getProfileRedirectUrl_shouldReturn_successMessageForValidInputs', () => {
        var teamId = 3;
        var network = 'Facebook';
        var userNetworkScopes = '1-2-3-4-5-6';
        return teamLibs.getProfileRedirectUrl(userId, teamId, network, accessToken, userNetworkScopes)
            .then((result) => {
                expect(result).toHaveProperty('navigateUrl');
            });
    });

    test('getProfileRedirectUrl_shouldReturn_warningMessageForInvalidTeamId', () => {
        var teamId = 16;
        var network = 'Facebook';
        var userNetworkScopes = '1-2-3-4-5-6';
        return teamLibs.getProfileRedirectUrl(userId, teamId, network, accessToken, userNetworkScopes)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getProfileRedirectUrl_shouldReturn_errorMessageForInvalidNetwork', () => {
        var teamId = 17;
        var network = 'Facebook';
        var userNetworkScopes = '4-5';
        return teamLibs.getProfileRedirectUrl(userId, teamId, network, accessToken, userNetworkScopes)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getProfileRedirectUrl_shouldReturn_errorMessageForNullNetwork', () => {
        var teamId = 17;
        var network = '';
        var userNetworkScopes = '4-5';
        return teamLibs.getProfileRedirectUrl(userId, teamId, network, accessToken, userNetworkScopes)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getProfileRedirectUrl_shouldReturn_errorMessageForinValidInputs', () => {
        var teamId = 16;
        var network = '';
        var userNetworkScopes = '1-2-3-4-5-6';
        return teamLibs.getProfileRedirectUrl('', teamId, network, '', userNetworkScopes)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('addBulkSocialProfiles', () => {

    test('addBulkSocialProfiles_shouldreturn_successMessageForvalidInputs', () => {
        console.log('bulk add is prohibited without proper access token and information.');
        // var userName = 'socioboard-admin';
        // var queryInputs = [
        //     {
        //         "account_type": "2",
        //         "user_name": "12465671",
        //         "first_name": "suresh",
        //         "last_name": "babu",
        //         "email": "",
        //         "social_id": "12465671",
        //         "profile_pic_url": "www.string.com",
        //         "cover_pic_url": "www.string.com",
        //         "profile_url": "www.string.com",
        //         "access_token": "EAAKYvwDVmnUBAIkvRhkMqNyvJnUaWwZBnqc1LWn1E7wOZAs0Tq0XzvzdWLh4fgHf03zT9puLZB0CbalyVsIqHTdSXRRDnh3JRxdZCZAzZA346uAVKqoucZB3ZCsqTLSJH78NsnwdKLpgUXoY8ZByXBzW8YZCsZBkBiZCaOup6HcDk6fhMQZDZD",
        //         "refresh_token": "EAAKYvwDVmnUBAIkvRhkMqNyvJnUaWwZBnqc1LWn1E7wOZAs0Tq0XzvzdWLh4fgHf03zT9puLZB0CbalyVsIqHTdSXRRDnh3JRxdZCZAzZA346uAVKqoucZB3ZCsqTLSJH78NsnwdKLpgUXoY8ZByXBzW8YZCsZBkBiZCaOup6HcDk6fhMQZDZD",
        //         "friendship_counts": "0",
        //         "info": "string"
        //     }]
        // return teamLibs.addBulkSocialProfiles(userId, 3, queryInputs, 20, '1-2-3-4-5-6-7-8')
        //     .then((result) => {
        //         expect(result).not.toHaveProperty('message');
        //     })
    });

    test('addBulkSocialProfiles_shouldreturn_failedMessageForInvalidInputs', () => {
        var userName = '';
        var queryInputs = {
            "account_type": "string",
            "user_name": "string",
            "first_name": "string",
            "last_name": "string",
            "email": "string",
            "social_id": "string",
            "profile_pic_url": "www.string.com",
            "cover_pic_url": "www.string.com",
            "profile_url": "www.string.com",
            "access_token": "string",
            "refresh_token": "string",
            "friendship_counts": "0",
            "info": "string"
        };
        return teamLibs.addBulkSocialProfiles(userId, 3, queryInputs, 20, '1-2-3-4-5-6-7-8')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

// // --------------------------
describe.skip('deleteSocialAccount', () => {

    test('deleteSocialAccount_shouldReturn_successMessageForValidInputs', () => {
        var accountId = 2;
        return teamLibs.deleteSocialProfile(userId, accountId)
            .then((success) => {
                expect(success).toMatch('success');
            });
    });

    test('deleteSocialAccount_shouldReturn_failedMessageForInvalidInputs', () => {
        var accountId = 20;
        return teamLibs.deleteSocialProfile(userId, accountId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('deleteSocialAccount_shouldReturn_failedMessageForMissingInputs', () => {
        return teamLibs.deleteSocialProfile(userId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('addOtherTeamAcount', () => {

    test('addOtherTeamAcount_shouldReturn_successMessageForValidInputs', () => {
        var accountId = 1;
        var teamId = 1;
        var userId = 1;
        return teamLibs.addOtherTeamSocialProfiles(userId, teamId, accountId)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });

    test('addOtherTeamAcount_shouldReturn_errorMessageForInvalidTeamId', () => {
        var accountId = 1;
        var teamId = 16;
        return teamLibs.addOtherTeamSocialProfiles(userId, teamId, accountId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('addOtherTeamAcount_shouldReturn_successMessageForInvalidInputs', () => {
        var accountId = '';
        var teamId = 17;
        return teamLibs.addOtherTeamSocialProfiles(userId, teamId, accountId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('deleteTeamSocialProfile', () => {

    test('deleteTeamSocialProfile_shouldReturn_successMessageForValidInputs', () => {
        var TeamId = 1;
        var AccountId = 1;
        var userScopeName = "Admin";
        return teamLibs.deleteTeamSocialProfile(userId, TeamId, AccountId, userScopeName)
            .then((result) => {
                expect(result).toMatch('success');
            });
    });

    test('deleteTeamSocialProfile_shouldReturn_errorMessageForInvalidInputs', () => {
        var TeamId = 20;
        var AccountId = 1;
        var userScopeName = "Admin";
        return teamLibs.deleteTeamSocialProfile(userId, TeamId, AccountId, userScopeName)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('deleteTeamSocialProfile_shouldReturn_errorMessageForMissiedInputs', () => {
        var TeamId = 17;
        var AccountId = '';
        var userScopeName = "Admin";
        return teamLibs.deleteTeamSocialProfile(userId, TeamId, AccountId, userScopeName)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('leaveFromTeam', () => {

    //     // first 2 should check - respose time
    test('leaveFromTeam_shouldReturn_successMessageForValidInputs', () => {
        var TeamId = 6;
        var userScopeName = "socioboard-user";
        const result = teamLibs.leaveFromTeam(4, TeamId, userScopeName);
        expect(result).resolves.toEqual('success');

    });

    test('leaveFromTeam_shouldReturn_warningMessageForValidInputs', () => {
        var TeamId = 3;
        var userScopeName = "socioboard-user";
        return teamLibs.leaveFromTeam(userId, TeamId, userScopeName)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('leaveFromTeam_shouldReturn_errorForInvalidInputs', () => {
        var TeamId = 20;
        var userScopeName = "suresh";
        return teamLibs.leaveFromTeam(userId, TeamId, userScopeName)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('leaveFromTeam_shouldReturn_errorMessagesForMissinginputs', () => {
        var TeamId = '';
        var userScopeName = "suresh";
        return teamLibs.leaveFromTeam(userId, TeamId, userScopeName)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe.skip('editTeamMemberPermission', () => {

    test('editTeamMemberPermission_shouldReturn_successMessageForValidInput', () => {
        var TeamId = 6;
        var MemberId = 2;
        var Permission = 0;
        return teamLibs.editTeamMemberPermission(userId, TeamId, MemberId, Permission)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('editTeamMemberPermission_shouldReturn_errorMessageForInvalidInput', () => {
        var TeamId = 14;
        var MemberId = 16;
        var Permission = 1;
        return teamLibs.editTeamMemberPermission(userId, TeamId, MemberId, Permission)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('editTeamMemberPermission_shouldReturn_errorMessageForMissingInput', () => {
        var TeamId = 17;
        var MemberId = '';
        var Permission = 1;
        return teamLibs.editTeamMemberPermission(userId, TeamId, MemberId, Permission)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('editTeamMemberPermission_shouldReturn_errorMessageForInvalidMemberId', () => {
        var TeamId = 17;
        var MemberId = 22;
        var Permission = 1;
        return teamLibs.editTeamMemberPermission(userId, TeamId, MemberId, Permission)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('lockProfile', () => {

    test('lockProfile_ShouldReturnSuccess_ValidInputs', () => {
        return teamLibs.lockProfiles(2, ['3'])
            .then((result) => {
                expect(result).toHaveProperty('updatedProfiles');
            });
    });

    test('lockProfile_ShouldReturnError_AccountNotBelongsToUser', () => {
        return teamLibs.lockProfiles(2, ['1'])
            .catch((error) => {
                expect(error).toHaveProperty('message', "Sorry, either accounts not found or you dont have access of those accounts!");
            });
    });

    test('lockProfile_ShouldReturnError_UnavailableUser', () => {
        return teamLibs.lockProfiles(9999999, ['1'])
            .catch((error) => {
                expect(error).toHaveProperty('message', "Sorry, either accounts not found or you dont have access of those accounts!");
            });
    });

    test('lockProfile_ShouldReturnError_MissingSocialAccounts', () => {
        return teamLibs.lockProfiles(2, [''])
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('lockProfile_ShouldReturnError_MissingUserId', () => {
        return teamLibs.lockProfiles('', ['1'])
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('unLockProfile', () => {

    test('unLockProfile_ShouldReturnSuccess_ValidInputs', () => {
        return teamLibs.unlockProfiles(2, ['3'])
            .then((result) => {
                expect(result).toHaveProperty('updatedProfiles');
            });
    });


    test('unLockProfile_ShouldReturnError_AccountNotBelongsToUser', () => {
        return teamLibs.unlockProfiles(2, ['1'])
            .catch((error) => {
                expect(error).toHaveProperty('message', "Sorry, either accounts not found or you dont have access of those accounts!");
            });
    });

    test('unLockProfile_ShouldReturnError_UnavailableUser', () => {
        return teamLibs.unlockProfiles(9999999, ['1'])
            .catch((error) => {
                expect(error).toHaveProperty('message', "Sorry, either accounts not found or you dont have access of those accounts!");
            });
    });

    test('unLockProfile_ShouldReturnError_MissingSocialAccounts', () => {
        return teamLibs.unlockProfiles(2, [''])
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('unLockProfile_ShouldReturnError_MissingUserId', () => {
        return teamLibs.unlockProfiles('', ['1'])
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });


});


