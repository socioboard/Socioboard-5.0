const moment = require('moment');
const InstagramStoryInsightModel = require('../../../library/mongoose/models/instagramstoryinsights');
const config = require('config');
const facebookHelper = require('../../../library/network/facebook')(config.get('facebook_api'));

const db = require('../../../library/sequelize-cli/models/index');
const logger = require('../../utils/logger');
const Operator = db.Sequelize.Op;
const socialAccount = db.social_accounts;

var helper = {};

// Available Verbs in fb - add, block, edit, edited, delete, follow, hide, mute, remove, unblock, unhide, update
helper.webhookEvents = function (webhookObject) {
    logger.info(`Process started for instagram.. ${JSON.stringify(webhookObject)}`);

    if (webhookObject.object == 'instagram') {
        webhookObject.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if (change.field == 'story_insights') {
                    var changeValue = change.value;
                    var postDetails = {
                        socialAccountId: changeValue.id,
                        storyDate: moment.unix(changeValue.created_time).utc(),
                        mediaId: changeValue.media_id,
                        impressions: changeValue.impressions,
                        reach: changeValue.reach,
                        tapsForward: changeValue.taps_forward,
                        tapsBack: changeValue.taps_back,
                        replies: changeValue.replies,
                    };
                    return socialAccount.findOne({
                        where: {
                            [Operator.and]: [{
                                social_id: postDetails.socialAccountId
                            }, {
                                account_type: 12
                            }]
                        },
                        attributes: ['id', 'access_token']
                    })
                        .then((account) => {
                            if (!account) {
                                return facebookHelper.getInstagramMediaInfo(account.access_token, postDetails.mediaId)
                                    .then((mediaDetails) => {
                                        postDetails.mediaType = mediaDetails.mediaType;
                                        postDetails.mediaUrls = mediaDetails.mediaUrls;
                                        postDetails.captions = mediaDetails.captions;

                                        var instagramStoryInsightModelObject = new InstagramStoryInsightModel(mediaDetails);
                                        return instagramStoryInsightModelObject.save()
                                            .then((object) => {
                                                logger.info(`Story Details : ${JSON.stringify(object)}`);
                                            })
                                            .catch((error) => {
                                                logger.info(`Story Details not saved : ${error.message}`);
                                            });
                                    })
                                    .catch((error) => {
                                        logger.info(`Story Details not saved : ${error.message}`);
                                    });
                            }
                        });
                }
                else {
                    logger.info("Not Supported field entry");
                }
            });
        });
    }
};

module.exports = helper;
