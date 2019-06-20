'use strict';
module.exports = (sequelize, Sequelize) => {
  const social_account_feeds_updates = sequelize.define('social_account_feeds_updates', {
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
  }, {});
  social_account_feeds_updates.associate = function (models) {
    // associations can be defined here
  };
  return social_account_feeds_updates;
};