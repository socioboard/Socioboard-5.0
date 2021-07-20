import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

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
    var startDate = moment().add(-1 * dayCount, 'days').startOf('day');
    var query = {
        publishedDate: {
            $gte: startDate,
            $lt: moment().endOf('day')
        },
        accountId: Number(accountId)
    };
    console.log(query)
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

publishedPost.methods.getSchedulePublishedReport = function (mongoId, skip, limit) {

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
    var query;
    if (accountId != 0) {
        query = {
            accountId: accountId
        };
    }
    if (teamId) {
        if (query) {
            query.TeamId = teamId;
        }
        else {
            query = {
                TeamId: teamId
            };
        }
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

publishedPost.methods.getTeamSchedulerStats = function (socialAccounts, TeamId, since, until) {
    var query = {};
    let accountId = [];
    socialAccounts.map(x => {
        accountId.push(x.account_id)
    })
    query = {
        accountId: { $in: accountId },
        TeamId,
        publishedDate: { $gte: new Date(since), $lte: new Date(until) }
    };
    query = [{ $match: query },
    {
        $project: {
            date: { "$dateToString": { "format": "%Y-%m-%d", "date": "$publishedDate" } },
            postCount: { $cond: [{ $eq: ['$PublishedStatus', "Success"] }, 1, 0] },
            postFailed: { $cond: [{ $ne: ['$PublishedStatus', "Success"] }, 1, 0] },
        }
    },
    {
        "$group": {
            // _id: "$date",
            _id: "$date",
            postCount: { $sum: "$postCount" },
            postFailed: { $sum: "$postFailed" }
        }

    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", postCount: "$postCount", postFailed: "$postFailed" } }]
    return this.model('PublishedPosts')
        .aggregate(query)
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            }
            return result
        })
        .catch(function (error) {
            throw error;
        });
};


publishedPost.methods.removeTeamsPublishedReport = function (teamId) {
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

publishedPost.methods.getPublishedPosts = function (ownerId, TeamId, skip, limit) {
    var query = {
        //  ownerId: ownerId,
        TeamId
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
            console.log(error);
        });
};


/**
 * TODO To get total scheduled post count for array of team
 * @description To get total scheduled post count for array of team
 * @param  {number} TeamId -Team id report
 * @return {string} Return total scheduled post count for array of team
 */
publishedPost.methods.getTotalTeamSchedulerStats = function (TeamId) {
    let query = [{
        $match: {
            TeamId: { $in: TeamId }
        }
    },
    {
        $project: {
            postCount: { $cond: [{ $eq: ['$PublishedStatus', "Success"] }, 1, 0] },
            postFailed: { $cond: [{ $ne: ['$PublishedStatus', "Success"] }, 1, 0] },
        }
    },
    {
        "$group": {
            _id: "$TeamId",
            postCount: { $sum: "$postCount" },
            postFailed: { $sum: "$postFailed" }
        }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, postCount: "$postCount", postFailed: "$postFailed" } }]
    return this.model('PublishedPosts')
        .aggregate(query)
        .then(function (result) {
            if (!result) {
                throw new Error('no previous data found.');
            }
            return result
        })
        .catch(function (error) {
            throw error;
        });
};

const publishedPostModel = mongoose.model('PublishedPosts', publishedPost);

export default publishedPostModel;
