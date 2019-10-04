const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on instagramposts collection of mongo DB
const instagramPost = new Schema({

    postId: { type: String, index: true, unique: true },
    socialId: { type: String },
    userName: { type: String, index: true },
    mediaUrl: { type: String },
    publishedDate: { type: Date, default: Date.now, index: true },
    captionId: { type: String },
    captionText: { type: String },
    isUserLiked: { type: Boolean },
    likeCount: { type: Number },
    commentCount: { type: Number },
    type: { type: String },
    link: { type: String },
    locationName: { type: String },
    locationId: { type: Number },

    batchId: { type: String },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

instagramPost.methods.insertManyPosts = function (posts) {
    // Inserting multiple data into the collection
    if (!posts) {
        reject(new Error('Invalid Inputs'));
    } else {
        return this.model('InstagramPosts')
            .bulkWrite(posts.map((post) => {
                return {
                    updateOne: {
                        filter: { postId: post.postId },
                        update: post,
                        upsert: true,
                    },
                };
            }))
            .then((result) => {
                return result;
            })
            .catch((error) => {
                throw new Error(error);
            });
    }
};

instagramPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
    // Fetching the posts from collection related to an account
    return this.model('InstagramPosts')
        .aggregate([
            { $match: { socialId: accountId } },
            { $sort: { publishedDate: -1 } },
            { $limit: limit },
            { $skip: skip }
        ])
        .then(function (result) {
            if (result.length > 0) {
                return result;
            }
            return [];
        })
        .catch(function (error) {
            throw new Error(error.message);
        });
};

instagramPost.methods.deleteAccountPosts = function (accountId) {
    // Deleting all posts related to a specified account
    var query = {
        socialAccountId: new RegExp(accountId, 'i')
    };
    return this.model('InstagramPosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw new Error(error.message);
        });
};


instagramPost.methods.findLastRecentInstaId = function () {
    // Fetching the last post with sort of published date
    return this.model('InstagramPosts')
        .find().limit(1).sort({ publishedDate: -1 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                return result[0].postId;
            }
        })
        .catch(function (error) {
            throw new Error(error.message);
        });

};

const instagramPostModel = mongoose.model('InstagramPosts', instagramPost);

module.exports = instagramPostModel;