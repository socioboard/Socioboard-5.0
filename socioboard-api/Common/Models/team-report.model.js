import moment from 'moment';
import PublishedPostsModel from '../Mongoose/models/published-posts.js';
import ScheduledPostsModel from '../Mongoose/models/schedule-posts.js';
import sequelize from 'sequelize';
import db from '../Sequelize-cli/models/index.js';

const publishedPostsModel = new PublishedPostsModel();
const scheduledPostsModel = new ScheduledPostsModel();
const Operator = db.Sequelize.Op;
const teamInfo = db.team_informations;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const userScheduleDetails = db.users_schedule_details;

class TeamReportLibs {
  constructor() {}

  async getTeamInfoId(userId, teamId) {
    const res = await teamInfo.findOne({
      where: {
        [Operator.and]: [
          {
            team_admin_id: userId,
          },
          {
            team_id: teamId,
          },
        ],
      },
      attributes: ['team_id', 'team_name', 'is_default_team'],
    });

    return res;
  }

  async teamSocialAccount(team_id) {
    return teamSocialAccountJoinTable.findAll({
      where: {
        team_id,
        // ,is_account_locked: false,
      },
      raw: true,
      attributes: ['account_id'],

      // include: [{
      //     model: social-account,
      //     as: 'SocialAccount',
      //     attributes: ['account_id'],
      //     through: {
      //         attributes: ['is_account_locked']
      //     }
      // }]
    });
  }

  async getTeamSchedulerStats(
    socialAccounts,
    filterPeriod,
    teamId,
    sinces,
    untils
  ) {
    const {since, untill} = await this.getFilteredPeriod(
      filterPeriod,
      sinces,
      untils
    );
    const publishPostCount = await publishedPostsModel.getTeamSchedulerStats(
      socialAccounts,
      parseInt(teamId),
      since,
      untill
    );
    const scheduledCount = await scheduledPostsModel.getTeamSchedulerStats(
      parseInt(teamId),
      since,
      untill
    );
    let postFailedCountNormalPost = await userScheduleDetails.findAll({
      where: {
        running_days_of_weeks: 'onetimeschedule',
        schedule_status: 1,
        team_id: teamId,
        one_time_schedule_date: {
          [Operator.lt]: new Date(),
          [Operator.gt]: since,
        },
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('schedule_id')), 'Count'],
        [
          sequelize.fn(
            'date_format',
            sequelize.col('one_time_schedule_date'),
            '%Y-%m-%d'
          ),
          'oneTimeScheduleDate',
        ],
      ],
      order: [[sequelize.literal('"oneTimeScheduleDate"'), 'ASC']],
      group: 'oneTimeScheduleDate',
      raw: true,
    });
    const data = await this.formatDate(
      publishPostCount,
      scheduledCount,
      since,
      untill,
      postFailedCountNormalPost
    );
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
          since = moment()
            .startOf('month')
            .subtract(1, 'days')
            .startOf('month');
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
          throw new Error('please choose valid filter type');
      }
      if (since <= untill) {
        resolve({since, untill});
      } else {
        reject(
          'Check range values.since should be lesser than or equals to until'
        );
      }
    });
  }

  async formatDate(
    publishPostCount,
    scheduledCount,
    since,
    untill,
    postFailedCountNormalPost
  ) {
    const day = 1000 * 60 * 60 * 24;
    let date1;
    let date2;

    date1 = new Date(since);
    date2 = new Date(untill);

    const dates = [];
    let totalPost = 0;
    let totalpostFailed = 0;
    let totalschedulePosts = 0;
    const diff = (date2.getTime() - date1.getTime()) / day;

    for (let i = 0; i <= diff; i++) {
      const xx = date1.getTime() + day * i;
      const yy = new Date(xx);

      dates.push(yy);
      // console.log(yy.getFullYear() + "-" + (yy.getMonth() + 1) + "-" + yy.getDate());
    }
    const daywisesData = [];

    for (const count in dates) {
      const daywises = {
        date: `${dates[count].getFullYear()}-${`0${
          dates[count].getMonth() + 1
        }`.slice(-2)}-${`0${dates[count].getDate()}`.slice(-2)}`,
        postCount: 0,
        postFailed: 0,
        schedulePosts: 0,
      };

      daywisesData.push(daywises);
    }
    for (const d in daywisesData) {
      for (var c in publishPostCount) {
        if (daywisesData[d].date == publishPostCount[c].date) {
          daywisesData[d].postCount = publishPostCount[c].postCount;
          daywisesData[d].postFailed = publishPostCount[c].postFailed;
          totalPost += publishPostCount[c].postCount;
          totalpostFailed += publishPostCount[c].postFailed;
        }
      }
      for (var c in scheduledCount) {
        if (daywisesData[d].date == scheduledCount[c].date) {
          daywisesData[d].schedulePosts = scheduledCount[c].schedulePosts;
          totalschedulePosts += scheduledCount[c].schedulePosts;
        }
      }
    }
    for (const failedCount in daywisesData) {
      for (var c in postFailedCountNormalPost) {
        if (
          daywisesData[failedCount].date ==
          postFailedCountNormalPost[c].oneTimeScheduleDate
        ) {
          daywisesData[failedCount].postFailed +=
            postFailedCountNormalPost[c].Count;
          totalpostFailed += postFailedCountNormalPost[c].Count;
        }
      }
    }
    const data = {
      totalPost,
      totalpostFailed,
      totalschedulePosts,
      daywisesData,
    };

    return data;
  }
}
export default TeamReportLibs;
