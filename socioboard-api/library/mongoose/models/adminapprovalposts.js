const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const logger = require('../../utils/logger');

mongoose.set('useCreateIndex', true);

const adminApprovalPosts = new Schema({
    ownerId: { type: Number, index: true },
    teamId: { type: Number },
    postType: { type: String },
    description: { type: String },
    mediaUrl: [{ type: String }],
    shareLink: { type: String },
    accountIds: { type: [String] },
    pinBoards: {
        type: [{
            accountId: { type: Number },
            boardId: [String]
        }]
    },
    createdDate: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: false },
    publishedDate: { type: Date, default: null },
    adminResponseStatus: { type: String, default: 'pending' }
});

adminApprovalPosts.methods.getAdminApprovalPost = function (ownerId, teamId, skip, limit) {
    // Fetching post of admin approval required for a Owner of particular Team
    var query = {
        ownerId: ownerId,
        teamId: teamId
    };
    return this.model('AdminApprovalPost')
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

adminApprovalPosts.methods.getPostsById = function (postIds) {
    // Fetching specified posts
    var query = { _id: { $in: postIds } };
    return this.model('AdminApprovalPost')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            logger.info(error);
        });
};

adminApprovalPosts.methods.getUnpublishedPostById = function (postId) {
    // Fetching un-published post Details
    var query = { _id: { $eq: postId }, isPublished: false };
    return this.model('AdminApprovalPost')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            if (!result)
                return result;
            else {
                var fetched = result.shift();
                return fetched;
            }
        })
        .catch(function (error) {
            logger.info(error);
        });
};

adminApprovalPosts.methods.getFirstPostById = function (postId) {
    // Fetching recent post from the list 
    var query = { _id: { $eq: postId } };
    return this.model('AdminApprovalPost')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            if (!result)
                return result;
            else {
                var fetched = result.shift();
                return fetched;
            }
        })
        .catch(function (error) {
            logger.info(error);
        });
};

adminApprovalPosts.methods.updateAdminResponse = function (taskId, adminResponse) {
    // Updating approval status of a particular task
    return this.model('AdminApprovalPost')
        .findOneAndUpdate(
            { _id: String(taskId) },
            { adminResponseStatus: adminResponse }
        )
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

adminApprovalPosts.methods.updatePublishStatus = function (taskId) {
    // Updating publish status of a particular task
    return this.model('AdminApprovalPost')
        .findOneAndUpdate(
            { _id: String(taskId) },
            { isPublished: true, publishedDate: moment.utc().format() }
        )
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

const AdminApproalPostModel = mongoose.model('AdminApprovalPost', adminApprovalPosts);

module.exports = AdminApproalPostModel;