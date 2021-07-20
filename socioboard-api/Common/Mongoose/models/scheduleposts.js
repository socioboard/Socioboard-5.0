import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);
const schedulePosts = new Schema({

    postType: { type: String },
    description: { type: String },
    ownerId: { type: Number },
    ownerName: { type: String },
    teamId: { type: Number },
    // To specify the collection of media url
    mediaUrl: [{ type: String }],
    mediaSelectionType: { type: Number },
    moduleName: { type: String },
    moduleValues: [{ type: String }],
    shareLink: { type: String },
    // To specify the targeting social profiles
    postingSocialIds: {
        type: [{
            accountType: { type: Number },
            accountId: { type: Number }
        }]
    },
    // To specify the pin board Details
    pinBoards: {
        type: [{
            accountId: { type: Number },
            boardId: { type: [String] }
        }]
    },
    // To specify category of the post 0-NormalSchedulePost, 1- DaywiseSchedulePost
    scheduleCategory: { type: Number },
    normalScheduleDate: { type: Date },
    //Provide the dayId by  0-sunday,1-monday ,... 6-saturday
    // [
    // sunday -  {dayId:0 ,Times : [Timing 1, Timing 2]},
    // tuesday -  {dayId:2 ,Times : [Timing 1, Timing 2]},
    // saturday -  {dayId:6 ,Times : [Timing 1, Timing 2]},
    // ]
    daywiseScheduleTimer: {
        type: [{
            dayId: { type: Number },
            timings: [{ type: Date }]
        }]
    },
    scheduleStatus: { type: Number },
    adminResponseStatus: { type: String, default: 'fullrights' },
    createdDate: { type: Date, default: Date.now },
});


schedulePosts.methods.getPostsById = function (postIds) {
    var query = { _id: { $in: postIds } };
    return this.model('SchedulePost')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};


schedulePosts.methods.getScheduleDetails = function (id) {
    var query = {
        _id: String(id),
    };
    return this.model('SchedulePost')
        .findOne(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

schedulePosts.methods.getTeamSchedulerStats = function (teamId, since, until) {
    let query = {};
    query = {
        teamId, $or: [{
            normalScheduleDate: { $gte: new Date(since), $lte: new Date(until) }
        },
        {
            'daywiseScheduleTimer.timings': { $gte: new Date(since), $lte: new Date(until) }
        }]
    };
    query = [{ $match: query },
    {
        $project: {
            date: { "$dateToString": { "format": "%Y-%m-%d", "date": "$normalScheduleDate" } }
        }
    },
    {
        "$group": {
            _id: "$date", schedulePosts: { $sum: 1 }
        }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", schedulePosts: "$schedulePosts" } }
    ]
    return this.model('SchedulePost')
        .aggregate(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};


schedulePosts.methods.updateAdminResponse = function (scheduleId, adminResponse) {
    return this.model('SchedulePost')
        .findOneAndUpdate(
            { _id: String(scheduleId) },
            { adminResponseStatus: adminResponse }
        )
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

schedulePosts.methods.updateStatus = function (scheduleId, status) {
    return this.model('SchedulePost')
        .findOneAndUpdate(
            { _id: String(scheduleId) },
            { scheduleStatus: status }
        )
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

schedulePosts.methods.insertManyPosts = function (posts, id) {
    return this.model('SchedulePost')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { _id: id },
                    update: post,
                    upsert: true,
                    returning: true
                },
            };
        }))
        .catch((error) => {
            console.log(error.message);
            return 0;
        });
};

const SchedulePostModel = mongoose.model('SchedulePost', schedulePosts);

export default SchedulePostModel;