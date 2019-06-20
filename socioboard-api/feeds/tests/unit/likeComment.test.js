const LikeCommentServices = require('../../core/likecomments/utils/likecommentlibs');
const CoreServices = require('../../../library/utility/coreServices');
const coreServices = new CoreServices();

const logger = require('../../utils/logger');
const config = require('config');
const MongoConnect = require('../../../library/mongoose/connect');
const matchers = require('../../../library/utility/unitTestLibs');
expect.extend(matchers.expect);

const likeCommentServices = new LikeCommentServices();
let newCommentId = '';
const userId = 1;
const teamId = 5;


beforeAll(() => {
    var mongoConnect = new MongoConnect();
    mongoConnect.mongoConfiguration = config.get('mongo');
    return mongoConnect.initialize();
});


describe('facebookLike', () => {

    test('facebookLike_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 2;
        var postId = '2915811841977561';
        return likeCommentServices.facebookLike(userId, accountId, teamId, postId)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('facebookLike_ShouldReturnError_InvalidPostId', () => {
        var accountId = 1;
        var postId = '130514181';
        return likeCommentServices.facebookLike(userId, accountId, teamId, postId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('facebookLike_ShouldReturnError_InvalidAccountId', () => {
        var postId = '130514181353929';
        return likeCommentServices.facebookLike(userId, 1245678, teamId, postId)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });


    test('facebookLike_ShouldReturnError_MissingInputs', () => {
        var accountId = 21;
        return likeCommentServices.facebookLike(userId, accountId, teamId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('facebookLike_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.facebookLike(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('facebookLike_ShouldReturnError_InvalidFbAccount', () => {
        return likeCommentServices.facebookLike(userId, 7, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('facebookComment', () => {

    test('facebookComment_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 2;
        var postId = '2915811841977561';
        var comment = String(coreServices.getRandomCharacters(5));
        return likeCommentServices.facebookComment(userId, accountId, teamId, postId, comment)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('facebookComment_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 699999;
        var postId = '1305141813';
        var comment = "missed.";
        return likeCommentServices.facebookComment(userId, accountId, teamId, postId, comment)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('facebookComment_ShouldReturnError_InvalidPosttId', () => {
        var accountId = 4;
        var postId = '1305141813';
        var comment = "missed.";
        return likeCommentServices.facebookComment(userId, accountId, teamId, postId, comment)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('facebookComment_ShouldReturnError_InvalidCommnet', () => {
        var accountId = 4;
        var postId = '1305141813';
        var comment = "missed.";
        return likeCommentServices.facebookComment(userId, accountId, teamId, postId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('facebookComment_ShouldReturnError_MissingInputs', () => {
        var accountId = 1;
        var postId = '130514181353929';
        return likeCommentServices.facebookComment(userId, accountId, teamId, postId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('facebookComment_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.facebookComment(userId, 6, 456786, 1, 'hey')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('facebookComment_ShouldReturnError_InvalidFbAccount', () => {
        return likeCommentServices.facebookComment(userId, 7, teamId, 1, 'hey')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});


describe('twitterLike', () => {

    test('twitterLike_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 6;
        var tweetId = '1131884577440485376';
        const result = likeCommentServices.twitterLike(userId, accountId, teamId, tweetId);
        expect(result).resolves.toHaveProperty('success');
    });

    test('twitterLike_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 6;
        var tweetId = '1131884577440485376';
        const result = likeCommentServices.twitterLike(userId, accountId, teamId, tweetId);
        expect(result).resolves.toMatch('Successfully liked.');
    });

    test('twitterLike_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 6998485;
        var tweetId = '1131884577440485376';
        return likeCommentServices.twitterLike(userId, accountId, teamId, tweetId)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('twitterLike_ShouldReturnError_InvalidTweetId', () => {
        var accountId = 4;
        var tweetId = '111045129278';
        return likeCommentServices.twitterLike(userId, accountId, teamId, tweetId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('twitterLike_ShouldReturnError_MissingInputs', () => {
        var accountId = 1;
        return likeCommentServices.twitterLike(userId, accountId, teamId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('twitterLike_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.twitterLike(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('twitterLike_ShouldReturnError_InvalidTwtAccount', () => {
        return likeCommentServices.twitterLike(userId, 7, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('twitterDislike', () => {

    test('twitterDislike_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 6;
        var tweetId = '1131884577440485376';
        const result = likeCommentServices.twitterDislike(userId, accountId, teamId, tweetId);
        expect(result).resolves.toEqual('Successfully disliked.');
    });

    test('twitterDislike_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 8578674;
        var tweetId = '1125339981940060160';
        const error = likeCommentServices.twitterDislike(userId, accountId, teamId, tweetId);
        expect(error).rejects.toHaveProperty('message');
    });

    test('twitterDislike_ShouldReturnError_InvalidTweetId', () => {
        var accountId = 4;
        var tweetId = '11104512';
        const error = likeCommentServices.twitterDislike(userId, accountId, teamId, tweetId);
        expect(error).rejects.toHaveProperty('message');
    });


    test('twitterDislike_ShouldReturnError_MissingInputs', () => {
        var accountId = 1;
        return likeCommentServices.twitterDislike(userId, accountId, teamId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('twitterDislike_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.twitterDislike(userId, 6, 456786, '1125339981940060160')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('twitterDislike_ShouldReturnError_InvalidTwtAccount', () => {
        return likeCommentServices.twitterDislike(userId, 7, teamId, '1125339981940060160')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});


describe('twitterComment', () => {

    test('twitterComment_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 6;
        var tweetId = '1131884577440485376';
        var comment = String(coreServices.getRandomCharacters(5));
        var result = likeCommentServices.twitterComment(userId, accountId, teamId, tweetId, comment);
        expect(result).resolves.toHaveProperty('commentId');

        // const data = likeCommentServices.twitterComment(userId, accountId, teamId, tweetId, comment);
        // logger.info(data);
        // data.then((data) => {
        //     if (data) {
        //         console.log(data);
        //         logger.info(data);
        //         newCommentId = data.commentId;
        //         expect(data).res.toHaveProperty('message');
        //     }
        //     console.log('no data is available.');
        // });


        // .then((response) => {
        //     if (response) {
        //         console.log(`Successfully commented and commented id is ${response.commentId}.`);
        //         logger.info(`Successfully commented and commented id is ${response.commentId}.`);

        //         newCommentId = response.commentId;
        //         expect(response).toHaveProperty('message');
        //     }

        //     console.log('no response came...');

        // });


    });

    test('twitterComment_ShouldReturnError_InvalidTweetId', () => {
        var accountId = 4;
        var tweetId = '1110451292';
        var comment = 'great';
        const error = likeCommentServices.twitterComment(userId, accountId, teamId, tweetId, comment);
        expect(error).rejects.toHaveProperty('message');
    });

    test('twitterComment_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 7844885;
        var tweetId = '1125339716457336832';
        var comment = 'great';
        const error = likeCommentServices.twitterComment(userId, accountId, teamId, tweetId, comment);
        expect(error).rejects.toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
    });

    test('twitterComment_ShouldReturnError_InvalidComment', () => {
        var accountId = 1;
        var tweetId = '1125339716457336832';
        var comment = 'great';
        const error = likeCommentServices.twitterComment(userId, accountId, teamId, tweetId, '');
        expect(error).rejects.toHaveProperty('message');
    });

    test('twitterComment_ShouldReturnError_MissingInputs', () => {
        var tweetId = '1125339716457336832';
        return likeCommentServices.twitterComment('', tweetId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('twitterComment_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.twitterComment(userId, 6, 456786, 1, 'hey')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('twitterComment_ShouldReturnError_InvalidTwtAccount', () => {
        return likeCommentServices.twitterComment(userId, 1, teamId, 1, 'hey')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('twitterDeleteComment', () => {

    test.skip('twitterDeleteComment_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 6;
        var tweetId = newCommentId;
        console.log(tweetId);
        const result = likeCommentServices.twitterDeleteComment(userId, accountId, teamId, tweetId);
        expect(result).resolves.toEqual('Successfully deleted the comment.');
    });

    test('twitterDeleteComment_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 9548654;
        var tweetId = '1110451292780949504';
        const error = likeCommentServices.twitterDeleteComment(userId, accountId, teamId, tweetId);
        expect(error).rejects.toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
    });

    test('twitterDeleteComment_ShouldReturnError_InvalidInputs', () => {
        var accountId = 4;
        var tweetId = '1292780949504';
        const error = likeCommentServices.twitterDeleteComment(userId, accountId, teamId, tweetId);
        expect(error).rejects.toHaveProperty('message');
    });


    test('twitterDeleteComment_ShouldReturnError_MissingInputs', () => {
        var accountId = 4;
        return likeCommentServices.twitterDeleteComment(userId, accountId, teamId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('twitterDeleteComment_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.twitterDeleteComment(userId, 6, 456786, 1)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('twitterDeleteComment_ShouldReturnError_InvalidTwtAccount', () => {
        return likeCommentServices.twitterDeleteComment(userId, 7, teamId, 1)
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});


describe('youtubeLike', () => {

    test('youtubeLike_ShouldReturnSuccess_ValidInputs(like)', () => {
        var accountId = 10;
        var videoId = 'EzTiaHkVdWg';
        var rating = 'like';
        const result = likeCommentServices.youtubeLike(userId, accountId, teamId, videoId, rating);
        expect(result).resolves.toMatch(new RegExp(`Successfully .*`));
    });

    test('youtubeDisLike_ShouldReturnSuccess_ValidInputs(dislike)', () => {
        var accountId = 10;
        var videoId = 'EzTiaHkVdWg';
        var rating = 'dislike';
        return likeCommentServices.youtubeLike(userId, accountId, teamId, videoId, rating)
            .then((result) => {
                expect(result).toMatch(new RegExp(`Successfully .*`));
            });
    });

    test('youtubeLike_ShouldReturnError_InvalidVideoId', () => {
        var accountId = 10;
        var videoId = 'pF861CG';
        var rating = 'dislike';
        const error = likeCommentServices.youtubeLike(userId, accountId, teamId, videoId, rating);
        expect(error).rejects.toHaveProperty('message');
    });

    test('youtubeLike_ShouldReturnError_InvalidRating', () => {
        var accountId = 10;
        var videoId = 'pF861CG_PEc';
        var rating = 'youtube';
        const error = likeCommentServices.youtubeLike(userId, accountId, teamId, videoId, rating);
        expect(error).rejects.toHaveProperty('message');
    });

    test('youtubeLike_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 9546843;
        var videoId = 'pF861CG_PEc';
        var rating = 'like';
        return likeCommentServices.youtubeLike(userId, accountId, teamId, videoId, rating)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });


    test('youtubeLike_ShouldReturnError_MissingInputs', () => {
        var accountId = 4;
        return likeCommentServices.youtubeLike(userId, accountId, teamId, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });


    test('youtubeLike_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.youtubeLike(userId, 6, 456786, 1, 'like')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('youtubeLike_ShouldReturnError_InvalidYtbAccount', () => {
        return likeCommentServices.youtubeLike(userId, 7, teamId, 1, 'like')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('youtubeComment', () => {

    test('youtubeComment_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 10;
        var videoId = 'EzTiaHkVdWg';
        var comment = String(coreServices.getRandomCharacters(5));
        return likeCommentServices.youtubeComment(userId, accountId, teamId, videoId, comment)
            .then((result) => {
                expect(result).toMatch(new RegExp(`Successfully .*`));
            });
    });

    test('youtubeComment_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 9845352;
        var videoId = 'EzTiaHkVdWg';
        var comment = 'liked';
        return likeCommentServices.youtubeComment(userId, accountId, teamId, videoId, comment)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('youtubeComment_ShouldReturnError_InvalidVideoId', () => {
        var accountId = 10;
        var videoId = 'pF861C';
        var comment = 'liked';
        return likeCommentServices.youtubeComment(userId, accountId, teamId, videoId, comment)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('youtubeComment_ShouldReturnError_MissingInputs', () => {
        var accountId = 9;
        var comment = 'liked';
        return likeCommentServices.youtubeComment(userId, accountId, teamId, '', comment)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });


    test('youtubeComment_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.youtubeComment(userId, 6, 456786, 1, 'hey')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('youtubeComment_ShouldReturnError_InvalidYtbAccount', () => {
        return likeCommentServices.youtubeComment(userId, 1, teamId, 1, 'hey')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('youtubeReplyComment', () => {

    test('youtubeReplyComment_ShouldReturnSuccess_ValidInputs', () => {
        var accountId = 10;
        var commentId = 'Ugxcd5jaUNm9aQxde9t4AaABAg';
        var comment = String(coreServices.getRandomCharacters(5));
        return likeCommentServices.youtubeReplyComment(userId, accountId, teamId, commentId, comment)
            .then((result) => {
                expect(result).toMatch(new RegExp(`Successfully .*`));
            });
    });

    test('youtubeReplyComment_ShouldReturnError_InvalidCommentId', () => {
        var accountId = 10;
        var commentId = 'Ugxcd5jaUNm9a';
        var comment = 'liked';
        return likeCommentServices.youtubeReplyComment(userId, accountId, teamId, commentId, comment)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('youtubeReplyComment_ShouldReturnError_InvalidAccountId', () => {
        var accountId = 9843138;
        var commentId = 'Ugxcd5jaUNm9a';
        var comment = 'liked';
        return likeCommentServices.youtubeReplyComment(userId, accountId, teamId, commentId, comment)
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('youtubeReplyComment_ShouldReturnError_InvalidComment', () => {
        var accountId = 200;
        var commentId = 'Ugxcd5jaUNm9a';
        var comment = 'liked';
        return likeCommentServices.youtubeReplyComment(userId, accountId, teamId, commentId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('youtubeReplyComment_ShouldReturnError_MissingInputs', () => {
        var commentId = 'pF861CG_PEc';
        return likeCommentServices.youtubeReplyComment('', commentId, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });


    test('youtubeReplyComment_ShouldReturnError_InvalidTeamOfUser', () => {
        return likeCommentServices.youtubeReplyComment(userId, 6, 456786, 1, 'hey')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('youtubeReplyComment_ShouldReturnError_InvalidYtbAccount', () => {
        return likeCommentServices.youtubeReplyComment(userId, 1, teamId, 1, 'hey')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});
