import nodemailer from 'nodemailer';
import sendGridMail from '@sendgrid/mail';

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
        reject(new Error('Invalid data!'));
      } else {
        sendGridMail.setApiKey(this.mailServiceConfig.sendgrid.apiKey);
        let message = {
          from: {
            name: 'SocioBoard',
            email: this.mailServiceConfig.sendgrid.frommail,
          },
          to: data.toMail,
          cc: this.mailServiceConfig.sendgrid.ccmail,
          subject: data.subject,
          html: data.htmlContent,
        };
        if (data?.asm && data?.asm != '') message.asm = data?.asm;
        return sendGridMail
          .send(message)
          .then(info => {
            resolve(info);
          })
          .catch(error => {
            reject(error);
          });
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
        reject(new Error('Invalid data!'));
      } else {
        const client = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: this.mailServiceConfig.sendgrid.username,
            pass: this.mailServiceConfig.sendgrid.password,
          },
        });
        const email = {
          from: this.mailServiceConfig.sendgrid.frommail,
          to: data.toMail,
          cc: this.mailServiceConfig.sendgrid.ccmail,
          subject: data.subject,
          html: data.htmlContent,
        };

        return client
          .sendMail(email)
          .then(info => resolve(info))
          .catch(error => reject(error));
      }
    });
  }

  /**
   * Send email via send grid services
   * @param {Object} data - To specify the neccessary details for sending emails
   * @param {string} data.toMail - To whom need to send the email
   * @param {string} data.subject - Subject of the mail
   * @param {string} data.htmlContent - Use report mail template
   * @param {object} attachments -Mail attachment
   */
  sendEmailReportBySendGridApi(data, attachments) {
    return new Promise((resolve, reject) => {
      if (!data) {
        reject(new Error('Invalid data!'));
      } else {
        sendGridMail.setApiKey(this.mailServiceConfig.sendgrid.apiKey);
        let message = {
          from: {
            name: 'SocioBoard',
            email: this.mailServiceConfig.sendgrid.frommail,
          },
          to: data.emails,
          cc: this.mailServiceConfig.sendgrid.ccmail,
          subject: data.title,
          html: data.html,
          attachments,
        };
        if (data?.asm && data?.asm != '') message.asm = data?.asm;
        return sendGridMail
          .sendMultiple(message)
          .then(info => {
            resolve(info);
          })
          .catch(error => {
            reject(error);
          });
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
        reject(new Error('Invalid data!'));
      } else {
        const client = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: this.mailServiceConfig.gmailServices.email,
            pass: this.mailServiceConfig.gmailServices.password,
          },
        });

        const email = {
          from: this.mailServiceConfig.gmailServices.email,
          to: data.toMail,
          subject: data.subject,
          html: data.htmlContent,
        };

        return client
          .sendMail(email)
          .then(info => resolve(info))
          .catch(error => reject(error));
      }
    });
  }
}

export default MailBase;
