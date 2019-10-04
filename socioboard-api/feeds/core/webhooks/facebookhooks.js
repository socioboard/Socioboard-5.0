const moment = require('moment');
const FacebookMongoPostModel = require('../../../library/mongoose/models/facebookposts');
const logger = require('../../utils/logger');

var helper = {};

//Available Items in fb - album, address, comment, connection, coupon, event, experience, group, group_message, interest, like, link, mention, milestone, note, page, picture, platform-story, photo, photo-album, post, profile, question, rating, reaction, relationship-status, share, status, story, timeline cover, tag, video
var itemsForPosts = ['photo', 'link', 'post', 'status', 'video'];
var itemsForReaction = ['like', 'reaction'];
var itemsForComment = ['comment'];

// Available Verbs in fb - add, block, edit, edited, delete, follow, hide, mute, remove, unblock, unhide, update
helper.webhookEvents = function (webhookObject) {
    logger.info(`Process started for facebook.. ${webhookObject}`);
    var facebookMongoPostModelObject = new FacebookMongoPostModel();
    if (webhookObject.object == 'page') {
        webhookObject.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if (change.field == 'feed') {

                    // Common details about posts
                    var postIdSplit = String(change.value.post_id).split('_');
                    var postDetails = {
                        postId: postIdSplit[1],
                        socialAccountId: postIdSplit[0], // pageId
                        publishedDate: moment.unix(change.value.created_time).utc(),
                        postUrl: `https://www.facebook.com/${postIdSplit[1]}`
                    };

                    // publishing posts
                    if (itemsForPosts.includes(change.value.item)) {
                        if (change.value.verb == 'add') {
                            postDetails.postType = change.value.item;
                            postDetails.description = change.value.message ? change.value.message : '';
                            postDetails.mediaUrls = [];
                            postDetails.likeCount = 0;
                            postDetails.commentCount = 0;
                            postDetails.isLiked = false;

                            var linkUrl = change.value.link ? change.value.link : null;
                            if (linkUrl)
                                postDetails.mediaUrls.push(linkUrl);
                            if (change.value.photos) {
                                change.value.photos.forEach(photo => {
                                    postDetails.mediaUrls.push(photo);
                                });
                            }
                            if (change.value.video) {
                                postDetails.mediaUrls.push(change.value.video);
                            }
                            if (change.value.photo) {
                                postDetails.mediaUrls.push(change.value.photo);
                            }
                            facebookMongoPostModelObject = new FacebookMongoPostModel(postDetails);
                            return facebookMongoPostModelObject.save()
                                .then((object) => {
                                    logger.info(`Post Details : ${JSON.stringify(object)}`);
                                })
                                .catch((error) => {
                                    logger.info(`Post Details not saved : ${error.message}`);
                                });
                        }
                        if (change.value.verb == 'remove') {
                            if (postDetails.postId) {
                                facebookMongoPostModelObject = new FacebookMongoPostModel();
                                return facebookMongoPostModelObject.deleteSinglePost(postDetails.postId)
                                    .then(() => {
                                        logger.info(`Post ${postDetails.postId} has been deleted!`);
                                    })
                                    .catch((error) => {
                                        logger.info(`Post Details not deleted : ${error.message}`);
                                    });
                            }
                        }
                    }

                    else if (itemsForReaction.includes(change.value.item)) {
                        if (postDetails.postId) {
                            if (change.value.verb == 'add') {
                                facebookMongoPostModelObject = new FacebookMongoPostModel();
                                return facebookMongoPostModelObject.updateLikeCount(postDetails.postId, 'increment')
                                    .then(() => {
                                        logger.info(`Post ${postDetails.postId} reaction has been incremented!`);
                                    })
                                    .catch((error) => {
                                        logger.info(`Post Details not update the reaction count : ${error.message}`);
                                    });
                            }
                            else if (change.value.verb == 'remove') {
                                facebookMongoPostModelObject = new FacebookMongoPostModel();
                                return facebookMongoPostModelObject.updateLikeCount(postDetails.postId, 'decrement')
                                    .then(() => {
                                        logger.info(`Post ${postDetails.postId} reaction has been decremented!`);
                                    })
                                    .catch((error) => {
                                        logger.info(`Post Details not update the reaction count : ${error.message}`);
                                    });
                            }
                        }
                    }

                    else if (itemsForComment.includes(change.value.item)) {
                        if (postDetails.postId) {
                            if (change.value.verb == 'add') {
                                facebookMongoPostModelObject = new FacebookMongoPostModel();
                                return facebookMongoPostModelObject.updateCommentCount(postDetails.postId, 'increment')
                                    .then(() => {
                                        logger.info(`Post ${postDetails.postId} comment has been incremented!`);
                                    })
                                    .catch((error) => {
                                        logger.info(`Post Details not update the comment count : ${error.message}`);
                                    });
                            }
                            else if (change.value.verb == 'remove') {
                                facebookMongoPostModelObject = new FacebookMongoPostModel();
                                return facebookMongoPostModelObject.updateCommentCount(postDetails.postId, 'decrement')
                                    .then(() => {
                                        logger.info(`Post ${postDetails.postId} comment has been decremented!`);
                                    })
                                    .catch((error) => {
                                        logger.info(`Post Details not update the comment count : ${error.message}`);
                                    });
                            }
                        }
                    }
                }
            });
        });
    }
};

module.exports = helper;
