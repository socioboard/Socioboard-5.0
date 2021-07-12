import pkg from 'mongoose';
const {connect, connection} = pkg;

class MongoConnect {
  constructor() {
    let mongoConfiguration = '';
    Object.defineProperty(this, 'mongoConfiguration', {
      set: function (mongoInfo) {
        mongoConfiguration = mongoInfo;
      },
      get: function () {
        return mongoConfiguration;
      },
    });
  }
  initialize() {
    return new Promise((resolve, reject) => {
      if (
        this.mongoConfiguration.username != '' &&
        this.mongoConfiguration.password != ''
      ) {
        connect(
          `mongodb://${this.mongoConfiguration.username}:${this.mongoConfiguration.password}@${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`,
          {useNewUrlParser: true, useUnifiedTopology: true}
        );
      } else {
        connect(
          `mongodb://${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`,
          {useNewUrlParser: true, useUnifiedTopology: true}
        );
      }
      var db = connection;

      db.on('error', function (error) {
        reject(error.message);
      });
      db.once('open', function () {
        resolve('Mongodb connected!');
      });
    });
  }
}

export default MongoConnect;
