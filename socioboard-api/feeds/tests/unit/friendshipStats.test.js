const FeedServices = require('../../core/friendshipstats/utils/friendshipstatslibs');
const feedServices = new FeedServices();

const unitTestLibs = require('../../../library/utility/unitTestLibs');

expect.extend(unitTestLibs.expect);

// 've to add for remaining profiles.
const userId = 1;
const teamId = 5;
const fbAccountId = 1;
const fbPageId = 2;
const twtAccountId = 6;


describe('getFbProfileStats', () => {

    test('getFbProfileStats_ShouldReturnSuccess_ValidInputs', () => {
        return feedServices.getFbProfileStats(userId, fbAccountId, teamId)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('getFbProfileStats_ShouldReturnError_InvalidInputs', () => {
        return feedServices.getFbProfileStats(userId, '', teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getFbProfileStats_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getFbProfileStats(userId, fbAccountId, 456786)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getFbProfileStats_ShouldReturnError_InvalidFbAccount', () => {
        return feedServices.getFbProfileStats(userId, 7, teamId)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getFbPageStats', () => {

    test('getFbPageStats_ShouldReturnSuccess_ValidInputs', () => {
        return feedServices.getFbPageStats(userId, fbPageId, teamId)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('getFbPageStats_ShouldReturnError_InvalidInputs', () => {
        return feedServices.getFbPageStats(userId, '', teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getFbPageStats_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getFbPageStats(userId, fbPageId, 456786)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getFbPageStats_ShouldReturnError_InvalidFbPageAccount', () => {
        return feedServices.getFbPageStats(userId, 7, teamId)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getTwtProfileStats', () => {

    test('getTwtProfileStats_ShouldReturnSuccess_ValidInputs', () => {
        return feedServices.getLookUp(userId, twtAccountId, teamId)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('getTwtProfileStats_ShouldReturnError_InvalidInputs', () => {
        return feedServices.getLookUp(userId, '', teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getTwtProfileStats_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getLookUp(userId, twtAccountId, 456786)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getTwtProfileStats_ShouldReturnError_InvalidTwtAccount', () => {
        return feedServices.getLookUp(userId, 1, teamId)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});