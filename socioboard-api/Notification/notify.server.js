import express from 'express';
import morgan from 'morgan';
import Helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import config from 'config';

import { createRequire } from 'module';

import Compression from 'compression';
import ExpressRateLimit from 'express-rate-limit';
import session from 'cookie-session';
import path from 'path';
import fs from 'fs';
import csrf from 'csurf';
import fileStreamRotator from 'file-stream-rotator';
import Routes from './resources/routes/public.routes.js';
import MongoConnect from './resources/database/mongo.database.js';
import DbConnect from './resources/database/mysql.database.js';
import Logger from './resources/Log/logger.log.js';

const app = express();
const require = createRequire(import.meta.url);
const swaggerFile = JSON.parse(
  fs.readFileSync('./resources/views/swagger-api-view.json', 'utf-8'),
);
const __dirname = path.resolve();
const logDir = `${__dirname}/resources/Log/ResponseLog`;

class App {
  constructor() {
    const server = require('http').Server(app);
    const io = require('socket.io')(server, {
      cors: {
        origin: true, // true means to use any frontend.
      },
    });

    app.use(morgan('tiny', { stream: Logger.stream }));
    app.use(Helmet(), Compression());
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static('public'));
    app.use(express.static('../../media'));
    app.use(express.static('./resources/Log/ResponseLog'));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(ExpressRateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());

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
      }),
    );

    const stream = fileStreamRotator.getStream({
      filename: path.join(logDir, '%DATE%-logs.log'),
      frequency: 'daily',
      verbose: false,
      datePattern: 'YYYY-MM-DD',
      max_logs: '3d',
      size: '100M',
    });

    if (app.get('env') !== 'local') {
      app.use(morgan('dev'));
      app.use(
        morgan(':method :url :status :res[content-length] :response-time ms', {
          stream,
        }),
      );
    }

    app.use(
      express.json({ limit: '50mb' }),
      express.urlencoded({
        limit: '50mb',
        urlencoded: false,
        extended: true,
      }),
    );

    app.use((req, res, next) => {
      res.set({
        compress: true,
        Conenction: 'keep-alive',
        'Keep-Alive': 'timeout=300',
      });
      next();
    });

    process
      .on('unhandledRejection', (reason, promise) => {
        Logger.error(
          `: ---- : unhandledRejection : ---- : ${reason} : ---- : Unhandled Rejection at Promise : ---- : ${promise} : ---- :`,
        );
      })
      .on('warning', (reason, promise) => {
        Logger.error(
          `: ---- :warning : ---- : ${reason} : ---- : warning message : ---- : ${promise} : ---- :`,
        );
      })
      .on('uncaughtException', (err) => {
        Logger.error(
          `: ---- : uncaughtException : ---- : ${err} : ---- : Uncaught Exception thrown : ---- :`,
        );
        process.exit(1);
      });

    app.use('/explorer', swaggerUi.serve, swaggerUi.setup(swaggerFile));
    app.get('/', (req, res) => res.redirect('/explorer'));

    const createFolders = () => new Promise((resolve, reject) => {
      // if (!fs.existsSync(config.get('payment.base_path'))) {
      //   fs.mkdirSync(config.get('payment.base_path'));
      // }

      // if (!fs.existsSync(config.get('payment.payment_path'))) {
      //   fs.mkdirSync(config.get('payment.payment_path'));
      // }
      resolve(true);
    });

    const startServer = () => new Promise((resolve, reject) => {
      const port = config.get('notification_socioboard.port');

      server.listen(port, () => {
        Logger.info(
          `service listening on ${config.get(
            'notification_socioboard.host_url',
          )} with ${process.env.NODE_ENV} Environment!`,
        );
        console.log(
          `service listening on ${config.get(
            'notification_socioboard.host_url',
          )} with ${process.env.NODE_ENV} Environment!`,
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
        const routes = new Routes(app, io);

        return routes;
      })
      .then(() => createFolders())
      .then(() => startServer())
      .catch((error) => {
        Logger.error(error.message);
      });
  }
}
export default new App();
