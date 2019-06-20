'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('social_account_feeds_updates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'social_accounts',
          key: 'account_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      social_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      updated_date: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('social_account_feeds_updates');
  }
};