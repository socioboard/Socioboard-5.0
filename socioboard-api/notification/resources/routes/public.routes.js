import socketLibs from '../../core/notify/socketServices.js'

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
import { notifyServer } from '../../core/notify/notify.routes.js'

import Router from 'express';
const router = Router();

class Routes {
  constructor(app, io) {
    this.configureCors(app);
    console.log(`app after ${app}`)
    console.log(`io ${io}`)


    const notifyRoute = notifyServer(io)
    // import socketLib from socketLibs(io);

    // router.use("/v1/notify/", notifyRoute);

    // io.on('connection', socketLib.handleSocket);

    // app.use(authenticate);
    // const notifyRoutes = require('../../core/notify/notify.routes.js')(io);
    // const socketLibs = require('../../core/notify/socketServices.js')(io);

    // app.use("/v1/notify/", notifyRoutes);

    // io.on('connection', socketLibs.handleSocket);

    // app.use(authenticate);


    // app.use("/", function (req, res) {
    //   res.status(404).send("Woops! 404 Not Found");
    // });


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
export default Routes;
