const mongoose = require('mongoose');

function MongoConnect() {
    let mongoConfiguration = '';
    Object.defineProperty(this, 'mongoConfiguration', {
        set: function (mongoInfo) {
            mongoConfiguration = mongoInfo;
        },
        get: function () {
            return mongoConfiguration;
        }
    });
}

MongoConnect.prototype.initialize = function () {
    return new Promise((resolve, reject) => {
        if (this.mongoConfiguration.username != '' && this.mongoConfiguration.password != '') {
            mongoose.connect(`mongodb://${this.mongoConfiguration.username}:${this.mongoConfiguration.password}@${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`, { useNewUrlParser: true, useFindAndModify: false });
        } else {
            mongoose.connect(`mongodb://${this.mongoConfiguration.host}/${this.mongoConfiguration.db_name}`, { useFindAndModify: false, useNewUrlParser: true });
        }
        var db = mongoose.connection;

        db.on('error', function (error) {
            reject(error.message);
        });
        db.once('open', function () {
            resolve("Mongodb connected!");
        });
    });
};

module.exports = MongoConnect;






