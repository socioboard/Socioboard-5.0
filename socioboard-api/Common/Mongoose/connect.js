import pkg from 'mongoose';

const { connect, connection } = pkg;

class MongoConnect {
  constructor() {
    let mongoConfiguration = '';

    Object.defineProperty(this, 'mongoConfiguration', {
      set(mongoInfo) {
        mongoConfiguration = mongoInfo;
      },
      get() {
        return mongoConfiguration;
      },
    });
  }

  initialize() {
    return new Promise((resolve, reject) => {
      if (this.mongoConfiguration.username != '' && this.mongoConfiguration.password != '') {
        connect(`mongodb://${this.mongoConfiguration.username}:${this.mongoConfiguration.password}@${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`, { useNewUrlParser: true, useUnifiedTopology: true });
      } else {
        connect(`mongodb://${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`, { useNewUrlParser: true, useUnifiedTopology: true });
      }
      const db = connection;

      db.on('error', (error) => {
        reject(error.message);
      });
      db.once('open', () => {
        resolve('Mongodb connected!');
      });
    });
  }
}

export default MongoConnect;
