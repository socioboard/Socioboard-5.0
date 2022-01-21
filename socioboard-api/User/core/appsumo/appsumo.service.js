import config from 'config';
import {ValidateErrorResponse} from '../../../Common/Shared/response.shared.js';
import AuthorizeServices from '../../../Common/Services/authorize.services.js';
import SendEmailServices from '../../../Common/Services/mail-base.services.js';
import validator from './appsumo.validator.js';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
const unauthorizedLibs = new UnauthorizedLibs();
import aMember from '../../../Common/Mappings/amember.users.js';
import db from '../../../Common/Sequelize-cli/models/index.js';
import logger from '../../resources/Log/logger.log.js';
const appSumoDetails = db.appsumo_details;
const appsumoActivation = db.appsumo_activation;

class AppSumoService {
  constructor() {
    this.authorizeServices = new AuthorizeServices(config.get('authorize'));
    this.sendEmailServices = new SendEmailServices(config.get('mailService'));
  }
  async getAccessToken(req, res) {
    try {
      let userDetails = req.body;
      logger.info(
        `AppSumo Access token request ${JSON.stringify(userDetails)}`
      );
      const {error} = validator.validateCredential({...userDetails});
      if (error) return ValidateErrorResponse(res, error.details[0].message);
      if (
        userDetails.username !== config.get('appsumo.username') ||
        userDetails.password !== config.get('appsumo.password')
      )
        return res.status(400).json({
          message: 'Check your credentials',
        });

      let access = this.authorizeServices.createToken(userDetails);
      logger.info(`AppSumo access token response ${access}`);
      return res.json({
        access,
      });
    } catch (e) {
      logger.info(`AppSumo access token error ${JSON.stringify(e)}`);
      return res.status(400).json({
        message: e.message,
      });
    }
  }

  async notification(req, res) {
    try {
      let token = req.headers['authorization'];
      logger.info(`AppSumo access token ${token}`);
      logger.info(
        `AppSumo notification request parameter ${JSON.stringify(req.body)}`
      );
      if (!token) return this.accessTokenFailed(res);
      if (token.startsWith('Bearer ')) {
        token = token.substring(7, token.length);
      }
      let decodedToken = this.authorizeServices.verifyToken(token);
      if (decodedToken?.auth === false) {
        return res.status(400).json({
          message: decodedToken?.message ?? 'Failed to authenticate token.',
        });
      }
      logger.info(`AppSumo decoded token ${JSON.stringify(decodedToken)}`);
      decodedToken = JSON.parse(decodedToken);
      if (
        decodedToken.username !== config.get('appsumo.username') ||
        decodedToken.password !== config.get('appsumo.password')
      )
        return this.accessTokenFailed(res);
      let data = req.body;
      let {action, plan_id, uuid, activation_email, invoice_item_uuid} = data;
      logger.info(`AppSumo notification payload ${data}`);
      const htmlContent = this.sendEmailServices.template
        .appSumoMailTemplate()
        .replace('[action]', action ?? '')
        .replace('[plan_id]', plan_id ?? '')
        .replace('[uuid]', uuid ?? '')
        .replace('[activation_email]', activation_email ?? '')
        .replace('[invoice_item_uuid]', invoice_item_uuid ?? '');
      let emailDetails = {
        subject: 'AppSumo Notification',
        toMail: config.get('appsumo.toMail'),
        htmlContent,
      };
      await this.sendEmailServices.sendMails(
        config.get('mailService.defaultMailOption'),
        emailDetails
      );
      let user = await unauthorizedLibs.checkEmailAvailability(
        activation_email
      );
      logger.info(`AppSumo user ${JSON.stringify(user)}`);
      if (user) {
        if (action == 'activate') {
          await appSumoDetails.create({
            ...req.body,
          });
          await this.setAMemberPlanForAppSumoUser(
            user.user_name,
            plan_id,
            false
          );
          return res.status(201).json({
            message: 'product activated',
            redirect_url: 'https://appv5.socioboard.com/login',
          });
        } else if (action == 'enhance_tier') {
          await appSumoDetails.create({
            ...req.body,
          });
          await this.setAMemberPlanForAppSumoUser(
            user.user_name,
            plan_id,
            false
          );
          return res.status(200).json({
            message: 'product enhanced',
          });
        } else if (action == 'reduce_tier') {
          await appSumoDetails.create({
            ...req.body,
          });
          await this.setAMemberPlanForAppSumoUser(
            user.user_name,
            plan_id,
            false
          );
          return res.status(200).json({
            message: 'product reduced',
          });
        } else if (action == 'refund') {
          //mail
          //delete the product (expired zero days)
          await appSumoDetails.create({
            ...req.body,
          });
          await this.setAMemberPlanForAppSumoUser(
            user.user_name,
            plan_id,
            true
          );
          return res.status(200).json({
            message: 'product refund',
          });
        }
      } else {
        logger.info(`AppSumo User not registered`);
        await this.addAppSumoUserDetails(
          action,
          uuid,
          plan_id,
          activation_email,
          invoice_item_uuid
        );
        return res.status(201).json({
          message: 'product activated',
          redirect_url: `https://appv5.socioboard.com/appsumo/${activation_email}`,
        });
      }
    } catch (e) {
      logger.info(`AppSumo notification error ${JSON.stringify(e)}`);
      return res.status(400).json({
        message: e.message,
      });
    }
  }
  async accessTokenFailed(res) {
    return res.status(400).json({
      message: 'Accesstoken is missing or invalid!',
    });
  }

  async setAMemberPlanForAppSumoUser(user_name, plan_id, refund) {
    await new aMember(config.get('aMember')).setAMemberPlanForAppSumoUser(
      user_name,
      plan_id,
      refund
    );
  }

  async addAppSumoUserDetails(
    action,
    uuid,
    plan_id,
    activation_email,
    invoice_item_uuid,
    status = 0
  ) {
    let res = await appsumoActivation.findOne({
      where: {
        activation_email,
      },
      raw: true,
    });
    if (res) {
      appsumoActivation.update(
        {action, uuid, plan_id, invoice_item_uuid},
        {where: {activation_email}}
      );
    } else {
      await appsumoActivation.create({
        action,
        uuid,
        plan_id,
        activation_email,
        invoice_item_uuid,
        status,
      });
    }
  }
}
export default new AppSumoService();
