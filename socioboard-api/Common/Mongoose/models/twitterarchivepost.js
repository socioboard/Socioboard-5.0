const mongoose = require('mongoose');
const moment = require('moment');
const { count } = require('./facebookposts');
const Schema = mongoose.Schema;
const mediaBasePath = "../../";
const fs = require("fs");

mongoose.set('useCreateIndex', true);

const twitterarchivepost = new Schema({
    tweetId: { type: String, index: true, unique: true },
    publishedDate: { type: Date, default: Date.now, index: true },
    descritpion: { type: String },
    mediaUrls: {
        type: [{
            type: { type: String },
            url: { type: String }
        }]
    },
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
    sentiment: { type: String, default: '' },
    customtag: { type: String, default: '' },
    quoteDetails: {
        type: [{
            quoteTweetId: { type: String, default: '' },
            quoteTweetUrl: { type: String, default: '' },
            quoteTweetText: { type: String, default: '' },
            quoteTweetMediaUrls: { type: [String] }
        }]
    },
    custometag: { type: String, default: '' },
    customtags: {
        type: [{
            groupname: { type: String, default: '' },
            customtags: { type: [String] }
        }]
    },
    isReplayTweet: { type: Boolean, default: false },
    isReTweet: { type: Boolean, default: false },
    retweetStatus: {
        type: [{
            retweetTweetId: { type: String, default: '' },
            retweetTweetUrl: { type: String, default: '' },
            retweetTweetText: { type: String, default: '' },
            // retweetTweetMediaUrls: { type: [String] }
        }]
    },

    replayDetails: {
        type: [{
            replayTweetId: { type: String, default: '' },
            replayTweetUserId: { type: String, default: '' },
            replayTweetScreenName: { type: String, default: '' },
            //replayTweetMediaUrls: { type: [String] }
        }]
    },
    // comments: {
    //     type: [{
    //         message: { type: String },
    //         mediaUrls: { type: [String] },
    //         commentedId: { type: String }
    //     }]
    // },

    batchId: { type: String },
    serverMediaUrl: {
        type: [{
            type: { type: String, default: '' },
            url: { type: String, default: '' }
        }]
    },
    deleteStatus: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

twitterarchivepost.methods.insertManyPosts = function (posts) {
    return this.model('TwitterArchivePost')
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

twitterarchivepost.methods.getBatchPost = function (batchId) {
    var query = {
        batchId: new RegExp(batchId, 'i')
    };
    return this.model('TwitterArchivePost')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
    var query = {
        accountId: new RegExp(accountId, 'i'),
        $or: [ 
            { deleteStatus: false },
            { deleteStatus: {$exists: false } }
            ]     
    };
    return this.model('TwitterArchivePost')
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


twitterarchivepost.methods.deleteMediaFile = function (accountId, isArray, skip, limit) {
    var query = {};
    if (!isArray)
        query.accountId = new RegExp(accountId, 'i')
    else
        query.accountId = { $in: accountId }

    return this.model('TwitterArchivePost')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {

            var mediaUrls = [];

            result.forEach(element => {

                if (element.mediaUrls.length != 0) {

                    element.mediaUrls.forEach(media => {
                        mediaUrls.push(media.url)

                    });


                }


            });

            deleteMediaFile(mediaUrls)


        })
        .catch(function (error) {
            console.log(error);
        });
};

const deleteMediaFile = function (arrayOfMediaFile) {

    Promise.all(arrayOfMediaFile.map((data) => {

        fs.unlink(mediaBasePath + data, function (err) {
            if (err) {

            } else {

            }
        })
    })
    )

};

twitterarchivepost.methods.getPreviousPost = function (keyword, skip, limit) {
    var query = {
        $or: [
            { socialAccountId: new RegExp(keyword, 'i') },
            { title: new RegExp(keyword, 'i') },
            { publishedDate: new RegExp(keyword, 'i') },
            { rating: new RegExp(keyword, 'i') }]
    };
    return this.model('TwitterArchivePost')
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

twitterarchivepost.methods.updateLike = function (tweetId, isliked) {
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    var updateObject = {};
    updateObject.isLiked = isliked;
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.updateLikeRetweetCount = function (tweetId, favoriteCount, retweetCount) {
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };

    var updateObject = {};
    updateObject.favoriteCount = favoriteCount;
    updateObject.retweetCount = retweetCount;

    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.updateLikeCount = function (tweetId, method) {
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
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.updateCommentCount = function (tweetId, method) {
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
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.addcomments = function (tweetId, message, commentedId, mediaUrls) {
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    var updateObject = { $push: { comments: { message: message, mediaUrls: mediaUrls, commentedId: String(commentedId) } } };
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.deletecomments = function (id) {
    var query = { "comments.commentedId": new RegExp(id, 'i') };
    var updateObject = { $pull: { comments: { commentedId: id } } };
    return this.model('TwitterArchivePost')
        .updateOne(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.deleteAccountPosts = function (accountId) {
    var query = {
        accountId: new RegExp(accountId, 'i')
    };
    return this.model('TwitterArchivePost')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.deleteSingleTweet = function (accountId, tweetId) {
    var query = {
        $and: [{
            accountId: new RegExp(accountId, 'i'),
            tweetId: new RegExp(tweetId)
        }]
    };
    return this.model('TwitterArchivePost')
        .findOneAndDelete(query)
        .then(function (result) {
            //return result;
            if (!result) {
                return "No tweet found"
            }
            else
                return "Deleted tweet succesfully";
        })
        .catch(function (error) {
            throw new Error(error);
        });
};

twitterarchivepost.methods.setdeleteStatus = function (accountId, tweetId, deleteStatus) {
    var query = {
        accountId: accountId,
        tweetId: tweetId
    };
    var updateObject = {};
    updateObject.deleteStatus = deleteStatus;
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else
                return "Deleted tweet succesfully";
        })
        .catch(function (error) {
            console.log("Error",error);
        });
};

twitterarchivepost.methods.findLastRecentTweetId = function () {
    return this.model('TwitterArchivePost')
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


twitterarchivepost.methods.findAllHashTags = function (social_id, isforTeam) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    return this.model('TwitterArchivePost')
        .find({ accountId: { $in: list } }, { hashtags: 1, _id: 0 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var data = [];
                for (var count in result) {
                    if ([result[count].hashtags].length != 0)
                        data = data.concat(result[count].hashtags)
                }
                var occurrences = {};
                for (var i = 0, j = data.length; i < j; i++) {
                    occurrences[data[i]] = (occurrences[data[i]] || 0) + 1;
                }
                return occurrences;
            }
        })
        .catch(function (error) {
            return '';
        });
};


twitterarchivepost.methods.getNumberOfTweet = function (social_id, isforTeam, data) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    return this.model('TwitterArchivePost')
        .find({ accountId: { $in: list } })
        .then(function (result) {
            if (!result) {
                throw new Error('no data found.');
            } else {
                var datas = {
                    numberOfArchivingTweets: result.length,
                    data
                };

                return result.length;
            }
        })
        .catch(function (error) {
            return '';
        });
};

twitterarchivepost.methods.getTweetDayWise = function (social_id, isforTeam) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    return this.model('TwitterArchivePost')
        .aggregate([
            { $match: { accountId: { $in: list } } },
            {
                $project: {
                    _id: "$_id",
                    year: { $year: "$publishedDate" },
                    month: { $month: "$publishedDate" },
                    day: { $dayOfMonth: "$publishedDate" },
                    date: { "$dateToString": { "format": "%Y-%m-%d", "date": "$publishedDate" } },
                    dates: { year: "$year", month: "$month", day: "$day" },
                    favoriteCount: "$favoriteCount",
                    retweetCount: "$retweetCount",
                    numberHashtag: { $cond: { if: { $isArray: "$hashtags" }, then: { $size: "$hashtags" }, else: "0" } }

                }
            },
            {
                $group: {
                    _id: "$date"
                    , likes: { $sum: "$favoriteCount" }
                    , retweets: { $sum: "$retweetCount" },
                    tweets: { $sum: 1 },
                    hashtags: { $sum: "$numberHashtag" }
                }
            },
            { $sort: { _id: -1 } }
        ])
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {

                var results = result;
                return result;
            }
        })
        .catch(function (error) {
            console.log("Error while getting datewise", error);
            return '';
        });
};


twitterarchivepost.methods.getArchivedTweetDayWise = function (social_id, isforTeam) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    return this.model('TwitterArchivePost')
        .aggregate([
            { $match: { accountId: { $in: list } } },
            {
                $project: {
                    _id: "$_id",
                    year: { $year: "$createdDate" },
                    month: { $month: "$createdDate" },
                    day: { $dayOfMonth: "$createdDate" },
                    date: { "$dateToString": { "format": "%Y-%m-%d", "date": "$createdDate" } },
                    dates: { year: "$year", month: "$month", day: "$day" },
                }
            },
            {
                $group: {
                    _id: "$date",
                    archivedTweet: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ])
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var totalPosts = 0;
                var data = [];
                for (var count in result) {
                    totalPosts = totalPosts + result[count].archivedTweet
                    var datas = {
                        date: result[count]._id,
                        archivedTweet: result[count].archivedTweet,
                    };
                    data.push(datas)
                }
                var response = {
                    totalPosts: totalPosts,
                    data: data
                }
                return response;
            }
        })
        .catch(function (error) {
            console.log("Error--", error);
            return '';
        });
};


twitterarchivepost.methods.getArchivedAccountDetails = function (social_id, isforTeam) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    return this.model('TwitterArchivePost')
        .distinct("accountId", { accountId: { $in: list } })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                return result;
            }
        })
        .catch(function (error) {
            return '';
        });
};

twitterarchivepost.methods.getSentimentAnalysis = function (social_id, isforTeam) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    return this.model('TwitterArchivePost')
        .find({ accountId: { $in: list } }, { sentiment: 1, _id: 0 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var totalCount = result.length;
                if (totalCount > 0) {
                    var pos = 0;
                    var neg = 0;
                    var neu = 0;
                    for (var count in result) {
                        if (result[count].sentiment == 0) {
                            neu = neu + 1;
                        }
                        else if (result[count].sentiment == -1) {
                            neg = neg + 1;
                        }
                        else {
                            pos = pos + 1;
                        }
                    }
                    var data = {
                        totalCount: totalCount,
                        sentiment: {
                            positive: pos,
                            neutral: neu,
                            negative: neg

                        },
                        sentiment_percentage: {
                            positive: (pos / totalCount) * 100,
                            neutral: (neu / totalCount) * 100,
                            negative: (neg / totalCount) * 100
                        }
                    }
                    return data;
                }
                else return result;
            }
        })
        .catch(function (error) {
            console.log("Error:", error)
            return '';
        });
};






twitterarchivepost.methods.findTweet = function (tweetId) {
    return this.model('TwitterArchivePost')
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

twitterarchivepost.methods.setSentimentStatus = function (socialAccount, tweetId, sentimentStatus) {
    var query = {
        accountId: socialAccount.social_id,
        tweetId: tweetId
    };
    var updateObject = {};
    updateObject.sentiment = sentimentStatus;
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else
                return "Status changed succesfully";
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.getCustomTagsFeeds = function (socialAccount, tweetId, groupName) {
    var query = {}
    query = {
        accountId: socialAccount.social_id,
        tweetId: tweetId
    };
    return this.model('TwitterArchivePost')
        .findOne(query, ['customtags', { '_id': 0 }])
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else {
                if (groupName) {
                    var groupRes = [];
                    for (var element in result.customtags) {

                        if (result.customtags[element].groupname == groupName) {

                            groupRes.push(result.customtags[element])
                        }

                    }
                    return groupRes;
                }
                else
                    return result;
            }
        })
        .catch(function (error) {
            console.log("Error", error);
        });
};

twitterarchivepost.methods.setCustomTag = function (socialAccount, tweetId, customeTagValue) {
    var query = {
        accountId: socialAccount.social_id,
        tweetId: tweetId
    };
    var updateObject = {};
    updateObject.customtag = customeTagValue;
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else
                return "Custome Tag Updated succesfully";
        })
        .catch(function (error) {
            console.log("Error", error);
        });
};

twitterarchivepost.methods.setCustomTags = function (socialAccount, tweetId, customeTagValue) {
    var query = {
        accountId: socialAccount.social_id,
        tweetId: tweetId
    };
    var updateObject = {};

    var data = [];
    for (var c in customeTagValue) {
        if (customeTagValue[c].groupname) {
            var datas = {
                groupname: customeTagValue[c].groupname,
                customtags: customeTagValue[c].customtags
            }
            data.push(datas)
        }
    }
    updateObject.customtags = data;
    return this.model('TwitterArchivePost')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else
                return "Custom Tag Updated succesfully";
        })
        .catch(function (error) {
            console.log("Error--", error);
        });
};

twitterarchivepost.methods.setCustomTagsSpecificGroup = function (socialAccount, tweetId, customeTagValue) {
    var query = {
        accountId: socialAccount.social_id,
        tweetId: tweetId
    };

    var groupName = customeTagValue[0].groupname
    return this.model('TwitterArchivePost')
        .findOne(query, ['customtags', { '_id': 0 }])
        .then(function (result) {
            if (!result) {
                return "No tweet found"
            }
            else {
                if (groupName) {

                    let checkCtag = result.customtags.find(i => i.groupname == groupName);

                    if (checkCtag) {

                        let checkCtag2 = result.customtags.filter(i => i.groupname != groupName);
                        checkCtag2.push(customeTagValue[0]);
                        return checkCtag2;


                    } else {
                        let checkCtag2 = result.customtags
                        checkCtag2.push(customeTagValue[0]);
                        return checkCtag2;

                    }
                }
                else {
                    return customeTagValue;
                }

            }

        })
        .catch(function (error) {
            console.log("Error", error);
        });

};

twitterarchivepost.methods.getArchivedAccountReportsOld = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    var query =
    {
        accountId: { $in: list },
        publishedDate: { $gte: new Date(startDate).setHours(0, 0, 0), $lte: new Date(endDate).setHours(23, 59, 59) }
    };
    if (keyword != "" && keyword != null) {
        if (keyword.indexOf("#") == 0) {
            query.hashtags = keyword
        }
        else {
            query.descritpion = new RegExp('.*' + keyword + '.*')
        }
    }
    if (startDate == endDate) {
        new Date(startDate).setHours(0, 0, 0)
    }
    if (sentimantScore)
        query.sentiment = sentimantScore
    if (custometag.length != 0)
        query.customtags = { $elemMatch: { custometag } }
    var data = {}
    return this.model('TwitterArchivePost')
        .find(query)
        //.sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            var retweet = 0;
            var likes = 0;
            var favorite = 0;
            var INTERACTION = 0;
            var replay = 0;
            var totalHashtag = 0;
            var tempObj = [];
            for (var i = 0; i < social_id.length; i++) {
                tempObj[social_id[i].social_id] = 0;
            }
            for (var c in result) {
                retweet = retweet + result[c].retweetCount
                likes = likes + result[c].favoriteCount
                INTERACTION = INTERACTION + result[c].mentions.length
                if (result[c].isLiked)
                    favorite = favorite + 1
                totalHashtag = totalHashtag + result[c].hashtags.length
                if (result[c].isReplayTweet)
                    replay = replay + 1;
                for (var i = 0; i < social_id.length; i++) {
                    if (result[c].accountId == social_id[i].social_id) {
                        tempObj[social_id[i].social_id] = tempObj[social_id[i].social_id] + 1
                    }
                }
            }
            data = {
                tweets: result.length,
                retweet: retweet,
                likes: likes,
                favorite: favorite,
                interaction: INTERACTION,
                replay: replay,
                totalHashtag: totalHashtag,
            };
            if (skip == 0 && limit == 0)
                return data
            else
                return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

twitterarchivepost.methods.getArchivedAccountReports = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
   
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    var query = {};
    if (custometag.length != 0) {

        let condition = [];

        custometag.map(customTag => {
            condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                { "customtags.customtags": { $all: customTag.customtags } });
        });

        query = { $and: condition }

    }
    query.accountId = { $in: list }
    query.publishedDate = { $gte: new Date(startDate).setHours(0, 0, 0), $lte: new Date(endDate).setHours(23, 59, 59) }

    if (keyword != "" && keyword != null) {
        if (keyword.indexOf("#") == 0) {
            query.hashtags = keyword
        }
        else {
            query.descritpion = new RegExp('.*' + keyword + '.*')
        }
    }
    if (sentimantScore)
        query.sentiment = sentimantScore


    var data = {}
    return this.model('TwitterArchivePost')
        .find(query)
        //.sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
           
                return result;

        })
        .catch(function (error) {
            console.log("Error", error);
        });
};

twitterarchivepost.methods.getArchivedAccountReportsAccounts = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
   
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    var query = {};
    if (custometag.length != 0) {

        let condition = [];

        custometag.map(customTag => {
            condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                { "customtags.customtags": { $all: customTag.customtags } });
        });

        query = { $and: condition }

    }
    query.accountId = { $in: list }

    var timestamp = Number(new Date(startDate).setHours(0, 0, 0))
    startDate  = new Date(timestamp)
    var timestamp = Number(new Date(endDate).setHours(23, 59, 59))
    endDate  = new Date(timestamp)
    query.publishedDate = { $gte: startDate, $lte: endDate }            
 
    if (keyword != "" && keyword != null) {
        if (keyword.indexOf("#") == 0) {
            query.hashtags = keyword
        }
        else {
            query.descritpion = new RegExp('.*' + keyword + '.*')
        }
    }
    if (sentimantScore)
        query.sentiment = sentimantScore
        query=[{$match:query},
            {"$group" : {_id:"$accountId", count:{$sum:1}}}
        ,{$project:{accountId:'$_id',_id:0,count:'$count'}} ]

        

    var data = {}
    return this.model('TwitterArchivePost')
        .aggregate(query)
       // .sort({ publishedDate: -1 })
        //.skip(skip)
        //.limit(limit)
        .then(function (result) {
            var results=[];
            for (var c in list){
                for (var count in result){
                    if(list[c]==result[count].accountId){
                        if(result[count].count!=0){
                            results.push(result[count].accountId)

                        }
                    }
                }
            }
           
                return results;

        })
        .catch(function (error) {
            console.log("Error", error);
        });
};

twitterarchivepost.methods.getArchivedAccountReportStats = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
    
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    var query = {};
    if (custometag.length != 0) {

        let condition = [];

        custometag.map(customTag => {
            condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                { "customtags.customtags": { $all: customTag.customtags } });
        });

        query = { $and: condition }

    }
    query.accountId = { $in: list }
    var timestamp = Number(new Date(startDate).setHours(0, 0, 0))
    startDate  = new Date(timestamp)
    var timestamp = Number(new Date(endDate).setHours(23, 59, 59))
    endDate  = new Date(timestamp)
    query.publishedDate = { $gte: startDate, $lte: endDate }

    if (keyword != "" && keyword != null) {
        if (keyword.indexOf("#") == 0) {
            query.hashtags = keyword
        }
        else {
            query.descritpion = new RegExp('.*' + keyword + '.*')
        }
    }
    if (sentimantScore)
        query.sentiment = sentimantScore

    query= [
        {$match:query},
            {$project:{
        favoriteCount: "$favoriteCount",
        retweetCount: "$retweetCount",
        numberHashtag: { $cond: { if: { $isArray: "$hashtags" }, then: { $size: "$hashtags" }, else: "0" } }
       ,favorite: {$cond: { if:  '$isLiked', then: 1,else: 0 }}
       , numberReplay: {$cond: { if:  '$isReplayTweet', then: 1,else: 0 }}
       , interaction:
           { $cond: { if: { $isArray: "$mentions" }, then: { $size: "$mentions" }, else: "0" } }
       }},
    {$group:{_id:'$customhashtag',
        retweet:{$sum:'$retweetCount'}
        ,likes: {$sum:'$favoriteCount'}
       ,favorite:{$sum:'$favorite'},
      replay: {$sum:'$numberReplay'},
        totalHashtag: {$sum:'$numberHashtag'},
        interaction:{$sum:'$interaction'}
        ,count:{$sum:1}}},
    {$project:{
        tweets:'$count',
        _id:0,
        likes:1,
        retweet:1,
        totalHashtag:1,
        favorite:1,
        replay:1,
        interaction:1
        }}   
        ]
    
    return this.model('TwitterArchivePost')
        .aggregate(query)
        .then(function (result) {
            var count = 0;
            var retweet = 0;
            var likes = 0;
            var favorite = 0;
            var INTERACTION = 0;
            var replay = 0;
            var totalHashtag = 0;

            if (result.length!=0) {

                count = result[0].tweets;
                retweet = result[0].retweet
                likes = result[0].likes
                INTERACTION = result[0].interaction 
                favorite = result[0].favorite
                totalHashtag = result[0].totalHashtag
                replay =result[0]. replay

            }


            data = {
                tweets: count,
                retweet: retweet,
                likes: likes,
                favorite: favorite,
                interaction: INTERACTION,
                replay: replay,
                totalHashtag: totalHashtag,
            };



                return data
        })
        .catch(function (error) {
        });
};

twitterarchivepost.methods.getArchivedAccountReportsold1 = function (social_id, isforTeam, startDate, endDate, keyword, category1, category2, sentimantScore, custometag, skip, limit, isForFeeds) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }
    var query =
    {
        accountId: { $in: list },
        publishedDate: { $gte: new Date(startDate).setHours(0, 0, 0), $lte: new Date(endDate).setHours(23, 59, 59) }
    };
    if (keyword != "" && keyword != null) {
        if (keyword.indexOf("#") == 0) {
            query.hashtags = keyword
        }
        else {
            query.descritpion = new RegExp('.*' + keyword + '.*')
        }
    }
    if (sentimantScore)
        query.sentiment = sentimantScore
    if (custometag.length != 0) {
        skip = 0
        limit = 0
    }
    var data = {}
    return this.model('TwitterArchivePost')
        .find(query)
        //.sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            var count = 0;
            var retweet = 0;
            var likes = 0;
            var favorite = 0;
            var INTERACTION = 0;
            var replay = 0;
            var totalHashtag = 0;
            var tempObj = [];
            for (var i = 0; i < social_id.length; i++) {
                tempObj[social_id[i].social_id] = 0;
            }

            var datas = [];
            for (var c in result) {
                if (custometag.length != 0) {
                    var d = 0;
                    for (var e in custometag) {
                        if (result[c].customtags.length != 0) {
                            for (var f in result[c].customtags) {
                                if (result[c].customtags[f].groupname == custometag[e].groupname)
                                    if ((custometag[e].customtags).every(v => result[c].customtags[f].customtags.includes(v))) {
                                        d = d + 1;
                                        if (d == custometag.length) {
                                            count = count + 1;
                                            datas.push(result[c])
                                            retweet = retweet + result[c].retweetCount
                                            likes = likes + result[c].favoriteCount
                                            INTERACTION = INTERACTION + result[c].mentions.length
                                            if (result[c].isLiked)
                                                favorite = favorite + 1
                                            totalHashtag = totalHashtag + result[c].hashtags.length
                                            if (result[c].isReplayTweet)
                                                replay = replay + 1;
                                            for (var i = 0; i < social_id.length; i++) {
                                                if (result[c].accountId == social_id[i].social_id) {
                                                    tempObj[social_id[i].social_id] = tempObj[social_id[i].social_id] + 1
                                                }
                                            }
                                        }
                                    }
                            }
                        }
                    }
                }
                else {
                    count = count + 1;
                    retweet = retweet + result[c].retweetCount
                    likes = likes + result[c].favoriteCount
                    INTERACTION = INTERACTION + result[c].mentions.length
                    if (result[c].isLiked)
                        favorite = favorite + 1
                    totalHashtag = totalHashtag + result[c].hashtags.length
                    if (result[c].isReplayTweet)
                        replay = replay + 1;
                    for (var i = 0; i < social_id.length; i++) {
                        if (result[c].accountId == social_id[i].social_id) {
                            tempObj[social_id[i].social_id] = tempObj[social_id[i].social_id] + 1
                        }
                    }
                }

            }
            data = {
                tweets: count,
                retweet: retweet,
                likes: likes,
                favorite: favorite,
                interaction: INTERACTION,
                replay: replay,
                totalHashtag: totalHashtag,
            };
            if (skip == 0 && limit == 0) {
                if (isForFeeds)
                    return datas;
                else
                    return data
            }
            else
                return result;

        })
        .catch(function (error) {
        });
};



twitterarchivepost.methods.removeSocialAccountPosts = function (accountId, isArray, skip, limit) {
    var query = {};
    if (!isArray)
        query.accountId = new RegExp(accountId, 'i')
    else
        query.accountId = { $in: accountId }

    return this.model('TwitterArchivePost')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log("Error", error);
        });
};

twitterarchivepost.methods.getSocialAccountPostsArray = function (accountId, skip, limit) {
    var query = {
        accountId: { $in: accountId }
    };
    return this.model('TwitterArchivePost')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log("Error", error);
        });
};

const twitterarchiveModel = mongoose.model('TwitterArchivePost', twitterarchivepost);

module.exports = twitterarchiveModel;
