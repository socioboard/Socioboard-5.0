'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('social_accounts', 'first_name', {
        type: Sequelize.STRING(128),
        allowNull: true,
      });
    } catch (error) {
      throw error
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('social_accounts', 'first_name', {
        type: Sequelize.STRING(64),
        allowNull: true,
      });
    } catch (error) {
     throw error
    }
  },
};
