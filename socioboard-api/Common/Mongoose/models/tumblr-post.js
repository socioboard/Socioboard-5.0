import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

/**
 * TODO To create schema for store Tumblr Post Details
 * Schema for store Tumblr Post Details
 * @param {{type:String}} postId - Post Id
 * @param {{type:String}} postStringId - Post Id
 * @param {{type:String}} socialId - User Unique SocialId
 * @param {{type:String}} userName - User Name
 * @param {{type:String}} mediaUrl -  Media Url for the Instagram Post
 * @param {{type:Date}} publishedDate - Published data of the Feed
 * @param {{type:String}} captionText - Caption Text
 * @param {{type:Boolean}} isUserLiked - True if user likes else false
 * @param {{type:Number}} likeCount - LikeCount for the Feed
 * @param {{type:Number}} commentCount - CommentCount for the Feed
 * @param {{type:String}} type - type of the Feed whether Image or Video
 * @param {{type:String}} permalink - Url of the Feed
 * @param {{type:String}} locationName - Location of the Feed where Published
 * @param {{type:Number}} locationId - Geo location Id of the Feed
 * @param {{type:Date}} createdDate - Created date of record
 * @param {{type:String}} version - Version of Feed
 */
const TumblrPost = new Schema({
  postId: { type: String, index: true, unique: true },
  postStringId: { type: String, index: true, unique: true },
  socialId: { type: String },
  userName: { type: String, index: true },
  mediaUrl: { type: String },
  publishedDate: { type: Date, default: Date.now, index: true },
  captionText: { type: String },
  isUserLiked: { type: Boolean, default: false },
  likeCount: { type: Number },
  commentCount: { type: Number },
  type: { type: String },
  permalink: { type: String },
  locationName: { type: String },
  locationId: { type: Number },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

/**
 * TODO To Insert Tumblr Post
 * Insert records stored in db.
 * @param {object} post - Post details
 * @return {object} Returns Inserted records
 */
TumblrPost.methods.insertManyPosts = function (posts) {
  if (!posts) {
    reject(new Error('Invalid Inputs'));
  } else {
    return this.model('TumblrPosts')
      .bulkWrite(
        posts.map((post) => ({
          updateOne: {
            filter: { postStringId: post.postStringId },
            update: post,
            upsert: true,
          },
        })),
      )
      .then((result) => result)
      .catch((error) => {
        throw new Error(error);
      });
  }
};

/**
 * TODO To Fetch Tumblr Post
 * Fetch Insta Post stored in db.
 * @param {Number} accountId - Account Id
 * @param {Number} skip - Skip count
 * @param {Number} limit - limit count
 * @return {object} Returns Fetched Instagram Post for specified Account Id
 */
TumblrPost.methods.getSocialAccountPosts = function (
  accountId,
  skip,
  limit,
) {
  return this.model('TumblrPosts')
    .aggregate([
      { $match: { socialId: accountId } },
      { $sort: { publishedDate: -1 } },
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
      throw new Error(error.message);
    });
};

/**
 * TODO To Delete  all the Tumblr Post for specified Account Id
 * Delete  all the Tumblr Post for specified Account Id
 * @param {Number} accountId - Account Id
 * @return {object} Returns success message of deleting
 */
TumblrPost.methods.deleteAccountPosts = function (accountId) {
  const query = {
    socialAccountId: new RegExp(accountId, 'i'),
  };

  return this.model('TumblrPosts')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      throw new Error(error.message);
    });
};

const TumblrPostModel = mongoose.model('TumblrPosts', TumblrPost);

export default TumblrPostModel;
