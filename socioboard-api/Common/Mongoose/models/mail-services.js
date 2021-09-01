import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);

const notificationInfo = new Schema({
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
  return this.model('MailServices')
    .insertMany(posts)
    .then((postdetails) => postdetails.length)
    .catch(() => 0);
};

notificationInfo.methods.getNotificationMailInfo = function (email, datePreset, notify_type) {
  const condition = [];

  condition.push({ userEmail: email });
  condition.push({
    sent_date: {
      $gte: moment().subtract(datePreset, 'days').startOf('day'),
    },
  });

  if (notify_type != -1 && notify_type > 0 && notify_type <= 11) condition.push({ notification_type: notify_type });

  return this.model('MailServices')
    .find({ $and: condition })
    .then((result) => result)
    .catch(() => []);
};

const mailServices = mongoose.model('MailServices', notificationInfo);

export default mailServices;
