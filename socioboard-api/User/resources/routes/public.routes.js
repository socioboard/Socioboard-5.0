import socialAccount from '../../core/social-account/social-account.routes.js';
import authenticate from '../../middleware/authentication.middleware.js';
import recentVisited from '../../middleware/recent-visited.middleware.js';
import team from '../../core/team/team.routes.js';
import OpenRoutes from './open.routes.js';
import unauthorized from '../../core/unauthorized/unauthorized.routes.js';
import socialCallback from '../../core/social-callback/social-callback.routes.js';
import authorized from '../../core/authorized/authorized.routes.js';
import recentVistedRoutes from '../../core/recent-visited/recent-visted.routes.js';
import teamReport from '../../core/team-report/team-report.routes.js';
import otpVerification from '../../core/otp-verification/otp-verification.router.js';
import demoRoutes from '../../../Common/Demo/bitly/bitly-demo.routes.js';
import invitation from '../../core/invitation/invitation.routes.js';
import AppSumoRoute from '../../core/appsumo/appsumo.routes.js';

class Routes {
  constructor(app) {
    this.configureCors(app);
    // new OpenRoutes('/v1/', app);
    app.use('/v1/', unauthorized);
    app.use('/v1/', socialCallback);
    app.use('/v1/otp/', otpVerification);
    app.use('/v1', demoRoutes);
    app.use('/v1/', invitation);
    app.use('/v1/appsumo/', AppSumoRoute);
    // SecuredRoutes;
    app.use(authenticate);
    app.use('/v1/recentvisited/', recentVistedRoutes);
    app.use('/v1/user/', authorized);
    app.use(recentVisited);
    app.use('/v1/team/', team);
    app.use('/v1/teamreport', teamReport);
    app.use('/v1/socialaccount', socialAccount);
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
