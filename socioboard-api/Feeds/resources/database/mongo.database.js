import config from 'config';
import MongoConnects from '../../../Common/Mongoose/connect.js';
import logger from '../Log/logger.log.js';

class MongoConnect {
  initialize() {
    return new Promise(async (resolve, reject) => {
      const mongoConnect = new MongoConnects();

      mongoConnect.mongoConfiguration = config.get('mongo');
      try {
        await mongoConnect.initialize();
        logger.info('Mongo Database has been connected.');
        console.log('Mongo Database has been connected.');
        resolve();
      } catch (error) {
        logger.error(`Mongo issues : ${error}`);
        reject(new Error(`Mongo issues : ${error}`));
      }
    });
  }
}

export default MongoConnect;
