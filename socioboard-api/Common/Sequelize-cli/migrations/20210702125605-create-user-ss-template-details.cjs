'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_ss_template_details', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(64),
      },
      file_name: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      media_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      mime_type: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      media_url: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_details',
          key: 'user_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_ss_template_details');
  }
};