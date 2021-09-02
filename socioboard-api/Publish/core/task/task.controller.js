import TaskService from './task.service.js';

class TaskController {
  async getTasks(req, res, next) {
    /* 	#swagger.tags = ['task']
            #swagger.description = 'To get the task list for providing an approval to other requested user inside the particular team' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Enter team id',
                }
             #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                } */
    return await TaskService.getTasks(req, res, next);
  }

  async assignTask(req, res, next) {
    /* 	#swagger.tags = ['task']
            #swagger.description = 'To assign the task to other team member' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['taskId'] = {
                in: 'query',
                description: 'Enter task id ',
                }
             #swagger.parameters['assigningUserId'] = {
                in: 'query',
                description: 'assigning User Id'
                }
            #swagger.parameters['teamId'] = {
                in: 'query',
                description: ' team id'
                } */
    return await TaskService.assignTask(req, res, next);
  }

  async updateTaskStatus(req, res, next) {
    /* 	#swagger.tags = ['task']
            #swagger.description = 'To assign the task to other team member' */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    /*   #swagger.parameters['taskId'] = {
                in: 'query',
                description: 'Enter task id ',
                }
             #swagger.parameters['status'] = {
                in: 'query',
                description: 'status',
                default: "Approved",
                enum: ["Approved", "Rejected"]
                }
            #swagger.parameters['teamId'] = {
                in: 'query',
                description: ' team id'
                } */
    return await TaskService.updateTaskStatus(req, res, next);
  }
}
export default new TaskController();
