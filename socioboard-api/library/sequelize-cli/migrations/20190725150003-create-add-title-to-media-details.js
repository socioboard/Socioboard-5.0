'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_media_details', 'title', { allowNull: false, type: Sequelize.STRING(64), default: "Media Title" });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_media_details', 'title');
  }
};