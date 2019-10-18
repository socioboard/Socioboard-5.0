
const authenticate = require('../middleware/authenticate');
const adminAuthenticate = require('../middleware/adminauthenicate');
const insight = require('../core/Insights/routes');
const mails = require('../core/mail/routes');

class Routes {

    constructor(app, io) {
        this.configureCors(app);

        const notifyRoutes = require('../core/notify/routes')(io);
        const socketLibs = require("../core/notify/socketServices")(io);

        app.use("/v1/notify/", notifyRoutes);

        io.on('connection', socketLibs.handleSocket);

        app.use(authenticate);

        app.use(adminAuthenticate);
        app.use('/v1/mail/', mails);
        app.use('/v1/insights/', insight); // for twitter 
        app.use('/v1/report/', insight); // for Team Reports

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

