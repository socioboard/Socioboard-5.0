'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('join_table_users_teams', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      invitation_accepted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      left_from_team: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      invited_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      permission: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '0-none, 1-full, 2-admin',
        validate: {
          max: {
            args: 2,
            msg: "permission should be less than or equal to 2"
          }
        }
      },
      team_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'team_informations',
          key: 'team_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_details',
          key: 'user_id'
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
    await queryInterface.dropTable('join_table_users_teams');
  }
};