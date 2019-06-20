const authenticate = require('../middleware/authenticate');
const adminauthenicate = require('../middleware/adminauthenicate');

const uploads = require('../core/uploader/routes');
const scheduler = require('../core/scheduler/routes');
const publisher = require('../core/publish/routes');
const messageRoutes = require('../core/message/routes');
const adminScheduleRoutes = require('../core/scheduler/adminroutes');
const reportRoutes = require('../core/reports/routes');
const taskRoutes = require('../core/task/routes');

class Routes {

    constructor(app) {
        
        this.configureCors(app);
        app.use(authenticate);

        app.use('/v1/upload/', uploads);
        app.use('/v1/schedule/', scheduler);
        app.use('/v1/publish/', publisher);
        app.use('/v1/task', taskRoutes);
        app.use('/v1/message/', messageRoutes);
        app.use('/v1/reports/', reportRoutes);

        app.use(adminauthenicate);
        app.use('/v1/admin/', adminScheduleRoutes);

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



