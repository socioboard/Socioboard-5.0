const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on taskmodels collection of mongo DB
var taskModel = new Schema({
    teamId: { type: String },
    ownerId: { type: Number },
    taskName: { type: String },
    taskDescription: { type: String },
    type: { type: Number }, // 0-Verify feeds, 1-Invite user, 2- Normal publish, 3-Schedule publish
    status: { type: String }, // Created, Processing, Paused, Completed, Reopen, Solved, Approved, Rejected
    feeds: {
        type: {
            network: { type: String },
            mongoId: { type: String },
            description: { type: String },
            url: { type: String },
            mediaUrls: { type: [Number] },
            date: { type: Date, default: Date.now }
        }
    },
    inviteEmails: { type: String },
    schedulePostId: { type: String, default: null }, // for type 3 => schedule post will store on mongo scheduleposts model, once its approved from admin which will add in schedule queue.
    normalPostId: { type: String, default: null }, // for type 2 => normal post content will store on adminapproval model, when its get approved from admin, it will fetch post and publish right away.
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
    assignedUser: {
        type: [
            {
                assignedTo: { type: Number },
                assignedBy: { type: Number },
                assignedDate: { type: Date, default: Date.now }
            }
        ]
    },
    comments: {
        type: [{
            commentedUserId: { type: Number },
            commentedUserName: { type: String },
            comment: { type: String },
            commentedDate: { type: Date, default: Date.now }
        }]
    }
});

taskModel.methods.insertMany = function (posts) {
    // Inserting multiple tasks into the collection
    return this.model('TaskModels')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch(() => {
            return 0;
        });
};

taskModel.methods.getPublishTaskLists = function (taskId) {
    // Fetching the details of publish task with task Id of recent updated
    return this.model('TaskModels')
        .findOne({ _id: String(taskId), type: { $in: [2, 3] } })
        .sort({ updatedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

taskModel.methods.getTeamPublishTaskLists = function (assignedTo, teamId, skip, limit) {
    // Fetching team posts of an Team to an team member
    var query = {
        $and: [
            { "assignedUser.assignedTo": { $eq: assignedTo } },
            { "teamId": teamId },
            { type: { $in: [2, 3] } }
        ]
    };
    return this.model('TaskModels')
        .find(query)
        .sort({ updatedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

taskModel.methods.getSchedulePublishTaskLists = function (assignedTo, teamId, skip, limit) {
    // Fetching schedule posts of an Team to an team member
    var query = {
        $and: [
            { "assignedUser.assignedTo": { $eq: assignedTo } },
            { "teamId": teamId },
            { "type": 3 }
        ]
    };
    return this.model('TaskModels')
        .find(query)
        .sort({ updatedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

taskModel.methods.getNormalPublishTaskLists = function (assignedTo, teamId, skip, limit) {
    // Fetching normal posts of an Team to an team member
    var query = {
        $and: [
            { "assignedUser.assignedTo": { $eq: assignedTo } },
            { "teamId": teamId },
            { "type": 2 }
        ]
    };
    return this.model('TaskModels')
        .find(query)
        .sort({ updatedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

taskModel.methods.assignTask = function (assignedBy, taskId, assignId, teamId) {
    // Fetching assigned tasks details
    return this.model('TaskModels')
        .findOneAndUpdate(
            { _id: String(taskId), teamId: Number(teamId), ownerId: { $ne: assignId }, status: { $nin: ["Solved", "Rejected"] } },
            { $push: { assignedUser: { assignedTo: Number(assignId), assignedBy: Number(assignedBy) } }, updatedDate: moment.utc().format() }
        )
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

taskModel.methods.updatePublishTaskStatus = function (assignedTo, taskId, teamId, status) {
    // Updating a task by an approval persion
    return this.model('TaskModels')
        .findOneAndUpdate(
            { _id: String(taskId), teamId: Number(teamId), status: { $ne: String(status) }, "assignedUser.assignedTo": { $eq: assignedTo }, type: { $in: [2, 3] } },
            { status: status, updatedDate: moment.utc().format() }
        )
        .then((result) => {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

taskModel.methods.deletePublishTask = function (ownerId, taskType, elementId) {

    // Deleting a task detail by the Owner of that taskS
    var query = { type: { $in: [2, 3] }, ownerId: ownerId };
    switch (Number(taskType)) {
        case 2:
            query.normalPostId = new RegExp(elementId, 'i');
            break;
        case 3:
            query.schedulePostId = new RegExp(elementId, 'i');
            break;
        default:
            break;
    }

    return this.model('TaskModels')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

var taskModels = mongoose.model('TaskModels', taskModel);

module.exports = taskModels;