'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn(
        'chat_group_messages',
        'type',
        {
          type: Sequelize.ENUM(['text', 'image', 'video', 'serve']),
          unique: false,
          comment: 'text, image, video, serve',
        },
      );
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn(
        'chat_group_messages',
        'type',
        {
          type: Sequelize.ENUM(['text', 'image', 'serve']),
          unique: false,
          comment: '0-Text, 1-Image, 2-Serve',
        },
      );
    } catch (error) {
      console.error(error);
    }
  },
};
