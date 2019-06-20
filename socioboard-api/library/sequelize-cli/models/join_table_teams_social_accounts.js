'use strict';
module.exports = (sequelize, Sequelize) => {
  const join_table_teams_social_accounts = sequelize.define('join_table_teams_social_accounts', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    is_account_locked: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    account_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'social_accounts',
        key: 'account_id'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }
  }, {});
  join_table_teams_social_accounts.associate = function(models) {
    // associations can be defined here
  };
  return join_table_teams_social_accounts;
};