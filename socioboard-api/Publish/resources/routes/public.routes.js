import upload from '../../core/upload/upload.router.js';
import authenticate from '../../middleware/authentication.middleware.js';
import publish from '../../core/publish/publish.router.js';
import taskRoutes from '../../core/task/task.router.js';
import reportsRoutes from '../../core/report/report.router.js';
import scheduler from '../../core/schedule/schedule.router.js';
import recentVisited from '../../middleware/recent-visited.middleware.js';
import youtubeUpload from '../../core/youtube-publish/youtube-publish.router.js';
import calenderView from '../../core/calender-view/calender-view.router.js';

class Routes {
  constructor(app) {
    this.configureCors(app);
    app.use(authenticate);
    app.use(recentVisited);
    app.use('/v1/upload', upload);
    app.use('/v1/publish', publish);
    app.use('/v1/task', taskRoutes);
    app.use('/v1/reports', reportsRoutes);
    app.use('/v1/schedule/', scheduler);
    app.use('/v1/youtube', youtubeUpload);
    app.use('/v1/calenderView', calenderView);
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
