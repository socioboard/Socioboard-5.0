import config from 'config';
import MongoConnects from '../../../Common/Mongoose/connect.js';
import logger from '../Log/logger.log.js';

class MongoConnect {
  initialize() {
      const mongoConnect = new MongoConnects();

      mongoConnect.mongoConfiguration = config.get('mongo');
      try {
        mongoConnect.initialize();
        logger.info('Mongo Database has been connected.');
        console.log('Mongo Database has been connected.');
      } catch (error) {
        logger.error(`Mongo issues : ${error}`);
      }
  }
}

export default MongoConnect;
