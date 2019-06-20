const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require("body-parser");
const xmlparser = require('express-xml-bodyparser');
const xhub = require('express-x-hub');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const config = require('config');
const fs = require('fs');
const Swagger = require('./startup/swagger');
const DbConnect = require('./startup/dbconnect');
const Routes = require('./startup/routes');

const app = express();

class App {
  constructor() {
    app.use(xhub({ algorithm: 'sha1', secret: config.get('facebook_api.secret_key') }));
    app.use(morgan("tiny", { "stream": logger.stream }));
    app.use(helmet());
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static('public'));
    app.use(express.static('../../media'));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(xmlparser());
    

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
        if (!fs.existsSync(config.get('content_studio.basePath'))) {
          fs.mkdirSync(config.get('content_studio.basePath'));
        }
        if (!fs.existsSync(config.get('content_studio.giphy.path'))) {
          fs.mkdirSync(config.get('content_studio.giphy.path'));
        }
        if (!fs.existsSync(config.get('content_studio.pixabay.path'))) {
          fs.mkdirSync(config.get('content_studio.pixabay.path'));
        }
        if (!fs.existsSync(config.get('content_studio.flickr.path'))) {
          fs.mkdirSync(config.get('content_studio.flickr.path'));
        }
        if (!fs.existsSync(config.get('content_studio.imgur.path'))) {
          fs.mkdirSync(config.get('content_studio.imgur.path'));
        }
      })
      .then(() => {
        let port = config.get('feed_socioboard.port');
        app.listen(port, () => {
          logger.info(`service listening on ${config.get('feed_socioboard.host_url')} with ${process.env.NODE_ENV} Environment!`);
          console.log(`service listening on ${config.get('feed_socioboard.host_url')} with ${process.env.NODE_ENV} Environment!`);
        });
      })
      .catch((error) => {
        logger.error(error.message);
      });
  }
}

module.exports = new App();














