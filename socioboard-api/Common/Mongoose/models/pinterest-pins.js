import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

/**
 * TODO To create schema for store Pinterst Pins
 * Schema for store interst Pins Details
 * @param {{type:String}} postId - Post Id
 * @param {{type:String}} boardId - Board Id
 * @param {{type:String}} socialId - User Unique SocialId
 * @param {{type:String}} userName - User Name
 * @param {{type:String}} mediaUrl -  Media Url for the Instagram Post
 * @param {{type:Date}} publishedDate - Published data of the Feed
 * @param {{type:String}} captionText - Caption Text
 * @param {{type:String}} type - type of the Feed whether Image or Video
 * @param {{type:String}} postUrl - Url of the Feed
 * @param {{type:String}} outgoingUrl - Outgoing Url of the Feed
 * @param {{type:Date}} createdDate - Created date of record
 * @param {{type:String}} version - Version of Feed
 */
const PinterestPins = new Schema({
  postId: { type: String, index: true, unique: true },
  boardId: { type: String, index: true },
  socialId: { type: String },
  userName: { type: String, index: true },
  mediaUrl: { type: String },
  publishedDate: { type: Date, default: Date.now, index: true },
  captionText: { type: String },
  type: { type: String },
  postUrl: { type: String },
  outgoingUrl: { type: String },
  createdDate: { type: Date, default: Date.now },
  version: { type: String, index: true },
});

/**
 * TODO To Insert Pinterst Pins
 * Insert records stored in db.
 * @param {object} post - Post details
 * @return {object} Returns Inserted records
 */
PinterestPins.methods.insertManyPins = function (posts) {
  if (!posts) {
    reject(new Error('Invalid Inputs'));
  } else {
    return this.model('PinterestPins')
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
 * TODO To Fetch Pinterst Pins 
 * Fetch Pinterst Pins stored in db.
 * @param {Number} accountId - Account Id
 * @param {Number} skip - Skip count
 * @param {Number} limit - limit count
 * @return {object} Returns Pinterst Pins for specified Account Id
 */
PinterestPins.methods.getPinterestPins = function (
  accountId,
  brdId,
  skip,
  limit,
) {
   const query = {
        socialId: accountId,
        boardId: brdId,
      };
  
  return this.model('PinterestPins')
    .find(query)
    .sort({publishedDate: -1})
    .skip(skip)
    .limit(limit)
    .then(result => result)
    .catch(error => {
      throw error;
    });
};

/**
 * TODO To Delete  all the Pinterest Pins for specified Account Id
 * Delete  all the  Pinterest Pins for specified Account Id
 * @param {Number} accountId - Account Id
 * @return {object} Returns success message of deleting
 */
PinterestPins.methods.deleteAccountPosts = function (accountId) {
  const query = {
           socialId: accountId,
    };

  return this.model('PinterestPins')
    .deleteMany(query)
    .then((result) => result)
    .catch((error) => {
      throw new Error(error.message);
    });
};

const PinterestPinsModel = mongoose.model('PinterestPins', PinterestPins);

export default PinterestPinsModel;
