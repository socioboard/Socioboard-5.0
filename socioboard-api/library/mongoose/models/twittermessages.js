const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on twittermessages collection of mongo DB
const twitterMessage = new Schema({
    messageId: { type: String, index: true, unique: true },
    messagedDate: { type: Date, default: Date.now, index: true },
    text: { type: String },
    mediaUrls: { type: [String] },
    hashtags: { type: [String] },
    mentions: { type: [String] },
    accountId: { type: String, index: true },
    senderInfo: {
        type: {
            name: { type: String },
            screenName: { type: String },
            profileUrl: { type: String },
            senderId: { type: String, index: true },
        }
    },
    receiverInfo: {
        type: {
            name: { type: String },
            screenName: { type: String },
            profileUrl: { type: String },
            receiverId: { type: String, index: true },
        }
    },
    isSeenByReceiver: { type: Boolean },
    batchId: { type: String },
    serverMediaUrl: { type: [String] },
    createdDate: { type: Date, default: Date.now },
    version: { type: String, index: true }
});

twitterMessage.methods.insertManyPosts = function (posts) {
    // Inserting multiple posts into the collection
    return this.model('TwitterMessages')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { messageId: post.messageId },
                    update: post,
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            return 0;
        });
};

twitterMessage.methods.getSocialAccountPosts = function (accountId, skip, limit) {
    // Fetching the details of an account
    return this.model('TwitterMessages')
        .aggregate([
            { $match: { accountId: accountId } },
            { $sort: { messagedDate: -1 } },
            { $limit: limit },
            { $skip: skip }
        ])
        .then(function (result) {
            if (result.length > 0) {
                return result;
            }
            return [];
        })
        .catch(function (error) {
            throw new Error(error.message);
        });
};

twitterMessage.methods.getMessageBetweenUsers = function (senderId, receiverId, skip, limit) {
    // Fetching the details of messages between users
    var query = {
        $or: [{
            $and: [
                { senderId: new RegExp(senderId, 'i') },
                { receiverId: new RegExp(receiverId, 'i') }
            ]
        },
        {
            $and: [
                { senderId: new RegExp(receiverId, 'i') },
                { receiverId: new RegExp(senderId, 'i') }
            ]
        }]
    };
    return this.model('TwitterMessages')
        .find(query)
        .sort({ messagedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            return error;
        });
};

twitterMessage.methods.getMessageBetweenTwoUsers = function (userId1, userId2, skip, limit) {
    // Fetching the details of messages between 2 users
    var query = {
        $or: [{
            $and: [
                { "senderInfo.senderId": new RegExp(userId1, 'i') },
                { "receiverInfo.receiverId": new RegExp(userId2, 'i') }
            ]
        },
        {
            $and: [
                { "senderInfo.senderId": new RegExp(userId2, 'i') },
                { "receiverInfo.receiverId": new RegExp(userId1, 'i') }
            ]
        }]
    };
    return this.model('TwitterMessages')
        .find(query)
        .sort({ messagedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            return error;
        });
};

twitterMessage.methods.getPreviouslyMessagedUsers = function (senderId, screenName, skip, limit) {
    // Fetching the details of perviously messaged user
    return this.model('TwitterMessages')
        .aggregate([
            { $match: { $and: [{ accountId: senderId }] } },
            { $sort: { messagedDate: -1 } },
            { $limit: limit },
            { $skip: skip },
            {
                $group: {
                    _id: null,
                    receivers: { $push: { name: "$receiverInfo.name", screenName: "$receiverInfo.screenName", profileUrl: "$receiverInfo.profileUrl", socialId: "$receiverInfo.receiverId" } },
                    senders: { $push: { name: "$senderInfo.name", screenName: "$senderInfo.screenName", profileUrl: "$senderInfo.profileUrl", socialId: "$senderInfo.senderId" } }
                }
            },
            { $project: { screenName: { $setUnion: ["$receivers", "$senders"] }, _id: 0 } },
            { $unwind: "$screenName" },
            {
                $project: {
                    "screenName": {
                        $cond: {
                            if: { $eq: [screenName, "$screenName.screenName"] },
                            then: "$$REMOVE",
                            else: "$screenName"
                        }
                    }
                }
            },
            { $unwind: "$screenName" }
        ])
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw new Error(error.message);
        });
};

const twitterMessageModel = mongoose.model('TwitterMessages', twitterMessage);

module.exports = twitterMessageModel;