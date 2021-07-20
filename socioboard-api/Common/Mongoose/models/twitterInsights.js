import mongoose from 'mongoose';
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const twitterInsights = new Schema({
    accountId: { type: String, index: true },
    insights: {
        type: [{
            followerCount: { type: Number, default: 0 },
            followingCount: { type: Number, default: 0 },
            favouritesCount: { type: Number, default: 0 },
            postsCount: { type: Number, default: 0 },
            userMentions: { type: Number, default: 0 },
            retweetCount: { type: Number, default: 0 },
            date: { type: Date, default: Date.now }
        }]
    }
});

twitterInsights.methods.insertInsights = function (data) {
    return this.model('TwitterInsights')
        .insertMany(data)
        .then((result) => {
            return result.length;
        }).catch((error) => {
            throw error;
        });
};

twitterInsights.methods.addInsights = function (accountId, insightData) {
    var query = {
        accountId: new RegExp(accountId, 'i')
    };
    var updateObject = { $push: { insights: insightData } };
    return this.model('TwitterInsights')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

twitterInsights.methods.getInsights = function (accountId, since, untill) {
    var query = {
        accountId: new RegExp(String(accountId), 'i'),
    };
    return this.model('TwitterInsights')
        .find(query)
        .then(function (result) {

            if (result && result[0] && result[0].insights.length > 0) {
                var filteredInsights = result[0].insights.filter(element => {
                    return element.date >= since && element.date <= untill;
                });
                return filteredInsights;
            }
            else
                return [];
        })
        .catch(function (error) {
            throw error;
        });
};

twitterInsights.methods.getInsightsDaywise = function (accountId, since, untill) {
    var query = {};
    query = {
        accountId
    };
    query = [{ $match: query },
    { $unwind: "$insights" },
    { $match: { 'insights.date': { $gte: new Date(since), $lte: new Date(untill) } } },
    {
        $project: {
            date: { "$dateToString": { "format": "%Y-%m-%d", "date": "$insights.date" } },
            followerCount: "$insights.followerCount",
            followingCount: "$insights.followingCount",
            favouritesCount: "$insights.favouritesCount",
            postsCount: "$insights.postsCount",
            userMentions: "$insights.userMentions",
            retweetCount: "$insights.retweetCount",
        }
    },
    {
        "$group": {
            _id: "$date",
            followerCount: { $last: "$followerCount" },
            followingCount: { $last: "$followingCount" },
            favouritesCount: { $last: "$favouritesCount" },
            postsCount: { $last: "$postsCount" },
            userMentions: { $last: "$userMentions" },
            retweetCount: { $last: "$retweetCount" }
        }
    },
    { $sort: { _id: 1 } },
    {
        $project:
        {
            _id: 0,
            date: "$_id",
            followerCount: "$followerCount",
            followingCount: "$followingCount",
            favouritesCount: "$favouritesCount",
            postsCount: "$postsCount",
            userMentions: "$userMentions",
            retweetCount: "$retweetCount"
        }
    }]
    return this.model('TwitterInsights')
        .aggregate(query)
        .then(function (result) {
            return result
        })
        .catch(function (error) {
            throw error;
        });
};

twitterInsights.methods.getInsightsStats = function (accountId, since, untill) {
    var query = {};
    query = {
        accountId
    };
    query = [{ $match: query },
    { $unwind: "$insights" },
    // { $match: { 'insights.date': { $gte: new Date(since), $lte: new Date(untill) } } },
    {
        $project: {
            date: { "$dateToString": { "format": "%Y-%m-%d", "date": "$insights.date" } },
            followerCount: "$insights.followerCount",
            followingCount: "$insights.followingCount",
            favouritesCount: "$insights.favouritesCount",
            postsCount: "$insights.postsCount",
            userMentions: "$insights.userMentions",
            retweetCount: "$insights.retweetCount",
        }
    },
    {
        "$group": {
            _id: "$date",
            followerCount: { $last: "$followerCount" },
            followingCount: { $last: "$followingCount" },
            favouritesCount: { $last: "$favouritesCount" },
            postsCount: { $last: "$postsCount" },
            userMentions: { $last: "$userMentions" },
            retweetCount: { $last: "$retweetCount" }
        }
    },
    { $sort: { _id: -1 } },
    {
        $project:
        {
            _id: 0,
            totalFollowerCount: "$followerCount",
            totalFollowingCount: "$followingCount",
            totalFavouritesCount: "$favouritesCount",
            totalPostsCount: "$postsCount",
            totalUserMentions: "$userMentions",
            totalRetweetCount: "$retweetCount"
        }
    }, { $limit: 1 }]
    return this.model('TwitterInsights')
        .aggregate(query)
        .then(function (result) {
            return result
        })
        .catch(function (error) {
            throw error;
        });
};

const TwitterInsightsModel = mongoose.model('TwitterInsights', twitterInsights);

export default TwitterInsightsModel;