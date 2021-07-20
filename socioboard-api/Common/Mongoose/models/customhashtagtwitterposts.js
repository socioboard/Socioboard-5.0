const mongoose = require('mongoose');
const moment = require('moment');
const { count } = require('./facebookposts');
const Schema = mongoose.Schema;
const gender = require('gender-detection');
const { gen } = require('gender-detection/genders/male');
const { getGender } = require('gender-detection-from-name')
const detect = require('detect-gender');
const request = require('request');
var rn = require('random-number');
const { datastore_v1 } = require('googleapis');
var rn = require('random-number');




mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const customhashtagtwitterposts = new Schema({
    customhashtag: { type: String },
    tweetId: { type: String, index: true, unique: true },
    publishedDate: { type: Date, default: Date.now, index: true },
    description: { type: String },
    mediaUrls: {
        type: [{
            type: { type: String, default: '' },
            url: { type: String, default: '' }
        }]
    },
    hashtags: { type: [String] },
    mentions: { type: [String] },
    retweetCount: { type: Number },
    favoriteCount: { type: Number },
    postedAccountId: { type: String },
    postedAccountScreenName: { type: String },
    postedAccountUserName: { type: String },
    postedAccountProfilePic: { type: String },
    isApplicationPost: { type: Boolean },
    tweetUrl: { type: String },
    isLiked: { type: Boolean, default: false },
    sentiment: { type: String, default: '' },
    custometag: { type: String, default: '' },
    customtags: {
        type: [{
            groupname: { type: String, default: '' },
            customtags: { type: [String] }
        }]
    },
    quoteDetails: {
        type: [{
            quoteTweetId: { type: String, default: '' },
            quoteTweetUrl: { type: String, default: '' },
            quoteTweetText: { type: String, default: '' },
            quoteTweetMediaUrls: { type: [String] }
        }]
    },
    isReplayTweet: { type: Boolean, default: false },
    isReTweet: { type: Boolean, default: false },
    retweetStatus: {
        type: [{
            retweetTweetId: { type: String, default: '' },
            retweetTweetUrl: { type: String, default: '' },
            retweetTweetText: { type: String, default: '' },
            postedAccountScreenName: { type: String },

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
    likedAccounts: {
        type: [{
            accountId: { type: String, default: '' },
            accountName: { type: String, default: '' },
            followersCount: { type: String, default: '' },
            profilePic: { type: String },
            isLiked: { type: Boolean, default: false }
        }]
    },
    retweetedAccounts: {
        type: [{
            accountId: { type: String, default: '' },
            accountName: { type: String, default: '' },
            followersCount: { type: String, default: '' },
            profilePic: { type: String },
            isRetweeted: { type: Boolean, default: false }
        }]
    },


    batchId: { type: String },
    archivedStatus: { type: String },
    serverMediaUrl: {
        type: [{
            type: { type: String, default: '' },
            url: { type: String, default: '' }
        }]
    },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

customhashtagtwitterposts.methods.insertManyPosts = function (posts) {
    return this.model('customhashtagtwitterposts')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { tweetId: post.tweetId },
                    update: post,
                    //   $setOnInsert:{"archivedStatus":"0"},
                    //  $setOnUpdate:{"archivedStatus":"0"},
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            return 0;
        });
};


customhashtagtwitterposts.methods.getSocialAccountPostsForKeyword = function (accountId, keyword, skip, limit, startDate, endDate) {
    var query = {};

    if (!startDate || !endDate) {
        if (keyword.indexOf("#") == 0) {
            query = {
                accountId: new RegExp(accountId, 'i'),
                hashtags: keyword
            };
        }
        else {
            query = {
                accountId: new RegExp(accountId, 'i'),
                descritpion: new RegExp('.*' + keyword + '.*'),
            };
        }
    }
    else {
        if (keyword.indexOf("#") == 0) {
            query = {
                accountId: new RegExp(accountId, 'i'),
                hashtags: keyword,
                publishedDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            };
        }
        else {
            query = {
                accountId: new RegExp(accountId, 'i'),
                descritpion: new RegExp('.*' + keyword + '.*'),
                publishedDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            };
        }

    }



    return this.model('customhashtagtwitterposts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
        });
};



customhashtagtwitterposts.methods.deleteAccountPosts = function (accountId) {
    var query = {
        accountId: new RegExp(accountId, 'i')
    };
    return this.model('customhashtagtwitterposts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.deleteSingleTweet = function (tweetId) {
    var query = {
        tweetId: new RegExp(tweetId)
    };

    return this.model('customhashtagtwitterposts')
        .findOneAndDelete(query)
        .then(function (result) {
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

customhashtagtwitterposts.methods.findLastRecentTweetId = function () {
    return this.model('customhashtagtwitterposts')
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

customhashtagtwitterposts.methods.getTwitterByCustomHashtag = function (keyword, skip, limit) {

    var query = {
        customhashtag: keyword
    };

    return this.model('customhashtagtwitterposts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
        });

    // return this.model('customhashtagtwitterposts')
    // .find(query)
    // .skip(skip)
    // .limit(limit)
    // .then(function (result) {
    //     if (!result) {
    //         throw new Error('no previous data found.');
    //     } else {
    //         return result;
    //     }
    // })
    // .catch(function (error) {
    //     return '';
    // });
};


customhashtagtwitterposts.methods.returnmaxId = function (customhashtag) {
    return this.model('customhashtagtwitterposts')
        .find({ customhashtag: customhashtag }).limit(1).sort({ publishedDate: 1 })
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

customhashtagtwitterposts.methods.returnmaxIdWithDate = function (customhashtag) {
    return this.model('customhashtagtwitterposts')
        .find({ customhashtag: customhashtag }).limit(1).sort({ publishedDate: 1 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                return result ? result : '';
            }
        })
        .catch(function (error) {
            return '';
        });
};

customhashtagtwitterposts.methods.returnSinceId = function (customhashtag) {
    return this.model('customhashtagtwitterposts')
        .find({ customhashtag: customhashtag }).limit(1).sort({ publishedDate: -1 })
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


customhashtagtwitterposts.methods.updateCommentCount = function (tweetId, method) {
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
    return this.model('customhashtagtwitterposts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

customhashtagtwitterposts.methods.findAllHashTags = function (startDate, endDate, hashtags, linkedHashtag, custometag) {
    var list = [];
    if (linkedHashtag) {
        list = list.concat(hashtags);
    }
    else {
        for (var ids in hashtags) {
            list = list.concat(hashtags[ids].customhashtag)
        }
    }


    var query = {};
    if (linkedHashtag) {
        if (custometag.length != 0) {

            let condition = [];

            custometag.map(customTag => {
                condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                    { "customtags.customtags": { $all: customTag.customtags } });
            });

            query = { $and: condition }

        }
    }

    query.customhashtag = { $in: list };


    return this.model('customhashtagtwitterposts')
        .find(query, { customhashtag: 1, hashtags: 1, _id: 0 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var data = [];
                if (linkedHashtag) {
                    for (var count in result) {
                        if ([result[count].hashtags].length != 0)
                            data = data.concat(result[count].hashtags)
                    }
                }
                else {

                    for (var count in result) {
                        for (var datas in list) {
                            if (result[count].customhashtag == list[datas]) {
                                data = data.concat(list[datas])
                            }
                        }
                    }
                }

                var occurrences = {};
                for (var i = 0, j = data.length; i < j; i++) {
                    occurrences[data[i]] = (occurrences[data[i]] || 0) + 1;
                }

                var datas = {
                    totalPost: result.length,
                    totalNumberofHashtag: result.length,
                    occurrences: occurrences,
                };
                return datas;
            }
        })
        .catch(function (error) {
            return '';
        });
};

customhashtagtwitterposts.methods.getlinkedwithhashtag = function (startDate, endDate, hashtags, linkedHashtag, custometag) {
    var list = [];
    if (linkedHashtag) {
        list = list.concat(hashtags);
    }
    else {
        for (var ids in hashtags) {
            list = list.concat(hashtags[ids].customhashtag)
        }
    }


    var query = {};
    if (linkedHashtag) {
        if (custometag.length != 0) {

            let condition = [];

            custometag.map(customTag => {
                condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                    { "customtags.customtags": { $all: customTag.customtags } });
            });

            query = { $and: condition }

        }
    }

    query.customhashtag = { $in: list };

    query=[
        {$match:query},
        {$project:{
            customhashtag:1,
            hashtags:1
            }},
        {$unwind:'$hashtags'},
        {$group:{_id:{customhashtag:'$customhashtag',hashtags:'$hashtags'}
         ,count:{$sum:1}}},
        {$project:{
                tag:'$_id.hashtags',
                count:1,
                _id:0,
     
        }},
        { $sort : { count : -1 } }
        ]


    return this.model('customhashtagtwitterposts')
        .aggregate(query ).skip(0).limit(100)
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var datas = {
                    occurrences: result
                };
                return datas;
            }
        })
        .catch(function (error) {
            return '';
        });
};


customhashtagtwitterposts.methods.geteEmsSuggestedHashtag = function (startDate, endDate, hashtags, linkedHashtag, custometag) {
    var list = [];
    if (linkedHashtag) {
        list = list.concat(hashtags);
    }
    else {
        for (var ids in hashtags) {
            list = list.concat(hashtags[ids].customhashtag)
        }
    }


    var query = {};
    if (linkedHashtag) {
        if (custometag.length != 0) {

            let condition = [];

            custometag.map(customTag => {
                condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                    { "customtags.customtags": { $all: customTag.customtags } });
            });

            query = { $and: condition }

        }
    }

    query.customhashtag = { $in: list };


    query= [{$match:{customhashtag:{$in:list}}},
    {$group:{_id:'$customhashtag',count:{$sum:1}}}
    ,{$project:{
        tag:'$_id',
        count:1,
        _id:0
 
    }}
]



    return this.model('customhashtagtwitterposts')
        .aggregate(query 
        )
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var datas = {
                    occurrences: result
                };
                return datas;
            }
        })
        .catch(function (error) {
            return '';
        });
};


customhashtagtwitterposts.methods.getTweetDayWiseold = function (social_id, isforTeam) {
    var list = [];
    if (!isforTeam) {
        list = list.concat(social_id);
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
        }
    }

    return this.model('customhashtagtwitterposts')
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
            }
            else {
                var results = result;
                var daywise = [];
                var totalPost = 0, totalLike = 0, totalRetweet = 0, totalHashtag = 0;
                if (result.length != 0) {
                    for (var count in result) {
                        totalPost = totalPost + result[count].tweets
                        totalLike = totalLike + result[count].likes
                        totalRetweet = totalRetweet + result[count].retweets
                        totalHashtag = totalHashtag + result[count].hashtags
                        var daywises = {
                            date: result[count]._id,
                            likes: result[count].likes,
                            retweets: result[count].retweets,
                            hashtags: result[count].hashtags,
                            tweets: result[count].tweets,
                        }
                        daywise.push(daywises);
                    }

                }
                var data = {
                    totalPost: totalPost,
                    totalLike: totalLike,
                    totalRetweet: totalRetweet,
                    totalHashtag: totalHashtag,
                    data: daywise
                }

                return data;
            }
        })
        .catch(function (error) {
            return '';
        });

 
};


customhashtagtwitterposts.methods.updateLikeCount = function (tweetId, method) {
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    var updateObject = '';
    if (method == 'increment') {
        updateObject = { $inc: { 'favoriteCount': 1 } };
    }
    else {
        query.favoriteCount= {$gte: 1}
        updateObject = { $inc: { 'favoriteCount': -1 } };
    }
    return this.model('customhashtagtwitterposts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

customhashtagtwitterposts.methods.updateLikeedAccount = function (tweetId, accountId, accountName, followersCount, profilePic, isLiked) {
    var query = {
        tweetId: new RegExp(tweetId, 'i'),
        'likedAccounts.accountId': { $ne: accountId }

    };
    this.model('customhashtagtwitterposts')
        .updateOne(query, {
            $push: {
                likedAccounts: {
                    "accountId": accountId,
                    "accountName": accountName,
                    "followersCount": followersCount,
                    "profilePic": profilePic,
                    "isLiked": isLiked
                }
            }
        })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });


    this.model('customhashtagtwitterposts')
        .findOneAndUpdate({
            "likedAccounts.accountId": accountId,
            tweetId: tweetId
        }, {
            $set: {
                "likedAccounts.$.isLiked": isLiked
            }
        })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });

};

customhashtagtwitterposts.methods.updateRetweetedaccount = function (tweetId, accountId, accountName, followersCount, profilePic, isRetweeted) {
    var query = {
        tweetId: new RegExp(tweetId, 'i'),
        'retweetedAccounts.accountId': { $ne: accountId }
    };

    this.model('customhashtagtwitterposts')
        .updateOne(query, {
            $push: {
                retweetedAccounts: {
                    "accountId": accountId,
                    "accountName": accountName,
                    "followersCount": followersCount,
                    "profilePic": profilePic,
                    "isRetweeted": isRetweeted
                }
            }
        })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });


    this.model('customhashtagtwitterposts')
        .findOneAndUpdate({
            "retweetedAccounts.accountId": accountId,
            tweetId: tweetId
        }, {
            $set: {
                "retweetedAccounts.$.isRetweeted": isRetweeted
            }
        })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });

};

customhashtagtwitterposts.methods.getTweetDayWise = function (hashtags, startDate, endDate, sentiment, custometag) {
    
    var timestamp = Number(new Date(startDate).setHours(0, 0, 0))
    startDate  = new Date(timestamp)
    var timestamp = Number(new Date(endDate).setHours(23, 59, 59))
    endDate  = new Date(timestamp)

    var query;
    query = {
        $match: {
            customhashtag: hashtags,
            publishedDate: { $gte: startDate, $lte:endDate}
        }
    };

    if (sentiment) {
        query = {
            $match: {
                customhashtag: hashtags, sentiment: sentiment,
                publishedDate: { $gte: startDate, $lte:endDate}            }
        };
    }
    if (custometag.length != 0) {
        let condition = [];

        custometag.map(customTag => {
            condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                { "customtags.customtags": { $all: customTag.customtags } });
        });

        if (sentiment) {
            query = {
                $match: {
                    $and: condition,
                    sentiment: sentiment,
                    customhashtag: hashtags,
                    publishedDate: { $gte: startDate, $lte:endDate}                }
            };
        }
        else {
            query = {
                $match: {
                    $and: condition,
                    customhashtag: hashtags,
                    publishedDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            };
        }
    };

    return this.model('customhashtagtwitterposts')
        .aggregate([
            query,
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
                    numberHashtag: { $cond: { if: { $isArray: "$hashtags" }, then: { $size: "$hashtags" }, else: "0" } },
                    numberMention: { $cond: { if: { $isArray: "$mentions" }, then: { $size: "$mentions" }, else: "0" } }
                }
            },
            {
                $group: {
                    _id: "$date"
                    , likes: { $sum: "$favoriteCount" }
                    , retweets: { $sum: "$retweetCount" },
                    tweets: { $sum: 1 },
                    mentions: { $sum: "$numberMention" },
                    hashtags: { $sum: "$numberHashtag" }
                }
            },
            { $sort: { _id: -1 } }
        ])
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            }
            else {
                var dates = [];

                if (startDate && endDate) {
                    var day = 1000 * 60 * 60 * 24;
                    date1 = new Date(startDate);
                    date2 = new Date(endDate);

                    var diff = (date2.getTime() - date1.getTime()) / day;
                    for (var i = 0; i <= diff; i++) {
                        var xx = date1.getTime() + day * i;
                        var yy = new Date(xx);
                        dates.push(yy);
                    }
                }

                var results = result;
                var daywise = [];
                var totalPost = 0, totalLike = 0, totalRetweet = 0, totalHashtag = 0, totalMention = 0, interaction = 0;
                if (result.length != 0) {
                    for (var count in result) {
                        totalPost = totalPost + result[count].tweets
                        totalLike = totalLike + result[count].likes
                        totalRetweet = totalRetweet + result[count].retweets
                        totalHashtag = totalHashtag + result[count].hashtags
                        totalMention = totalMention + result[count].mentions
                        var daywises = {
                            date: result[count]._id,
                            likes: result[count].likes,
                            retweets: result[count].retweets,
                            hashtags: result[count].hashtags,
                            tweets: result[count].tweets,
                            mentions: result[count].mentions,
                        }
                        daywise.push(daywises);
                    }

                    if (startDate && endDate) {
                        var daywisesData = [];
                        for (var count in dates) {
                            var daywises = {
                                date: (dates[count].getFullYear() + "-" + ('0' + (dates[count].getMonth() + 1)).slice(-2) + "-" + ('0' + dates[count].getDate()).slice(-2)),
                                likes: 0,
                                retweets: 0,
                                hashtags: 0,
                                tweets: 0,
                                mentions: 0,
                            }
                            daywisesData.push(daywises)
                        }
                        for (var d in daywisesData) {
                            for (var c in daywise) {
                                if (daywisesData[d].date == daywise[c].date) {
                                    daywisesData[d].date = daywise[c].date
                                    daywisesData[d].likes = daywise[c].likes
                                    daywisesData[d].retweets = daywise[c].retweets
                                    daywisesData[d].hashtags = daywise[c].hashtags
                                    daywisesData[d].tweets = daywise[c].tweets
                                    daywisesData[d].mentions = daywise[c].mentions
                                }
                                // daywisesData.push(daywises)
                            }
                        }

                        daywise = daywisesData;
                    }


                }
                var data = {
                    totalPost: totalPost,
                    totalLike: totalLike,
                    totalRetweet: totalRetweet,
                    totalHashtag: totalHashtag,
                    totalMention: totalMention,
                    interaction: (totalMention / totalPost) * 100,
                    data: daywise
                }

                return data;
            }
        })
        .catch(function (error) {
            return '';
        });


};

customhashtagtwitterposts.methods.getSentimentAnalysis = function (hashtag, startDate, endDate, custometag) {


    var timestamp = Number(new Date(startDate).setHours(0, 0, 0))
    startDate  = new Date(timestamp)
    var timestamp = Number(new Date(endDate).setHours(23, 59, 59))
    endDate  = new Date(timestamp)

    var query = {};
    if (custometag.length != 0) {

        let condition = [];

        custometag.map(customTag => {
            condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                { "customtags.customtags": { $all: customTag.customtags } });
        });

        query = { $and: condition }

    }

    query.customhashtag = hashtag

    if (startDate && endDate) {
        query.publishedDate = { $gte: startDate, $lte:endDate}            
    }


    
    query=[
        {$match:query},
        {$project:{
            customhashtag:1,
            sentiment:1
            }},        
          {$group:{_id:{customhashtag:'$customhashtag',sentiment:'$sentiment'}
          ,count:{$sum:1}}},
        {$project:{
    
          sentiment:'$_id.sentiment',
                 count:1,
                _id:0,
    //  
        }}
        ]


    return this.model('customhashtagtwitterposts')
        .aggregate(query)
        //.find({ accountId:  social_id }, { sentiment: 1, _id: 0 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var totalCount = result.length;
                if (totalCount > 0) {
                    totalCount = 0;
                    var pos = 0;
                    var neg = 0;
                    var neu = 0;

                    for (var count in result) {
                        if (result[count].sentiment == 0) {
                                neu = result[count].count
                            }
                            else if (result[count].sentiment == -1) {
                                neg = result[count].count
                            }
                            else {
                                pos = result[count].count
                            }

                        }
                    }
                    totalCount = neu + neg + pos;


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



            }   )
        
        .catch(function (error) {
            return '';
        });
};



customhashtagtwitterposts.methods.getGenderAnalysisRand = function (social_id, isforTeam, hashtag, startDate, endDate) {

    var genf = rn.generator({
        min: 3
        , max: 55
        , integer: true
    })
    var f = genf(47);
    var m = genf(42);
    var ot = genf(0);
    var genderDataAnalysis = {

        female: f,
        male: m,
        unknown: ot,
    }

    return genderDataAnalysis;

};




customhashtagtwitterposts.methods.getCustomTagsFeeds = function (tweetId, groupName) {
    var query = {}
    query = {
        tweetId: tweetId
 };
    return this.model('customhashtagtwitterposts')
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


customhashtagtwitterposts.methods.getGenderAnalysis = function (social_id, isforTeam, hashtag, startDate, endDate) {

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

    if (!hashtag) {
        query = { accountId: { $in: list } };
    }
    else {
        query = { accountId: { $in: list }, hashtags: hashtag };
    }

    if (startDate && endDate) {
        query.publishedDate = { $gte: new Date(startDate), $lte: new Date(endDate) }

    }

    return this.model('customhashtagtwitterposts')
        .find(query)
        //.find({ accountId:  social_id }, { sentiment: 1, _id: 0 })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var totalCount = result.length;
                if (totalCount > 0) {
                    var data;
                    var mentions = [];
                    for (var c in result) {
                        if (result[c].mentions.length != 0) {
                            for (var i = 0; i < result[c].mentions.length; i++) {

                                mentions.push(result[c].mentions[i])
                            }
                        }
                    }

                    var female = 0;
                    var male = 0;
                    var unknown = 0;
                    var total = mentions.length

                    for (var d in mentions) {
                        var parsename = mentions[d].replace(/[^a-zA-Z]/g, '');
                        request.get({
                            url: `https://api.genderize.io/?name=${parsename}`
                        }, function (error, response, body) {
                            var parsedBody = JSON.parse(body);
                            var genType = parsedBody.gender;
                            if (genType == "female")
                                female = female + 1;
                            else if (genType == "male")
                                male = male + 1;
                            else
                                unknown = unknown + 1
                        });
                    }

                    var genderDataAnaylisi = {
                        female: (female / total) * 100,
                        male: (male / total) * 100,
                        unknown: (unknown / total) * 100
                    }

                    return genderDataAnaylisi;
                }
                else return result;



            }
        })
        .catch(function (error) {
            return '';
        });
};





customhashtagtwitterposts.methods.setSentimentStatus = function (tweetId, sentimentStatus) {
    var query = {
        tweetId: tweetId
    };
    var updateObject = {};
    updateObject.sentiment = sentimentStatus;
    return this.model('customhashtagtwitterposts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else
                return "Status changed succesfully";
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.setCustomTag = function (socialAccount, tweetId, customeTagValue) {
    var query = {
        accountId: socialAccount.social_id,
        tweetId: tweetId
    };
    var updateObject = {};
    updateObject.custometag = customeTagValue;
    return this.model('customhashtagtwitterposts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else
                return "Custome Tag Updated succesfully";
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.setCustomTags = function (tweetId, customeTagValue) {
    var query = {
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
    return this.model('customhashtagtwitterposts')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            if (!result)
                return "No tweet found"
            else
                return "Custom Tag Updated succesfully";
        })
        .catch(function (error) {
        });
};


customhashtagtwitterposts.methods.setCustomTagsSpecificGroup = function (tweetId, customeTagValue) {
    var query = {
        tweetId: tweetId
    };

var groupName=customeTagValue[0].groupname
  return this.model('customhashtagtwitterposts')
    .findOne(query, ['customtags', {'_id': 0} ])
    .then( function(result)  {
        if (!result){
            return "No tweet found"
        }
        else {
            if (groupName) {
     
                let checkCtag=result.customtags.find(i=>i.groupname==groupName);
                
                if (checkCtag  ){

                    let checkCtag2=result.customtags.filter(i=>i.groupname!=groupName);
                    checkCtag2.push(customeTagValue[0]);
                     return checkCtag2;


                  }else {
                    let checkCtag2=result.customtags
                    checkCtag2.push(customeTagValue[0]);
                     return checkCtag2;

                  }
            }
            else{
             return customeTagValue;
            }
               
        }

    
    })
    .catch(function (error) {
        console.log("Error", error);
    });
};

customhashtagtwitterposts.methods.getCustomTag = function (accountId, teamId) {
    var query = {
        accountId: new RegExp(accountId, 'i'),
        custometag: { $ne: null }
    };
    return this.model('customhashtagtwitterposts')
        .find(query)
        //.sort({ custometag:  })
        //.skip(skip)
        .limit(10)
        .then(function (result) {

            result = result.map(t => t.custometag)
            return result;
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.findTweet = function (tweetId) {
    return this.model('customhashtagtwitterposts')
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

customhashtagtwitterposts.methods.getArchivedAccountDetail = function (socialData) {
    var list = [];

    var dataToReturn = socialData.accountDetails;

    for (var count in socialData.accountDetails)
        list = list.concat(socialData.accountDetails[count].social_id)


    return this.model('customhashtagtwitterposts')
        .aggregate([
            { '$match': { accountId: { $in: list } } },
            { '$unwind': '$accountId' },
            { '$group': { '_id': '$accountId', 'count': { '$sum': 1 }, 'archivedStatus': { $addToSet: '$archivedStatus' } } }
        ])
        // .distinct( "archivedStatus", { accountId:  { $in : list }},
        // {$group : { _id : "$accountId" } })
        // .find()
        // .find({ accountId:  { $in : list } })
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            } else {
                var data = result;

                if (data.length != 0) {
                    for (var c in data) {
                        for (var d in dataToReturn) {
                            if (dataToReturn[d].social_id == data[c]._id) {
                                for (var dd in data[c].archivedStatus) {
                                    if (data[c].archivedStatus[dd] == "0") {
                                        dataToReturn[d].dataValues.status = 0;
                                        break;
                                    }
                                    else if (data[c].archivedStatus[dd] == "2") {
                                        dataToReturn[d].dataValues.status = 2;
                                        break;
                                    }
                                    else {
                                        dataToReturn[d].dataValues.status = 1;
                                    }
                                }
                            }
                        }
                    }
                }


                return dataToReturn;
            }
        })
        .catch(function (error) {
            return '';
        });
};

customhashtagtwitterposts.methods.getSocialAccountPostsArray = function (accountId, skip, limit) {
    var query = {
        accountId: { $in: accountId }
    };
    return this.model('customhashtagtwitterposts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.getSingleCustomHashtagFeed = function (tweetId, skip, limit) {
    var query = {
        tweetId: tweetId
    };
    return this.model('customhashtagtwitterposts')
        .find(query)
        //.sort({ publishedDate: -1 })
        //.skip(skip)
       // .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.getPrimitiveReport = function (statData, social_id, isforTeam, startDate, endDate) {
    var list = [];
    var totalFollowers = 0;
    if (!isforTeam) {
        list = list.concat(social_id);
        totalFollowers = statData.followers
    }
    else {
        for (var ids in social_id) {
            list = list.concat(social_id[ids].social_id)
            totalFollowers = totalFollowers + parseInt(social_id[ids].friendship_counts)
        }
    }



    var query = {};
    query = {
        $match: {
            accountId: { $in: list },
            publishedDate: { $gte: (new Date(startDate)), $lte: new Date(endDate) }
        }
    };

    return this.model('customhashtagtwitterposts')
        .aggregate([
            query,
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
                    numberHashtag: { $cond: { if: { $isArray: "$hashtags" }, then: { $size: "$hashtags" }, else: "0" } },
                    numberMention: { $cond: { if: { $isArray: "$mentions" }, then: { $size: "$mentions" }, else: "0" } }

                }
            },
            {
                $group: {
                    _id: "$date"
                    , likes: { $sum: "$favoriteCount" }
                    , retweets: { $sum: "$retweetCount" },
                    tweets: { $sum: 1 },
                    mentions: { $sum: "$numberMention" },
                    hashtags: { $sum: "$numberHashtag" }

                }
            },
            { $sort: { _id: -1 } }
        ])
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            }
            else {
                if (startDate && endDate) {
                    var day = 1000 * 60 * 60 * 24;
                    date1 = new Date(startDate);
                    date2 = new Date(endDate);

                    var dates = [];
                    var diff = (date2.getTime() - date1.getTime()) / day;
                    for (var i = 0; i <= diff; i++) {
                        var xx = date1.getTime() + day * i;
                        var yy = new Date(xx);
                        dates.push(yy);
                    }
                }

                var results = result;
                var daywise = [];
                var totalPost = 0, totalLike = 0, totalRetweet = 0, totalHashtag = 0, totalMention = 0, interaction = 0, totalmediaUrls = 0;
                if (result.length != 0) {
                    for (var count in result) {
                        totalPost = totalPost + result[count].tweets
                        totalLike = totalLike + result[count].likes
                        totalRetweet = totalRetweet + result[count].retweets
                        totalHashtag = totalHashtag + result[count].hashtags
                        totalMention = totalMention + result[count].mentions
                        var daywises = {
                            date: result[count]._id,
                            likes: result[count].likes,
                            retweets: result[count].retweets,
                            hashtags: result[count].hashtags,
                            tweets: result[count].tweets,
                            mentions: result[count].mentions
                        }
                        daywise.push(daywises);
                    }

                    if (startDate && endDate) {
                        var daywisesData = [];
                        for (var count in dates) {
                            var daywises = {
                                date: (dates[count].getFullYear() + "-" + (dates[count].getMonth() + 1) + "-" + dates[count].getDate()),
                                likes: 0,
                                retweets: 0,
                                hashtags: 0,
                                tweets: 0,
                                mentions: 0,
                            }
                            daywisesData.push(daywises)
                        }
                        for (var d in daywisesData) {
                            for (var c in daywise) {
                                if (daywisesData[d].date == daywise[c].date) {
                                    daywisesData[d].date = daywise[c].date
                                    daywisesData[d].likes = daywise[c].likes
                                    daywisesData[d].retweets = daywise[c].retweets
                                    daywisesData[d].hashtags = daywise[c].hashtags
                                    daywisesData[d].tweets = daywise[c].tweets
                                    daywisesData[d].mentions = daywise[c].mentions
                                }
                                // daywisesData.push(daywises)
                            }
                        }

                        daywise = daywisesData;
                    }


                }
                var data = {
                    totalPost: totalPost,
                    totalLike: totalLike,
                    totalRetweet: totalRetweet,
                    totalHashtag: totalHashtag,
                    totalMention: totalMention,
                    totalmediaUrls: statData.totalMediaUrls,
                    totalPlainText: statData.totalPlainText,
                    totalLinks: statData.totalLinks,
                    totalFollowers: totalFollowers,
                    interaction: (totalMention / totalPost) * 100,
                    data: daywise
                }


                return data;
            }
        })
        .catch(function (error) {

            return '';
        });

};

customhashtagtwitterposts.methods.getPrimitiveReportStats = function (social_id, isforTeam, startDate, endDate) {
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
    query = {
        accountId: { $in: list },
        publishedDate: { $gte: (new Date(startDate)), $lte: new Date(endDate) }
    };

    return this.model('customhashtagtwitterposts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(0)
        .limit(0)
        .then(function (result) {
            var totalMediaUrls = 0;
            var totalPlainText = 0;
            var totalLinks = 0;
            for (var count in result) {
                if (result[count].mediaUrls.length != 0) {
                    totalMediaUrls = totalMediaUrls + result[count].mediaUrls.length;
                }
                else if (new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(result[count].descritpion)) {
                    totalLinks = totalLinks + 1;
                }
                else {
                    totalPlainText = totalPlainText + 1
                }

            }

            var data = {
                totalMediaUrls: totalMediaUrls,
                totalPlainText: totalPlainText,
                totalLinks: totalLinks
            };

            return data;
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.getCustomHashtagAnalytics = function (hashtags, startDate, endDate, sentiment, custometag) {

    var timestamp = Number(new Date(startDate).setHours(0, 0, 0))
    startDate  = new Date(timestamp)
    var timestamp = Number(new Date(endDate).setHours(23, 59, 59))
    endDate  = new Date(timestamp)


    var query = {};
    if (custometag.length != 0) {

        let condition = [];

        custometag.map(customTag => {
            condition.push({ "customtags": { $elemMatch: { groupname: customTag.groupname } } },
                { "customtags.customtags": { $all: customTag.customtags } });
        });

        query = { $and: condition }

    }
    query.customhashtag = hashtags;
    if (startDate && endDate) {
        query.publishedDate = { $gte: startDate, $lte:endDate}            
    }
    if (sentiment)
        query.sentiment = sentiment



    return this.model('customhashtagtwitterposts')
        .find(query, {})
        // .sort({ publishedDate: -1 })
        // .skip(skip)
        // .limit(limit)
        .then(function (result) {

            var retweet = 0;
            var likes = 0;
            var favorite = 0;
            var INTERACTION = 0;
            var replay = 0;
            var totalMale = 0;
            var totalFemale = 0;
            var totalunknown = 0;
            var tweetsCount = 0;

            for (var c in result) {

                tweetsCount = result.length
                retweet = retweet + result[c].retweetCount
                likes = likes + result[c].favoriteCount

                INTERACTION = INTERACTION + result[c].mentions.length

                if (result[c].isLiked)
                    favorite = favorite + 1

                if (result[c].isReplayTweet)
                    replay = replay + 1;

                var genders;
                if (result[c].postedAccountUserName)
                    genders = gender.detect(result[c].postedAccountUserName)
                else
                    genders = gender.detect(result[c].postedAccountScreenName)
                if (genders == "male")
                    totalMale = totalMale + 1
                else if (genders == "female")
                    totalFemale = totalFemale + 1
                else
                    totalunknown = totalunknown + 1


            }


            var percentage = {
                male: (totalMale / tweetsCount) * 100,
                female: (totalFemale / tweetsCount) * 100,
                unknown: (totalunknown / tweetsCount) * 100,

            }
           
            var genf = rn.generator({
                min: 3
                , max: 50
                , integer: true
            })
            var f = genf(47);
            var m = genf(42);
            var ot = genf(0);
            var genderDataAnalysis = {
        
                female: f,
                male: m,
                unknown: ot,
            }
        

            var genderAnalysisData = {
                percentage: percentage
            }



            var data = {
                tweets: tweetsCount,
                retweet: retweet,
                likes: likes,
                favorite: favorite,
                interaction: INTERACTION,
                replay: replay,
                genderAnalysis: genderAnalysisData,
            };


            return data;
        })
        .catch(function (error) {
        });
};

customhashtagtwitterposts.methods.getSocialAccountSinglePostsLikeAndRetweetCount = function (tweetId) {
    var query = {
        tweetId: new RegExp(tweetId, 'i')
    };
    return this.model('customhashtagtwitterposts')
        .find(query)
       // .sort({ publishedDate: -1 })
       // .skip(skip)
       // .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};


const customhashtagtwitterpostsModel = mongoose.model('customhashtagtwitterposts', customhashtagtwitterposts);

module.exports = customhashtagtwitterpostsModel;
