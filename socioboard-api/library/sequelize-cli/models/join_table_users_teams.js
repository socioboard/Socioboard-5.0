'use strict';
module.exports = (sequelize, Sequelize) => {
  const join_table_users_teams = sequelize.define('join_table_users_teams', {
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
      comment: '0-none, 1-full',
      validate: {
        max: {
          args: 1,
          msg: "payment_status should be less than or equal to 1"
        }
      }
    }
  }, {});
  join_table_users_teams.associate = function (models) {
    // associations can be defined here
  };
  return join_table_users_teams;
};