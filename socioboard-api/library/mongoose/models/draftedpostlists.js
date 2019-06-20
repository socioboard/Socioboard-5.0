const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const draftPosts = new Schema({
    ownerId: { type: Number, index: true },
    teamId: { type: Number },
    postType: { type: String },
    description: { type: String },
    mediaUrl: [{ type: String }],
    shareLink: { type: String },
    createdDate: { type: Date, default: Date.now }
});

draftPosts.methods.getDraftedPost = function (ownerId, teamId, skip, limit) {
    var query = {
        ownerId: ownerId,
        teamId: teamId
    };
    return this.model('DraftPost')
        .find(query)
        .sort({ createdDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

draftPosts.methods.getPostsById = function (postIds) {
    var query = { _id: { $in: postIds } };
    return this.model('DraftPost')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};


const draftPost = mongoose.model('DraftPost', draftPosts);

module.exports = draftPost;