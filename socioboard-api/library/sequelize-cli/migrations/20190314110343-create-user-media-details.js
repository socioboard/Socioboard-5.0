'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_media_details', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: Sequelize.INTEGER(3),
        allowNull: false,
        defaultValue: 0
      },
      media_url: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      thumbnail_url: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      privacy_type: {
        type: Sequelize.INTEGER(3),
        allowNull: false,
        defaultValue: 0
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
      created_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      file_name: {
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
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'team_informations',
          key: 'team_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_media_details');
  }
};