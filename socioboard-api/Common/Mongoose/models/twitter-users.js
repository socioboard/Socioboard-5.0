import TwitterUsersSchema from '../schemas/twitter-users.schema.js';

class TwitterUsers {
  getAccountFriendById(accountId, userId) {
    return TwitterUsersSchema.findOne({ accountId, type: 'friend', 'user.id': userId });
  }

  getAccountFriendByScreenName(accountId, screenName) {
    return TwitterUsersSchema.findOne({ accountId, type: 'friend', 'user.screen_name': screenName });
  }

  getAccountFriends(accountId, { skip, limit }) {
    return TwitterUsersSchema.find({ accountId, type: 'friend' }).skip(skip).limit(limit);
  }

  getAccountFollowers(accountId, { skip, limit }) {
    return TwitterUsersSchema.find({ accountId, type: 'follower' }).skip(skip).limit(limit);
  }

  insertAccountUsers(users) {
    return TwitterUsersSchema.insertMany(users);
  }

  deleteFriends(accountId) {
    return TwitterUsersSchema.deleteMany({ accountId, type: 'friend' });
  }

  deleteFollowers(accountId) {
    return TwitterUsersSchema.deleteMany({ accountId, type: 'follower' });
  }

  deleteAccountFriend(accountId, userId) {
    return TwitterUsersSchema.findOneAndDelete({ accountId, type: 'friend', 'user.id': userId });
  }
}

export default new TwitterUsers();
