import ScheduleService from './schedule.service.js';

class ScheduleController {
  async create(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To schedule the post ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['postInfo'] = {
                 in: 'body',
                 description: 'Post type should be Text,Image,Link,Video',
                 required: true,
                 schema: { $ref: "#/definitions/postScheduler" }
                 } */
    return await ScheduleService.create(req, res, next);
  }

  async getScheduleDetails(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To get the schedule details of the user ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['fetchPageId'] = {
                 in: 'query',
                 description: 'PaginationId'
                 } */
    return await ScheduleService.getScheduleDetails(req, res, next);
  }

  async getSchedulePostById(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To get the schedule details of perticular id ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['id'] = {
                 in: 'query',
                 description: '_id'
                 } */
    return await ScheduleService.getSchedulePostById(req, res, next);
  }

  async getFilteredScheduleDetails(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To get the schedule details of the user using schedule status filter' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['fetchPageId'] = {
                 in: 'query',
                 description: 'PaginationId'
                 }
                 #swagger.parameters['teamId'] = {
                 in: 'query',
                 description: 'User team id'
                 }
                 #swagger.parameters['scheduleStatus'] = {
                 in: 'query',
                 description: 'schedule status,1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done'
                 } */
    return await ScheduleService.getFilteredScheduleDetails(req, res, next);
  }

  async getScheduleDetailsByCategories(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To get the schedule details of the user by category' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['fetchPageId'] = {
                 in: 'query',
                 description: 'PaginationId'
                 }
                 #swagger.parameters['scheduleStatus'] = {
                 in: 'query',
                 description: 'schedule status,1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done'
                 }
                 #swagger.parameters['scheduleCategory'] = {
                 in: 'query',
                 description: 'schedule category 0-Normal, 1-daywise'
                 }
                 #swagger.parameters['teamId'] = {
                 in: 'query',
                 description: 'User team id'
                 } */
    return await ScheduleService.getScheduleDetailsByCategories(req, res, next);
  }

  async changeScheduleStatus(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = ' To change the scheduled status' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['scheduleId'] = {
                 in: 'query',
                 description: 'schedule id'
                 }
                 #swagger.parameters['scheduleStatus'] = {
                 in: 'query',
                 description: 'schedule status'
                 } */
    return await ScheduleService.changeScheduleStatus(req, res, next);
  }

  async cancel(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = ' To cancel a scheduled post job  ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['scheduleId'] = {
                 in: 'query',
                 description: 'schedule id'
                 } */
    return await ScheduleService.cancel(req, res, next);
  }

  async delete(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To delete a scheduled post job  ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['scheduleId'] = {
                 in: 'query',
                 description: 'schedule id'
                 } */
    return await ScheduleService.delete(req, res, next);
  }

  async edit(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To edit a scheduled post job  ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['scheduleId'] = {
                 in: 'query',
                 description: 'schedule id from get-schedule-details '
                 }
                 #swagger.parameters['teamId'] = {
                 in: 'query',
                 description: 'team id'
                 }
                 #swagger.parameters['postDetails'] = {
                 in: 'body',
                 description: 'Post type should be Text,Image,Link,Video',
                 schema: { $ref: "#/definitions/postScheduler" }
                 } */
    return await ScheduleService.edit(req, res, next);
  }

  async editDraftSchedule(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To edit a scheduled post job  ' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['scheduleId'] = {
                 in: 'query',
                 description: 'schedule id from get-schedule-details '
                 }
                 #swagger.parameters['teamId'] = {
                 in: 'query',
                 description: 'team id'
                 }
                 #swagger.parameters['postDetails'] = {
                 in: 'body',
                 description: 'Post type should be Text,Image,Link,Video',
                 schema: { $ref: "#/definitions/postScheduler" }
                 } */
    return await ScheduleService.editDraftSchedule(req, res, next);
  }

  /**
   * TODO To get all published post for a schedule
   * Get all published post for a schedule.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns scheduled details
   */
  async getPublishedSchedulePostById(req, res, next) {
    /*
      #swagger.tags = ['Schedule']
      #swagger.description = 'To edit a scheduled post job' 
    */
    /*
      #swagger.security = [{
        "AccessToken": []
        }] 
    */
    /*
      #swagger.parameters['scheduleId'] = {
        in: 'query',
        description: 'schedule id from get-schedule-details '
      }
      #swagger.parameters['skip'] = {
        in: 'query',
        description: 'skip'
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'limit'
      } 
    */
    return await ScheduleService.getPublishedSchedulePostById(req, res, next);
  }

  async getFilterScheduleDetailsByCategories(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To get the schedule details of the user by category' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /* #swagger.parameters['fetchPageId'] = {
                 in: 'query',
                 description: 'PaginationId'
                 }
                 #swagger.parameters['scheduleStatus'] = {
                 in: 'query',
                 description: 'schedule status,1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done'
                 }
                 #swagger.parameters['scheduleCategory'] = {
                 in: 'query',
                 description: 'schedule category 0-Normal, 1-daywise'
                 }
                 #swagger.parameters['teamId'] = {
                 in: 'query',
                 description: 'User team id'
                 }
                #swagger.parameters['filterPeriod'] = {
                in: 'query',
                description: 'Filter Period 1- Today, 2-Yesterday, 3-Last week, 4-Last 30 days, 5- this month, 6- last month, 7- custom range',
                enum: [1,2,3,4,5,6,7]
                }
                #swagger.parameters['since'] = {
                in: 'query',
                description: 'Custom since range in YYYY-MM-DD format'
                }
                #swagger.parameters['until'] = {
                in: 'query',
                description: 'Custom until range in YYYY-MM-DD format'
                } */
    return await ScheduleService.getFilterScheduleDetailsByCategories(
      req,
      res,
      next
    );
  }

  async getActiveScheduleCount(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To get the schedule details of the user by category' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await ScheduleService.getActiveScheduleCount(req, res, next);
  }

  async getScheduleDetailsCount(req, res, next) {
    /* 	#swagger.tags = ['Schedule']
            #swagger.description = 'To get the schedule details of the user by category' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*           #swagger.parameters['scheduleStatus'] = {
                 in: 'query',
                 description: 'schedule status,1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done'
                 }
                 #swagger.parameters['scheduleCategory'] = {
                 in: 'query',
                 description: 'schedule category 0-Normal, 1-daywise'
                 }
                 #swagger.parameters['teamId'] = {
                 in: 'query',
                 description: 'User team id'
                 } */
    return await ScheduleService.getScheduleDetailsCount(req, res, next);
  }
}
export default new ScheduleController();
