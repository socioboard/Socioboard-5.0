'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn(
        'chat_group_messages',
        'is_edited',
        {
          allowNull: false,
          defaultValue: false,
          type: Sequelize.BOOLEAN,
        },
      );
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn(
        'chat_group_messages',
        'is_edited',
      );
    } catch (error) {
      console.error(error);
    }
  },
};
