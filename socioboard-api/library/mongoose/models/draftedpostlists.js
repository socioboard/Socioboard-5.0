const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

// All functions will execute on draftPosts collection of mongo DB
const draftPosts = new Schema({
    ownerId: { type: Number, index: true },
    teamId: { type: Number },
    postType: { type: String },
    description: { type: String },
    mediaUrl: [{ type: String }],
    shareLink: { type: String },
    createdDate: { type: Date, default: Date.now }
});

draftPosts.methods.getDraftedPost = function (ownerId, teamId, skip, limit) {
    // Fetching drafted posts of a team belongs to an user with sorting of created date
    var query = {
        ownerId: ownerId,
        teamId: teamId
    };
    return this.model('DraftPost')
        .find(query)
        .sort({ createdDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

draftPosts.methods.getPostsById = function (postIds) {
    // Fetching the pecified post details
    var query = { _id: { $in: postIds } };
    return this.model('DraftPost')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};


const draftPost = mongoose.model('DraftPost', draftPosts);

module.exports = draftPost;