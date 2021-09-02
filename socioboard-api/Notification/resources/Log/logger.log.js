import winston from 'winston';
import fs from 'fs';
import 'winston-daily-rotate-file';

if (!fs.existsSync('resources/Log/ResponseLog')) {
  fs.mkdirSync('resources/Log/ResponseLog');
}
const transportsLogger = [];

transportsLogger.push(
  new winston.transports.DailyRotateFile({
    level: process.env.ENV === 'development' ? 'debug' : 'info',
    datePattern: 'YYYY-MM-DD-HH',
    filename: 'resources/Log/ResponseLog/notify%DATE%.log',
    handleExceptions: true,
    json: true,
    maxSize: '1g',
    maxFiles: '3d',
  }),
);

const logger = winston.createLogger({
  transports: transportsLogger,
  exitOnError: false,
});

logger.stream = {
  write(message, encoding) {
    logger.info(message);
  },
};

export default logger;
