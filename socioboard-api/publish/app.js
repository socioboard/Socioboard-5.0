const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const config = require('config');
const Routes = require('./startup/routes');
const DbConnect = require('./startup/dbconnect');
const Swagger = require('./startup/swagger');
const fs = require('fs');
const app = express();

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
      .then(()=>{
        if (!fs.existsSync(config.get('uploadService.basePath'))) {
          fs.mkdirSync(config.get('uploadService.basePath'));
        }
        if (!fs.existsSync(config.get('uploadService.image_path'))) {
          fs.mkdirSync(config.get('uploadService.image_path'));
        }
        if (!fs.existsSync(config.get('uploadService.video_path'))) {
          fs.mkdirSync(config.get('uploadService.video_path'));
        }
        if (!fs.existsSync(config.get('uploadService.thumbnail_path'))) {
          fs.mkdirSync(config.get('uploadService.thumbnail_path'));
        }
         
      })
      .then(() => {
        let port = config.get('publisher_socioboard.port');
        app.listen(port, () => {
          logger.info(`service listening on ${config.get('publisher_socioboard.host_url')} with ${process.env.NODE_ENV} Environment!`);
          console.log(`service listening on ${config.get('publisher_socioboard.host_url')} with ${process.env.NODE_ENV} Environment!`);
        });
      })
      .catch((error) => {
        logger.error(error.message);
      });
  }
}

module.exports = new App();


















