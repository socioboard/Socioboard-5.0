'use strict';

module.exports = (sequelize, Sequelize) => {
  const boards = sequelize.define('boards', {
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
  }, {});
  boards.associate = function (models) {
    // associations can be defined here
  };
  return boards;
};