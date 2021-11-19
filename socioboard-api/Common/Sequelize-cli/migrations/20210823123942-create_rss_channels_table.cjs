'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('rss_channels', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: {
          allowNull: false,
          type: Sequelize.STRING(256),
        },
        logo_url: {
          allowNull: true,
          type: Sequelize.STRING(256),
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_details',
            key: 'user_id',
          },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      });
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('rss_channels');
    } catch (error) {
      console.error(error);
    }
  },
};
