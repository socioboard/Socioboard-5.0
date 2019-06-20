const schedule = require('node-schedule');
const logger = require('../../../utils/logger');
const InsightLibs = require('../utils/insightLibs');
const insightLibs = new InsightLibs();

class InsightControllers {

    constructor(){
        this.setupTwitterInsightsCrons();
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

    twtInsights(req, res) {
        return insightLibs.twtInsights()
            .then((result) => {
                res.status(200).json({ code: 200, status: "success", data: result });
            })
            .catch((error) => {
                res.status(200).json({ code: 400, status: "failed", error: error.message });
            });
    }
}

module.exports = new InsightControllers();