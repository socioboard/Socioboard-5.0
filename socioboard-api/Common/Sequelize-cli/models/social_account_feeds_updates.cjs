'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class social_account_feeds_updates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  social_account_feeds_updates.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      account_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'social_accounts',
          key: 'account_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      social_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      boardId: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      updated_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      sequelize,
      modelName: 'social_account_feeds_updates',
    }
  );
  return social_account_feeds_updates;
};
