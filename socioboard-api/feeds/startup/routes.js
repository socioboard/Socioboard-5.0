const config = require('config');
const authenticate = require('../middleware/authenticate');
const adminAuthenticate = require('../middleware/adminauthenicate');
const trends = require('../core/trends/routes');
const feeds = require('../core/networkfeeds/routes');
const webhooks = require('../core/webhooks/routes');
const likecomments = require('../core/likecomments/routes');
const adminRoutes = require('../core/admin/routes');
const friendsRoutes = require('../core/friends/routes');
const networkInsights = require('../core/networkInsights/routes');
const friendshipStats = require('../core/friendshipstats/routes');
const boards = require('../core/boards/routes');
const xhub = require('express-x-hub');
const logger = require('../utils/logger');

class Routes {

    constructor(app) {
        this.configureCors(app);
        app.use(xhub({ algorithm: 'sha1', secret: config.get('facebook_api.secret_key') }));

        app.use("/v1/webhooks/", webhooks);
        app.use(authenticate);
        app.use("/v1/trends/", trends);  
        app.use("/v1/feeds/", feeds);
        app.use("/v1/likecomments/", likecomments);
        app.use("/v1/friends/", friendsRoutes);
        app.use("/v1/friendshipstats/", friendshipStats);
        app.use("/v1/networkinsights/", networkInsights);
        app.use("/v1/boards/", boards);
        app.use(adminAuthenticate);
        app.use('/v1/admin/', adminRoutes);
        app.use("/", function (req, res) {
            res.status(404).send("Woops! 404 Not Found");
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
module.exports = Routes;
