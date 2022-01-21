import config from 'config';
import paths, {dirname} from 'path';
import {fileURLToPath} from 'url';
import schedule from 'node-schedule';
import moment from 'moment';
import fs from 'fs';
import ReportMailModel from '../../../Common/Models/report-mail.model.js';
import TeamReport from '../../../Common/Models/team-report.model.js';
import SendEmailService from '../../../Common/Services/mail-base.services.js';

import validate from './report-mail.validate.js';
import {
  CatchResponse,
  ErrorResponse,
  SuccessResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import logger from '../../resources/log/logger.log.js';
import EmailTemplate from '../../../Common/Services/email.template.js';
import db from '../../../Common/Sequelize-cli/models/index.js';

const teamReport = new TeamReport();
const __dirname = dirname(fileURLToPath(import.meta.url));
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
        autoReport,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (req.query.testMail == 1) {
        const testMail = ReportMailModel.addReport(
          req.query.reportTitle,
          req.query.report,
          req.query.frequency,
          JSON.stringify(req.body.autoReport),
          req.body.userScopeId
        );

        SuccessResponse(res, 'Auto report schedule added successfully');
      } else {
        const user = await this.sendMailReports(
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
        autoReport,
      });

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (!id) return ValidateErrorResponse(res, 'Id required');
      const data = await ReportMailModel.getReportById(id);

      if (!data) return ErrorResponse(res, 'Record Not Found');
      if (req.query.testMail === '1') {
        const add = ReportMailModel.editReport(
          req.query.reportTitle,
          req.query.report,
          req.query.frequency,
          JSON.stringify(req.body.autoReport),
          req.body.userScopeId,
          req.query.id
        );

        SuccessResponse(res, 'Auto report schedule updated successfully');
      } else {
        const user = await this.sendMailReports(
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
      const {id} = req.query;

      if (!id) return ValidateErrorResponse(res, 'Record id is required');
      const data = await ReportMailModel.getReportById(id);

      if (data) {
        const result = await ReportMailModel.removeReport(
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
      const result = await ReportMailModel.getReports(
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
      // Check auto report id given or not
      if (!req.query.id) return ValidateErrorResponse(res, 'Id required');
      const result = await ReportMailModel.getReportById(req.query.id);

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
    const attachments = [];
    let reportDate;

    if (autoReport.teamReport) {
      if (autoReport.teamReport?.length !== 0) {
        let teamReports = [];
        let mailDetails = [];
        const promises = autoReport.teamReport.map(
          async team =>
            await ReportMailModel.getTeamSchedulerStats(
              team,
              userScopeId,
              frequency == 0 ? 1 : frequency == 1 ? 3 : 4
            )
        );

        teamReports = await Promise.all(promises);
        let path;

        if (teamReports.length > 0) {
          const promises = teamReports
            .filter(data => data !== undefined)
            .map(async data => {
              const attachments = [];

              if (report == 0 || report == 1) {
                path = await ReportMailModel.teamReportToPdf(
                  data.report.daywisesData,
                  reportTitle,
                  data.teamDetails.team_name,
                  frequency,
                  data.teamDetails.team_id
                );
                const content = fs.readFileSync(path).toString('base64');

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
                const content = fs.readFileSync(path).toString('base64');

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
        const promises = autoReport.twitterReport.map(
          async twitter =>
            await ReportMailModel.getTwitterReport(
              twitter,
              userScopeId,
              frequency == 0 ? 1 : frequency == 1 ? 3 : 4
            )
        );

        twitterReport = await Promise.all(promises);
        let mailDetails = [];

        if (twitterReport.length > 0) {
          const promises = twitterReport
            .filter(data => data !== undefined)
            .map(async data => {
              const attachments = [];

              if (report == 0 || report == 1) {
                const path = await ReportMailModel.twitterReportToPdf(
                  data.data,
                  reportTitle,
                  data.socialAccDetails.user_name,
                  frequency,
                  data.socialAccDetails.account_id,
                  data.socialAccDetails.first_name,
                  data.socialAccDetails.last_name
                );
                const content = fs.readFileSync(path).toString('base64');

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
                const path = await ReportMailModel.twitterReportToCsv(
                  data.data,
                  reportTitle,
                  data.socialAccDetails.user_name,
                  frequency,
                  data.socialAccDetails.account_id,
                  data.socialAccDetails.first_name,
                  data.socialAccDetails.last_name
                );
                const content = fs.readFileSync(path).toString('base64');

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
        const promises = autoReport.youTube.map(
          async youTube =>
            await ReportMailModel.getYouTubeReport(
              youTube,
              userScopeId,
              frequency == 0 ? 3 : frequency == 1 ? 3 : 4
            )
        );

        youTubeReport = await Promise.all(promises);
        let mailDetails = [];
        const promise = youTubeReport
          .filter(data => data !== undefined)
          .map(async data => {
            const attachments = [];

            if (report == 0 || report == 1) {
              const path = await ReportMailModel.youtubeReportToPdf(
                data.response.daywises,
                reportTitle,
                data.socialAccDetails.user_name,
                frequency,
                data.socialAccDetails.account_id,
                data.socialAccDetails.first_name,
                data.socialAccDetails.last_name
              );
              const content = fs.readFileSync(path).toString('base64');

              attachments.push({
                content,
                filename: `${reportTitle}_${
                  data.socialAccDetails.first_name
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
              const path = await ReportMailModel.youtubeReportToCsv(
                data.response.daywises,
                reportTitle,
                data.socialAccDetails.user_name,
                frequency,
                data.socialAccDetails.account_id,
                data.socialAccDetails.first_name,
                data.socialAccDetails.last_name
              );
              const content = fs.readFileSync(path).toString('base64');

              attachments.push({
                content,
                filename: `${reportTitle}_${
                  data.socialAccDetails.first_name
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
    const {
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

    reportDate = await ReportMailModel.getReportDate(
      frequency == 0 ? 1 : frequency == 1 ? 3 : 4
    );
    const sendEmailServiceObject = new SendEmailService(
      config.get('mailService')
    );
    let users = {
      attachments,
      title: reportTitle,
      html: EmailTemplate({
        report_type:
          frequency == 0 ? 'Daily' : frequency == 1 ? 'Weekly' : 'Monthly',
      }),
      emails: autoReport.email,
    };
    let asm = {
      group_id: config.get('mail_subscription_group.auto_report') ?? '',
      groups_to_display: [
        config.get('mail_subscription_group.auto_report') ?? '',
      ],
    };
    if (asm && asm != '') users.asm = asm;
    const result = await sendEmailServiceObject.sendReport(
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
    schedule.scheduleJob('25 18 * * *', async () => {
      logger.info(
        `Cron started for daily report mail, started time ${moment()}`
      );
      const dailyReports = await ReportMailDetails.findAll({
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
    schedule.scheduleJob('00 18 * * 0', async () => {
      logger.info(
        `Cron started for weekly report mail, started time ${moment()}`
      );
      const dailyReports = await ReportMailDetails.findAll({
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
    schedule.scheduleJob('00 18 1 * *', async () => {
      logger.info(
        `Cron started for monthly report mail, started time ${moment()}`
      );
      const dailyReports = await ReportMailDetails.findAll({
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
