/**
 * @typedef {import('./calender-view.service.js')}
 */
import calenderViewService from './calender-view.service.js';

/**
 * CalenderViewController class
 * Base class for controllers
 */
class CalenderViewController {
  /**
   * TODO To get scheduled details for calender view
   * Get all scheduling details.
   * @param {import('express').Request} req have optional schedule_status, schedule_type
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns scheduled details
   */
  async scheduleDetails(req, res, next) {
    /* 	#swagger.tags = ['Calender View']
            #swagger.description = 'To get the schedule details of the user by category' */
    /*  #swagger.security = [{
               "AccessToken": []
            }]
            */
    /*  #swagger.parameters['scheduleStatus'] = {
            in: 'query',
            description: 'schedule status,1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done'
            }
             #swagger.parameters['teamId'] = {
            in: 'query',
            description: 'Team id'
            }
            #swagger.parameters['scheduleCategory'] = {
            in: 'query',
            description: 'schedule category 0-Normal, 1-daywise'
            } */
    return await calenderViewService.scheduleDetails(req, res, next);
  }
}

export default new CalenderViewController();
