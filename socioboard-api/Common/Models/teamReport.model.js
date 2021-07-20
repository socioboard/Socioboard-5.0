import PublishedPostsModel from '../Mongoose/models/publishedposts.js'
import ScheduledPostsModel from '../Mongoose/models/scheduleposts.js'
const publishedPostsModel = new PublishedPostsModel()
const scheduledPostsModel = new ScheduledPostsModel()

import db from '../Sequelize-cli/models/index.js'
const userDetails = db.user_details;
const Operator = db.Sequelize.Op;
const userRewardsModel = db.user_rewards;
const applicationInfo = db.application_informations;
const userActivation = db.user_activations;
const teamInfo = db.team_informations;
const socialAccount = db.social_accounts;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const userTeamJoinTable = db.join_table_users_teams;
const updateFriendsTable = db.social_account_friends_counts;
import moment from 'moment'

class TeamReportLibs {

    constructor() {

    }
    async getTeamInfoId(userId, teamId) {
        let res = await teamInfo.findOne({
            where: {
                [Operator.and]: [{
                    team_admin_id: userId
                }, {
                    team_id: teamId
                }]
            },
            attributes: ['team_id', 'team_name', 'is_default_team']
        })
        return res
    }

    async teamSocialAccount(team_id) {
        return teamSocialAccountJoinTable.findAll({
            where: {
                team_id
                //,is_account_locked: false,
            }, raw: true,
            attributes: ['account_id']

            // include: [{
            //     model: socialAccount,
            //     as: 'SocialAccount',
            //     attributes: ['account_id'],
            //     through: {
            //         attributes: ['is_account_locked']
            //     }
            // }]
        });
    }

    async getTeamSchedulerStats(socialAccounts, filterPeriod, teamId, sinces, untils) {
        let { since, untill } = await this.getFilteredPeriod(filterPeriod, sinces, untils)
        let publishPostCount = await publishedPostsModel.getTeamSchedulerStats(socialAccounts, parseInt(teamId), since, untill)
        let scheduledCount = await scheduledPostsModel.getTeamSchedulerStats(parseInt(teamId), since, untill)
        let data = await this.formatDate(publishPostCount, scheduledCount, since, untill)
        return data;

    }


    async getFilteredPeriod(filterPeriod, since, untill) {
        return new Promise((resolve, reject) => {
            switch (Number(filterPeriod)) {
                case 1:
                    since = moment().startOf('day');
                    untill = moment().endOf('day');
                    break;
                case 2:
                    since = moment().subtract(1, 'days').startOf('day');
                    untill = moment().subtract(1, 'days').endOf('day');
                    break;
                case 3:
                    since = moment().subtract(6, 'days').startOf('day');
                    untill = moment().endOf('day');
                    break;
                case 4:
                    since = moment().subtract(30, 'days').startOf('day');
                    untill = moment();
                    break;
                case 5:
                    since = moment().startOf('month');
                    untill = moment();
                    break;
                case 6:
                    since = moment().startOf('month').subtract(1, 'days').startOf('month');
                    untill = moment().startOf('month').subtract(1, 'days').endOf('month');
                    break;
                case 7:
                    if (filterPeriod == 7) {
                        if (!since || !untill) throw new Error('Invalid Inputs');
                        else {
                            since = moment(since).startOf('day');
                            untill = moment(untill).endOf('day');
                        }
                    }
                    break;
                default:
                    throw new Error("please choose valid filter type");
            }
            if (since <= untill) {
                resolve({ since, untill });
            }
            else {
                reject('Check range values.since should be lesser than or equals to until')
            }

        })
    }

    async formatDate(publishPostCount, scheduledCount, since, untill) {
        let day = 1000 * 60 * 60 * 24;
        let date1, date2;
        date1 = new Date(since);
        date2 = new Date(untill);

        var dates = [];
        let totalPost = 0, totalpostFailed = 0, totalschedulePosts = 0
        var diff = (date2.getTime() - date1.getTime()) / day;
        for (var i = 0; i <= diff; i++) {
            var xx = date1.getTime() + day * i;
            var yy = new Date(xx);
            dates.push(yy);
            //console.log(yy.getFullYear() + "-" + (yy.getMonth() + 1) + "-" + yy.getDate());
        }
        var daywisesData = [];
        for (var count in dates) {
            var daywises = {
                date: (dates[count].getFullYear() + "-" + ("0" + (dates[count].getMonth() + 1)).slice(-2) + "-" + ("0" + dates[count].getDate()).slice(-2)),
                postCount: 0,
                postFailed: 0,
                schedulePosts: 0
            }
            daywisesData.push(daywises)
        }
        for (var d in daywisesData) {
            for (var c in publishPostCount) {
                if (daywisesData[d].date == publishPostCount[c].date) {
                    daywisesData[d].postCount = publishPostCount[c].postCount
                    daywisesData[d].postFailed = publishPostCount[c].postFailed
                    totalPost += publishPostCount[c].postCount
                    totalpostFailed += publishPostCount[c].postFailed
                }
            }
            for (var c in scheduledCount) {
                if (daywisesData[d].date == scheduledCount[c].date) {
                    daywisesData[d].schedulePosts = scheduledCount[c].schedulePosts
                    totalschedulePosts += scheduledCount[c].schedulePosts
                }
            }
        }

        let data = {
            totalPost,
            totalpostFailed,
            totalschedulePosts,
            daywisesData
        }
        return data

    }

}
export default TeamReportLibs