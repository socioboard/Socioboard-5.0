import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;
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
            console.log(error);
        });
};

adminApprovalPosts.methods.getPostsById = function (postIds) {
    var query = { _id: { $in: postIds } };
    return this.model('AdminApprovalPost')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

adminApprovalPosts.methods.getUnpublishedPostById = function (postId) {
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
            console.log(error);
        });
};

adminApprovalPosts.methods.getFirstPostById = function (postId) {
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
            console.log(error);
        });
};

adminApprovalPosts.methods.updateAdminResponse = function (taskId, adminResponse) {
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

adminApprovalPosts.methods.getPostsById = function (postIds) {
    var query = { _id: { $in: postIds } };
    return this.model('AdminApprovalPost')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};


adminApprovalPosts.methods.deleteDraftPostById = function (postIds) {
    var query = { _id: { $in: postIds } };
    return this.model('AdminApprovalPost')
        .deleteMany(query)
        .then(function (result) {
            if (result.deletedCount != 0)
                return "Deleted successfully"
            return "No record found"
        })
        .catch(function (error) {
            throw error;
        });
};

const AdminApproalPostModel = mongoose.model('AdminApprovalPost', adminApprovalPosts);

export default AdminApproalPostModel;