const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const customHashtag = new Schema({
    customhashtagId: { type: String, index: true, unique: true },
    hashtag: { type: String },
    groupId: { type: String },
    totalLike: { type: String },
    totalTweet: { type: String }


});

customHashtag.methods.insertCustomHashtag = function (posts) {
    return this.model('HashtagGroup')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

customHashtag.methods.getGroupDetails = function (hashtaggroupId) {
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



const customHashtagModel = mongoose.model('CustomHashtagModel', customHashtag);

module.exports = customHashtagModel;
