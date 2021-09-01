import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, label, prettyPrint,
} = format;

require('winston-daily-rotate-file');

if (!fs.existsSync('resources/Log/ResponseLog')) {
  fs.mkdirSync('resources/Log/ResponseLog');
}
const transportsLogger = [];

transportsLogger.push(
  new transports.DailyRotateFile({
    level: process.env.ENV === 'localDev' ? 'debug' : 'info',
    datePattern: 'DD-MM-YYYY',
    filename: 'resources/Log/ResponseLog/publish%DATE%.log',
    handleExceptions: true,
    json: true,
    maxSize: '1g',
    maxFiles: '3d',
  }),
);

const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint(),
  ),
  transports: transportsLogger,
  exitOnError: false,
});

logger.stream = {
  write(message, encoding) {
    logger.info(message);
  },
};

export default logger;
