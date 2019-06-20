'use strict';

module.exports = (sequelize, Sequelize) => {
  const team_informations = sequelize.define('team_informations', {
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
          args: [4, 64],
          msg: "team_name should have 4 to 64 characters."
        }
      }
    },
    team_logo: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'www.socioboard.com',
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
    is_default_team: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  }, {});
  team_informations.associate = function (models) {
    team_informations.belongsToMany(models.user_details, { through: models.join_table_users_teams, as: 'User', foreignKey: 'team_id', otherKey: 'user_id' });
    team_informations.belongsToMany(models.social_accounts, { through: models.join_table_teams_social_accounts, as: 'SocialAccount', foreignKey: 'team_id', otherKey: 'account_id' });
  };
  return team_informations;
};