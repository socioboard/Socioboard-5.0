'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_activations', 'shortenStatus', { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, comment: "0-normal, 1-firebase" });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_activations', 'shortenStatus');
  }
};