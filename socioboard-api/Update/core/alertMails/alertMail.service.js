import { ErrorResponse, SuccessResponse, CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js'
import AlertMailModel from '../../../Common/Models/alertMail.model.js'
const alertMailModel = new AlertMailModel()
import moment from 'moment';
import logger from '../../resources/log/logger.log.js'
import schedule from 'node-schedule';
class AlertMailController {

    constructor() {
        this.setupMailServicesCrons();
    }

    setupMailServicesCrons() {
        logger.info("Cron setup initialized for mail services...");
        schedule.scheduleJob('37 13 * * *', () => {
            logger.info(`Cron started to notify all user's whose plan going to expire within 3 days, started time ${moment()}`);
            let res = alertMailModel.sendExpireAlert()
            res ? logger.info(`Cron process completed for notify all user's whose plan going to expire within 3 days, completed time ${moment()}`)
                : logger.info(`Cron process error while notifying user's whose plan going to expire within 3 days, stopped time ${moment()}`)
        });
        schedule.scheduleJob('37 13 * * *', () => {
            logger.info(`Cron started to notify all user's whose plan already expired, started time ${moment()}`);
            let res = alertMailModel.sendExpiredIntimation()
            res ?
                logger.info(`Cron process completed for notify all user's whose plan already expired, completed time ${moment()}`)
                : logger.info(`Cron process error while notifying user's whose plan already expired, stopped time ${moment()}`)
        });
        logger.info("Cron setup completed for mail services...");

        schedule.scheduleJob('37 13 * * *', () => {
            logger.info(`Cron started to notify all user's whose plan already expired, started time ${moment()}`);
            let res = alertMailModel.sendExpiredMail()
            res ?
                logger.info(`Cron process completed for notify all user's whose plan already expired, completed time ${moment()}`)
                : logger.info(`Cron process error while notifying user's whose plan already expired, stopped time ${moment()}`)
        });
        logger.info("Cron setup completed for mail services...");
    }

    async sendExpireAlert(req, res, next) {
        try {
            let result = await alertMailModel.sendExpireAlert()
            result ? SuccessResponse(res, result) : ErrorResponse(res, result)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async sendExpiredIntimation(req, res, next) {
        try {
            let result = await alertMailModel.sendExpiredIntimation()
            result ? SuccessResponse(res, result) : ErrorResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }

    async sendExpiredMail(req, res, next) {
        try {
            let result = await alertMailModel.sendExpiredMail(req.query.days)
            result ? SuccessResponse(res, result) : ErrorResponse(res)
        } catch (err) {
            return CatchResponse(res, err.message);
        }
    }


}

export default new AlertMailController()