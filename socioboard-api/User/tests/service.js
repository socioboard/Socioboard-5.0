import db from '../../Common/Sequelize-cli/models';

export function activateUserByEmail(email) {
  return db.user_activations.update({
    activation_status: 1,
  }, {
    include: [
      {
        model: db.user_details,
        on: `user_activations.id = user_details.user_activation_id AND user_details.email = ${email}`,
      },
    ],
    where: {},
  });
}

export function getEmailActivationToken(email) {
  return db.user_details.findOne({
    attributes: ['Activations.email_validate_token'],
    where: {
      email,
    },
    include: [{
      model: db.user_activations,
      as: 'Activations',
      attributes: [],
    }],
    raw: true,
  });
}

export function getPasswordActivationToken(email) {
  return db.user_details.findOne({
    attributes: ['Activations.forgot_password_validate_token'],
    where: {
      email,
    },
    include: [{
      model: db.user_activations,
      as: 'Activations',
      attributes: [],
    }],
    raw: true,
  });
}

export function getDirectLoginValidateToken(email) {
  return db.user_details.findOne({
    attributes: ['Activations.direct_login_validate_token'],
    where: {
      email,
    },
    include: [{
      model: db.user_activations,
      as: 'Activations',
      attributes: [],
    }],
    raw: true,
  });
}
