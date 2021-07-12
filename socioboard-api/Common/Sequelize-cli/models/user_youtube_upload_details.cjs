'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class user_youtube_upload_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_youtube_upload_details.belongsTo(models.user_details, { as: 'UserSchedule', foreignKey: 'user_id', targetKey: 'user_id' });
      user_youtube_upload_details.belongsTo(models.team_informations, { as: 'TeamSchedule', foreignKey: 'team_id', targetKey: 'team_id' });

    }
  };
  user_youtube_upload_details.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    upload_type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0-upload, 1-Draft"
      // 0- upload, 1- Draft
    },
    mongo_id: {
      type: Sequelize.STRING(64),
      allowNull: false
    },
    created_date: {
      type: Sequelize.DATE,
      allowNull: false
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
      allowNull: false,
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
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'user_youtube_upload_details',
  });
  return user_youtube_upload_details;
};

