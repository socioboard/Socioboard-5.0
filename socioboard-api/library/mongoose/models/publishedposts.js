const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on publishedposts collection of mongo DB
const publishedPost = new Schema({
    publishedDate: { type: Date, default: Date.now },
    accountId: { type: Number, index: true, },
    fullPublishContentId: { type: String },
    postCategory: { type: String },
    publishedContentDetails: { type: String },
    publishedMediaUrls: { type: [String] },
    postShareUrl: { type: String },
    PublishedId: { type: String, index: true, unique: true },
    PublishedUrl: { type: String },
    PublishedStatus: { type: String },
    TeamId: { type: Number }
});


publishedPost.methods.insertManyPosts = function (posts) {
    // Inserting multiple posts into the collection
    return this.model('PublishedPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

publishedPost.methods.getTodayPostsCount = function (accountId) {
    // Fetching how many posts user has published in today
    var query = {
        publishedDate: {
            $gte: moment().startOf('day'),
            $lt: moment().endOf('day')
        },
        accountId: accountId
    };
    return this.model('PublishedPosts')
        .find(query)
        .then(function (result) {
            return result.length;
        })
        .catch(function (error) {
            throw error;
        });
};

publishedPost.methods.getXdaysPostsCount = function (accountId, dayCount) {
    // Fetching how many posts user has published in X number of days
    var startDate = moment().add(-1 * dayCount, 'days').startOf('day');
    var query = {
        publishedDate: {
            $gte: startDate,
            $lt: moment().endOf('day')
        },
        accountId: Number(accountId)
    };
    return this.model('PublishedPosts')
        .find(query)
        .then(function (result) {
            return result.length;
        })
        .catch(function (error) {
            throw error;
        });
};

publishedPost.methods.getAccountPublishCount = function (accountId) {
    // Fetching total posts counts published in an account
    var query = {
        accountId: Number(accountId)
    };
    return this.model('PublishedPosts')
        .find(query)
        .then(function (result) {
            return result.length;
        })
        .catch(function (error) {
            throw error;
        });
};

publishedPost.methods.getTeamPublishedCount = function (teamId) {
    // Fetching total posts counts published in an account
    var query = {
        TeamId: Number(teamId)
    };
    return this.model('PublishedPosts')
        .find(query)
        .then((result) => {
            return result.length;
        })
        .catch((error) => {
            throw error;
        });
};

publishedPost.methods.getSchedulePublishedReport = function (mongoId, skip, limit) {

    // Fetching publish details of a specified content id
    var query = {
        fullPublishContentId: mongoId,
    };
    return this.model('PublishedPosts')
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

publishedPost.methods.getAccountPublishedReport = function (accountId, teamId, skip, limit) {
    // Fetching the details of post published by an account
    var query = {
        accountId: accountId
    };
    if (teamId) {
        query.TeamId = teamId;
    }
    return this.model('PublishedPosts')
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

publishedPost.methods.removeTeamsPublishedReport = function (teamId) {
    // Removing published details of a particular team
    var query = {
        TeamId: teamId
    };
    return this.model('PublishedPosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

publishedPost.methods.removeAccountsPublishedReport = function (accountId) {
    // Removing published details of a particular account
    var query = {
        accountId: accountId
    };
    return this.model('PublishedPosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

const publishedPostModel = mongoose.model('PublishedPosts', publishedPost);

module.exports = publishedPostModel;
