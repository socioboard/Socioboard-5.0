import db from '../Sequelize-cli/models/index.js';
import config from "config";
import moment from 'moment'
const userDetails = db.user_details;
const Operator = db.Sequelize.Op;
const userActivation = db.user_activations;
import SendEmailService from '../Services/mailBase.services.js';

class AlertMailLibs {

    constructor() {
    }

    async getUserExpiresShortly() {
        let res = await userDetails.findAll({
            attributes: ['user_id', 'first_name', 'email'],
            include: [{
                model: userActivation,
                as: 'Activations',
                where: {
                    [Operator.and]: [{
                        account_expire_date: {
                            [Operator.lt]: moment().add(3, 'days').startOf('day'),
                            [Operator.gt]: moment.now()
                        }
                    }]
                },
                attributes: ['id', 'user_plan', 'account_expire_date'],
            }]
        })
        return res
    }

    async getUserDetailsPlanExpired() {
        let res = await userDetails.findAll({
            attributes: ['user_id', 'first_name', 'email'],
            include: [{
                model: userActivation,
                as: 'Activations',
                where: {
                    [Operator.and]: [{
                        account_expire_date: {
                            [Operator.lt]: moment().startOf('day'),
                        }
                    }],
                    sent_expired_mail: 0
                },
                attributes: ['id', 'user_plan', 'account_expire_date']
            }]
        })
        return res
    }

    async getUserDetailsPlanExpiredXDays() {
        let res = await userDetails.findAll({
            attributes: ['user_id', 'first_name', 'email'],
            include: [{
                model: userActivation,
                as: 'Activations',
                where: {
                    [Operator.and]: [{
                        account_expire_date: {
                            [Operator.lte]: moment().startOf('day'),
                        }
                    }]
                },
                attributes: ['id', 'user_plan', 'account_expire_date'],
            }]
        })
        return res;
    }

    async compareDates(days) {
        let users = await this.getUserDetailsPlanExpiredXDays(days)
        let matchedUser = []
        users.map(user => {
            if (this.date_diff_inDays(user.Activations.account_expire_date, moment().startOf('day'), days))
                matchedUser.push(user)
        })
        return matchedUser
    }

    async sendExpireAlert() {
        let users = await this.getUserExpiresShortly()
        let sendEmailServiceObject = new SendEmailService(config.get('mailService'));
        let scheduleObject = {
            moduleId: 1,
            batchId: String(moment().unix()),
            users: users,
            scheduleId: -1,
            teamId: -1,
            newsletterContent: '',
        };
        let result = await sendEmailServiceObject.mailServiceSchedule(scheduleObject);
        return result

    }

    async sendExpiredIntimation() {
        let users = await this.getUserDetailsPlanExpired()
        let sendEmailServiceObject = new SendEmailService(config.get('mailService'));
        let scheduleObject = {
            moduleId: 2,
            batchId: String(moment().unix()),
            users: users,
            scheduleId: -1,
            teamId: -1,
            newsletterContent: '',
        };
        let result = await sendEmailServiceObject.mailServiceSchedule(scheduleObject);
        let update = await this.updateSentMailStatus(users)
        return result
    }

    async sendExpiredMail(days = 7) {
        let users = await this.compareDates(days)
        let sendEmailServiceObject = new SendEmailService(config.get('mailService'));
        let scheduleObject = {
            moduleId: 2,
            batchId: String(moment().unix()),
            users: users,
            scheduleId: -1,
            teamId: -1,
            newsletterContent: '',
        };
        let result = await sendEmailServiceObject.mailServiceSchedule(scheduleObject);
        return result
        return users
    }

    async updateSentMailStatus(users) {
        users.map(user => {
            userActivation.update({ sent_expired_mail: 1 },
                { where: { id: user.Activations.id } })
        })
    }


    async date_diff_inDays(date1, date2, days) {
        let dt1 = new Date(date1);
        let dt2 = new Date(date2);
        let differentDays = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
        return differentDays % days
    }

}

export default AlertMailLibs;