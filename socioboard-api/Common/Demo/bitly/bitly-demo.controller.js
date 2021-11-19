import BITLY_CONSTANTS from '../../Constants/bitly.constants.js';
import {
  demoBitlyOAuthAuthorizeSchema,
  demoBitlyCallback,
  demoBitlyAccessToken,
  demoCheckAuthToken,
  demoBitlyGetGroupLinks,
} from './bitly-demo.validate.js';

class DemoController {
  async bitlyOAuthAuthorize(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['client_id'] = {
        in: 'query',
        description: 'Demo bitly account id',
        required: true
       }
       #swagger.parameters['redirect_uri'] = {
        in: 'query',
        description: 'Demo bitly redirect uri',
        required: true
       }
        */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      await demoBitlyOAuthAuthorizeSchema.validateAsync(req.query);

      res.status(200).redirect(`${BITLY_CONSTANTS.REDIRECT_URI}?code=demo-bitly-code`);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async bitlyCallback(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['code'] = {
        in: 'query',
        description: 'Demo bitly code id',
        required: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      await demoBitlyCallback.validateAsync(req.query);

      res.send('demo').end();
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getUserDetails(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['code'] = {
        in: 'query',
        description: 'Demo bitly code id',
        required: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const accessToken = this.getReqAccessToken(req);

      await demoCheckAuthToken.validateAsync(accessToken);

      res.status(200).json({
        login: BITLY_CONSTANTS.ACCOUNT_DETAILS.LOGIN,
        name: BITLY_CONSTANTS.ACCOUNT_DETAILS.NAME,
        is_active: true,
        created: new Date(),
        modified: 'string',
        is_sso_user: true,
        emails: [
          {
            email: BITLY_CONSTANTS.ACCOUNT_DETAILS.EMAIL,
            is_primary: true,
            is_verified: true,
          },
        ],
        is_2fa_enabled: true,
        default_group_guid: BITLY_CONSTANTS.ACCOUNT_DETAILS.DEFAULT_GROUP,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAccessToken(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['code'] = {
        in: 'query',
        description: 'Demo bitly code id',
        required: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      await demoBitlyAccessToken.validateAsync(req.query);

      res.status(200).json({
        access_token: BITLY_CONSTANTS.ACCOUNT_DETAILS.ACCESS_TOKEN,
        login: BITLY_CONSTANTS.ACCOUNT_DETAILS.LOGIN,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getGroupLink(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['code'] = {
        in: 'query',
        description: 'Demo bitly code id',
        required: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const { group_guid: groupGuid } = await demoBitlyGetGroupLinks.validateAsync(req.params);

      if (groupGuid === BITLY_CONSTANTS.GROUP_GUID_FORBIDDEN) {
        return res.status(403).json({
          message: 'FORBIDDEN',
          resource: 'bitlinks',
          description: 'You are currently forbidden to access this resource.',
        });
      }

      return res.status(200).json({
        links: [
          {
            created_at: '2021-08-12T13:24:23+0000',
            id: 'bit.ly/demo-bitly',
            link: 'https://bit.ly/demo-bitly',
            custom_bitlinks: [],
            long_url: 'https://demo-bitly.demo',
            archived: false,
            created_by: BITLY_CONSTANTS.ACCOUNT_DETAILS.LOGIN,
            client_id: BITLY_CONSTANTS.CLIENT_ID,
            tags: [],
            deeplinks: [],
            references: {
              group: '',
            },
          },
        ],
        pagination: {
          prev: '',
          next: '',
          size: 50,
          page: 1,
          total: 1,
        },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPlatformLimits(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['code'] = {
        in: 'query',
        description: 'Demo bitly code id',
        required: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      if (req.query.path.length === 0) {
        return res.status(200).json({
          platform_limits: [
            {
              endpoint: '/organizations',
              methods: [
                {
                  name: 'GET',
                  limit: 2500,
                  count: 0,
                },
              ],
            },
            {
              endpoint: '/shorten',
              methods: [
                {
                  name: 'POST',
                  limit: 1000,
                  count: 0,
                },
              ],
            },
            {
              endpoint: '/bitlinks',
              methods: [
                {
                  name: 'POST',
                  limit: 1500,
                  count: 0,
                },
              ],
            },
          ],
        });
      }

      if (req.query.path === '/shorten') {
        return res.status(200).json({
          platform_limits: [
            {
              endpoint: '/shorten',
              methods: [
                {
                  name: 'POST',
                  limit: 1000,
                  count: 0,
                },
              ],
            },
          ],
        });
      }

      return res.status(404).json({
        message: 'NOT_FOUND',
        resource: 'limits',
        description: 'What you are looking for cannot be found.',
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async shortenLink(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['code'] = {
        in: 'query',
        description: 'Demo bitly code id',
        required: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      const accessToken = this.getReqAccessToken(req);

      if (accessToken !== BITLY_CONSTANTS.ACCOUNT_DETAILS.ACCESS_TOKEN) {
        res.status(403).json({
          message: 'FORBIDDEN',
        });
      }

      res.status(200).json({
        created_at: '2021-08-11T13:47:08+0000',
        id: 'bit.ly/demo-bitly',
        link: 'https://bit.ly/demo-bitly',
        custom_bitlinks: [],
        long_url: 'https://demo-bitly.demo',
        archived: false,
        tags: [],
        deeplinks: [],
        references: {
          group: 'demo',
        },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async archiveLink(req, res) {
    /* #swagger.tags = ['Demo Bitly API']
        #swagger.description = 'Returns demo bitly oauth code' */
    /* #swagger.parameters['code'] = {
        in: 'query',
        description: 'Demo bitly code id',
        required: true
       } */
    /* #swagger.security = [{
        "AccessToken": []
       }] */

    try {
      if (req.params.bitlink === BITLY_CONSTANTS.BITLINK) {
        return res.status(200).json({
          created_at: '2021-08-12T13:24:23+0000',
          id: 'bit.ly/demo-bitly',
          link: 'https://bit.ly/demo-bitly',
          custom_bitlinks: [],
          long_url: 'https://demo-bitly.demo',
          archived: true,
          created_by: 'o_11s3145r3d',
          client_id: '47a3227f1107a4d05ddf3826ff1f9820a898fbcc',
          tags: [],
          deeplinks: [],
          references: {
            group: 'demo',
          },
        });
      }

      if (req.params.bitlink === BITLY_CONSTANTS.BITLINK_FORBIDDEN) {
        return res.status(403).json({
          message: 'FORBIDDEN',
        });
      }

      return res.status(404).json({
        message: 'NOT_FOUND',
        resource: 'bitlinks',
        description: 'What you are looking for cannot be found.',
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  getReqAccessToken(req) {
    return req.headers.authorization.split('Bearer ')[1];
  }
}

export default new DemoController();
