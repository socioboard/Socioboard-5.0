('use strict');
if (process.env.IS_DEBUGGING) console.log(__filename);
import express from 'express';
// require('express-async-errors');
import morgan from 'morgan';
import Helmet from 'helmet';
import Compression from 'compression';
import ExpressRateLimit from 'express-rate-limit';
import session from 'cookie-session';
import config from 'config';
import path from 'path';
import fs from 'fs';
import Routes from './resources/routes/public.routes.js';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';

import DbConnect from './resources/database/mysql.database.js';
import MongoConnect from './resources/database/mongo.database.js'

import cookieParser from 'cookie-parser';
const swaggerFile = JSON.parse(
  fs.readFileSync('./resources/views/swagger-api-view.json', 'utf-8')
);
import csrf from 'csurf';
import Server from 'http';
import * as io from 'socket.io';
const __dirname = path.resolve();
import fileStreamRotator from 'file-stream-rotator';
const logDir = __dirname + '/resources/Log/ResponseLog';

import Logger from './resources/Log/logger.log.js';
// import recentVisited from './middleware/recent.visited.middleware.js'
const app = express();
const server = Server.Server(app);
io.Server;

// Timezone setting
//moment.tz.setDefault(process.env.TIMEZONE);

app.use(Helmet(), Compression());
//app.use(ExpressRateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '100mb' }));
app.use(express.static('public'));
app.use(express.static('../../media'));
app.use(express.static('./resources/Log/ResponseLog'));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
// app.enableCors();

// now add csrf and other middle wares, after the "/api" was mounted
//app.use(csrf({ cookie: true }));

//  app.use('/api', api);

const expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 12); // 1/2 day
app.use(
  session({
    name: 'session_name_from_config',
    keys: ['key1_from_config', 'key2_from_config'],
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      expires: expiryDate,
    },
  })
);

// Stream information for log name and frequency
let stream = fileStreamRotator.getStream({
  filename: path.join(logDir, '%DATE%-logs.log'),
  frequency: 'daily',
  verbose: false,
  datePattern: 'YYYY-MM-DD',
  max_logs: '7d',
  size: '100M',
});

app.use(morgan('tiny', { stream: Logger.stream }));

if (app.get('env') !== 'local') {
  app.use(morgan('dev'));
  app.use(
    morgan(':method :url :status :res[content-length] :response-time ms', {
      stream: stream,
    })
  );
}

// for reading req body
app.use(
  express.json({ limit: '50mb' }),
  express.urlencoded({
    limit: '50mb',
    urlencoded: false,
    extended: true,
  })
);

//Set response header
app.use(function (req, res, next) {
  res.set({
    // compress: true,
    Conenction: 'keep-alive',
    'Keep-Alive': 'timeout=300',
  });
  // res.on("finish", function () {
  //   console.log("after", res);
  //   recentVisited(req, res)
  // });
  next();
});

//For exception handling for runtime
process
  .on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection: ', reason, 'Promise', promise);
    Logger.error(
      `: ---- : unhandledRejection : ---- : ${reason} : ---- : Unhandled Rejection at Promise : ---- : ${promise} : ---- :`
    );
  })
  .on('warning', (reason, promise) => {
    Logger.error(
      `: ---- :warning : ---- : ${reason} : ---- : warning message : ---- : ${promise} : ---- :`
    );
  })
  .on('uncaughtException', err => {
    console.log('Uncaught Exception:', err);
    Logger.error(
      `: ---- : uncaughtException : ---- : ${err} : ---- : Uncaught Exception thrown : ---- :`
    );
    process.exit(1);
  });

app.use('/explorer', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.get('/', (req, res) => res.redirect('/explorer'));

let createFolders = () => {
  return new Promise((resolve, reject) => {
    // if (!fs.existsSync(config.get('payment.base_path'))) {
    //   fs.mkdirSync(config.get('payment.base_path'));
    // }

    // if (!fs.existsSync(config.get('payment.payment_path'))) {
    //   fs.mkdirSync(config.get('payment.payment_path'));
    // }
    resolve(true);
  });
};

let startServer = () => {
  return new Promise((resolve, reject) => {
    let port = config.get('user_socioboard.port');
    server.listen(port, () => {
      Logger.info(
        `service listening on ${config.get('user_socioboard.host_url')} with ${process.env.NODE_ENV
        } Environment!`
      );
      console.log(
        `service listening on ${config.get('user_socioboard.host_url')} with ${process.env.NODE_ENV
        } Environment!`
      );
    });
    resolve(true);
  });
};

var dbConnect = new DbConnect();
var mongoConnect = new MongoConnect();
dbConnect
  .initialize()
  .then(() => {
    return mongoConnect.initialize()
  })
  .then(() => {
    var routes = new Routes(app);
    return routes;
  })
  .then(() => {
    return createFolders();
  })
  .then(() => {
    return startServer();
  })
  .catch(error => {
    Logger.error(error.message);
  });

