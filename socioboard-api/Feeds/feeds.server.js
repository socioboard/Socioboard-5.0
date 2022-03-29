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
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';

import cookieParser from 'cookie-parser';

import csrf from 'csurf';
import Server from 'http';
import * as io from 'socket.io';

import fileStreamRotator from 'file-stream-rotator';
import MongoConnect from './resources/database/mongo.database.js';
import DbConnect from './resources/database/mysql.database.js';
import Routes from './resources/routes/public.routes.js';

import Logger from './resources/log/logger.log.js';

if (process.env.IS_DEBUGGING) console.log(__filename);
const swaggerFile = JSON.parse(
  fs.readFileSync('./resources/views/swagger-api-view.json', 'utf-8')
);
const __dirname = path.resolve();
const logDir = `${__dirname}/log/ResponseLog`;

const app = express();
const server = Server.Server(app);

io.Server;

// Timezone setting
// moment.tz.setDefault(process.env.TIMEZONE);

app.use(Helmet(), Compression());
// app.use(ExpressRateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({extended: false}));
app.use(express.json({limit: '100mb'}));
app.use(express.static('public'));
app.use(express.static('../../media'));
app.use(express.static('./resources/log/ResponseLog'));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
// app.enableCors();

// now add csrf and other middle wares, after the "/api" was mounted
// app.use(csrf({ cookie: true }));

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
const stream = fileStreamRotator.getStream({
  filename: path.join(logDir, '%DATE%-logs.log'),
  frequency: 'daily',
  verbose: false,
  datePattern: 'YYYY-MM-DD',
  max_logs: '7d',
  size: '100M',
});

app.use(morgan('tiny', {stream: Logger.stream}));

if (app.get('env') !== 'local') {
  app.use(morgan('dev'));
  morgan.token('url', (req, res) => req.path);
  app.use(
    morgan(':method :url :status :res[content-length] :response-time ms', {
      stream,
    })
  );
}

// for reading req body
app.use(
  express.json({limit: '50mb'}),
  express.urlencoded({
    limit: '50mb',
    urlencoded: false,
    extended: true,
  })
);

// Set response header
app.use((req, res, next) => {
  res.set({
    compress: true,
    Conenction: 'keep-alive',
    'Keep-Alive': 'timeout=300',
  });
  next();
});

// For exception handling for runtime
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

const createFolders = () =>
  new Promise((resolve, reject) => {
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
    if (!fs.existsSync(config.get('archivedMedia.path'))) {
      fs.mkdirSync(config.get('archivedMedia.path'));
    }
    if (!fs.existsSync(config.get('customhashtagMedia.path'))) {
      fs.mkdirSync(config.get('customhashtagMedia.path'));
    }
    resolve(true);
  });

const startServer = () =>
  new Promise((resolve, reject) => {
    const port = config.get('feed_socioboard.port');

    server.listen(port, () => {
      Logger.info(
        `service listening on ${config.get('feed_socioboard.host_url')} with ${
          process.env.NODE_ENV
        } Environment!`
      );
      console.log(
        `service listening on ${config.get('feed_socioboard.host_url')} with ${
          process.env.NODE_ENV
        } Environment!`
      );
    });
    resolve(true);
  });

const dbConnect = new DbConnect();
const mongoConnect = new MongoConnect();

dbConnect
  .initialize()
  .then(() => mongoConnect.initialize())
  .then(() => {
    const routes = new Routes(app);

    return routes;
  })
  .then(() => createFolders())
  .then(() => startServer())
  .catch(error => {
    Logger.error(error.message);
  });
