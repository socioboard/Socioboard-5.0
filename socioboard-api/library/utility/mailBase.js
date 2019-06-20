const nodemailer = require('nodemailer');
const sendGridMail = require('@sendgrid/mail');

class MailBase {

    constructor(mailService) {
        this.mailServiceConfig = mailService;
    }

    /**
     *  Send email via send grid Api services
     *  @param {Object} data - To specify the neccessary details for sending emails
     *  @param {string} data.toMail - To whom need to send the email
     *  @param {string} data.subject - Subject of the mail
     *  @param {string} data.htmlContent - Use any one of above template
     */
    sendEmailBySendGridApi(data) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject(new Error("Invalid data!"));
            } else {
                sendGridMail.setApiKey(this.mailServiceConfig.sendgrid.apiKey);
                var message = {
                    from: this.mailServiceConfig.sendgrid.frommail,
                    to: data.toMail,
                    cc: this.mailServiceConfig.sendgrid.ccmail,
                    subject: data.subject,
                    html: data.htmlContent
                };
                return sendGridMail.send(message)
                    .then((info) => { resolve(info); })
                    .catch((error) => { reject(error); });
            }
        });
    }


    /**
   *  Send email via send grid services 
   *  @param {Object} data - To specify the neccessary details for sending emails
   *  @param {string} data.toMail - To whom need to send the email
   *  @param {string} data.subject - Subject of the mail
   *  @param {string} data.htmlContent - Use any one of above templete
   */
    sendEmailBySendGrid(data) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject(new Error("Invalid data!"));
            } else {
                var client = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: this.mailServiceConfig.sendgrid.username,
                        pass: this.mailServiceConfig.sendgrid.password
                    }
                });
                var email = {
                    from: this.mailServiceConfig.sendgrid.frommail,
                    to: data.toMail,
                    cc: this.mailServiceConfig.sendgrid.ccmail,
                    subject: data.subject,
                    html: data.htmlContent
                };
                return client.sendMail(email)
                    .then((info) => resolve(info))
                    .catch((error) => reject(error));
            }
        });
    }


    /**
     *  Send email via gmail services
     *  @param {Object} data - To specify the neccessary details for sending emails
     *  @param {string} data.toMail - To whom need to send the email
     *  @param {string} data.subject - Subject of the mail
     *  @param {string} data.htmlContent - Use any one of above templete
     */
    sendEmailByGmail(data) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject(new Error("Invalid data!"));
            } else {

                var client = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: this.mailServiceConfig.gmailServices.email,
                        pass: this.mailServiceConfig.gmailServices.password,
                    }
                });
                var email = {
                    from: this.mailServiceConfig.gmailServices.email,
                    to: data.toMail,
                    subject: data.subject,
                    html: data.htmlContent,
                };
                return client.sendMail(email)
                    .then((info) => resolve(info))
                    .catch((error) => reject(error));
            }
        });
    }
}


module.exports = MailBase;