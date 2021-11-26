import PinterestPinsService from './pinterest-pins.service.js'

class FeedController{
 
/**
 * TODO To Fetch the Pinterest Pins for specific Boards
 * Function to Fetch Pinterest Pins for specific Boards
 * @param {import('express').Request} req   
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @return {object} Returns  Pinterest Pins
 */
 async getPinterestPins(req, res, next) {
     /* 	#swagger.tags = ['Pinterest Pins']
            #swagger.description = 'Get Pins from Pinterst with specific Boards' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Pinterst account id',
                }
                #swagger.parameters['boardId'] = {
                in: 'query',
                description: 'Board Id'
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                } */
     /* #swagger.security = [{
               "AccessToken": []
        }] */
      return await PinterestPinsService.getPinterestPins(req, res, next);
  }

}
export default new FeedController();
