
const MongoConnect = require('../mongoose/connect');


var helper = {};

helper.expect = {
    // Check whether recieved object is an array or not
    toBeArray(received) {
        if (received instanceof Array) {
            return {
                message: () => `Expected [${received}] to be an array, Yeah its a array!`,
                pass: true
            };
        } else {
            return {
                message: () => `Expected [${received}] to be an array, but its not a array!`,
                pass: false
            };
        }
    },

    toBeObject(received) {
        if (received instanceof Object) {
            return {
                message: () => `Expected [${received}] to be an Object, Yeah its a Object!`,
                pass: true
            };
        } else {
            return {
                message: () => `Expected [${received}] to be an Object, but its not a Object!`,
                pass: false
            };
        }
    },

    toBeDelete(received) {
        if (received) {
            return {
                message: () =>
                    `expected ${received}.`,
                pass: false,
            };
        } else {
            return {
                message: () =>
                    `not expected ${received}.`,
                pass: true,
            };
        }
    },


};

helper.initialize = function (mongoConnectConfig) {
    return new Promise((resolve, reject) => {
        var mongoConnect = new MongoConnect();
        mongoConnect.mongoConfiguration = mongoConnectConfig;
        return mongoConnect.initialize()
            .then((message) => resolve(message))
            .catch((error) => reject(error));
    });
};

module.exports = helper;
