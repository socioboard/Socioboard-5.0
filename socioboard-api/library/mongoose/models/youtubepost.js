const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on twitterposts collection of mongo DB
const youtubePost = new Schema({
    videoId: { type: String, index: true, unique: true },
    title: { type: String },
    description: { type: String },
    category: { type: String },
    channelId: { type: String },
    channelTitle: { type: String },
    publishedDate: { type: Date, default: Date.now },
    mediaUrl: { type: [String] },
    updatedDate: { type: Date, default: Date.now },
    thumbnailUrls: { type: [String] },
    embed_url: { type: String },
    etag: { type: String },
    isFeedPost: { type: Boolean, default: false },
    isLiked: {
        type: String,
        enum: ['like', 'dislike', 'none'],
        default: "none"
    },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

youtubePost.methods.insertMultiPosts = function (posts) {
    // Inserting multiple posts into the collection
    return this.model('YoutubePosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

youtubePost.methods.insertManyPosts = function (posts) {
    // inserting or creating multiple posts
    return this.model('YoutubePosts')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { videoId: post.videoId },
                    update: post,
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            return 0;
        });
};


youtubePost.methods.FindInsertOrUpdate = function (post) {
    // Creating/Updating post to the collection
    var query = { videoId: new RegExp(post.videoId, 'i') };
    var options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return this.model('YoutubePosts')
        .findOneAndUpdate(query, post, options)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

youtubePost.methods.getPreviousPost = function (keyword, sort, skip, limit) {
    // Fetching the posts of apecified keyword avaliable posts with recent published
    var query = {
        $and: [{
            $or: [
                { description: new RegExp(keyword, 'i') },
                { title: new RegExp(keyword, 'i') }
            ]
        }, { category: new RegExp(sort, "i") }]
    };
    return this.model('YoutubePosts')
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

youtubePost.methods.getSocialAccountPosts = function (channelId, skip, limit) {
    // Fetching posts of a particular account/channel
    var query = { channelId: new RegExp(channelId, 'i') };
    return this.model('YoutubePosts')
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

youtubePost.methods.deleteAccountPosts = function (accountId) {
    // Deleting posts of a particular account/channel
    var query = {
        channelId: new RegExp(accountId, 'i')
    };
    return this.model('YoutubePosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};


youtubePost.methods.updateIsLike = function (data) {
    // Updating like to particular video
    var query = { videoId: new RegExp(data.videoId, 'i') };
    var update = { $set: { isLiked: data.rating } };
    return this.model('YoutubePosts')
        .findOneAndUpdate(query, update)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

const youtubePostModel = mongoose.model('YoutubePosts', youtubePost);

module.exports = youtubePostModel;
