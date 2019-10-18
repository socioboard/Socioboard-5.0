'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users_schedule_details', 'start_date', { type: Sequelize.DATE, allowNull: true })
      .then(() => {
        return queryInterface.addColumn('users_schedule_details', 'interval', { type: Sequelize.INTEGER, allowNull: true });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users_schedule_details', 'start_date')
      .then(() => {
        return queryInterface.removeColumn('users_schedule_details', 'interval');
      });
  }
};
