import ReportMailModel from './../../../Common/Models/report.mail.model.js';
import TeamReport from '../../../Common/Models/teamReport.model.js';
const teamReport = new TeamReport();
import SendEmailService from './../../../Common/Services/mailBase.services.js';
import config from 'config';
import paths from 'path';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import validate from './report.mail.validate.js';
import {
  CatchResponse,
  ErrorResponse,
  SuccessResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import logger from '../../resources/Log/logger.log.js';
import schedule from 'node-schedule';
import moment from 'moment';
import EmailTemplate from '../../../Common/Services/email.template.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
import fs from 'fs';
import db from '../../../Common/Sequelize-cli/models/index.js';
const ReportMailDetails = db.auto_reports;

class ReportMailService {
  constructor() {
    this.cronForDailyReports();
    this.cronForWeeklyReports();
    this.cronForMonthlyReports();
  }

  /**
   * TODO To create scheduler details.
   * @description  To create scheduler details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns status for creating scheduler details
   */
  async sendReportMail(req, res) {
    try {
      const {autoReport, userScopeId} = req.body;
      const {reportTitle, frequency, report, testMail} = req.query;
      const {error} = validate.validAutoReport({
        reportTitle,
        frequency,
        report,
        testMail,
        autoReport: autoReport,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (req.query.testMail == 1) {
        let testMail = ReportMailModel.addReport(
          req.query.reportTitle,
          req.query.report,
          req.query.frequency,
          JSON.stringify(req.body.autoReport),
          req.body.userScopeId
        );
        SuccessResponse(res, 'Auto report schedule added successfully');
      } else {
        let user = await this.sendMailReports(
          autoReport,
          userScopeId,
          reportTitle,
          frequency,
          report,
          testMail,
          req.body.userScopeName
        );
        return SuccessResponse(res, 'Test mail sent successfully');
      }
    } catch (error) {
      logger.info(`Error in sendReportMail ${error}`);
      return CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To update scheduler details.
   * @description  To update scheduler details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns status for updating scheduler details
   */
  async editReport(req, res) {
    try {
      const {autoReport, userScopeId} = req.body;
      const {reportTitle, frequency, report, testMail, id} = req.query;
      const {error} = validate.validAutoReport({
        reportTitle,
        frequency,
        report,
        testMail,
        autoReport: autoReport,
      });
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (!id) return ValidateErrorResponse(res, 'Id required');
      let data = await ReportMailModel.getReportById(id);
      if (!data) return ErrorResponse(res, 'Record Not Found');
      if (req.query.testMail === '1') {
        let add = ReportMailModel.editReport(
          req.query.reportTitle,
          req.query.report,
          req.query.frequency,
          JSON.stringify(req.body.autoReport),
          req.body.userScopeId,
          req.query.id
        );
        SuccessResponse(res, 'Auto report schedule updated successfully');
      } else {
        let user = await this.sendMailReports(
          autoReport,
          userScopeId,
          reportTitle,
          frequency,
          report,
          testMail,
          req.body.userScopeName
        );
        return SuccessResponse(res, 'Test mail sent successfully');
      }
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To delete a auto report details from db.
   * @description  To delete a auto report details from db
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns delete status
   */
  async removeReport(req, res) {
    try {
      let id = req.query.id;
      if (!id) return ValidateErrorResponse(res, 'Record id is required');
      let data = await ReportMailModel.getReportById(id);
      if (data) {
        let result = await ReportMailModel.removeReport(
          id,
          req.body.userScopeId
        );
        return SuccessResponse(res, 'Schedule Report Deleted Successfully');
      }
      return ErrorResponse(res, 'Record Not Found');
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get auto report mail details for user.
   * @description  TO get Auto report mail details user
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns Auto report mail details for user
   */
  async getReports(req, res) {
    try {
      let result = await ReportMailModel.getReports(
        req.body.userScopeId,
        req.query.pageId
      );
      SuccessResponse(res, result);
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }

  /**
   * TODO To get auto report mail details for a particular id.
   * @description  TO get Auto report mail details for a particular id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns Auto report mail details for a particular id
   */
  async getReportsById(req, res) {
    try {
      //Check auto report id given or not
      if (!req.query.id) return ValidateErrorResponse(res, 'Id required');
      let result = await ReportMailModel.getReportById(req.query.id);
      result
        ? SuccessResponse(res, result)
        : ErrorResponse(res, 'No record Found');
    } catch (error) {
      CatchResponse(res, error.message);
    }
  }
  /**
   * TODO To send mail for email with specified reports.
   * @description To send mail for email with specified reports
   * @param  {object} autoReport -Report details that should be generated
   * @param  {number} userScopeId -User id
   * @param  {string} reportTitle -Title of report
   * @param  {number} report_type -Report type 0-All,1-pdf,2-csv
   * @param  {number} frequency -Frequency of reports 0-daily,1-weekly,2-monthly
   * @param  {object} content -Report details
   * @return {string} Mail send status
   */
  async sendMailReports(
    autoReport,
    userScopeId,
    reportTitle,
    frequency,
    report
  ) {
    let attachments = [],
      reportDate;
    if (autoReport.teamReport) {
      if (autoReport.teamReport?.length !== 0) {
        let teamReports = [];
        let mailDetails = [];
        let promises = autoReport.teamReport.map(async team => {
          return await ReportMailModel.getTeamSchedulerStats(
            team,
            userScopeId,
            frequency == 0 ? 1 : frequency == 1 ? 3 : 4
          );
        });
        teamReports = await Promise.all(promises);
        let path;
        if (teamReports.length > 0) {
          let promises = teamReports
            .filter(data => data !== undefined)
            .map(async data => {
              let attachments = [];
              if (report == 0 || report == 1) {
                path = await ReportMailModel.teamReportToPdf(
                  data.report.daywisesData,
                  reportTitle,
                  data.teamDetails.team_name,
                  frequency,
                  data.teamDetails.team_id
                );
                let content = fs.readFileSync(path).toString('base64');
                attachments.push({
                  content,
                  filename: `${reportTitle}_${
                    data.teamDetails.team_name
                  }_${frequency}_${data.teamDetails.team_id}_${
                    data.report.daywisesData[0].date
                  }_${
                    data.report.daywisesData[
                      data.report.daywisesData.length - 1
                    ].date
                  }.pdf`,
                  type: 'application/pdf',
                  disposition: 'attachment',
                });
                reportDate = `${
                  data.report.daywisesData[data.report.daywisesData.length - 1]
                    .date
                } to ${data.report.daywisesData[0].date}`;
              }
              if (report == 0 || report == 2) {
                path = await ReportMailModel.teamReportToCsv(
                  data.report.daywisesData,
                  reportTitle,
                  data.teamDetails.team_name,
                  frequency,
                  data.teamDetails.team_id
                );
                let content = fs.readFileSync(path).toString('base64');
                attachments.push({
                  content,
                  filename: `${reportTitle}_${
                    data.teamDetails.team_name
                  }_${frequency}_${data.teamDetails.team_id}_${
                    data.teamDetails.team_id
                  }_${data.report.daywisesData[0].date}_${
                    data.report.daywisesData[
                      data.report.daywisesData.length - 1
                    ].date
                  }.csv`,
                  type: 'application/csv',
                  disposition: 'attachment',
                });
              }
              return attachments;
            });
          mailDetails = await Promise.all(promises);
        }
        mailDetails.map(x => x.map(y => attachments.push(y)));
      }
    }
    if (autoReport.twitterReport) {
      if (autoReport.twitterReport?.length !== 0) {
        let twitterReport = [];
        const promises = autoReport.twitterReport.map(async twitter => {
          return await ReportMailModel.getTwitterReport(
            twitter,
            userScopeId,
            frequency == 0 ? 1 : frequency == 1 ? 3 : 4
          );
        });
        twitterReport = await Promise.all(promises);
        let mailDetails = [];
        if (twitterReport.length > 0) {
          let promises = twitterReport
            .filter(data => data !== undefined)
            .map(async data => {
              let attachments = [];
              if (report == 0 || report == 1) {
                let path = await ReportMailModel.twitterReportToPdf(
                  data.data,
                  reportTitle,
                  data.socialAccDetails.user_name,
                  frequency,
                  data.socialAccDetails.account_id,
                  data.socialAccDetails.first_name,
                  data.socialAccDetails.last_name
                );
                let content = fs.readFileSync(path).toString('base64');
                attachments.push({
                  content,
                  filename: `${reportTitle}_${
                    data.socialAccDetails.user_name
                  }_${frequency}_${data.socialAccDetails.account_id}_${
                    data.data[0].date
                  }_${data.data[data.data.length - 1].date}.pdf`,
                  type: 'application/pdf',
                  disposition: 'attachment',
                });
              }
              if (report == 0 || report == 2) {
                let path = await ReportMailModel.twitterReportToCsv(
                  data.data,
                  reportTitle,
                  data.socialAccDetails.user_name,
                  frequency,
                  data.socialAccDetails.account_id,
                  data.socialAccDetails.first_name,
                  data.socialAccDetails.last_name
                );
                let content = fs.readFileSync(path).toString('base64');
                attachments.push({
                  content,
                  filename: `${reportTitle}_${
                    data.socialAccDetails.user_name
                  }_${frequency}_${data.socialAccDetails.account_id}_${
                    data.data[0].date
                  }_${data.data[data.data.length - 1].date}.csv`,
                  type: 'application/csv',
                  disposition: 'attachment',
                });
              }
              return attachments;
            });
          mailDetails = await Promise.all(promises);
        }
        mailDetails.map(x => x.map(y => attachments.push(y)));
      }
    }
    if (autoReport.youTube) {
      if (autoReport.youTube?.length !== 0) {
        let youTubeReport = [];
        const promises = autoReport.youTube.map(async youTube => {
          return await ReportMailModel.getYouTubeReport(
            youTube,
            userScopeId,
            frequency == 0 ? 3 : frequency == 1 ? 3 : 4
          );
        });
        youTubeReport = await Promise.all(promises);
        let mailDetails = [];
        let promise = youTubeReport
          .filter(data => data !== undefined)
          .map(async data => {
            let attachments = [];
            if (report == 0 || report == 1) {
              let path = await ReportMailModel.youtubeReportToPdf(
                data.response.daywises,
                reportTitle,
                data.socialAccDetails.user_name,
                frequency,
                data.socialAccDetails.account_id,
                data.socialAccDetails.first_name,
                data.socialAccDetails.last_name
              );
              let content = fs.readFileSync(path).toString('base64');
              attachments.push({
                content,
                filename: `${reportTitle}_${
                  data.socialAccDetails.user_name
                }_${frequency}_${data.socialAccDetails.account_id}_${
                  data.response.daywises[0].day
                }_${
                  data.response.daywises[data.response.daywises.length - 1].day
                }.pdf`,
                type: 'application/pdf',
                disposition: 'attachment',
              });
            }
            if (report == 0 || report == 2) {
              let path = await ReportMailModel.youtubeReportToCsv(
                data.response.daywises,
                reportTitle,
                data.socialAccDetails.user_name,
                frequency,
                data.socialAccDetails.account_id,
                data.socialAccDetails.first_name,
                data.socialAccDetails.last_name
              );
              let content = fs.readFileSync(path).toString('base64');
              attachments.push({
                content,
                filename: `${reportTitle}_${
                  data.socialAccDetails.user_name
                }_${frequency}_${data.response.daywises[0].day}_${
                  data.response.daywises[data.response.daywises.length - 1].day
                }.csv`,
                type: 'application/csv',
                disposition: 'attachment',
              });
            }
            return attachments;
          });
        mailDetails = await Promise.all(promise);
        mailDetails.map(x => x.map(y => attachments.push(y)));
      }
    }
    let {
      postFailed,
      totalPost,
      publishedCount,
      scheduleCount,
      twitterCount,
      fbCount,
      instagramCount,
      youTubeCount,
      linkedInCount,
    } = await ReportMailModel.getDirectTotalPost(
      userScopeId,
      autoReport.teamReport
    );
    let sendEmailServiceObject = new SendEmailService(
      config.get('mailService')
    );
    let users = {
      attachments,
      title: reportTitle,
      html: EmailTemplate({
        heading: `${reportTitle}`,
        reportDate,
        publishedCount,
        scheduleCount,
        postFailed,
        totalPost,
        twitterCount,
        fbCount,
        instagramCount,
        youTubeCount,
        linkedInCount,
      }),
      emails: autoReport.email,
    };
    let result = await sendEmailServiceObject.sendReport(
      users,
      users.attachments
    );
    return result;
  }

  /**
   * TODO To run scheduler for sent mail for day wise report.
   * @description  To run scheduler for sent mail for day wise report
   */
  async cronForDailyReports() {
    schedule.scheduleJob('30 23 * * *', async () => {
      logger.info(
        `Cron started for daily report mail, started time ${moment()}`
      );
      let dailyReports = await ReportMailDetails.findAll({
        where: {frequency: 0},
        raw: true,
      });
      dailyReports.map(async report => {
        this.sendMailReports(
          JSON.parse(report.content),
          report.user_id,
          report.report_title,
          report.frequency,
          report.report_type
        );
      });
    });
  }

  /**
   * TODO To run scheduler for sent mail for weekly report.
   * @description  To run scheduler for sent mail for weekly report
   */
  async cronForWeeklyReports() {
    schedule.scheduleJob('30 23 * * 0', async () => {
      logger.info(
        `Cron started for weekly report mail, started time ${moment()}`
      );
      let dailyReports = await ReportMailDetails.findAll({
        where: {frequency: 1},
        raw: true,
      });
      dailyReports.map(async report => {
        this.sendMailReports(
          JSON.parse(report.content),
          report.user_id,
          report.report_title,
          report.frequency,
          report.report_type
        );
      });
    });
  }

  /**
   * TODO To run scheduler for sent mail for monthly report.
   * @description  To run scheduler for sent mail for monthly report
   */
  async cronForMonthlyReports() {
    schedule.scheduleJob('30 23 1 * *', async () => {
      logger.info(
        `Cron started for monthly report mail, started time ${moment()}`
      );
      let dailyReports = await ReportMailDetails.findAll({
        where: {frequency: 2},
        raw: true,
      });
      dailyReports.map(async report => {
        this.sendMailReports(
          JSON.parse(report.content),
          report.user_id,
          report.report_title,
          report.frequency,
          report.report_type
        );
      });
    });
  }
}
export default new ReportMailService();
