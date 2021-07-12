'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
class pinterest_boards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pinterest_boards.belongsTo(models.social_accounts, { as: 'Boards', foreignKey: "social_account_id", targetKey: 'account_id' });

    }
  };
  pinterest_boards.init({
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
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
}, {
    sequelize,
    modelName: 'pinterest_boards',
  });
  return pinterest_boards;
};