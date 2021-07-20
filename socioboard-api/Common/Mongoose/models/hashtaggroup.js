const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const hashtaggroup = new Schema({
    hashtaggroupId: { type: String, index: true, unique: true },
    hashtaggroupId:{ type: Number,index:true},
    groupname: { type: String },
    userId: { type: String },
    teamId: { type: String },
    created: {type: Date, default: Date.now}

});

hashtaggroup.methods.insertHashTagGroup = function (posts) {
    return this.model('HashtagGroup')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            console.log("error :",error)
            return 0;
        });
};

hashtaggroup.methods.getHashTagDetails = function (hashtaggroupId) {
    var query = {
        hashtaggroupId: hashtaggroupId
    };
    return this.model('HashtagGroup')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

// hashtaggroup.methods.getPreviousPost = function (keyword, skip, limit) {
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

const HashtagGroupModel = mongoose.model('HashtagGroup', hashtaggroup);

module.exports = HashtagGroupModel;
