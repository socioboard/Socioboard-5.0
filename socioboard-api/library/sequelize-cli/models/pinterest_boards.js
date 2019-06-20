'use strict';
module.exports = (sequelize, Sequelize) => {
  const pinterest_boards = sequelize.define('pinterest_boards', {
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
      type: Sequelize.STRING(64)
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
  }, {});
  pinterest_boards.associate = function (models) {
    pinterest_boards.belongsTo(models.social_accounts, { as: 'Boards', foreignKey: "social_account_id", targetKey: 'account_id' });
    // associations can be defined here
  };
  return pinterest_boards;
};