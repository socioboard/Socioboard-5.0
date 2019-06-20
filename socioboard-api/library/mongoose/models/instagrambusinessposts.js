const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const instagramBusinessPost = new Schema({
    postId: { type: String, index: true, unique: true },
    permalink: { type: String },
    captions: { type: String },
    mediaType: { type: String },
    mediaUrls: { type: [String] },
    publishedDate: { type: Date, default: Date.now, index: true },
    hashtags: { type: [String] },
    mentions: { type: [String] },
    instagramId: { type: String, index: true },
    socialAccountId: { type: String, index: true },
    ownerId: { type: String, index: true },
    ownerUserName: { type: String, index: true },
    likeCount: { type: Number },
    commentCount: { type: Number },
    comments: {
        type: [{
            text: String,
            mediaUrls: [String],
            commentId: String,
            commentDate: { type: Date, default: Date.now },
        }]
    },

    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

instagramBusinessPost.methods.insertManyPosts = function (posts) {
    return this.model('InstagramBusinessPosts')
        .bulkWrite(posts.feeds.map((post) => {
            return {
                updateOne: {
                    filter: { postId: post.postId },
                    update: post,
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            console.log(error.message);
            return 0;
        });
};

instagramBusinessPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
    return this.model('InstagramBusinessPosts')
        .aggregate([
            { $match: { socialAccountId: accountId } },
            { $sort: { publishedDate: -1 } },
            { $limit: limit },
            { $skip: skip }
        ])
        .then(function (result) {
            console.log(result);
            if (result.length > 0) {
                return result;
            }
            return [];
        })
        .catch(function (error) {
            console.log(error);
            throw new Error(error.message);
        });
};

instagramBusinessPost.methods.deleteAccountPosts = function (accountId) {
    var query = {
        socialAccountId: new RegExp(accountId, 'i')
    };
    return this.model('InstagramBusinessPosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};


const instagramBusinessPostModel = mongoose.model('InstagramBusinessPosts', instagramBusinessPost);

module.exports = instagramBusinessPostModel;