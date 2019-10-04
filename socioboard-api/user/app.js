const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const DbConnect = require('./startup/dbconnect');
const Swagger = require('./startup/swagger');
const Routes = require('./startup/routes');
const config = require('config');
const fs = require('fs');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

class App {

    constructor() {
        app.use(morgan("tiny", { "stream": logger.stream }));
        app.use(helmet());
        app.use(express.json({ limit: '100mb' }));
        app.use(express.urlencoded({ extended: false }));
        app.use(express.static('public'));
        app.use(express.static('../../media'));
        app.use(cookieParser());
        app.use(bodyParser.json());

        process.on('unhandledRejection', (reason, promise) => {
            logger.debug(reason);
        });

        process.on('uncaughtException', (error) => {
            logger.debug(error);
        });

        var dbConnect = new DbConnect();
        return dbConnect.initialize()
            .then(() => {
                var swagger = new Swagger(app, __dirname);
                return swagger;
            })
            .then(() => {
                var routes = new Routes(app);
                return routes;
            })
            .then(() => {
                if (!fs.existsSync(config.get('payment.base_path'))) {
                    fs.mkdirSync(config.get('payment.base_path'));
                }

                if (!fs.existsSync(config.get('payment.payment_path'))) {
                    fs.mkdirSync(config.get('payment.payment_path'));
                }
            })
            .then(() => {
                let port = config.get('user_socioboard.port');
                server.listen(port, () => {
                    logger.info(`service listening on ${config.get('user_socioboard.host_url')} with ${process.env.NODE_ENV} Environment!`);
                    console.log(`service listening on ${config.get('user_socioboard.host_url')} with ${process.env.NODE_ENV} Environment!`);
                });
            })
            .catch((error) => {
                logger.error(error.message);
            });
    }
}

module.exports = new App();










