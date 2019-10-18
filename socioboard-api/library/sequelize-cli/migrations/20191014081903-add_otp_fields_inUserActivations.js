'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_activations', 'otp_token', { type: Sequelize.STRING(32), allowNull: true, comment: 'first half for email, next half for phone' })
      .then(() => {
        return queryInterface.addColumn('user_activations', 'otp_token_expire', {
          type: Sequelize.DATE, allowNull: true, validate: {
            isDate: {
              args: true,
              msg: "otp_token_expire should be a valid date format."
            }
          }, comment: 'expires in 10 minutes'
        });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_activations', 'otp_token')
      .then(() => {
        return queryInterface.removeColumn('user_activations', 'otp_token_expire');
      });
  }
};
