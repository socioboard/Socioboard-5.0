const FriendsServices = require('../../../feeds/core/friends/utils/friendlibs');
const friendsServices = new FriendsServices();

const untiTestLibs = require('../../../library/utility/unitTestLibs');
expect.extend(untiTestLibs);
const userId = 1;
const teamId = 5;
const accountId = 6;
describe('getTwitterFollowers', () => {

    test('getTwitterFollowers_ShouldReturnSuccess_ValidInputs', () => {
        var cursorValue = -1;
        return friendsServices.getTwitterFollowers(userId, accountId, teamId, cursorValue)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getTwitterFollowers_ShouldReturnError_InvalidAccountId', () => {
        var cursorValue = '-1';
        return friendsServices.getTwitterFollowers(userId, 5847961, teamId, cursorValue)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Account isnt belongs to team or account is locked for the team!');
            });
    });

    test('getTwitterFollowers_ShouldReturnError_MissingInputs', () => {
        var cursorValue = -1;
        return friendsServices.getTwitterFollowers(userId, accountId, '', cursorValue)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify your inputs: 1. Account id *`));
            });
    });

    test('getTwitterFollowers_ShouldReturnError_MissingCursorValue', () => {
        return friendsServices.getTwitterFollowers(userId, accountId, 5, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Please validate the cursor value!');
            });
    });

    test('getTwitterFollowers_ShouldReturnError_InvalidTeamOfUser', () => {
        return friendsServices.getTwitterFollowers(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getTwitterFollowers_ShouldReturnError_InvalidTwtAccount', () => {
        return friendsServices.getTwitterFollowers(userId, 1, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });


});

describe('getTwitterFollowing', () => {

    test('getTwitterFollowing_ShouldReturnSuccess_ValidInputs', () => {
        return friendsServices.getTwitterFollowing(userId, accountId, teamId, 'test', -1)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getTwitterFollowing_ShouldReturnError_InvalidAccountId', () => {
        return friendsServices.getTwitterFollowing(userId, 8547961, teamId, 'testing', 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getTwitterFollowing_ShouldReturnError_MissingInputs', () => {
        return friendsServices.getTwitterFollowing(userId, '', teamId, 'test', 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getTwitterFollowing_ShouldReturnError_MissingCursorValue', () => {
        return friendsServices.getTwitterFollowing(userId, accountId, 5, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Please validate the cursor value!');
            });
    });

    test('getTwitterFollowing_ShouldReturnError_InvalidTeamOfUser', () => {
        return friendsServices.getTwitterFollowing(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getTwitterFollowing_ShouldReturnError_InvalidTwtAccount', () => {
        return friendsServices.getTwitterFollowing(userId, 1, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getTwitterSearchUser', () => {

    test('getTwitterSearchUser_ShouldReturnSuccess_ValidInputs', () => {
        return friendsServices.getTwitterSearchUser(userId, accountId, teamId, 'twitter', 1)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getTwitterSearchUser_ShouldReturnError_InvalidAccountId', () => {
        return friendsServices.getTwitterSearchUser(userId, 8547961, teamId, 'twitter', 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Account isnt belongs to team or account is locked for the team!');
            });
    });

    test('getTwitterSearchUser_ShouldReturnError_MissingInputs', () => {
        return friendsServices.getTwitterSearchUser(userId, accountId, teamId, '', 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getTwitterSearchUser_ShouldReturnError_MissingPageIdValue', () => {
        return friendsServices.getTwitterSearchUser(userId, accountId, '', 'test', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getTwitterSearchUser_ShouldReturnError_InvalidTeamOfUser', () => {
        return friendsServices.getTwitterSearchUser(userId, 6, 456786, 'test', 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getTwitterSearchUser_ShouldReturnError_InvalidTwtAccount', () => {
        return friendsServices.getTwitterSearchUser(userId, 1, teamId, 'test', 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});