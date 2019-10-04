const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on twitterposts collection of mongo DB
const twitterPost = new Schema({
    tweetId: { type: String, index: true, unique: true },
    publishedDate: { type: Date, default: Date.now, index: true },
    descritpion: { type: String },
    mediaUrls: { type: [String] },
    hashtags: { type: [String] },
    mentions: { type: [String] },
    retweetCount: { type: Number },
    favoriteCount: { type: Number },
    accountId: { type: String, index: true },
    postedAccountId: { type: String },
    postedAccountScreenName: { type: String },
    isApplicationPost: { type: Boolean },
    tweetUrl: { type: String },
    isLiked: { type: Boolean, default: false },
    quoteDetails: {
        type: [{
            quoteTweetId: { type: String, default: '' },
            quoteTweetUrl: { type: String, default: '' },
            quoteTweetText: { type: String, default: '' },
            quoteTweetMediaUrls: { type: [String] }
        }]
    },
    comments: {
        type: [{
            message: { type: String },
            mediaUrls: { type: [String] },
            commentedId: { type: String }
        }]
    },

    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

twitterPost.methods.insertManyPosts = function (posts) {
    // Inserting multiple posts into the collection
    return this.model('TwitterPosts')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { tweetId: post.tweetId },
                    update: post,
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            return 0;
        });
};

twitterPost.methods.getBatchPost = function (batchId) {
    // Fetching posts by batch Id
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('TwitterPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
    // Fetching the posts related to an account of twtitter
    var query = {
        accountId: new RegExp(accountId, 'i')
    };
    return this.model('TwitterPosts')
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

twitterPost.methods.getPreviousPost = function (keyword, skip, limit) {
    // Fetching posts related to a keyword containing in the post
    var query = {
        $or: [
            { socialAccountId: new RegExp(keyword, 'i') },
            { title: new RegExp(keyword, 'i') },
            { publishedDate: new RegExp(keyword, 'i') },
            { rating: new RegExp(keyword, 'i') }]
    };
    return this.model('TwitterPosts')
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

twitterPost.methods.updateLike = function (tweetId, isliked) {
    // Updating the like status to a post
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    var updateObject = {};
    updateObject.isLiked = isliked;
    return this.model('TwitterPosts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.updateLikeRetweetCount = function (tweetId, favoriteCount, retweetCount) {
    // Updating the retweet count of a particular tweet
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };

    var updateObject = {};
    updateObject.favoriteCount = favoriteCount;
    updateObject.retweetCount = retweetCount;

    return this.model('TwitterPosts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.updateLikeCount = function (tweetId, method) {
    // Updating like count of a tweet
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    var updateObject = '';
    if (method == 'increment') {
        updateObject = { $inc: { 'favoriteCount': 1 } };
    }
    else {
        updateObject = { $inc: { 'favoriteCount': -1 } };
    }
    return this.model('TwitterPosts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.updateCommentCount = function (tweetId, method) {
    // Updating comment count of a tweet
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    var updateObject = '';
    if (method == 'increment') {
        updateObject = { $inc: { 'retweetCount': 1 } };
    }
    else {
        updateObject = { $inc: { 'retweetCount': -1 } };
    }
    return this.model('TwitterPosts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.addcomments = function (tweetId, message, commentedId, mediaUrls) {
    // Updating/Adding comments to a tweet
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    var updateObject = { $push: { comments: { message: message, mediaUrls: mediaUrls, commentedId: String(commentedId) } } };
    return this.model('TwitterPosts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.deletecomments = function (id) {
    // Deleting comment from the tweets
    var query = { "comments.commentedId": new RegExp(id, 'i') };
    var updateObject = { $pull: { comments: { commentedId: id } } };
    return this.model('TwitterPosts')
        .updateOne(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.deleteAccountPosts = function (accountId) {
    // Deleting all posts related to an account
    var query = {
        accountId: new RegExp(accountId, 'i')
    };
    return this.model('TwitterPosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterPost.methods.deleteSingleTweet = function (accountId, tweetId) {
    // Deleting a paricular tweet from an account
    var query = {
        $and: [{
            accountId: new RegExp(accountId, 'i'),
            tweetId: new RegExp(tweetId, 'i')
        }]
    };
    return this.model('TwitterPosts')
        .findOneAndDelete(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw new Error(error);
        });
};

twitterPost.methods.findLastRecentTweetId = function () {
    // Fetching the recent tweet
    return this.model('TwitterPosts')
        .find().limit(1).sort({ publishedDate: -1 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                return result[0].tweetId ? result[0].tweetId : '';
            }
        })
        .catch(function (error) {
            return '';
        });
};



twitterPost.methods.findTweet = function (tweetId) {
    // Fetching a particular tweet details
    return this.model('TwitterPosts')
        .findOne({
            tweetId: tweetId
        })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                return result;
            }
        })
        .catch(function (error) {
            throw new Error(error);
        });
};



const twitterPostModel = mongoose.model('TwitterPosts', twitterPost);

module.exports = twitterPostModel;
