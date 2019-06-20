const config = require('config');
const MongoConnect = require('../../library/mongoose/connect');
const db = require('../../library/sequelize-cli/models/index');
const logger = require('../utils/logger');

class DbConnect {
    initialize() {
        return new Promise((resolve, reject) => {
            var mongoConnect = new MongoConnect();
            mongoConnect.mongoConfiguration = config.get('mongo');
            return mongoConnect.initialize()
                .then(() => {
                    logger.info('Mongo Database has been connected.');
                    db.sequelize.sync({ force: false })
                        .then(() => {
                            logger.info('Sequelize Database has been connected.');
                            resolve('Database Connected');
                        })
                        .catch((error) => {
                            logger.error(`Mysql issues : ${error}`);
                            reject(new Error(`Mysql issues : ${error}`));
                        });
                })
                .catch((error) => {
                    logger.error(`Mongo issues : ${error}`);
                    reject(new Error(`Mongo issues : ${error}`));
                });
        });
    }
}

module.exports = DbConnect;