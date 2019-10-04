const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

// All functions will execute on notificationinfo collection of mongo DB
var notificationInfo = new Schema({
    userEmail: { type: String },
    notification_type: { type: Number },
    plan_type: { type: Number },
    expire_date: { type: Date, default: null },
    last_login: { type: Date, default: null },
    other_newsletter_title: { type: String, default: null },
    sent_date: { type: Date, default: null },
    batchId: { type: String },
    schedule_id: { type: Number },
    team_id: { type: Number },
});

notificationInfo.methods.insertMany = function (posts) {
    // Inserting multiple posts into the collection
    return this.model('MailServices')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch(() => {
            return 0;
        });
};

notificationInfo.methods.getNotificationMailInfo = function (email, datePreset, notify_type) {
    var condition = [];
    condition.push({ userEmail: email });
    condition.push({
        sent_date: {
            $gte: moment().subtract(datePreset, 'days').startOf('day'),
        }
    });

    if (notify_type != -1 && notify_type > 0 && notify_type <= 11)
        condition.push({ notification_type: notify_type });

    return this.model('MailServices')
        .find({ $and: condition })
        .then(function (result) {
            return result;
        })
        .catch(function () {
            return [];
        });
};

var mailServices = mongoose.model('MailServices', notificationInfo);

module.exports = mailServices;