'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('social_accounts', 'social_id', {
        type: Sequelize.STRING(256),
        allowNull: true,
      });
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('social_accounts', 'social_id', {
        type: Sequelize.STRING(64),
        allowNull: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
