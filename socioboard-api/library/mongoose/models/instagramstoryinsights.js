const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const instagramStoryInsights = new Schema({

    socialAccountId: { type: String, index: true },
    storyDate: { type: Date, default: Date.now, index: true },
    captions: { type: String },
    mediaId: { type: String, index: true, unique: true },
    mediaType: { type: String },
    mediaUrls: { type: [String] },
    impressions: { type: Number },
    reach: { type: Number },
    tapsForward: { type: Number },
    tapsBack: { type: Number },
    replies: { type: Number },

    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

instagramStoryInsights.methods.insertManyPosts = function (posts) {
    return this.model('InstagramStoryInsights')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { mediaId: post.mediaId },
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

instagramStoryInsights.methods.getSocialAccountPosts = function (accountId, skip, limit) {
    return this.model('InstagramStoryInsights')
        .aggregate([
            { $match: { socialAccountId: accountId } },
            { $sort: { storyDate: -1 } },
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


instagramStoryInsights.methods.deleteAccountPosts = function (accountId) {
    var query = {
        socialAccountId: new RegExp(accountId, 'i')
    };
    return this.model('InstagramStoryInsights')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};


const instagramStoryInsightModel = mongoose.model('InstagramStoryInsights', instagramStoryInsights);

module.exports = instagramStoryInsightModel;