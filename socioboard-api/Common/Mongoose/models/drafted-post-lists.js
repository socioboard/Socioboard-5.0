import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

const draftPosts = new Schema({
  ownerId: { type: Number, index: true },
  teamId: { type: Number },
  postType: { type: String },
  description: { type: String },
  mediaUrl: [{ type: String }],
  accountIds: [{ type: String }],
  shareLink: { type: String },
  createdDate: { type: Date, default: Date.now },
});

draftPosts.methods.getDraftedPost = function (ownerId, teamId, skip, limit) {
  const query = {
    ownerId,
    teamId,
  };

  return this.model('DraftPost')
    .find(query)
    .sort({ createdDate: -1 })
    .skip(skip)
    .limit(limit)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

draftPosts.methods.getPostsById = function (postIds) {
  const query = { _id: { $in: postIds } };

  return this.model('DraftPost')
    .find(query)
    .sort({ createdDate: -1 })
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

draftPosts.methods.insertManyPosts = function (posts, id) {
  return this.model('DraftPost')
    .bulkWrite(posts.map((post) => ({
      updateOne: {
        filter: { _id: id },
        update: post,
        upsert: true,
        returning: true,
      },
    })))
    .catch((error) => {
      console.log(error.message);

      return 0;
    });
};

draftPosts.methods.deleteDraftPostById = function (postIds) {
  const query = { _id: { $in: postIds } };

  return this.model('DraftPost')
    .deleteMany(query)
    .then((result) => {
      if (result.deletedCount != 0) return 'Deleted successfully';

      return 'No record found';
    })
    .catch((error) => {
      throw error;
    });
};

const draftPost = mongoose.model('DraftPost', draftPosts);

export default draftPost;
