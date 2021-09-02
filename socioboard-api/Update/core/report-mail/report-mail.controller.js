import ReportMailService from './report-mail.service.js';

class ReportMailController {
  /**
     * TODO To create a auto report scheduler
     * @description  To create a auto report scheduler
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @return {object} Returns status for created details
     */
  async createReport(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To send report mail' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['reportTitle'] = {
                    in: 'query',
                    description: 'Report title.',
                    required: true,
                    }
            #swagger.parameters['frequency'] = {
                    in: 'query',
                    description: 'Frequency 0-day,1-weekly,2-monthly.',
                    required: true,
                    }
            #swagger.parameters['report'] = {
                    in: 'query',
                    description: ' 0-all,1-pdf,2-csv.',
                    required: true,
                    }
            #swagger.parameters['autoReport'] = {
                    in: 'body',
                    description: 'Auto report information',
                    required: true,
                    schema: { $ref: "#/definitions/autoReport" }
                    }
             #swagger.parameters['testMail'] = {
                    in: 'query',
                    description: '0-testMail,1-Create schedule',
                    required: true,
                    } */
    return await ReportMailService.sendReportMail(req, res, next);
  }

  /**
     * TODO To edit a auto report scheduler
     * @description To edit a auto report scheduler
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @return {object} Returns status for edited details
     */
  async editReport(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To edit auto mail details' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['id'] = {
                    in: 'query',
                    description: 'Report title.',
                    required: true,
                    }
            #swagger.parameters['reportTitle'] = {
                    in: 'query',
                    description: 'Report title.',
                    required: true,
                    }
            #swagger.parameters['frequency'] = {
                    in: 'query',
                    description: 'Frequency 0-day,1-weekly,2-monthly.',
                    required: true,
                    }
            #swagger.parameters['report'] = {
                    in: 'query',
                    description: ' 0-all,1-pdf,2-csv.',
                    required: true,
                    }
            #swagger.parameters['autoReport'] = {
                    in: 'body',
                    description: 'Auto report information',
                    required: true,
                    schema: { $ref: "#/definitions/autoReport" }
                    }
             #swagger.parameters['testMail'] = {
                    in: 'query',
                    description: '0-testMail,1-Create schedule',
                    required: true,
                    } */
    return await ReportMailService.editReport(req, res, next);
  }

  /**
    * TODO To delete a auto report details from db.
    * @description  Delete a auto report details from db
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @param {import('express').NextFunction} next
    * @return {object} Returns status for delete status
    */
  async removeReport(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To delete a auto report details from db' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['id'] = {
                in: 'query',
                description: 'Report id for remove data.',
                required: true,
                } */
    return await ReportMailService.removeReport(req, res, next);
  }

  /**
    * TODO To get auto report mail details for user.
    * @description  To get Auto report mail details for user
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @param {import('express').NextFunction} next
    * @return {object} Returns Auto report details for user
    */
  async getReports(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'To get Auto report mail details for user' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination id.',
                required: true,
                } */
    return await ReportMailService.getReports(req, res, next);
  }

  /**
    * TODO To get auto report mail details for a particular id.
    * @description  To get Auto report mail details for a particular id
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @param {import('express').NextFunction} next
    * @return {object} Returns Auto report details for particular id
    */
  async getReportsById(req, res, next) {
    /* 	#swagger.tags = ['Report']
            #swagger.description = 'TO get Auto report mail details for a particular id' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['id'] = {
                in: 'query',
                description: 'Report id',
                required: true,
                } */
    return await ReportMailService.getReportsById(req, res, next);
  }
}
export default new ReportMailController();
