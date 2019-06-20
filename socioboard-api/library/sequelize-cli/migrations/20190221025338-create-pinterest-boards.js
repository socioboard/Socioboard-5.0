'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('pinterest_boards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      board_id: {
        allowNull: false,
        type: Sequelize.STRING(64)
      },
      board_name: {
        allowNull: false,
        type: Sequelize.STRING(64)
      },
      board_url: {
        allowNull: true,
        type: Sequelize.TEXT('tiny'),
      },
      privacy: {
        allowNull: false,
        type: Sequelize.STRING(64)

      },
      board_admin_name: {
        allowNull: false,
        type: Sequelize.STRING(60)
      },
      board_admin_id: {
        allowNull: false,
        type: Sequelize.STRING(64)
      },
      board_admin_url: {
        allowNull: true,
        type: Sequelize.TEXT('tiny')
      },
      social_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'social_accounts',
          key: 'account_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('pinterest_boards');
  }
};