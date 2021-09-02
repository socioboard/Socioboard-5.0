import TwitterFeeds from '../../core/twitter-feeds/twitter-feeds.routes.js';
import FacebookFeeds from '../../core/facebook-feeds/facebook-feeds.routes.js';
import InstaFeeds from '../../core/instagram-feeds/instagram-feeds.routes.js';
import YouTubeFeeds from '../../core/youtube-feeds/youtube-feeds.routes.js';
import Trends from '../../core/trends/trends.routes.js';
import Boards from '../../core/boards/boards.routes.js';
import RssFeeds from '../../core/rss-feeds/rss-feeds.routes.js';
import NetworkInsights from '../../core/network-insight/network-insight.routes.js';
import authenticate from '../../middleware/authentication.middleware.js';
import recentVisited from '../../middleware/recent-visited.middleware.js';
import planValidation from '../../../Common/Shared/plan-validation.js';
import linkedInFeedsRoutes from '../../core/linkedIn-feeds/linkedIn-feeds.routes.js';

class Routes {
  constructor(app) {
    this.configureCors(app);
    app.use(authenticate);
    app.use('/v1/feeds/', InstaFeeds);
    app.use(recentVisited);
    app.use('/v1/feeds/', TwitterFeeds);
    app.use('/v1/feeds/', FacebookFeeds);
    app.use('/v1/feeds/', YouTubeFeeds);
    app.use('/v1/feeds/', linkedInFeedsRoutes);
    app.use('/v1/trends/', Trends);
    app.use('/v1/boards/', planValidation('BoardMe'), Boards);
    app.use('/v1/feeds/', RssFeeds);
    app.use('/v1/networkinsight/', NetworkInsights);
    app.use('/', (req, res) => {
      res.redirect('/explorer');
    });
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
