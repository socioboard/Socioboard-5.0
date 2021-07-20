/**
 * Import sequelize data table
 * @typedef {import('../Sequelize-cli/models/index.js')} 
 */
import db from '../Sequelize-cli/models/index.js'
const Op = db.Sequelize.Op;
const YouTubeUploadDetails = db.user_youtube_upload_details;
import YouTubeUploadPosts from '../Mongoose/models/youtubeuploadposts.js';
import moment from 'moment';
import config from 'config'
import logger from '../../Publish/resources/Log/logger.log.js';

class YouTubeModel {

    /**
     * TODO To get count of video uploaded last 24 hours
     * Function to get number of video uploaded last 24 hours
     * @param  {number} user_id -User id
     * @param  {number} account_id -YouTube account id
     * @return {object} post details for account that posted from last 24 hours
     */
    async getUploadedVideoCountPer24hrs(user_id, account_id) {
        let res = await YouTubeUploadDetails.findAll({
            where: {
                user_id,
                account_id,
                upload_type: 0,
                updated_at: {
                    [Op.lt]: new Date(),
                    [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000),
                }
            }, raw: true
        })
        return res
    }

    /**
     * TODO To store post details to mongo db and mysql table
     * Function to store post details to mongo db and mysql table
     * @param  {number} user_id -User id
     * @param  {number} team_id -Team id of user
     * @param  {number} account_id -Account id of youTube channel
     * @param  {object} postDetails -Post details for youTube upload
     * @return {string} Returns message for successful db insertion 
     */
    async updateTable(user_id, account_id, team_id, postDetails) {
        try {
            let postInfo = await this.postInfo(postDetails, user_id, team_id, account_id)
            let youTubeUploadPosts = new YouTubeUploadPosts(postInfo);
            const id = await youTubeUploadPosts.save();
            let res = await YouTubeUploadDetails.create({
                upload_type: postInfo.postType,
                mongo_id: String(id._id),
                created_date: moment.utc(),
                user_id,
                team_id,
                account_id,
                created_at: moment.utc(),
                updated_at: moment.utc()
            });
            return res
        }
        catch (error) { logger.error(error) }
    }

    /**
     * TODO To get time to restore daily quota
     * To get time to restore daily quota 
     * @param  {date} date - Last uploaded date and time
     * @return {object} Returns remaining time to restore quota
     */
    async remainingTimeForUpload(date) {
        let diff = (new Date(`${date}+0000`)) - (new Date(Date.now()));
        return { hours: Math.floor(diff / 3.6e6) + 24, minutes: Math.floor((diff % 3.6e6) / 6e4) + 60, seconds: Math.floor((diff % 6e4) / 1000) + 60 }
    }

    /**
     * TODO To get the drafted or uploaded video details
     * This is the function to get drafted and uploaded video details
     * @param  {number} user_id -User Id
     * @param  {number} account_id -Account Id of youTube channel
     * @param  {number} team_id -Team Id of user
     * @param  {number} postType -Post type 0-published,1-drafted,2-both
     * @param  {number} pageId-Page id for pagination
     * @return {object} Returns drafted and uploaded video details
     */
    async postDetails(user_id, account_id, team_id, postType, pageId) {
        let query = { user_id, account_id, team_id }
        postType === '2' ? '' : query.upload_type = postType
        let response = await YouTubeUploadDetails.findAll({
            where: query,
            offset: (config.get('perPageLimit') * (pageId - 1)),
            limit: config.get('perPageLimit'),
            order: [
                ['updated_at', 'DESC'],
            ],
        })
        let mongoIds = [];
        response ? response.map(element => mongoIds.push(element.mongo_id)) : mongoIds = []
        return { postDetails: response, mongoPost: await YouTubeUploadPosts.find({ _id: { $in: mongoIds } }).sort({ createdDate: -1 }) }
    }

    /**
     * TODO To get post details for particular id
     * Function to get post details for particular id
     * @param  {number} user_id -User id
     * @param  {number} id -Mysql table unique id
     * @return {object} Returns post details for particular id
     */
    async getPostDetailsByIdWithPostType(user_id, id) {
        let mongo_id = await YouTubeUploadDetails.findOne({
            where: { user_id, id }, raw: true,
            attributes: ['mongo_id', 'upload_type']
        })
        return mongo_id
    }

    /**
     * TODO To delete post details from database
     * Function to delete post details from database
     * @param  {number} user_id -User id
     * @param  {number} mongo_id -Mongo db unique id
     * @param  {number} id -Mysql table unique id
     * @return {object} Returns delete status
     */
    async deletePostDetailsById(user_id, id, mongo_id) {
        let res = await YouTubeUploadPosts.deleteOne({ _id: { $in: mongo_id } })
        let deleteData = await YouTubeUploadDetails.destroy({ where: { user_id, id } })
        return "Record deleted successfully";
    }

    /**
    * TODO To get post details for particular id with mongo details
    * Function to get post details for particular id with mongo details
    * @param  {number} user_id -User id
    * @param  {number} id -Mysql table unique id
    * @return {object} Returns post details for particular id with mongo details
    */
    async getPostDetailsByIdWithMongo(user_id, id) {
        let post = await YouTubeUploadDetails.findOne({
            where: { user_id, id }, raw: true,
        })
        let postDetails = await YouTubeUploadPosts.findOne({ _id: post.mongo_id })
        return { post, postDetails }
    }

    /**
     * TODO To updated drafted post details
     * Function to updated drafted post details
     * @param  {number} user_id -User id
     * @param  {number} team_id -Team id of user
     * @param  {number} account_id -Account id of youTube channel
     * @param  {object} postDetails -Post details for youTube upload
     * @param  {number} mongo_id -Mongo db unique id
     * @param  {number} id -Mysql table unique id
     * @return {object} Returns updated status of post details
     */
    async updateDraftTable(user_id, account_id, team_id, postDetails, mongo_id, id) {
        try {
            let postInfo = await this.postInfo(postDetails, user_id, team_id, account_id)
            let youTubeUploadPosts = new YouTubeUploadPosts();
            let ids = await youTubeUploadPosts.updateDraft(mongo_id, postInfo);
            let res = await YouTubeUploadDetails.update({
                upload_type: postInfo.postType,
                mongo_id: mongo_id,
                created_date: moment.utc(),
                user_id,
                team_id,
                account_id,
                updated_at: moment.utc()
            }, { where: { id } })
            return res
        }
        catch (error) {
        }
    }

    /**
     * TODO To format post details to store in mongo db
     * Function to format post details to store in mongo db youTube post details
     * @param  {object} postDetails -Post details for youTube upload
     * @param  {number} user_id -User id
     * @param  {number} team_id -Team id of user
     * @param  {number} account_id -Account id of youTube channel
     * @return {object} Returns parsed details based on inputs
     */
    async postInfo(postDetails, user_id, team_id, account_id) {
        return {
            postType: postDetails.postType ?? '',
            title: postDetails.resource?.snippet?.title ?? '',
            description: postDetails?.resource?.snippet?.description ?? '',
            ownerId: user_id,
            teamId: team_id,
            mediaUrl: postDetails.mediaUrls ?? [],
            postingSocialIds: [account_id],
            privacy: postDetails?.resource?.status?.privacyStatus ?? '',
            publishAt: postDetails?.resource?.status?.privacyStatus == 'private' ? postDetails?.resource?.status?.publishAt ?? '' : '',
            tags: postDetails?.resource?.snippet?.tags ?? [],
            categoryId: postDetails?.resource?.snippet?.categoryId ?? '',
            defaultLanguage: postDetails?.resource?.snippet?.defaultLanguage ?? "en",
            defaultAudioLanguage: postDetails?.resource?.snippet?.defaultAudioLanguage ?? "en",
        }
    }

    /**
     * TODO To delete post details from db after draft been posted
     * Function to delete post details from db after draft been posted
     * @param  {number} mongo_id -Mongo db unique id
     * @param  {number} id -Mysql table unique id
     * @return {string} Returns status of deleted post details
     */
    async removeData(mongo_id, id) {
        let result = await YouTubeUploadDetails.destroy({ where: { id } })
        let removeData = await YouTubeUploadPosts.findByIdAndRemove({ _id: String(mongo_id) })
        return removeData
    }

}

export default YouTubeModel