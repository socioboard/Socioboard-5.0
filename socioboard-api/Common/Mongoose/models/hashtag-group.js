const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const hashtagGroup = new Schema({
  hashtaggroupId: { type: String, index: true, unique: true },
  hashtaggroupId: { type: Number, index: true },
  groupname: { type: String },
  userId: { type: String },
  teamId: { type: String },
  created: { type: Date, default: Date.now },

});

hashtagGroup.methods.insertHashTagGroup = function (posts) {
  return this.model('HashtagGroup')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch((error) => {
      console.log('error :', error);

      return 0;
    });
};

hashtagGroup.methods.getHashTagDetails = function (hashtaggroupId) {
  const query = {
    hashtaggroupId,
  };

  return this.model('HashtagGroup')
    .find(query)
    .then((result) => result)
    .catch((error) => {
      console.log(error);
    });
};

// hashtagGroup.methods.getPreviousPost = function (keyword, skip, limit) {
//     var query = {
//         $or: [
//             { description: new RegExp(keyword, 'i') },
//             { title: new RegExp(keyword, 'i') },
//             { publishedDate: new RegExp(keyword, 'i') },
//             { rating: new RegExp(keyword, 'i') }]
//     };
//     return this.model('HashtagGroup')
//         .find(query)
//         .sort({ publishedDate: -1 })
//         .skip(skip)
//         .limit(limit)
//         .then(function (result) {
//             return result;
//         })
//         .catch(function (error) {
//         });
// };

const HashtagGroupModel = mongoose.model('HashtagGroup', hashtagGroup);

module.exports = HashtagGroupModel;
