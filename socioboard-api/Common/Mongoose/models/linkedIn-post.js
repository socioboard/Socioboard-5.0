import mongoose from 'mongoose';
const {Schema} = mongoose;
mongoose.set('useCreateIndex', true);
/**
 * TODO To create schema for store LinkedIn Post Details
 * Schema for store Instagram Post Details
 * @param  {String} postId -Post Id
 * @param  {String} socialId -User Unique SocialId
 * @param  {String} userName -User Name
 * @param  {Array} mediaUrl -Array of Media Url for the Instagram Post
 * @param  {Date} publishedAt -Published data of the Feed
 * @param  {String} shareMediaCategory -Type of the Feed whether Image or Video
 * @param  {String} description -Description of post
 * @param  {String} mediaTitle -Media title Text
 * @param  {Array} hashtag -TArray of hashtag
 * @param  {String} sharedUrl -Shared Url for the Feed
 * @param  {Date} createdDate -Created data of the Feed
 * @param  {type:String} postUrl -Url of the Feed
 */
const linkedInPost = new Schema({
  postId: {type: String, unique: true},
  socialId: {type: String},
  mediaUrl: {type: Array},
  publishedAt: {type: Date, default: Date.now},
  shareMediaCategory: {type: String},
  description: {type: String},
  mediaTitle: {type: String},
  hashtag: {type: Array},
  sharedUrl: {type: String},
  postUrl: {type: String},
  createdDate: {type: Date, default: Date.now},
});

/**
 * TODO To Insert LinkedIn Post
 * Insert records stored in db.
 * @param  {object} post -Post details
 * @return {object} Returns Inserted records
 */
linkedInPost.methods.insertManyPosts = function (posts) {
  if (!posts) {
    reject(new Error('Invalid Inputs'));
  } else {
    try {
      return this.model('LinkedInPost')
        .bulkWrite(
          posts.map(post => ({
            updateOne: {
              filter: {postId: post.postId},
              update: post,
              upsert: true,
            },
          }))
        )
        .then(result => result)
        .catch(error => {
          throw new Error(error);
        });
    } catch (e) {}
  }
};

/**
 * TODO To Fetch LinkedIn Post
 * Fetch Insta Post stored in db.
 * @param  {Number} accountId - Account Id
 * @param  {Number} skip - Skip count
 * @param  {Number} limit - limit count
 * @return {object} Returns Fetched Instagram Post for specified Account Id
 */
linkedInPost.methods.getSocialAccountPosts = function (accountId, skip, limit) {
  return this.model('LinkedInPost')
    .aggregate([
      {$match: {socialId: accountId}},
      {$sort: {publishedAt: -1}},
      {$limit: limit},
      {$skip: skip},
    ])
    .then(result => {
      if (result.length > 0) {
        return result;
      }
      return [];
    })
    .catch(error => {
      throw new Error(error.message);
    });
};

/**
 * TODO To Delete  all the LinkedIn Post for specified Account Id
 * Delete  all the LinkedIn Post for specified Account Id
 * @param  {Number} accountId - Account Id
 * @return {object} Returns success message of deleting
 */
linkedInPost.methods.deleteAccountPosts = function (accountId) {
  const query = {
    socialAccountId: new RegExp(accountId, 'i'),
  };
  return this.model('LinkedInPost')
    .deleteMany(query)
    .then(result => result)
    .catch(error => {
      throw new Error(error.message);
    });
};

const linkedInPosts = mongoose.model('LinkedInPost', linkedInPost);

export default linkedInPosts;
