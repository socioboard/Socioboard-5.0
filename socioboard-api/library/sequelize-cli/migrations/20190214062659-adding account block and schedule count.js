'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_details', 'is_account_locked', { type: Sequelize.BOOLEAN, defaultValue: false })
      .then(() => {
        return queryInterface.addColumn('application_informations', 'maximum_schedule', { type: Sequelize.INTEGER, defaultValue: 5 });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_details', 'is_account_locked')
      .then(() => {
        return queryInterface.removeColumn('application_informations', 'maximum_schedule');
      });
  }
};
