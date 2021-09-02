'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class user_media_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_media_details.belongsTo(models.user_details, {
        as: 'UserMedia',
        foreignKey: 'user_id',
        targetKey: 'user_id',
      });
      user_media_details.belongsTo(models.team_informations, {
        as: 'TeamMedia',
        foreignKey: 'team_id',
        targetKey: 'team_id',
      });
    }
  }
  user_media_details.init(
    {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      /**
       * 0- image
       * 1- video
       */
      type: {
        type: Sequelize.INTEGER(3),
        allowNull: false,
        defaultValue: 0,
        comment: '0-Image, 1-Video',
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(64),
      },
      media_url: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      thumbnail_url: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      /**
       * 0- public
       * 1- private
       */
      privacy_type: {
        type: Sequelize.INTEGER(3),
        allowNull: false,
        defaultValue: 0,
        comment: '0-public, 1-private, 3-publish',
      },
      media_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      mime_type: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      created_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      file_name: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_details',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'team_informations',
          key: 'team_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'user_media_details',
    }
  );
  return user_media_details;
};
