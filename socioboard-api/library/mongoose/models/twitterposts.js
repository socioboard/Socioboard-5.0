const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

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
            console.log(error.message);
            return 0;
        });
};

twitterPost.methods.getBatchPost = function (batchId) {
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('TwitterPosts')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
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
            console.log(error);
        });
};

twitterPost.methods.getPreviousPost = function (keyword, skip, limit) {
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
            console.log(error);
        });
};

twitterPost.methods.updateLike = function (tweetId, isliked) {
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
            console.log(error);
        });
};

twitterPost.methods.updateLikeRetweetCount = function (tweetId, favoriteCount, retweetCount) {
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
            console.log(error);
        });
};

twitterPost.methods.updateLikeCount = function (tweetId, method) {
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
            console.log(error);
        });
};

twitterPost.methods.updateCommentCount = function (tweetId, method) {
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
            console.log(error);
        });
};

twitterPost.methods.addcomments = function (tweetId, message, commentedId, mediaUrls) {
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
            console.log(error);
        });
};

twitterPost.methods.deletecomments = function (id) {
    var query = { "comments.commentedId": new RegExp(id, 'i') };
    var updateObject = { $pull: { comments: { commentedId: id } } };
    return this.model('TwitterPosts')
        .updateOne(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterPost.methods.deleteAccountPosts = function (accountId) {
    var query = {
        accountId: new RegExp(accountId, 'i')
    };
    return this.model('TwitterPosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterPost.methods.deleteSingleTweet = function (accountId, tweetId) {
    var query = {
        $and: [{
            accountId: new RegExp(accountId, 'i'),
            tweetId: new RegExp(tweetId, 'i')
        }]
    };
    return this.model('TwitterPosts')
        .findOneAndDelete(query)
        .then(function (result) {
            console.log(`Response : ${JSON.stringify(result)}`);
            return result;
        })
        .catch(function (error) {
            throw new Error(error);
        });
};

twitterPost.methods.findLastRecentTweetId = function () {
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
