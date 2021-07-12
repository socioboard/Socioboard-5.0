'use strict';
const {
  Model
} = require('sequelize')
module.exports = (sequelize, Sequelize) => {
  class team_informations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      team_informations.belongsToMany(models.user_details, { through: models.join_table_users_teams, as: 'User', foreignKey: 'team_id', otherKey: 'user_id' });
      team_informations.belongsToMany(models.social_accounts, { through: models.join_table_teams_social_accounts, as: 'SocialAccount', foreignKey: 'team_id', otherKey: 'account_id' });

    }
  };
  team_informations.init({
    team_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    team_name: {
      type: Sequelize.STRING(64),
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "team_name is mandatory field."
        },
        len: {
          args: [2, 64],
          msg: "team_name should have 2 to 64 characters."
        }
      }
    },
    team_logo: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'https://i.imgur.com/eRkLsuQ.png',
      validate: {
        isUrl: {
          args: true,
          msg: "team_logo is not in valid url."
        }
      }
    },
    team_description: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'NA'
    },
    team_admin_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    is_team_locked: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_default_team: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'team_informations',
  });
  return team_informations;
};