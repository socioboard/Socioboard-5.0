import unauthorized from '../../core/unauthorized/unauthorized.routes.js';
import socialCallback from '../../core/social-callback/social-callback.routes.js';

class OpenRoutes {
  constructor(routeVersion, app) {
    app.use(routeVersion, unauthorized);
    app.use(routeVersion, socialCallback);
  }
}

export default OpenRoutes;
