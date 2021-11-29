'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class join_table_users_teams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      join_table_users_teams.belongsTo(models.user_details, { foreignKey: 'user_id', targetKey: 'user_id' })
    }
  };
  join_table_users_teams.init({
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
          msg: "payment_status should be less than or equal to 2"
        }
      }
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
    },
  }, {
    sequelize,
    modelName: 'join_table_users_teams',
  });
  return join_table_users_teams;
};
