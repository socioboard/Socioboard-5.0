const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const automatedRss = new Schema({
    teamId: { type: Number, index: true },
    userId: { type: Number },
    rssDetails: {
        type: [{
            name: { type: String },
            rss_feed_url: { type: String },
            custom_interval: { type: Number },
            start_date: { type: Date },
            end_date: { type: Date },
            account_ids: {
                type: [{
                    accountType: { type: Number },
                    accountId: { type: Number }
                }]
            },

        }]
    }
});

automatedRss.methods.insertRss = function (data) {
    // Inserting/Adding data to automatedRss collection of Mongo DB
    return this.model('AutomatedRss')
        .insertMany(data)
        .then((result) => {
            return result;
        }).catch((error) => {
            throw error;
        });
};


automatedRss.methods.getRss = function (teamId, skip, limit) {
    // Fetching rss of a particular Team
    return this.model('AutomatedRss')
        .aggregate([{ $match: { teamId: Number(teamId) } }, { $limit: Number(limit) }, { $skip: Number(skip) }])
        .then(function (result) {
            if (result.length > 0) {
                return result;
            }
            return [];
        })
        .catch(function (error) {
            throw new Error(error);
        });
};

automatedRss.methods.updateRss = function (teamId, insightData) {
    // Updating rss details of a particular Team
    var query = {
        teamId: teamId
    };
    var updateObject = { $set: { rssDetails: [insightData] } };
    return this.model('AutomatedRss')
        .updateOne(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

automatedRss.methods.deleteRss = function (teamId, mongoId) {
    // Deleting a specified rss
    // var query = {
    //     teamId: teamId,
    // };
    var query = { "_id": `ObjectId("${mongoId}")` };
    return this.model('AutomatedRss')
        .deleteOne(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

automatedRss.methods.deletePost = function (mongoId) {
    // Deleting a particular post
    var id = { "_id": new RegExp(String(mongoId), 'i'), };
    return this.model('AutomatedRss')
        .deleteOne(id)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

automatedRss.methods.getScheduleDetails = function (id) {
    // Fetching details of a particular rss
    var query = {
        "_id": `ObjectId("${id}")`,
    };
    return this.model('AutomatedRss')
        .findOne(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

// automatedRss.methods.findById = function (postId) {
//     var query = {
//         _id: { $in: postId }
//     };
//     return this.model('AutomatedRss')
//         .findOne(query)
//         .then(function (result) {
//             return result;
//         })
//         .catch(function (error) {
//             throw error;
//         });
// };

const AutomatedRssModel = mongoose.model('AutomatedRss', automatedRss);

module.exports = AutomatedRssModel;