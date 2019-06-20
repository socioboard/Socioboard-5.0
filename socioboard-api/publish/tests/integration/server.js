const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('../../utils/logger');
const Routes = require('../../startup/routes');
const DbConnect = require('../../startup/dbconnect');

const app = express();

app.use(morgan("tiny", { "stream": logger.stream }));
app.use(helmet());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());

var routes = new Routes(app);
var dbconnect = new DbConnect();
dbconnect.initialize();

process.on('unhandledRejection', (reason, promise) => {
    logger.debug(reason);
});

process.on('uncaughtException', (error) => {
    logger.debug(reason);
});

module.exports = app;


















