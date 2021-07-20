import mongoose from 'mongoose';
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

/**
 * TODO To create schema for store youTube upload details
 * Schema for store youTube upload details.
 * @param  {{type:String}} postType -Post type 0-upload,1-draft
 * @param  {{type:String}} description -Description for youTube video
 * @param  {{type:Number}} ownerId -User id who own that youTube account
 * @param  {{type:Number}} teamId -User team id
 * @param  {[{type:String}]} mediaUrl -Media url that need to post on youTube
 * @param  {[{type:Number}]} postingSocialIds -YouTube channel account id
 * @param  {{type:String}} title -YouTube video title
 * @param  {{type:String}} privacy -Privacy type of video,private or public
 * @param  {{type:Date}} publishAt -Schedule a video when to make it public if its privacy is private
 * @param  {{type:[String]}} tags -Tags for the videos
 * @param  {{type:Number}} categoryId -Category id of video
 * @param  {{type:String}} defaultLanguage -Default language
 * @param  {{type:String}} defaultAudioLanguage -Default audio language
 * @param  {{type:Date}} createdDate -Created date of record
 */
const youTubeUploadPosts = new Schema({
    postType: { type: String },
    description: { type: String },
    ownerId: { type: Number },
    teamId: { type: Number },
    // To specify the collection of media url
    mediaUrl: [{ type: String }],
    // To specify the targeting social profiles
    postingSocialIds: [{ type: Number }],
    title: { type: String },
    privacy: { type: String },
    publishAt: { type: Date },
    tags: { type: [String] },
    categoryId: { type: Number },
    defaultLanguage: { type: String },
    defaultAudioLanguage: { type: String },
    createdDate: { type: Date, default: Date.now }
});

/**
 * TODO To get records based on post ids
 * Get  all records based on array of post ids.
 * @param  {Array} postIds -Array of ids
 * @return {object} Returns set of records matches post ids
 */
youTubeUploadPosts.methods.getPostsById = (postIds) => {
    let query = { _id: { $in: postIds } };
    return this.model('youTubeUploadPosts')
        .find(query)
        .sort({ createdDate: -1 })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};


/**
 * TODO To update records
 * Update records stored in db.
 * @param  {number} post_id -Post unique id
 * @param  {object} post -Post details
 * @return {object} Returns updated records
 */
youTubeUploadPosts.methods.updateDraft = function (post_id, post) {
    let query = {
        _id: String(post_id)
    };
    let updateObject = {};
    updateObject = post;
    return this.model('youTubeUploadPosts')
        .updateOne(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

const YouTubeUploadPosts = mongoose.model('youTubeUploadPosts', youTubeUploadPosts);

export default YouTubeUploadPosts;