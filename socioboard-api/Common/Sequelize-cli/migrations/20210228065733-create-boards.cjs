'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('boards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      board_name: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      keyword: {
        type: Sequelize.STRING(64),
        allowNull: false,
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
    await queryInterface.dropTable('boards');
  }
};