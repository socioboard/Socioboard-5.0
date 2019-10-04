const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on twitterinsights collection of mongo DB
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
    // Inserting multiple insights into the collection (new)
    return this.model('TwitterInsights')
        .insertMany(data)
        .then((result) => {
            return result.length;
        }).catch((error) => {
            throw error;
        });
};

twitterInsights.methods.addInsights = function (accountId, insightData) {
    // Adding insights to the existing account (for existing)
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
    // Fetching insights for a specified account
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

const TwitterInsightsModel = mongoose.model('TwitterInsights', twitterInsights);

module.exports = TwitterInsightsModel;