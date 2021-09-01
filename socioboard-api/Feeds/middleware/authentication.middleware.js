import config from 'config';
import moment from 'moment';
import Helper from '../../Common/Services/authorize.services.js';

const helper = new Helper(config.get('authorize'));

export default (req, res, next) => {
  /* #swagger.ignore = true */
  const token = req.headers['x-access-token'];

  if (token) {
    const decodedToken = helper.verifyToken(token);

    if (decodedToken.auth === false) return res.status(401).send('Accesstoken is missing or invalid');
    if (decodedToken) {
      const parsedToken = JSON.parse(decodedToken);
      const expireDate = parsedToken.Activations.account_expire_date;
      const remindingDays = moment(expireDate).diff(moment(), 'days');

      req.body.userScopeId = parsedToken.user_id;
      req.body.userScopeEmail = parsedToken.email;
      req.body.userScopeName = parsedToken.first_name;
      req.body.userScopeMaxAccountCount = parsedToken.userPlanDetails.account_count;
      req.body.userScopeMaxMemberCount = parsedToken.userPlanDetails.member_count;
      req.body.userScopeAvailableNetworks = parsedToken.userPlanDetails.available_network;
      req.body.userScopeMaxScheduleCount = parsedToken.userPlanDetails.maximum_schedule;
      req.body.userScopeIsAdmin = parsedToken.is_admin_user;

      req.body.userScopeCustomReport = parsedToken.userPlanDetails.custom_report;
      req.body.userScopeTeamReport = parsedToken.userPlanDetails.team_report;
      req.body.userScopeBoardMe = parsedToken.userPlanDetails.board_me;
      req.body.userScopeShareLibrary = parsedToken.userPlanDetails.share_library;
      req.body.userScopeContentStudio = parsedToken.userPlanDetails.content_studio;
      req.body.userScopeDiscovery = parsedToken.userPlanDetails.discovery;
      req.body.userScopeRssFeeds = parsedToken.userPlanDetails.rss_feeds;
      req.body.language = parsedToken.language;

      if (remindingDays < 0) {
        const redirectValueFromRequest = req.query.redirectToken;

        if (redirectValueFromRequest) {
          const decryptredRedirectToken = JSON.parse(helper.decrypt(redirectValueFromRequest));

          const expiredDays = moment(decryptredRedirectToken.expire_date).diff(moment(), 'days');

          if (expiredDays >= 0 && decryptredRedirectToken.isChangePlan) {
            req.body.AppScopedRedirectUrl = decryptredRedirectToken.redirect_url;
            next();
          } else res.status(200).json({ code: 401, status: 'failed', message: 'Something went wrong!' });
        } else {
          const redirectTokenValue = {
            isChangePlan: true,
            expire_date: moment.utc().add(1, 'days'),
            redirect_url: req.originalUrl,
          };
          const redirectToken = helper.encrypt(JSON.stringify(redirectTokenValue));

          res.redirect(`${config.get('user_socioboard.host_url')}/v1/user/change-plan/?userId=${parsedToken.user_id}&currentPlan=${parsedToken.Activations.user_plan}&newPlan=0&redirectToken=${redirectToken}`);
        }
      } else {
        next();
      }
    } else {
      res.status(200).json({ code: 400, status: 'failed', message: 'Bad request!' });
    }
  } else res.status(200).json({ code: 401, status: 'failed', message: 'Accesstoken is missing or invalid!' });
};
