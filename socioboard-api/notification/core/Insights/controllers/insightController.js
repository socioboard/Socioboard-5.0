const schedule = require('node-schedule');
const logger = require('../../../utils/logger');
const InsightLibs = require('../utils/insightLibs');
const insightLibs = new InsightLibs();
const moment = require('moment');

class InsightControllers {

    constructor() {
        this.setupTwitterInsightsCrons();
        this.setupTeamReportInsightCrons();
    }

    setupTwitterInsightsCrons() {
        logger.info("Cron setup intialized for twitter insights services...");
        schedule.scheduleJob('00 22 * * *', () => {
            logger.info(`Cron started for updating all twitter account insight's which is not locked for atleast a team, started time ${moment()}`);
            return insightLibs.twtInsights()
                .then(() => {
                    logger.info(`Cron process completed for updating all twitter accounts insight, completed time ${moment()}`);
                })
                .catch((error) => {
                    logger.info(`Cron process errored while updating all twitter accounts insight, stopped time ${moment()}`);
                });
        });
        logger.info("Cron setup completed for twitter insights services...");
    }

    setupTeamReportInsightCrons() {
        logger.info("Cron setup intialized for teams report insights services...");
        schedule.scheduleJob('00 32 * * *', () => {
            logger.info(`Cron started for updating all teams report insight's, started time ${moment()}`);
            return insightLibs.updateTeamReport()
                .then(() => {
                    logger.info(`Cron process completed for updating all teams report insight, completed time ${moment()}`);
                })
                .catch((error) => {
                    logger.error(error);
                    logger.info(`Cron process errored while updating all teams report insight, stopped time ${moment()}`);
                });
        });
        logger.info("Cron setup completed for teams report insights services...");
    }

    twtInsights(req, res) {
        return insightLibs.twtInsights()
            .then((result) => {
                res.status(200).json({ code: 200, status: "success", data: result });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

    updateTeamReport(req, res) {
        return insightLibs.updateTeamReport()
            .then((response) => {
                res.status(200).json({ code: 200, status: 'success', TeamInsights: response });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }

}

module.exports = new InsightControllers();