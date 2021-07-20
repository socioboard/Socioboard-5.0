import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;


mongoose.set('useCreateIndex', true);

const facebookPost = new Schema({
    postId: { type: String, index: true, unique: true },
    privacy: { type: String },
    publishedDate: { type: Date, default: Date.now },
    postType: { type: String },
    description: { type: String },
    postUrl: { type: String },
    isApplicationPost: { type: Boolean },
    mediaUrls: { type: [String] },
    likeCount: { type: Number },
    commentCount: { type: Number },
    socialAccountId: { type: String, index: true },
    isLiked: { type: Boolean, default: false },
    comments: {
        type: [{
            message: String,
            mediaUrls: [String],
            commentId: String
        }]
    },
    batchId: { type: String },
    serverMediaUrl: { type: String },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

facebookPost.methods.insertManyPosts = function (posts) {
    return this.model('FacebookPosts')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { postId: post.postId },
                    update: post,
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            console.log("error ", error)
            return 0;
        });
};

facebookPost.methods.getBatchPost = function (batchId) {
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('FacebookPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

facebookPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
    var query = {
        socialAccountId: new RegExp(accountId, 'i')
    };
    return this.model('FacebookPosts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

facebookPost.methods.getPreviousPost = function (keyword, skip, limit) {
    var query = {
        $or: [
            { socialAccountId: new RegExp(keyword, 'i') },
            { title: new RegExp(keyword, 'i') },
            { publishedDate: new RegExp(keyword, 'i') },
            { rating: new RegExp(keyword, 'i') }]
    };
    return this.model('FacebookPosts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

facebookPost.methods.deleteAccountPosts = function (accountId) {
    var query = {
        socialAccountId: new RegExp(accountId, 'i')
    };
    return this.model('FacebookPosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

facebookPost.methods.deleteSinglePost = function (postId) {
    var query = {
        postId: new RegExp(postId, 'i')
    };
    return this.model('FacebookPosts')
        .findOneAndDelete(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

facebookPost.methods.updateLikeCount = function (postId, method) {
    var query = {
        postId: new RegExp(postId, 'i')
    };
    var updateObject = '';
    if (method == 'increment') {
        updateObject = { $inc: { 'likeCount': 1 } };
    }
    else {
        updateObject = { $inc: { 'likeCount': -1 } };
    }
    return this.model('FacebookPosts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

facebookPost.methods.updateCommentCount = function (postId, method) {
    var query = {
        postId: new RegExp(postId, 'i')
    };
    var updateObject = '';
    if (method == 'increment') {
        updateObject = { $inc: { 'commentCount': 1 } };
    }
    else {
        updateObject = { $inc: { 'commentCount': -1 } };
    }
    return this.model('FacebookPosts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

const facebookPostModel = mongoose.model('FacebookPosts', facebookPost);

export default facebookPostModel;
