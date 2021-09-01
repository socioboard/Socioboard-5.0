import BoardsService from './boards.service.js';

class BoardsController {
  async create(req, res, next) {
    /* 	#swagger.tags = ['Boards']
           #swagger.description = 'Create the Boards' */
    /*	#swagger.parameters['boardName'] = {
                in: 'query',
                description: 'Board Name'
                }
                #swagger.parameters['Keyword'] = {
                in: 'query',
                description: 'Keyword',
               }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await BoardsService.create(req, res, next);
  }

  async getAllBoards(req, res, next) {
    /* 	#swagger.tags = ['Boards']
           #swagger.description = 'Get  the Boards' */
    /*	#swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await BoardsService.getAllBoards(req, res, next);
  }

  async update(req, res, next) {
    /* 	#swagger.tags = ['Boards']
           #swagger.description = 'Create the Boards' */
    /*	#swagger.parameters['boardId'] = {
                in: 'query',
                description: 'Board Id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['Keyword'] = {
                in: 'query',
                description: 'Keyword',
               } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await BoardsService.update(req, res, next);
  }

  async delete(req, res, next) {
    /* 	#swagger.tags = ['Boards']
           #swagger.description = 'Delete the Board' */
    /*	#swagger.parameters['boardId'] = {
                in: 'query',
                description: 'Board Id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await BoardsService.delete(req, res, next);
  }
}

export default new BoardsController();
