import fs from 'fs';
import moment from 'moment';
import { createObjectCsvWriter } from 'csv-writer';
import sequelize from 'sequelize';
import paths, { dirname } from 'path';

import { fileURLToPath } from 'url';
import uuidv1 from 'uuidv1';
import _ from 'underscore';
import config from 'config';
import UserTeamAccountLibs from '../Shared/user-team-accounts-libs.shared.js';
import TwitterInsights from '../Mongoose/models/twitter-insights.js';
import FacebookHelper from '../Cluster/facebook.cluster.js';
import GoogleHelper from '../Cluster/google.cluster.js';
import db from '../Sequelize-cli/models/index.js';
import TeamReport from './team-report.model.js';
import { PdfMaker } from '../pdf-maker/pdf-maker.js';
import logger from '../../Update/resources/log/logger.log.js';
import PublishedPost from '../Mongoose/models/published-posts.js';
import SchedulePostModel from '../Mongoose/models/schedule-posts.js';

const teamReport = new TeamReport();
const { Op } = db.Sequelize;
const ReportMailDetails = db.auto_reports;
const userTeamJoinTable = db.join_table_users_teams;
const teamSocialAccountJoinTable = db.join_table_teams_social_accounts;
const socialAccount = db.social_accounts;
const __dirname = dirname(fileURLToPath(import.meta.url));
const twitterInsights = new TwitterInsights();
const teamInfo = db.team_informations;

class ReportMailModel {
  constructor() {
    this.userTeamAccountLibs = new UserTeamAccountLibs();
    this.googleHelper = new GoogleHelper(config.get('google_api'));
    this.facebookHelper = new FacebookHelper();
  }

  /**
     * TODO To check user is belongs to the team or not.
     * @description To check user is belongs to the team or not
     * @param  {number} userId -User Id
     * @param  {number} teamId -Team id
     * @return {boolean} Returns true id user belongs to that team else false
     */
  async isUserBelongsToTeam(userId, teamId) {
    const response = await userTeamJoinTable.findOne({
      where: {
        team_id: teamId,
        user_id: userId,
        left_from_team: 0,
      },
    });

    if (!response) return false;

    return true;
  }

  /**
     * TODO To get user schedule stats for team report.
     * @description To get user schedule stats for team report
     * @param  {number} teamId -Team id
     * @param  {number} userId -User id
     * @param  {number} frequency -Frequency for daily,weekly,monthly data
     * @return {object} Returns scheduled stats
     */
  async getTeamSchedulerStats(teamId, userId, frequency) {
    const validTeam = await this.isUserBelongsToTeam(userId, teamId);
    let teamSocialAccount;

    if (validTeam) {
      const teamDetails = await this.getTeamDetails(teamId);

      teamSocialAccount = await teamReport.teamSocialAccount(teamId);
      const report = await teamReport.getTeamSchedulerStats(teamSocialAccount, frequency, teamId);

      return { teamDetails, report };
    }
  }

  /**
     * TODO To get twitter account stats for twitter id.
     * @description To get twitter account stats for twitter id.
     * @param  {number} accountId -Twitter account id
     * @param  {number} userScopeId -User id
     * @param  {number} filterPeriod -Filter Period for daily,weekly,monthly data
     * @return {object} Returns twitter stats
     */
  async getTwitterReport(accountId, userScopeId, filterPeriod) {
    const socialAccDetails = await this.getSocialAccount(4, accountId);

    if (socialAccDetails) {
      const dates = await teamReport.getFilteredPeriod(filterPeriod);
      const twitterInsight = await twitterInsights.getInsightsDaywise(accountId, dates.since, dates.untill);
      const data = await this.formatDate(twitterInsight, dates.since, dates.untill);
      const stats = await twitterInsights.getInsightsStats(accountId, dates.since, dates.untill);

      return { data, stats, socialAccDetails };
    }
  }

  /**
     * TODO To get team details for team id.
     * @description To get team details for team id..
     * @param  {number} team_id -Team id
     * @return {object} Returns team id
     */
  async getTeamDetails(team_id) {
    return await teamInfo.findOne({ where: { team_id }, raw: true });
  }

  /**
     * TODO To get facebook page account stats for facebook page id.
     * @description To get facebook page account stats for facebook page id.
     * @param  {number} accountId -Facebook page account id
     * @param  {number} userScopeId -User id
     * @param  {number} filterPeriod -Filter Period for daily,weekly,monthly data
     * @return {object} Returns facebook page stats
     */
  async fbpageReport(accountId, userScopeId, filterPeriod) {
    const getSocialAccDetails = await this.getSocialAccount(2, accountId);

    if (getSocialAccDetails) {
      const dates = await teamReport.getFilteredPeriod(filterPeriod);
      const response = await this.facebookHelper.fbPageInsights(getSocialAccDetails.access_token, getSocialAccDetails.social_id, dates.since, dates.untill, filterPeriod);

      if (response.data.length < 1) throw new Error("Sorry, Account isn't active for specified time span");

      return response;
    }
  }

  /**
     * TODO To get youTube channel account stats for youTube channel id.
     * @description To get youTube channel account stats for youTube channel id.
     * @param  {number} accountId -Facebook page account id
     * @param  {number} userScopeId -User id
     * @param  {number} filterPeriod -Filter Period for daily,weekly,monthly data
     * @return {object} Returns youTube channel report
     */
  async getYouTubeReport(accountId, userScopeId, filterPeriod) {
    const socialAccDetails = await this.getSocialAccount(9, accountId);

    if (socialAccDetails) {
      const dates = await teamReport.getFilteredPeriod(filterPeriod); // modification required
      const data = await this.googleHelper.youtubeInsights(socialAccDetails.refresh_token, encodeURIComponent(socialAccDetails.social_id), dates.since, dates.untill);
      const response = await this.parseYouTubeData(data);

      return { response, socialAccDetails };
    }
  }

  /**
     * TODO To get format youTube response from google apis to required format
     * @description To get format youTube response from google apis to required format.
     * @param  {object} youTubeInsightData -youTube channel response from google apis
     * @return {object} Returns data with required format
     */
  async parseYouTubeData(youTubeInsightData) {
    const headers = _.pluck(youTubeInsightData.columnHeaders, 'name');
    const result = [];

    for (const itr of youTubeInsightData.rows) {
      const data = {};

      for (let i = 0; i < itr.length; i++) {
        data[`${headers[i]}`] = itr[i];
      }
      result.push(data);
    }
    const data = await this.getTotalData(result);

    return data;
  }

  /**
     * TODO To get total values from youTube response
     * @description To get total values from youTube response.
     * @param  {object} result -youTube channel response from google apis
     * @return {object} Returns data with required format
     */
  async getTotalData(result) {
    let totalAverageViewDuration = 0;
    let totalLikes = 0;
    let totalDislikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalSubscribersGained = 0;
    let totalSubscribersLost = 0;
    let totalViews = 0;
    const daywises = [];

    result.map((x) => {
      totalAverageViewDuration += x.averageViewDuration,
      totalLikes += x.likes,
      totalDislikes += x.dislikes,
      totalComments += x.comments,
      totalShares += x.shares,
      totalSubscribersGained += x.subscribersGained,
      totalSubscribersLost += x.subscribersLost,
      totalViews += x.views;
      daywises.push(x);
    });

    return {
      total: {
        totalAverageViewDuration,
        totalLikes,
        totalDislikes,
        totalComments,
        totalShares,
        totalSubscribersGained,
        totalSubscribersLost,
        totalViews,
      },
      daywises,
    };
  }

  /**
     * TODO To get social account details for particular account id
     * @description To get social account details for particular account id
     * @param  {number} account_type -Social media platform number
     * @param  {number} account_id -Social account id
     * @return {object} Returns social account details
     */
  async getSocialAccount(account_type, account_id) {
    const res = await socialAccount.findOne({
      where: {
        account_type,
        account_id,
      },
      raw: true,
    });

    return res;
  }

  /**
     * TODO To get format twitter response with required format
     * @description To get format twitter response with required format.
     * @param  {object} twitterInsights -twitter response
   - * @param  {date} since -From date
     * @param  {date} untill -To date
     * @return {object} Returns data with required format
     */
  async formatDate(twitterInsights, since, untill) {
    const day = 1000 * 60 * 60 * 24;
    let date1; let
      date2;

    date1 = new Date(since);
    date2 = new Date(untill);

    const dates = [];
    const diff = (date2.getTime() - date1.getTime()) / day;

    for (let i = 0; i <= diff; i++) {
      const xx = date1.getTime() + day * i;
      const yy = new Date(xx);

      dates.push(yy);
    }
    const daywisesData = [];

    for (const count in dates) {
      const daywises = {
        date: (`${dates[count].getFullYear()}-${(`0${dates[count].getMonth() + 1}`).slice(-2)}-${(`0${dates[count].getDate()}`).slice(-2)}`),
        followerCount: 0,
        followingCount: 0,
        favouritesCount: 0,
        postsCount: 0,
        userMentions: 0,
        retweetCount: 0,
      };

      daywisesData.push(daywises);
    }
    for (const d in daywisesData) {
      for (const c in twitterInsights) {
        if (daywisesData[d].date == twitterInsights[c].date) {
          daywisesData[d].followerCount = twitterInsights[c].followerCount;
          daywisesData[d].followingCount = twitterInsights[c].followingCount;
          daywisesData[d].favouritesCount = twitterInsights[c].favouritesCount;
          daywisesData[d].postsCount = twitterInsights[c].postsCount;
          daywisesData[d].userMentions = twitterInsights[c].userMentions;
          daywisesData[d].retweetCount = twitterInsights[c].retweetCount;
        }
      }
    }

    return daywisesData;
  }

  /**
     * TODO To generate pdf files for team report
     * @description To generate pdf files for team report
     * @param  {object} details -Team report
     * @param  {string} reportTitle -Report title
     * @param  {string} teamName -Name of the team
     * @param  {number} frequency -Frequency of report
     * @param  {number} teamId -Team id
     * @return {string} Return pdf file name
     */
  async teamReportToPdf(details, reportTitle, teamName, frequency, teamId) {
    try {
      const filePath = paths.resolve(__dirname, `../../../media/autoReport/${reportTitle}_${teamName}_${frequency}_${teamId}_${details[0].date}_${details[details.length - 1].date}.pdf`);
      const pdfFileTableHeader = [
        { id: 'date', title: 'Date' },
        { id: 'postCount', title: 'Post Count' },
        { id: 'postFailed', title: 'Post Failed' },
        { id: 'schedulePosts', title: 'Schedule Posts' },
      ];
      const pdfFileLogoUrl = 'https://i.imgur.com/eRkLsuQ.png';
      const pdfDoc = new PdfMaker({ filepath: filePath }).createPdfDoc();

      pdfDoc.setFont(this.language);
      pdfDoc.setDocDetails([
        `Team Report ${teamName} `,
        `Date: ${details[0].date}/${details[details.length - 1].date}`,
      ]);
      const logo = await pdfDoc.setLogo(pdfFileLogoUrl);

      pdfDoc.setTableHeaders(pdfFileTableHeader);

      const pdfTableRowData = [];
      // blank entry

      pdfTableRowData.push({});
      for (const attendance of Object.values(details.reverse())) {
        pdfTableRowData.push({
          date: attendance.date,
          postCount: attendance.postCount ?? 0,
          postFailed: attendance.postFailed ?? 0,
          schedulePosts: attendance.schedulePosts ?? 0,
        });
      }
      // TODO: logic to create the PDF file
      await pdfDoc.setTableBody(pdfTableRowData).end();

      return filePath;
    } catch (err) {
      logger.error(`-V3---email-----${err.message}---${err}'---${__filename}----`);

      return Promise.reject(err);
    }
  }

  /**
     * TODO To generate pdf files for twitter report
     * @description To generate pdf files for twitter report
     * @param  {object} details -Twitter report
     * @param  {string} reportTitle -Report title
     * @param  {string} user_name -Name of the user
     * @param  {number} frequency -Frequency of report
     * @param  {number} account_id -Account id of twitter
     * @param  {string} first_name -First Name of twitter account
     * @param  {string} last_name -Last name twitter account
     * @return {string} Return pdf file name
     */
  async twitterReportToPdf(details, reportTitle, user_name, frequency, account_id, first_name, last_name = '') {
    try {
      const filePath = paths.resolve(__dirname, `../../../media/autoReport/${reportTitle}_${user_name}_${frequency}_${account_id}_${details[0].date}_${details[details.length - 1].date}.pdf`);
      const pdfFileTableHeader = [
        { id: 'date', title: 'Date' },
        { id: 'followerCount', title: 'Follower Count' },
        { id: 'followingCount', title: 'Following Count' },
        { id: 'favoritesCount', title: 'Favorites Count' },
        { id: 'postsCount', title: 'Posts Count' },
        { id: 'userMentions', title: 'User Mentions' },
        { id: 'retweetCount', title: 'Retweet Count' },

      ];
      // adding reseller logo link
      const pdfFileLogoUrl = 'https://i.imgur.com/eRkLsuQ.png';
      const pdfDoc = new PdfMaker({ filepath: filePath }).createPdfDoc();

      pdfDoc.setFont(this.language);
      pdfDoc.setDocDetails([
        `Twitter report ${first_name} ${last_name}  `,
        `Date: ${details[0].date}/${details[details.length - 1].date}`,
      ]);
      await pdfDoc.setLogo(pdfFileLogoUrl);
      pdfDoc.setTableHeaders(pdfFileTableHeader);
      const pdfTableRowData = [];
      // blank entry

      pdfTableRowData.push({});
      for (const data of Object.values(details.reverse())) {
        pdfTableRowData.push({
          date: data.date,
          followerCount: data.followerCount ?? 0,
          followingCount: data.followingCount ?? 0,
          favoritesCount: data.favouritesCount ?? 0,
          postsCount: data.postsCount ?? 0,
          userMentions: data.userMentions ?? 0,
          retweetCount: data.retweetCount ?? 0,
        });
      }
      // TODO: logic to create the PDF file
      await pdfDoc.setTableBody(pdfTableRowData).end();

      return filePath;
    } catch (err) {
      logger.error(err);

      return Promise.reject(err);
    }
  }

  /**
    * TODO To generate pdf files for youTube report
    * @description To generate pdf files for youTube report
    * @param  {object} details -youTube report
    * @param  {string} reportTitle -Report title
    * @param  {string} teamName -Name of the team
    * @param  {number} frequency -Frequency of report
    * @param  {number} account_id -Account id of youTube
    * @param  {string} first_name -First Name of youTube account
    * @param  {string} last_name -Last name youTube account
    * @return {string} Return pdf file name
    */
  async youtubeReportToPdf(details, reportTitle, user_name, frequency, account_id, first_name, last_name = '') {
    try {
      const filePath = paths.resolve(__dirname, `../../../media/autoReport/${reportTitle}_${user_name}_${frequency}_${account_id}_${details[0].day}_${details[details.length - 1].day}.pdf`);
      const pdfFileTableHeader = [
        { id: 'day', title: 'Date' },
        { id: 'averageViewDuration', title: 'Average View Duration' },
        { id: 'likes', title: 'Total likes' },
        { id: 'dislikes', title: 'Total dislikes' },
        { id: 'comments', title: 'comments' },
        { id: 'shares', title: 'Shares' },
        { id: 'subscribersGained', title: 'Subscribers Gained' },
        { id: 'subscribersLost', title: 'Subscribers Lost' },
        { id: 'views', title: 'Views Count' },
      ];
      // adding reseller logo link
      const pdfFileLogoUrl = 'https://i.imgur.com/eRkLsuQ.png';
      const pdfDoc = new PdfMaker({ filepath: filePath }).createPdfDoc();

      pdfDoc.setFont(this.language);
      pdfDoc.setDocDetails([
        `YouTube Report ${first_name}`,
        `Date: ${details[0].day}/${details[details.length - 1].day}`,
      ]);
      await pdfDoc.setLogo(pdfFileLogoUrl);
      pdfDoc.setTableHeaders(pdfFileTableHeader);
      const pdfTableRowData = [];

      pdfTableRowData.push({});
      for (const data of Object.values(details)) {
        pdfTableRowData.push({
          day: data.day,
          averageViewDuration: data.averageViewDuration ?? 0,
          likes: data.likes ?? 0,
          dislikes: data.dislikes ?? 0,
          comments: data.comments ?? 0,
          shares: data.shares ?? 0,
          subscribersGained: data.subscribersGained ?? 0,
          subscribersLost: data.subscribersLost ?? 0,
          views: data.views ?? 0,
        });
      }
      // TODO: logic to create the PDF file
      await pdfDoc.setTableBody(pdfTableRowData).end();

      return filePath;
    } catch (err) {
      // Logger.error(`-V3---email-----${err.message}---${err}'---${__filename}----`);
      return Promise.reject(err);
    }
  }

  /**
     * TODO To generate csv files for team report
     * @description To generate csv files for team report
     * @param  {object} details -Team report
     * @param  {string} reportTitle -Report title
     * @param  {string} teamName -Name of the team
     * @param  {number} frequency -Frequency of report
     * @param  {number} teamId -Team id
     * @return {string} Return csv file name
     */
  async teamReportToCsv(DayWiseData, reportTitle, teamName, frequency, teamId) {
    try {
      const fileName = `${reportTitle}_${teamName}_${frequency}_${teamId}_${DayWiseData[0].date}_${DayWiseData[DayWiseData.length - 1].date}.csv`;
      const { filePath, csvWriter } = this.getCvsWriter(fileName, [
        { id: 'date', title: 'Date' },
        { id: 'postCount', title: 'Post Count' },
        { id: 'postFailed', title: 'Post Failed' },
        { id: 'schedulePosts', title: 'Schedule Posts' },
      ]);

      await csvWriter.writeRecords([]);
      for (const dayWiseData of Object.values(DayWiseData)) {
        await csvWriter.writeRecords([{
          date: `${moment(dayWiseData.date).format('YYYY-MM-DD')}`,
          postCount: dayWiseData.postCount ?? 0,
          postFailed: dayWiseData.postFailed ?? 0,
          schedulePosts: dayWiseData.schedulePosts ?? 0,
        }]);
      }

      return filePath;
    } catch (err) {
      logger.error(`-V3---email-----${err.message}---${err}'---${__filename}----`);

      return Promise.reject(err);
    }
  }

  /**
     * TODO To generate csv files for twitter report
     * @description To generate csv files for twitter report
     * @param  {object} details -Twitter report
     * @param  {string} reportTitle -Report title
     * @param  {string} user_name -Name of the user
     * @param  {number} frequency -Frequency of report
     * @param  {number} account_id -Account id of twitter
     * @param  {string} first_name -First Name of twitter account
     * @param  {string} last_name -Last name twitter account
     * @return {string} Return csv file name
     */
  async twitterReportToCsv(details, reportTitle, user_name, frequency, account_id, first_name, last_name = '') {
    try {
      const fileName = `${reportTitle}_${user_name}_${frequency}_${account_id}_${details[0].date}_${details[details.length - 1].date}.csv`;
      const csvReportHeader = 'Header';
      const { filePath, csvWriter } = this.getCvsWriter(fileName, [
        { id: 'date', title: 'Date' },
        { id: 'followerCount', title: 'Follower Count' },
        { id: 'followingCount', title: 'Following Count' },
        { id: 'favouritesCount', title: 'Favorites Count' },
        { id: 'postsCount', title: 'Posts Count' },
        { id: 'userMentions', title: 'User Mentions' },
        { id: 'retweetCount', title: 'Retweet Count' },
      ]);

      await csvWriter.writeRecords([]);
      for (const data of Object.values(details.reverse())) {
        await csvWriter.writeRecords([{
          date: data.date,
          followerCount: data.followerCount ?? 0,
          followingCount: data.followingCount ?? 0,
          favouritesCount: data.favouritesCount ?? 0,
          postsCount: data.postsCount ?? 0,
          userMentions: data.userMentions ?? 0,
          retweetCount: data.retweetCount ?? 0,
        }]);
      }

      return filePath;
    } catch (err) {
      logger.error(err);

      return Promise.reject(err);
    }
  }

  /**
    * TODO To generate csv files for youTube report
    * @description To generate csv files for youTube report
    * @param  {object} details -youTube report
    * @param  {string} reportTitle -Report title
    * @param  {string} teamName -Name of the team
    * @param  {number} frequency -Frequency of report
    * @param  {number} account_id -Account id of youTube
    * @param  {string} first_name -First Name of youTube account
    * @param  {string} last_name -Last name youTube account
    * @return {string} Return csv file name
    */
  async youtubeReportToCsv(Details, reportTitle, user_name, frequency, account_id, first_name, last_name = '') {
    try {
      const fileName = `${reportTitle}_${user_name}_${frequency}_${account_id}_${Details[0].day}_${Details[Details.length - 1].day}.csv`;
      const { filePath, csvWriter } = this.getCvsWriter(fileName, [
        { id: 'day', title: 'Date' },
        { id: 'averageViewDuration', title: 'Average View Duration' },
        { id: 'likes', title: 'Total likes' },
        { id: 'dislikes', title: 'Total dislikes' },
        { id: 'comments', title: 'comments' },
        { id: 'shares', title: 'Shares' },
        { id: 'subscribersGained', title: 'Subscribers Gained' },
        { id: 'subscribersLost', title: 'Subscribers Lost' },
        { id: 'views', title: 'Views Count' },
      ]);

      await csvWriter.writeRecords([]);
      for (const data of Object.values(Details)) {
        await csvWriter.writeRecords([{
          day: data.day,
          averageViewDuration: data.averageViewDuration ?? 0,
          likes: data.likes ?? 0,
          dislikes: data.dislikes ?? 0,
          comments: data.comments ?? 0,
          shares: data.shares ?? 0,
          subscribersGained: data.subscribersGained ?? 0,
          subscribersLost: data.subscribersLost ?? 0,
          views: data.views ?? 0,
        }]);
      }

      return filePath;
    } catch (err) {
      logger.error(err);

      return Promise.reject(err);
    }
  }

  /**
     * TODO To csv file and its path
     * @description To csv file and its path
     * @param  {File} fileName -File path for csv file
     * @param  {object} header -Csv file header
     * @return {object} Returns csv file and its path
     */
  getCvsWriter(fileName, header) {
    const filePath = paths.resolve(__dirname, `../../../media/autoReport/${fileName}`);
    const csvWriter = createObjectCsvWriter({ path: filePath, header });

    return { filePath, csvWriter };
  }

  /**
     * TODO To add auto report.
     * @description  To add auto report
     * @param  {String} report_title -Report title
     * @param  {number} report_type -Report type 0-All,1-pdf,2-csv
     * @param  {number} frequency -Frequency of reports 0-daily,1-weekly,2-monthly
     * @param  {object} content -Report details
     * @param  {number} user_id -User id
     * @return {string} Added record details
     */
  async addReport(report_title, report_type, frequency, content, user_id) {
    const res = await ReportMailDetails.create({
      report_title,
      report_type,
      frequency,
      content,
      user_id,
      created_at: moment.utc(),
      updated_at: moment.utc(),
    });
  }

  /**
    * TODO To update auto report.
    * @description  To update auto report.
    * @param  {String} report_title -Report title
    * @param  {number} report_type -Report type 0-All,1-pdf,2-csv
    * @param  {number} frequency -Frequency of reports 0-daily,1-weekly,2-monthly
    * @param  {object} content -Report details
    * @param  {number} user_id -User id
    * @param  {number} id -Id of auto report details
    * @return {string} Updated record details
    */
  async editReport(report_title, report_type, frequency, content, user_id, id) {
    const res = await ReportMailDetails.update({
      report_title, report_type, frequency, content, user_id, updated_at: moment.utc(),
    },
    { where: { id } });

    return res;
  }

  /**
     * TODO To delete a record for particular id.
     * @description  Delete a record for particular id
     * @param  {number} id -Auto report mail details unique id
     * @return {object} - Return deleted results
     */
  async removeReport(id) {
    const res = await ReportMailDetails.destroy({ where: { id } });

    return res;
  }

  /**
     * TODO To get auto report mail details for a particular id.
     * @description  TO get Auto report mail details for a particular id
     * @param  {number} id -Auto report mail details unique id
     * @return {object} Return records matching with id
     */
  async getReportById(id) {
    const res = await ReportMailDetails.findOne({ where: { id } });

    return res;
  }

  /**
     * TODO To get auto report mail details for a user.
     * @description  TO get Auto report mail details for a user
     * @param  {number} user_id -User id
     * @param  {number} pageId -Pagination id
     * @return {object} Return records matching user with pagination
     */
  async getReports(user_id, pageId) {
    const res = await ReportMailDetails.findAll({
      where: { user_id },
      offset: (config.get('perPageLimit') * (pageId - 1)),
      limit: config.get('perPageLimit'),
      order: [
        ['updated_at', 'DESC'],
      ],
      raw: true,
    });

    return res;
  }

  /**
     * TODO To get stats for mail report
     * @description To get stats for mail report
     * @param  {number} ownerId -User id
     * @param  {number} teams -Array of team
     * @return {object} Return stats for mail report
     */
  async getDirectTotalPost(ownerId, teams) {
    let TeamId;

    if (teams.length != 0) TeamId = teams;
    else {
      TeamId = await teamInfo.findAll({
        where: { team_admin_id: ownerId },
        attributes: ['team_id'],
        raw: true,
      });
    }
    const publishPost = new PublishedPost();

    if (teams.length != 0) {
      const toNumbers = (arr) => arr.map(Number);

      TeamId = toNumbers(TeamId);
    } else {
      TeamId = TeamId.map((x) => x.team_id);
    }
    const res = await publishPost.getTotalTeamSchedulerStats(TeamId);
    const scheduleCount = await SchedulePostModel.countDocuments({ ownerId });
    const teamDetails = await teamSocialAccountJoinTable.findAll({
      where: { team_id: TeamId },
      attributes: ['account_id'],
      raw: true,
    });
    const account_id = [];

    teamDetails.map((x) => account_id.push(x.account_id));
    const result = await socialAccount.findAll({
      where: { account_id },
      attributes: [
        'account_type',
        [sequelize.fn('count', sequelize.col('account_type')), 'count'],
      ],
      group: ['account_type'],
      raw: true,
      order: sequelize.literal('count ASC'),
    });
    let youTubeCount = 0; let twitterCount = 0; let fbCount = 0; let instagramCount = 0; let
      linkedInCount = 0;

    result.map((x) => {
      x.account_type == 9 ? youTubeCount = x.count : '';
      x.account_type == 4 ? twitterCount = x.count : '';
      x.account_type == 5 ? instagramCount = x.count : '';
      x.account_type == 2 ? fbCount += x.count : '';
      x.account_type == 1 ? fbCount += x.count : '';
      x.account_type == 6 ? linkedInCount = x.count : '';
    });

    return {
      totalPost: (res[0]?.postCount ?? 0 + scheduleCount), scheduleCount, publishedCount: res[0]?.postCount ?? 0, postFailed: res[0]?.postFailed ?? 0, youTubeCount, twitterCount, fbCount, instagramCount, linkedInCount,
    };
  }

  /**
     * TODO To get report date
     * @description To get report date
     * @param  {number} filterPeriod -Filter period 1-today,2-yesterday,3-week,4-month
     * @return {string} Returns starting and ending date for report
     */
  async getReportDate(filterPeriod) {
    const { since, untill } = await teamReport.getFilteredPeriod(filterPeriod);

    return `${moment(since).format('YYYY-MM-DD')} to ${moment(untill).format('YYYY-MM-DD')}`;
  }
}

export default new ReportMailModel();
