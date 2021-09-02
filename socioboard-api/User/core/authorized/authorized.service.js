import AuthorizedLibs from '../../../Common/Models/authorized.model.js';
import UnauthorizedLibs from '../../../Common/Models/unauthorized.model.js';
import {
  ErrorResponse,
  SuccessResponse,
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';
import validate from './authorized.validate.js';

const authorizedLibs = new AuthorizedLibs();
const unauthorizedLibs = new UnauthorizedLibs();

class UserController {
  async changePassword(req, res, next) {
    try {
      if (req.body.currentPassword == req.body.newPassword) {
        return ErrorResponse(
          res,
          'New password should not match with current password!'
        );
      }
      const userDetalts = await authorizedLibs.getUserDetails(
        req.body.userScopeId
      );

      if (userDetalts.password !== req.body.currentPassword) {
        return ErrorResponse(
          res,
          'Sorry You Entered  Incorrect  Old Password!',
          401
        );
      }
      const response = await authorizedLibs.changePassword(
        req.body.userScopeId,
        req.body.userName,
        req.body.newPassword
      );

      if (response.length == 1) return SuccessResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async holdUser(req, res, next) {
    //  const { value, error } = validate.validatePassword(req.body)
    // if (error) return responseformat(res, 401, null, "validation failed", error.details[0].message)

    try {
      const data = await authorizedLibs.holdUser(req.body.userScopeId);

      if (data[0] === 1)
        return SuccessResponse(res, null, 'User holden successfully');

      return ErrorResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To Fetch the User Details
   * Route Fetch the User Details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns User Details along with Access Token
   */
  async getUserInfo(req, res, next) {
    try {
      const userDetails = await authorizedLibs.getUserDetailswithId(
        req.body.userScopeId
      );
      const userInformation = await unauthorizedLibs.getUserAccessToken(
        req.body.userScopeId,
        userDetails.Activations.id
      );

      if (!userInformation) return ErrorResponse(res, 'Something went wrong!');
      if (userInformation) return SuccessResponse(res, userInformation);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  /**
   * TODO To Update the User Details
   * Route Update update-profile-details
   * @name post/publish
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @return {object} Returns updated  User Details
   */
  async updateProfileDetails(req, res, next) {
    try {
      const userDetails = await authorizedLibs.getUserDetailswithId(
        req.body.userScopeId
      );

      if (!userDetails) return ErrorResponse(res, 'No user found!');
      const updateUser = await authorizedLibs.updateUser(
        req.body,
        req.body.userScopeId,
        req.body.userName
      );
      const userInformation = await unauthorizedLibs.getUserAccessToken(
        req.body.userScopeId,
        userDetails.Activations.id
      );

      if (!userInformation) return ErrorResponse(res, 'Something went wrong!');
      if (userInformation) return SuccessResponse(res, userInformation);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async deleteUser(req, res, next) {
    try {
      let userDeatils = await unauthorizedLibs.getUserDetailswithId(
        req.body.userScopeId
      );
      let response = await authorizedLibs.deleteUser(req.body.userScopeId);
      let deleteFromAmember = await authorizedLibs.deleteUserAmember(
        req.body.userName
      );
      if (response) {
        let mailDetails = await unauthorizedLibs.sendDeleteUserMail(
          userDeatils
        );
        return SuccessResponse(res, response);
      }
      return ErrorResponse(res);
    } catch (err) {
      return CatchResponse(res, err.message);
    }
  }

  async changePlan(req, res, next) {
    try {
      const {value, error} = validate.validatePlan(req.query);

      if (error) return ValidateErrorResponse(res, error.details[0].message);
      const {currentPlan} = req.query;
      const {newPlan} = req.query;

      const userPlanDetails = await authorizedLibs.getUserPlanDetailswithId(
        req.body.userScopeId,
        currentPlan
      );
      if (!userPlanDetails)
        return ErrorResponse(res, 'Entered CurrentPlan Invalid!!');

      const newPlandetails = await authorizedLibs.getPlanDetails(newPlan);

      if (!newPlandetails) return ErrorResponse(res, 'New Plan Not Found!!');
      // if (newPlandetails) return SuccessResponse(res, userPlanDetails)
      const updatePlan = await authorizedLibs.updatePlan(
        userPlanDetails.Activations.id,
        newPlan
      );

      if (updatePlan) return SuccessResponse(res, 'success');
    } catch (error) {
      console.error(`Error in catch ${error}`);

      return CatchResponse(res, error.message);
    }
  }
}
export default new UserController();
