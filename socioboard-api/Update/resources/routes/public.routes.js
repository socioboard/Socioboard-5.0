import alertMails from '../../core/alert-mails/alert-mails.router.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import adminAuthenticate from '../../middleware/adminAuthenticate.middleware.js';
import reportMail from '../../core/report-mail/report-mail.router.js';

class Routes {
  constructor(app) {
    this.configureCors(app);
    app.use(authenticate);
    app.use('/v1/report/', reportMail);
    app.use(adminAuthenticate);
    app.use('/v1/mail', alertMails);
  }

  configureCors(app) {
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
      res.setHeader('Cache-Control', 'no-cache');
      next();
    });
  }
}
export default Routes;
