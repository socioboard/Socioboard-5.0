import config from 'config';
import moment from 'moment';
import logger from '../../Update/resources/Log/logger.log.js';
import db from '../Sequelize-cli/models/index.js';
import SendEmailService from '../Services/mail-base.services.js';

const userDetails = db.user_details;
const Operator = db.Sequelize.Op;
const userActivation = db.user_activations;

class AlertMailLibs {
  async getUserExpiresShortly() {
    const res = await userDetails.findAll({
      attributes: ['user_id', 'first_name', 'email'],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {
            account_expire_date: {
              [Operator.lte]: moment(
                new Date(moment().add(3, 'days').endOf('day'))
              ),
              [Operator.gte]: moment(
                new Date(moment().add(1, 'days').startOf('day'))
              ),
            },
          },
          attributes: ['id', 'user_plan', 'account_expire_date'],
        },
      ],
    });

    return res;
  }

  async getUserDetailsPlanExpired() {
    const res = await userDetails.findAll({
      attributes: ['user_id', 'first_name', 'email'],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {
            [Operator.and]: [
              {
                account_expire_date: {
                  [Operator.lt]: moment().startOf('day'),
                  [Operator.gt]: moment().subtract(1, 'day').startOf('day'),
                },
                sent_expired_mail: 0,
              },
            ],
          },
          attributes: ['id', 'user_plan', 'account_expire_date'],
        },
      ],
    });

    return res;
  }

  async getUserDetailsPlanExpiredXDays() {
    const res = await userDetails.findAll({
      attributes: ['user_id', 'first_name', 'email'],
      include: [
        {
          model: userActivation,
          as: 'Activations',
          where: {
            [Operator.and]: [
              {
                account_expire_date: {
                  [Operator.lte]: moment().startOf('day'),
                },
              },
            ],
          },
          attributes: ['id', 'user_plan', 'account_expire_date'],
        },
      ],
    });

    return res;
  }

  async compareDates(days) {
    const users = await this.getUserDetailsPlanExpiredXDays(days);
    const matchedUser = [];

    users.map(user => {
      if (
        this.date_diff_inDays(
          user.Activations.account_expire_date,
          moment().startOf('day'),
          days
        )
      )
        matchedUser.push(user);
    });

    return matchedUser;
  }

  async sendExpireAlert() {
    const users = await this.getUserExpiresShortly();
    logger.info(
      `All user's whose plan going to expire :${JSON.stringify(users)}`
    );
    const sendEmailServiceObject = new SendEmailService(
      config.get('mailService')
    );
    const scheduleObject = {
      moduleId: 1,
      batchId: String(moment().unix()),
      users,
      scheduleId: -1,
      teamId: -1,
      newsletterContent: '',
    };
    const result = await sendEmailServiceObject.mailServiceSchedule(
      scheduleObject
    );

    return result;
  }

  async sendExpiredIntimation() {
    const users = await this.getUserDetailsPlanExpired();
    logger.info(
      `All user's whose plan already expired :${JSON.stringify(users)}`
    );
    const sendEmailServiceObject = new SendEmailService(
      config.get('mailService')
    );
    const scheduleObject = {
      moduleId: 2,
      batchId: String(moment().unix()),
      users,
      scheduleId: -1,
      teamId: -1,
      newsletterContent: '',
    };
    const result = await sendEmailServiceObject.mailServiceSchedule(
      scheduleObject
    );
    const update = await this.updateSentMailStatus(users);

    return result;
  }

  async sendExpiredMail(days = 7) {
    const users = await this.compareDates(days);
    const sendEmailServiceObject = new SendEmailService(
      config.get('mailService')
    );
    const scheduleObject = {
      moduleId: 2,
      batchId: String(moment().unix()),
      users,
      scheduleId: -1,
      teamId: -1,
      newsletterContent: '',
    };
    const result = await sendEmailServiceObject.mailServiceSchedule(
      scheduleObject
    );

    return result;

    return users;
  }

  async updateSentMailStatus(users) {
    users.map(user => {
      userActivation.update(
        {sent_expired_mail: 1},
        {where: {id: user.Activations.id}}
      );
    });
  }

  async date_diff_inDays(date1, date2, days) {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);
    const differentDays = Math.floor(
      (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
        Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
        (1000 * 60 * 60 * 24)
    );

    return differentDays % days;
  }
}

export default AlertMailLibs;
