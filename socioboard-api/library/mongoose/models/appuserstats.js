const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

var appUserStats = new Schema({
    totalUsers: { type: Number },
    paidUsers: { type: Number },
    unpaidUsers: { type: Number },
    activeUsers: { type: Number },
    inActiveUsers: { type: Number },
    lockedUsers: { type: Number },
    month: { type: Number },
    year: { type: Number }
});

appUserStats.index({ "month": 1, "year": 1 }, { "unique": true });

appUserStats.methods.insertMany = function (details) {
    // Inserting/Adding data into the table
    return this.model('AppUserStats')
        .insertMany(details)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            return 0;
        });
};

appUserStats.methods.getMonthlyStats = function () {
    // Fetching monthly status of application from DB
    return this.model('AppUserStats')
        .find({})
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw new Error(error.message);
        });
};

appUserStats.methods.getParticularMonth = function (month, year) {
    // Fetching specified month status of application from DB
    var query = {
        month: { $gte: month },
        year: { $gte: year },
    };
    return this.model('AppUserStats')
        .find(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

var AppUserStatsModel = mongoose.model('AppUserStats', appUserStats);

module.exports = AppUserStatsModel;