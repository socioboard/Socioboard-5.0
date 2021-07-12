import TwitterFeeds from '../../core/twitterfeeds/twitter.feeds.routes.js';
import FacebookFeeds from '../../core/facebookfeeds/facebook.feeds.routes.js';
import InstaFeeds from '../../core/instafeeds/insta.feeds.routes.js';
import YouTubeFeeds from '../../core/youtubefeeds/youtube.feeds.routes.js';
import Trends from '../../core/trends/trends.routes.js';
import Boards from '../../core/boards/boards.routes.js';
import RssFeeds from '../../core/rssfeeds/rss.feeds.routes.js';
import NetworkInsights from '../../core/networkInsight/networkInsight.routes.js';
import authenticate from '../../middleware/authentication.middleware.js';
import recentVisited from '../../middleware/recent.visited.middleware.js';

class Routes {
  constructor(app) {
    this.configureCors(app);
    app.use(authenticate);
    app.use('/v1/feeds/', InstaFeeds);
    app.use(recentVisited);
    app.use('/v1/feeds/', TwitterFeeds);
    app.use('/v1/feeds/', FacebookFeeds);
    app.use('/v1/feeds/', YouTubeFeeds);
    app.use('/v1/trends/', Trends);
    app.use('/v1/boards/', Boards);
    app.use('/v1/feeds/', RssFeeds);
    app.use('/v1/networkinsight/', NetworkInsights);
    app.use('/', function (req, res) {
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
