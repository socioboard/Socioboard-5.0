const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

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
    },
  },
  receiverInfo: {
    type: {
      name: { type: String },
      screenName: { type: String },
      profileUrl: { type: String },
      receiverId: { type: String, index: true },
    },
  },
  isSeenByReceiver: { type: Boolean },
  batchId: { type: String },
  serverMediaUrl: { type: [String] },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

twitterMessage.methods.insertManyPosts = function (posts) {
  return this.model('TwitterMessages')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { messageId: post.messageId },
        update: post,
        upsert: true,
      },
    })))
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

twitterMessage.methods.getSocialAccountPosts = function (accountId, skip, limit) {
  return this.model('TwitterMessages')
    .aggregate([
      { $match: { accountId } },
      { $sort: { messagedDate: -1 } },
      { $limit: limit },
      { $skip: skip },
    ])
    .then((result) => {
      if (result.length > 0) {
        return result;
      }

      return [];
    })
    .catch((error) => {
      console.log(error);
      throw new Error(error.message);
    });
};

twitterMessage.methods.getMessageBetweenUsers = function (senderId, receiverId, skip, limit) {
  const query = {
    $or: [{
      $and: [
        { senderId: new RegExp(senderId, 'i') },
        { receiverId: new RegExp(receiverId, 'i') },
      ],
    },
    {
      $and: [
        { senderId: new RegExp(receiverId, 'i') },
        { receiverId: new RegExp(senderId, 'i') },
      ],
    }],
  };

  return this.model('TwitterMessages')
    .find(query)
    .sort({ messagedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterMessage.methods.getMessageBetweenTwoUsers = function (userId1, userId2, skip, limit) {
  const query = {
    $or: [{
      $and: [
        { 'senderInfo.senderId': new RegExp(userId1, 'i') },
        { 'receiverInfo.receiverId': new RegExp(userId2, 'i') },
      ],
    },
    {
      $and: [
        { 'senderInfo.senderId': new RegExp(userId2, 'i') },
        { 'receiverInfo.receiverId': new RegExp(userId1, 'i') },
      ],
    }],
  };

  return this.model('TwitterMessages')
    .find(query)
    .sort({ messagedDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

twitterMessage.methods.getPreviouslyMessagedUsers = function (senderId, screenName, skip, limit) {
  return this.model('TwitterMessages')
    .aggregate([
      { $match: { $and: [{ accountId: senderId }] } },
      { $sort: { messagedDate: -1 } },
      { $limit: limit },
      { $skip: skip },
      {
        $group: {
          _id: null,
          receivers: {
            $push: {
              name: '$receiverInfo.name', screenName: '$receiverInfo.screenName', profileUrl: '$receiverInfo.profileUrl', socialId: '$receiverInfo.receiverId',
            },
          },
          senders: {
            $push: {
              name: '$senderInfo.name', screenName: '$senderInfo.screenName', profileUrl: '$senderInfo.profileUrl', socialId: '$senderInfo.senderId',
            },
          },
        },
      },
      { $project: { screenName: { $setUnion: ['$receivers', '$senders'] }, _id: 0 } },
      { $unwind: '$screenName' },
      {
        $project: {
          screenName: {
            $cond: {
              if: { $eq: [screenName, '$screenName.screenName'] },
              then: '$$REMOVE',
              else: '$screenName',
            },
          },
        },
      },
      { $unwind: '$screenName' },
    ])
    .then((result) => result)
    .catch((error) => {
      throw new Error(error.message);
    });
};

const twitterMessageModel = mongoose.model('TwitterMessages', twitterMessage);

module.exports = twitterMessageModel;
