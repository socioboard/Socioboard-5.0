import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

/**
 * TODO To create schema for store Instagram Post Details
 * Schema for store Instagram Post Details
 * @param  {{type:String}} postId -Post Id
 * @param  {{type:String}} socialId -User Unique SocialId
 * @param  {{type:String}} userName -User Name
 * @param  {{type:[String]}} mediaUrl -Array of Media Url for the Instagram Post
 * @param  {{type:Date}} publishedDate -Published data of the Feed
 * @param  {{type:String}} captionId -Caption Id
 * @param  {{type:String}} captionText -Caption Text
 * @param  {{type:Boolean}} isUserLiked -True if user likes else false
 * @param  {{type:Number}} likeCount -LikeCount for the Feed
 * @param  {{type:Number}} commentCount -CommentCount for the Feed
 * @param  {{type:String}} type -type of the Feed whether Image or Video
 * @param  {{type:String}} link -Url of the Feed
 * @param  {{type:String}} locationName -Location of the Feed where Published
 * @param  {{type:Number}} locationId -Geo location Id of the Feed
 * @param  {[{type:String}]} batchId -Batch Id of the  Feed
 * @param  {{type:Date}} createdDate -Created date of record
 * @param  {{type:String}} version -Version of Feed
 */
const instagramPost = new Schema({
  postId: { type: String, index: true, unique: true },
  socialId: { type: String },
  userName: { type: String, index: true },
  mediaUrl: { type: Array },
  publishedDate: { type: Date, default: Date.now, index: true },
  captionId: { type: String },
  captionText: { type: String },
  isUserLiked: { type: Boolean, default: false },
  likeCount: { type: Number },
  commentCount: { type: Number },
  type: { type: String },
  link: { type: String },
  locationName: { type: String },
  locationId: { type: Number },
  batchId: { type: String },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

/**
 * TODO To Insert Instagram Post
 * Insert records stored in db.
 * @param  {object} post -Post details
 * @return {object} Returns Inserted records
 */
instagramPost.methods.insertManyPosts = function (posts) {
  if (!posts) {
    reject(new Error('Invalid Inputs'));
  } else {
    return this.model('InstagramPosts')
      .bulkWrite(
        posts.map((post) => ({
          updateOne: {
            filter: { postId: post.postId },
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
 * TODO To Fetch Instagram Post
 * Fetch Insta Post stored in db.
 * @param  {Number} accountId - Account Id
 * @param  {Number} skip - Skip count
 * @param  {Number} limit - limit count
 * @return {object} Returns Fetched Instagram Post for specified Account Id
 */
instagramPost.methods.getSocialAccountPosts = function (
  accountId,
  skip,
  limit,
) {
  return this.model('InstagramPosts')
    .aggregate([
      { $match: { socialId: accountId } },
      { $sort: { publishedDate: -1 } },
      { $limit: limit },
      { $skip: skip },
    ])
    .then((result) => {
      if (result.length > 0) {
        console.log(`result ${JSON.stringify(result)}`);

        return result;
      }

      return [];
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};

/**
 * TODO To Delete  all the Instagram Post for specified Account Id
 * Delete  all the Instagram Post for specified Account Id
 * @param  {Number} accountId - Account Id
 * @return {object} Returns success message of deleting
 */
instagramPost.methods.deleteAccountPosts = function (accountId) {
  const query = {
    socialAccountId: new RegExp(accountId, 'i'),
  };

  return this.model('InstagramPosts')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      throw new Error(error.message);
    });
};

const instagramPostModel = mongoose.model('InstagramPosts', instagramPost);

export default instagramPostModel;
