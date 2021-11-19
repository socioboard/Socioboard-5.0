'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('rss_links', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        url: {
          allowNull: false,
          type: Sequelize.STRING(256),
        },
        category: {
          allowNull: true,
          type: Sequelize.STRING(256),
        },
        channel_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'rss_channels',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
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
      await queryInterface.dropTable('rss_links');
    } catch (error) {
      console.error(error);
    }
  },
};
