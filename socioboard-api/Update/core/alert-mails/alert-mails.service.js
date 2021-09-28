import moment from 'moment';
import schedule from 'node-schedule';
import {
  ErrorResponse,
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import AlertMailModel from '../../../Common/Models/alert-mail.model.js';
import logger from '../../resources/Log/logger.log.js';

const alertMailModel = new AlertMailModel();

class AlertMailController {
  constructor() {
    this.setupMailServicesCrons();
  }

  setupMailServicesCrons() {
    logger.info('Cron setup initialized for mail services...');
    schedule.scheduleJob({hour: 0, minute: 2, second: 0}, () => {
      logger.info(
        `Cron started to notify all user's whose plan going to expire within 3 days, started time ${moment()}`
      );
      const res = alertMailModel.sendExpireAlert();

      res
        ? logger.info(
            `Cron process completed for notify all user's whose plan going to expire within 3 days, completed time ${moment()}`
          )
        : logger.info(
            `Cron process error while notifying user's whose plan going to expire within 3 days, stopped time ${moment()}`
          );
    });
    schedule.scheduleJob({hour: 0, minute: 2, second: 0}, () => {
      logger.info(
        `Cron started to notify all user's whose plan already expired, started time ${moment()}`
      );
      const res = alertMailModel.sendExpiredIntimation();

      res
        ? logger.info(
            `Cron process completed for notify all user's whose plan already expired, completed time ${moment()}`
          )
        : logger.info(
            `Cron process error while notifying user's whose plan already expired, stopped time ${moment()}`
          );
    });
    logger.info('Cron setup completed for mail services...');

    // schedule.scheduleJob('37 13 * * *', () => {
    //   logger.info(`Cron started to notify all user's whose plan already expired, started time ${moment()}`);
    //   const res = alertMailModel.sendExpiredMail();

    //   res
    //     ? logger.info(`Cron process completed for notify all user's whose plan already expired, completed time ${moment()}`)
    //     : logger.info(`Cron process error while notifying user's whose plan already expired, stopped time ${moment()}`);
    // });
    logger.info('Cron setup completed for mail services...');
  }

  async sendExpireAlert(req, res, next) {
    try {
      const result = await alertMailModel.sendExpireAlert();

      result ? SuccessResponse(res, result) : ErrorResponse(res, result);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async sendExpiredIntimation(req, res, next) {
    try {
      const result = await alertMailModel.sendExpiredIntimation();

      result ? SuccessResponse(res, result) : ErrorResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async sendExpiredMail(req, res, next) {
    try {
      const result = await alertMailModel.sendExpiredMail(req.query.days);

      result ? SuccessResponse(res, result) : ErrorResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }
}

export default new AlertMailController();
