import Joi from 'joi';

class Validator {
  createTeam(data) {
    const JoiSchema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string(),
      logoUrl: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  // editTeam(data) {
  //     const JoiSchema = Joi.object({
  //         name: Joi.string().required(),
  //         description: Joi.string(),
  //         logoUrl: Joi.string().required()
  //     }).options({ abortEarly: false });
  //     return JoiSchema.validate(data)
  // }
  deleteTeam(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  async inviteTeam(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      Email: Joi.string().required().email(),
      Permission: Joi.string().required(),
      // userScopeName: Joi.string().allow()
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  async withdrawTeam(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      Email: Joi.string().required().email(),
      userScopeName: Joi.string().allow(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  async removeTeamMember(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      memberId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  async editTeamMemberPermission(data) {
    const JoiSchema = Joi.object({
      teamId: Joi.string().required(),
      memberId: Joi.string().required(),
      Permission: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  addOtherTeamSocialProfiles(data) {
    const JoiSchema = Joi.object({
      accountId: Joi.string().required(),
      teamId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  addOtherTeamSocialProfilesById(data) {
    const JoiSchema = Joi.object({
      accountId: Joi.string().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }

  deleteTeamSocialProfile(data) {
    const JoiSchema = Joi.object({
      accountId: Joi.string().required(),
      teamId: Joi.string().required(),
      userScopeId: Joi.number().required(),
    }).options({ abortEarly: false });

    return JoiSchema.validate(data);
  }
}

export default new Validator();
