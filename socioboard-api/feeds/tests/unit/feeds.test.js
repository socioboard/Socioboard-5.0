const FeedServices = require('../../core/networkfeeds/utils/feedlibs');
const feedServices = new FeedServices();

const unitTestLibs = require('../../../library/utility/unitTestLibs');
const config = require('config');
const MongoConnect = require('../../../library/mongoose/connect');

expect.extend(unitTestLibs.expect);

beforeAll(() => {
    var mongoConnect = new MongoConnect();
    mongoConnect.mongoConfiguration = config.get('mongo');
    return mongoConnect.initialize();
});

const userId = 1;
const teamId = 5;

describe('getFacebookFeeds', () => {

    test('getFacebookFeeds_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 1;
        const result = feedServices.getFacebookFeeds(userId, accountId, teamId, 1);
        expect(result).resolves.toBeArray();

    });


    test('getFacebookFeeds_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9694572;
        return feedServices.getFacebookFeeds(userId, accountId, teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getFacebookFeeds_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getFacebookFeeds(userId, accountId, teamId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Please validate the page id!');
            });
    });

    test('getFacebookFeeds_ShouldReturnError_MissingInputs', () => {
        return feedServices.getFacebookFeeds(userId, '', teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify your inputs: 1. Account id *`));
            });
    });

    test('getFacebookFeeds_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getFacebookFeeds(userId, 1, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getFacebookFeeds_ShouldReturnError_InvalidFbAccount', () => {
        return feedServices.getFacebookFeeds(userId, 7, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getRecentFbFeeds', () => {
    test('getRecentFbFeeds_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 1;
        const result = feedServices.getRecentFbFeeds(userId, accountId, teamId, 1);
        expect(result).resolves.toBeArray();

    });


    test('getRecentFbFeeds_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9694572;
        return feedServices.getRecentFbFeeds(userId, accountId, teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getRecentFbFeeds_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getRecentFbFeeds(userId, accountId, teamId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Please validate the page id!');
            });
    });

    test('getRecentFbFeeds_ShouldReturnError_MissingInputs', () => {
        return feedServices.getRecentFbFeeds(userId, '', teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify account id valid or not!`));
            });
    });

    test('getRecentFbFeeds_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getRecentFbFeeds(userId, 1, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getRecentFbFeeds_ShouldReturnError_InvalidFbAccount', () => {
        return feedServices.getRecentFbFeeds(userId, 7, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });
});


describe('getTweets', () => {

    test('getTweets_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 6;
        const result = feedServices.getTweets(userId, accountId, teamId, 1);
        expect(result).resolves.toBeArray();
    });

    test('getTweets_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9484244;
        return feedServices.getTweets(userId, accountId, teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getTweets_ShouldReturnError_MissingInputs', () => {
        return feedServices.getTweets(userId, '', teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify your inputs: 1. Account id *`));
            });
    });

    test('getTweets_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getTweets(userId, accountId, teamId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Please validate the page id!');
            });
    });

    test('getTweets_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getTweets(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getTweets_ShouldReturnError_InvalidTwtAccount', () => {
        return feedServices.getTweets(userId, 7, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getRecentTweets', () => {

    test('getRecentTweets_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 6;
        const result = feedServices.getRecentTweets(userId, accountId, teamId, 1);
        expect(result).resolves.toBeArray();
    });

    test('getRecentTweets_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9484244;
        return feedServices.getRecentTweets(userId, accountId, teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getRecentTweets_ShouldReturnError_MissingInputs', () => {
        return feedServices.getRecentTweets(userId, '', teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify account id valid or not!`));
            });
    });

    test('getRecentTweets_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getRecentTweets(userId, accountId, teamId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Please validate the page id!');
            });
    });

    test('getRecentTweets_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getRecentTweets(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getRecentTweets_ShouldReturnError_InvalidTwtAccount', () => {
        return feedServices.getRecentTweets(userId, 7, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getHomeTimeLineTweets', () => {

    test('getHomeTimeLineTweets_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 6;
        const result = feedServices.getHomeTimeLineTweets(userId, accountId, teamId);
        expect(result).resolves.toBeObject();
    });

    test('getHomeTimeLineTweets_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9515444;
        return feedServices.getHomeTimeLineTweets(userId, accountId, teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getHomeTimeLineTweets_ShouldReturnError_MissingInputs', () => {
        return feedServices.getHomeTimeLineTweets(userId, 13, '')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify your inputs: 1. Account id *`));
            });
    });

    test('getHomeTimeLineTweets_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getHomeTimeLineTweets(userId, 6, 456786)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getHomeTimeLineTweets_ShouldReturnError_InvalidTwtAccount', () => {
        return feedServices.getHomeTimeLineTweets(userId, 7, teamId)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getMentionTimeLineTweets', () => {

    test('getMentionTimeLineTweets_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 6;
        const result = feedServices.getMentionTimeLineTweets(userId, accountId, teamId);
        expect(result).resolves.toBeObject();
    });

    test('getMentionTimeLineTweets_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9124514;
        return feedServices.getMentionTimeLineTweets(userId, accountId, teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getMentionTimeLineTweets_ShouldReturnError_MissingInputs', () => {
        return feedServices.getMentionTimeLineTweets(userId, '', teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getMentionTimeLineTweets_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getMentionTimeLineTweets(userId, 6, 456786)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getMentionTimeLineTweets_ShouldReturnError_InvalidTwtAccount', () => {
        return feedServices.getMentionTimeLineTweets(userId, 7, teamId)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getTweetsByKeyword', () => {

    test('getTweetsByKeyword_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 6;
        const keyword = "twitter";
        const result = feedServices.getTweetsByKeyword(userId, accountId, teamId, keyword);
        expect(result).resolves.toBeObject();
    });

    test('getTweetsByKeyword_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9142715;
        const keyword = "test";
        return feedServices.getTweetsByKeyword(userId, accountId, teamId, keyword)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getTweetsByKeyword_ShouldReturnError_MissingInputs', () => {
        const accountId = 1;
        const keyword = "test";
        return feedServices.getTweetsByKeyword(userId, '', teamId, keyword)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getTweetsByKeyword_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getTweetsByKeyword(userId, 6, 456786, 'twitter')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getTweetsByKeyword_ShouldReturnError_InvalidTwtAccount', () => {
        return feedServices.getTweetsByKeyword(userId, 7, teamId, 'twitter')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });


});

describe('getCompanyUpdates', () => {

    test('getCompanyUpdates_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 9;
        const result = feedServices.getCompanyUpdates(userId, accountId, teamId);
        expect(result).resolves.toBeArray();
    });

    test('getCompanyUpdates_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 9574142;
        return feedServices.getCompanyUpdates(userId, accountId, teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getCompanyUpdates_ShouldReturnError_MissingInputs', () => {
        return feedServices.getCompanyUpdates(userId, '', teamId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getCompanyUpdates_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getCompanyUpdates(userId, 6, 456786)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getCompanyUpdates_ShouldReturnError_InvalidLinkedInAccount', () => {
        return feedServices.getCompanyUpdates(userId, 1, teamId)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getPinterestPins', () => {

    test('getPinterestPins_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 12;
        const boardId = '772367473533318666';
        return feedServices.getPinterestPins(userId, accountId, teamId, boardId)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('getPinterestPins_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 8767452;
        return feedServices.getPinterestPins(userId, accountId, teamId, '323435235435')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getPinterestPins_ShouldReturnError_InvalidBoardId', () => {
        const accountId = 7;
        return feedServices.getPinterestPins(userId, accountId, teamId, '323435235435')
            .catch((error) => {
                expect(error).toHaveProperty('message', "No profile found or account isn't pinterest profile.");
            });
    });

    test('getPinterestPins_ShouldReturnError_MissingInputs', () => {
        return feedServices.getPinterestPins('', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });


    test('getPinterestPins_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getPinterestPins(userId, 6, 456786, '323435235435')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getPinterestPins_ShouldReturnError_InvalidLinkedInAccount', () => {
        return feedServices.getPinterestPins(userId, 1, teamId, '323435235435')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });


    test('getPinterestPins_ShouldReturnError_InvalidLinkedInAccount', () => {
        return feedServices.getPinterestPins(userId, 12, teamId, '323435235435')
            .catch((error) => {
                expect(error.message).toMatch(`No board found with requested account.`);
            });
    });

});


describe('getYoutubeFeeds', () => {

    test('getYoutubeFeeds_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 10;
        const result = feedServices.getYoutubeFeeds(userId, accountId, teamId, 1);
        expect(result).resolves.toBeArray();
    });

    test('getYoutubeFeeds_ShouldReturnError_InvalidAccountId', () => {
        const accountId = 8945241;
        return feedServices.getYoutubeFeeds(userId, accountId, teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getYoutubeFeeds_ShouldReturnError_MissingInputs', () => {
        return feedServices.getYoutubeFeeds(userId, '', teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify your inputs: 1. Account id *`));
            });
    });


    test('getYoutubeFeeds_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getYoutubeFeeds(userId, accountId, teamId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Please validate the page id!');
            });
    });

    test('getYoutubeFeeds_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getYoutubeFeeds(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getYoutubeFeeds_ShouldReturnError_InvalidYtbAccount', () => {
        return feedServices.getYoutubeFeeds(userId, 1, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getRecentInstagramFeeds', () => {

    test('getInstagramFeeds_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 7;
        const result = feedServices.getRecentInstagramFeeds(userId, accountId, teamId, 1);
        expect(result).resolves.toBeArray();
    });

    test('getInstagramFeeds_ShouldReturnError_InvalidAccountId', () => {
        return feedServices.getRecentInstagramFeeds(userId, 4875954, teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getInstagramFeeds_ShouldReturnError_MissingInputs', () => {
        return feedServices.getRecentInstagramFeeds(userId, '', teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`Please verify your inputs:`));
            });
    });

    test('getInstagramFeeds_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getRecentInstagramFeeds(userId, accountId, teamId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Please validate the page id!');
            });
    });

    test('getInstagramFeeds_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getRecentInstagramFeeds(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getInstagramFeeds_ShouldReturnError_InvalidInstaAccount', () => {
        return feedServices.getRecentInstagramFeeds(userId, 1, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getInstaBusinessFeedsFromDB', () => {

    test('getInstaBusinessFeedsFromDB_ShouldReturnSuccess_ValidInputs', () => {
        const accountId = 7;
        const result = feedServices.getInstaBusinessFeedsFromDB(userId, accountId, teamId, 1);
        expect(result).resolves.toBeArray();
    });

    test('getInstaBusinessFeedsFromDB_ShouldReturnError_InvalidAccountId', () => {
        return feedServices.getInstaBusinessFeedsFromDB(userId, 4875954, teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getInstaBusinessFeedsFromDB_ShouldReturnError_MissingInputs', () => {
        return feedServices.getInstaBusinessFeedsFromDB(userId, '', teamId, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getInstaBusinessFeedsFromDB_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getInstaBusinessFeedsFromDB(userId, accountId, teamId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getInstaBusinessFeedsFromDB_ShouldReturnError_InvalidTeamOfUser', () => {
        return feedServices.getInstaBusinessFeedsFromDB(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getInstaBusinessFeedsFromDB_ShouldReturnError_InvalidInstaAccount', () => {
        return feedServices.getInstaBusinessFeedsFromDB(userId, 1, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getInstagramBusinessFeeds', () => {

    test('getInstagramBusinessFeeds_ShouldReturnSuccess_ValidInputs', () => {
        const result = feedServices.getInstagramBusinessFeeds(7, 1);
        expect(result).resolves.toBeArray();
    });


    test('getInstagramBusinessFeeds_ShouldReturnError_InvalidAccountId', () => {
        return feedServices.getInstagramBusinessFeeds(9842725, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', "No profile found or account isn't instagram business profile.");
            });
    });

    test('getInstagramBusinessFeeds_ShouldReturnError_MissingInputs', () => {
        return feedServices.getInstagramBusinessFeeds('', 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getInstagramBusinessFeeds_ShouldReturnError_InvalidPageId', () => {
        const accountId = 29;
        return feedServices.getInstagramBusinessFeeds(accountId, '')
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});