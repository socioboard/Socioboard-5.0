const mongoose = require('mongoose');

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const appUserStats = new Schema({
  totalUsers: { type: Number },
  paidUsers: { type: Number },
  unpaidUsers: { type: Number },
  activeUsers: { type: Number },
  inActiveUsers: { type: Number },
  lockedUsers: { type: Number },
  month: { type: Number },
  year: { type: Number },
});

appUserStats.index({ month: 1, year: 1 }, { unique: true });

appUserStats.methods.insertMany = function (details) {
  return this.model('AppUserStats')
    .insertMany(details)
    .then((postdetails) => postdetails.length)
    .catch((error) => 0);
};

appUserStats.methods.getMonthlyStats = function () {
  return this.model('AppUserStats')
    .find({})
    .then((result) => result)
    .catch((error) => {
      throw new Error(error.message);
    });
};

appUserStats.methods.getParticularMonth = function (month, year) {
  const query = {
    month: { $gte: month },
    year: { $gte: year },
  };

  return this.model('AppUserStats')
    .find(query)
    .then((result) => result)
    .catch((error) => {
      throw error;
    });
};

const AppUserStatsModel = mongoose.model('AppUserStats', appUserStats);

module.exports = AppUserStatsModel;
