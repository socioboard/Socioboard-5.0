import config from 'config';
import SocketLibs from '../../core/notify/socket-services.js';
import NotifyRoute from '../../core/notify/notify.routes.js';
import notifySocketRoute from '../../core/notify/notify-socket.router.js';

class Routes {
  constructor(app, io) {
    this.configureCors(app);
    const socketLib = SocketLibs(io);

    io.on('connection', socketLib.handleSocket);
    app.set('socketio', io);
    app.use('/v1/notify', notifySocketRoute);
    app.use('/v1/notify', NotifyRoute);
    app.use('/', (req, res) => {
      res.status(404).send('Woops! 404 Not Found');
    });
  }

  configureCors(app) {
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Credentials', true);
      next();
    });
  }
}
export default Routes;
