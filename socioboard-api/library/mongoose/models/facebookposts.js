const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on facebookposts collection of mongo DB
const facebookPost = new Schema({
    postId: { type: String, index: true, unique: true },
    privacy: { type: String },
    publishedDate: { type: Date, default: Date.now, index: true },
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
    // Inserting the posts data into the facebookposts collection
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
            return 0;
        });
};

facebookPost.methods.getBatchPost = function (batchId) {
    // Fetching a specified post 
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
    // Fetching posts fro facebookposts with sorting of published date
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
    // Fetching the previous posts matching with keyword in any field of the post
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
    // Deleting all posts related to an account
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
    // Deleting a single post
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
    // Updating like status of a specified post
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
    // Updating the comment count for a specified post
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

module.exports = facebookPostModel;
