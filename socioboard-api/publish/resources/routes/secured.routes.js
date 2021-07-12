//  TODO secure Tags will be listed here
import authenticate from '../../middleware/authentication.middleware.js';
import autherized from '../../core/authorized/routes.js';
import team from '../../core/team/routes.js';

export default function SecuredRoutes(app) {
  app.use(authenticate);
  app.use('/v1/user/', autherized);
  app.use('/v1/team/', team);
}

/**
 * SECTION:  Secured
 * * User - tag name under Admin
 */
