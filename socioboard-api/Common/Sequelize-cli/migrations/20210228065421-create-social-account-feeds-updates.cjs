'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('social_account_feeds_updates', {
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
      }
      // ,
      // updated_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // },
      // created_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('social_account_feeds_updates');
  }
};